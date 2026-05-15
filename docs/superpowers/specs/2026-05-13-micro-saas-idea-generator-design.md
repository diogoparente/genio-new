# Micro-SaaS Idea Generator — Design Spec

**Status:** Approved
**Date:** 2026-05-13

## Overview

A web application that generates micro-SaaS ideas backed by proven audience signals. Each idea includes evidence (search volume, community demand, competitor presence), monetization guidance, and enough detail to begin implementation. Users authenticate, trigger generation runs, browse curated ideas, and save promising ones.

## Architecture

Single Next.js App Router application. API routes handle auth, generation, and data access. Server components render pages; client components handle interactivity (forms, polling, filters).

```
src/
  app/
    api/              # API routes
      auth/           # better-auth handlers
      generations/    # POST (trigger), GET (list), GET :id
      ideas/          # GET (browse), GET :id, PATCH :id, DELETE :id
      sources/        # GET status (data source health)
    (auth)/           # login, signup pages
    (dashboard)/      # generator, ideas, generation history
    page.tsx          # landing page
  lib/
    auth.ts           # better-auth config
    db/
      schema.ts       # Drizzle schema
      migrations/     # Drizzle migrations
      client.ts       # Neon connection
    sources/          # Data source adapters
      adapter.ts      # Shared interface
      google-trends.ts
      reddit.ts
      hackernews.ts
      producthunt.ts
    synthesis/
      prompt.ts       # LLM prompt templates
      parser.ts       # Structured output parsing + validation
    generation/
      orchestrator.ts # Orchestrates: fetch → synthesize → store
  components/
    GenerationForm.tsx
    IdeaCard.tsx
    IdeaDetail.tsx
    SignalBadge.tsx
    GenerationStatus.tsx
    IdeaFilters.tsx
```

**Stack:**
- Next.js (App Router) + TypeScript
- better-auth (email/password minimum)
- Drizzle ORM + Neon Postgres
- DeepSeek as default LLM provider, abstraction layer for multi-provider
- Tailwind CSS for styling (assumed, fits ecosystem)

**Deploy:** Long-running Node server (Railway, Fly.io, etc.) or Vercel with awareness of generation time (15–45s). No Redis dependency — self-contained.

## Data Model

```
users                    # better-auth managed
  id, name, email, ...

idea_generations         # one generation run = one row
  id, userId, niche (nullable), batchSize, status enum,
  confidence, createdAt

ideas                    # individual generated ideas
  id, generationId, name, tagline, description, targetAudience,
  monetizationModel enum, confidenceScore (0-100), createdAt

idea_signals             # market evidence per idea
  id, ideaId, source enum, keyword, volumeEstimate,
  trendDirection enum, mentionCount, sentimentSummary,
  rawData jsonb, createdAt

idea_competitors         # existing players
  id, ideaId, name, url, description, strength enum

idea_details             # LLM-synthesized enrichment
  id, ideaId, suggestedTechStack json, estimatedTAM,
  acquisitionChannels json, pricingSuggestions json,
  mvpFeatureSet json, createdAt
```

Relationships: `idea_generations → ideas → { idea_signals, idea_competitors, idea_details }`.

## Generation Pipeline

1. User triggers generation via API (optional niche, batch size default 7)
2. Data sources queried in parallel (Google Trends, Reddit, HN, Product Hunt). Niche filters if provided; otherwise trending/popular topics from each source.
3. Each source normalizes output to: `{ keyword, volume, trend, mentions, rawData }`.
4. Normalized signals fed to LLM via structured prompt. LLM instructed to cross-reference signals, avoid duplicates, prioritize high-confidence ideas, and output JSON matching the idea schema with all enrichment fields.
5. LLM response parsed and validated against schema. Invalid entries discarded.
6. Full batch written to DB (generation + ideas + signals + competitors + details) in a transaction.
7. Generation marked complete. Results returned to frontend.

**Error handling:** Single source failure does not block generation — other sources proceed. LLM call retried once on failure. If generation fails entirely, generation row marked `failed` with error message.

## API Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/generations` | Trigger new generation |
| GET | `/api/generations` | List past generation runs |
| GET | `/api/generations/:id` | Get one generation + its ideas |
| GET | `/api/ideas` | Browse ideas (paginated, filterable) |
| GET | `/api/ideas/:id` | Single idea with full details |
| PATCH | `/api/ideas/:id` | Lightweight mutations (save/unsave, notes) |
| DELETE | `/api/ideas/:id` | Remove an idea |
| GET | `/api/sources/status` | Data source health check |

All routes behind better-auth middleware. Ideas scoped to authenticated user.

## Frontend

**Pages:**
- `/` — Landing page
- `/login`, `/signup` — better-auth forms
- `/dashboard` — Hub: trigger generation, see recent ideas
- `/dashboard/generations` — Past generation runs
- `/dashboard/ideas` — Browse all saved ideas with filters
- `/dashboard/ideas/:id` — Full idea detail view

**Key Components:**
- `GenerationForm` — Niche input (optional), batch size slider, generate button with loading state
- `IdeaCard` — Compact: name, tagline, confidence badge, monetization model icon, save button
- `IdeaDetail` — Full view with all sections (signals, competitors, tech stack, TAM, pricing, MVP features, acquisition channels)
- `SignalBadge` — Trend direction (up/flat/down) with source icon
- `GenerationStatus` — Loading state with estimated time, shown while the synchronous API call completes. If generation time exceeds ~30s regularly, add SSE streaming for step-by-step progress ("fetching data..." → "synthesizing..." → "complete") as a follow-up.
- `IdeaFilters` — Filter by monetization model, confidence, niche, saved status

## Data Source Adapters

Each adapter implements a shared interface:

```typescript
interface SignalSource {
  name: string;
  fetchSignals(params: { niche?: string; limit: number }): Promise<NormalizedSignal[]>;
  healthCheck(): Promise<boolean>;
}

interface NormalizedSignal {
  keyword: string;
  volume: number | null;
  trend: 'up' | 'flat' | 'down';
  mentionCount: number;
  sentimentSummary: string;
  rawData: Record<string, unknown>;
}
```

**Initial sources (free tier):**
- Google Trends (no official API — use a third-party JS wrapper or fetch from community-maintained endpoints)
- Reddit (public API, subreddit searches)
- Hacker News (Algolia search API)
- Product Hunt (public API / scraping)

## LLM Provider Abstraction

```typescript
interface LLMProvider {
  name: string;
  generateStructured<T>(params: {
    systemPrompt: string;
    userPrompt: string;
    schema: ZodSchema<T>;
  }): Promise<T>;
}
```

DeepSeek default. Provider configurable via environment variables. Model selection per-provider supported.

## Out of Scope

- Automated recurring generation (manual trigger only)
- Team/org accounts
- Export to CSV/PDF (can be added later)
- Payment/monetization of the tool itself (the tool generates monetizable ideas, but the tool is not itself a SaaS product at this stage)
