# Micro-SaaS Idea Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app that generates micro-SaaS ideas backed by search volume, community demand, and competitor presence signals.

**Architecture:** Single Next.js App Router app with API routes, Drizzle + Neon for persistence, better-auth for authentication, DeepSeek as default LLM provider. Generation runs synchronously via API route (15-45s). Data sources queried in parallel, normalized, fed to LLM for structured idea synthesis.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Drizzle ORM + Neon Postgres, better-auth, DeepSeek API, Tailwind CSS, Zod

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.env.example`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm
```
Run from the project root. When prompted for the project name, use `.` to create in current directory.

- [ ] **Step 2: Install core dependencies**

```bash
npm install drizzle-orm @neondatabase/serverless better-auth zod deepseek-ai dotenv
npm install -D drizzle-kit @types/node
```

- [ ] **Step 3: Create `.env.example`**

```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000
DEEPSEEK_API_KEY=sk-xxx
```

- [ ] **Step 4: Create `.gitignore` additions**

```
.env
.env.local
node_modules/
.next/
```

- [ ] **Step 5: Verify scaffold**

```bash
npm run dev
```
Expected: dev server starts on localhost:3000. Kill it after confirming.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with dependencies"
```

---

### Task 2: Database Schema

**Files:**
- Create: `src/lib/db/schema.ts`

- [ ] **Step 1: Write the Drizzle schema**

```typescript
// src/lib/db/schema.ts
import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const generationStatus = pgEnum("generation_status", [
  "pending",
  "running",
  "complete",
  "failed",
]);

export const monetizationModel = pgEnum("monetization_model", [
  "subscription",
  "one_time",
  "usage_based",
  "hybrid",
]);

export const trendDirection = pgEnum("trend_direction", [
  "up",
  "flat",
  "down",
]);

export const signalSource = pgEnum("signal_source", [
  "google_trends",
  "reddit",
  "hackernews",
  "producthunt",
]);

export const competitorStrength = pgEnum("competitor_strength", [
  "strong",
  "moderate",
  "weak",
]);

export const ideaGenerations = pgTable("idea_generations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  niche: text("niche"),
  batchSize: integer("batch_size").notNull().default(7),
  status: generationStatus("status").notNull().default("pending"),
  confidence: integer("confidence"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ideas = pgTable("ideas", {
  id: uuid("id").defaultRandom().primaryKey(),
  generationId: uuid("generation_id")
    .notNull()
    .references(() => ideaGenerations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  targetAudience: text("target_audience").notNull(),
  monetizationModel: monetizationModel("monetization_model").notNull(),
  confidenceScore: integer("confidence_score").notNull().default(0),
  isSaved: integer("is_saved").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ideaSignals = pgTable("idea_signals", {
  id: uuid("id").defaultRandom().primaryKey(),
  ideaId: uuid("idea_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  source: signalSource("source").notNull(),
  keyword: text("keyword").notNull(),
  volumeEstimate: integer("volume_estimate"),
  trendDirection: trendDirection("trend_direction"),
  mentionCount: integer("mention_count").default(0),
  sentimentSummary: text("sentiment_summary"),
  rawData: jsonb("raw_data").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ideaCompetitors = pgTable("idea_competitors", {
  id: uuid("id").defaultRandom().primaryKey(),
  ideaId: uuid("idea_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url"),
  description: text("description"),
  strength: competitorStrength("strength").notNull().default("moderate"),
});

export const ideaDetails = pgTable("idea_details", {
  id: uuid("id").defaultRandom().primaryKey(),
  ideaId: uuid("idea_id")
    .notNull()
    .references(() => ideas.id, { onDelete: "cascade" }),
  suggestedTechStack: jsonb("suggested_tech_stack").default([]),
  estimatedTAM: text("estimated_tam"),
  acquisitionChannels: jsonb("acquisition_channels").default([]),
  pricingSuggestions: jsonb("pricing_suggestions").default([]),
  mvpFeatureSet: jsonb("mvp_feature_set").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const ideaGenerationsRelations = relations(ideaGenerations, ({ many }) => ({
  ideas: many(ideas),
}));

export const ideasRelations = relations(ideas, ({ one, many }) => ({
  generation: one(ideaGenerations, {
    fields: [ideas.generationId],
    references: [ideaGenerations.id],
  }),
  signals: many(ideaSignals),
  competitors: many(ideaCompetitors),
  details: one(ideaDetails, {
    fields: [ideas.id],
    references: [ideaDetails.ideaId],
  }),
}));

export const ideaSignalsRelations = relations(ideaSignals, ({ one }) => ({
  idea: one(ideas, {
    fields: [ideaSignals.ideaId],
    references: [ideas.id],
  }),
}));

export const ideaCompetitorsRelations = relations(ideaCompetitors, ({ one }) => ({
  idea: one(ideas, {
    fields: [ideaCompetitors.ideaId],
    references: [ideas.id],
  }),
}));

export const ideaDetailsRelations = relations(ideaDetails, ({ one }) => ({
  idea: one(ideas, {
    fields: [ideaDetails.ideaId],
    references: [ideas.id],
  }),
}));
```

- [ ] **Step 2: Create Drizzle config file**

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 3: Create database client**

```typescript
// src/lib/db/client.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 4: Verify schema compiles**

```bash
npx tsc --noEmit
```
Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/schema.ts src/lib/db/client.ts drizzle.config.ts
git commit -m "feat: add Drizzle schema and database client"
```

---

### Task 3: Auth Setup

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...all]/route.ts`, `src/middleware.ts`

- [ ] **Step 1: Write better-auth config**

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import * as schema from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {},
});
```

- [ ] **Step 2: Write auth API route handler**

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

- [ ] **Step 3: Write middleware**

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/generations") ||
    pathname.startsWith("/api/ideas")
  ) {
    const sessionCookie = request.cookies.get("better-auth.session_token");
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/generations/:path*", "/api/ideas/:path*"],
};
```

- [ ] **Step 4: Add auth secret to `.env.example`**

```bash
# already present from scaffold, verify BETTER_AUTH_SECRET and BETTER_AUTH_URL are listed
```

- [ ] **Step 5: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/middleware.ts
git commit -m "feat: add better-auth configuration and middleware"
```

---

### Task 4: Auth Pages

**Files:**
- Create: `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`
- Create: `src/components/AuthForm.tsx`
- Create: `src/lib/auth-helpers.ts`

- [ ] **Step 1: Write auth helpers**

```typescript
// src/lib/auth-helpers.ts
import { auth } from "./auth";
import { headers } from "next/headers";

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}
```

- [ ] **Step 2: Write AuthForm component**

```typescript
// src/components/AuthForm.tsx
"use client";

import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) throw new Error(await res.text());
      }

      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());

      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
          minLength={8}
          required
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write auth layout**

```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write login page**

```typescript
// src/app/(auth)/login/page.tsx
import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
      <AuthForm mode="login" />
      <p className="text-center text-sm mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-indigo-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Write signup page**

```typescript
// src/app/(auth)/signup/page.tsx
import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
      <AuthForm mode="signup" />
      <p className="text-center text-sm mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/AuthForm.tsx src/app/\(auth\)/ src/lib/auth-helpers.ts
git commit -m "feat: add login and signup pages"
```

---

### Task 5: Data Source Adapter Interface

**Files:**
- Create: `src/lib/sources/types.ts`
- Create: `src/lib/sources/registry.ts`

- [ ] **Step 1: Write source types**

```typescript
// src/lib/sources/types.ts
export interface NormalizedSignal {
  keyword: string;
  volume: number | null;
  trend: "up" | "flat" | "down";
  mentionCount: number;
  sentimentSummary: string;
  rawData: Record<string, unknown>;
}

export interface SignalSource {
  name: string;
  fetchSignals(params: { niche?: string; limit: number }): Promise<NormalizedSignal[]>;
  healthCheck(): Promise<boolean>;
}
```

- [ ] **Step 2: Write source registry**

```typescript
// src/lib/sources/registry.ts
import type { SignalSource, NormalizedSignal } from "./types";
import { googleTrendsSource } from "./google-trends";
import { redditSource } from "./reddit";
import { hackernewsSource } from "./hackernews";
import { producthuntSource } from "./producthunt";

const allSources: SignalSource[] = [
  googleTrendsSource,
  redditSource,
  hackernewsSource,
  producthuntSource,
];

export async function fetchAllSignals(params: {
  niche?: string;
  limit: number;
}): Promise<{ source: string; signals: NormalizedSignal[] }[]> {
  const results = await Promise.allSettled(
    allSources.map(async (source) => ({
      source: source.name,
      signals: await source.fetchSignals(params),
    }))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<{ source: string; signals: NormalizedSignal[] }> =>
      r.status === "fulfilled"
    )
    .map((r) => r.value);
}

export async function checkAllSourcesHealth(): Promise<
  { name: string; healthy: boolean }[]
> {
  const results = await Promise.allSettled(
    allSources.map(async (s) => ({ name: s.name, healthy: await s.healthCheck() }))
  );
  return results.map((r) =>
    r.status === "fulfilled" ? r.value : { name: "unknown", healthy: false }
  );
}
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: errors about missing imports (google-trends, reddit, etc.) — expected, they don't exist yet. The types file should compile clean. We'll fix the missing imports in subsequent tasks.

- [ ] **Step 4: Commit**

```bash
git add src/lib/sources/types.ts src/lib/sources/registry.ts
git commit -m "feat: add data source adapter interface and registry"
```

---

### Task 6: Data Source Adapters (Google Trends + Reddit)

**Files:**
- Create: `src/lib/sources/google-trends.ts`
- Create: `src/lib/sources/reddit.ts`

- [ ] **Step 1: Write Google Trends adapter**

```typescript
// src/lib/sources/google-trends.ts
import type { SignalSource, NormalizedSignal } from "./types";

const GT_API = "https://trends.google.com/trends/api/explore";

async function fetchTrendsForKeyword(keyword: string): Promise<{
  volume: number | null;
  trend: "up" | "flat" | "down";
}> {
  const params = new URLSearchParams({
    hl: "en-US",
    tz: "0",
    req: JSON.stringify({
      comparisonItem: [{ keyword, geo: "", time: "today 12-m" }],
      category: 0,
      property: "",
    }),
  });

  const res = await fetch(`${GT_API}?${params.toString()}`);
  const text = await res.text();
  // Google Trends prepends `)]}',\n` to prevent JSON hijacking
  const json = JSON.parse(text.replace(/^\)\]\}',\n/, ""));

  const timelineData = json?.widgets?.[0]?.data;
  if (!timelineData?.length) {
    return { volume: null, trend: "flat" };
  }

  const values = timelineData.map((d: { formattedValue: string[] }) =>
    parseInt(d.formattedValue?.[0] ?? "0", 10)
  );
  const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
  const recent = values.slice(-4).reduce((a: number, b: number) => a + b, 0) / values.slice(-4).length;
  const older = values.slice(0, 4).reduce((a: number, b: number) => a + b, 0) / values.slice(0, 4).length;

  return {
    volume: Math.round(avg),
    trend: recent > older * 1.1 ? "up" : recent < older * 0.9 ? "down" : "flat",
  };
}

export const googleTrendsSource: SignalSource = {
  name: "google_trends",

  async fetchSignals({ niche, limit }) {
    const seedKeywords = niche
      ? [niche, `${niche} software`, `${niche} tool`, `${niche} app`]
      : [
          "saas tool for",
          "software for",
          "app for",
          "platform for",
          "tool for",
        ];

    const signals: NormalizedSignal[] = [];

    for (const kw of seedKeywords.slice(0, limit)) {
      try {
        const { volume, trend } = await fetchTrendsForKeyword(kw);
        signals.push({
          keyword: kw,
          volume,
          trend,
          mentionCount: 0,
          sentimentSummary: `Search trend: ${trend}`,
          rawData: { volume, trend },
        });
      } catch {
        // Skip failed keyword fetches
      }
    }

    return signals;
  },

  async healthCheck() {
    try {
      await fetchTrendsForKeyword("test");
      return true;
    } catch {
      return false;
    }
  },
};
```

- [ ] **Step 2: Write Reddit adapter**

```typescript
// src/lib/sources/reddit.ts
import type { SignalSource, NormalizedSignal } from "./types";

const REDDIT_SEARCH = "https://www.reddit.com/search.json";

async function searchReddit(query: string, limit: number): Promise<NormalizedSignal[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit), sort: "relevance" });
  const res = await fetch(`${REDDIT_SEARCH}?${params.toString()}`);
  if (!res.ok) throw new Error(`Reddit API returned ${res.status}`);

  const json = await res.json();
  const posts = json?.data?.children ?? [];

  return posts.map((p: { data: { title: string; selftext: string; ups: number; num_comments: number; subreddit: string } }) => {
    const text = `${p.data.title} ${p.data.selftext ?? ""}`;
    const isPainPoint = /looking for|need|wish there was|anyone know|recommend|alternative to|frustrated|hate|sucks|expensive/i.test(text);

    return {
      keyword: p.data.title.slice(0, 100),
      volume: null,
      trend: isPainPoint ? "up" as const : "flat" as const,
      mentionCount: p.data.ups + p.data.num_comments,
      sentimentSummary: isPainPoint
        ? `Pain point in r/${p.data.subreddit}: ${text.slice(0, 200)}`
        : `Discussion in r/${p.data.subreddit}: ${text.slice(0, 200)}`,
      rawData: {
        subreddit: p.data.subreddit,
        ups: p.data.ups,
        comments: p.data.num_comments,
        isPainPoint,
      },
    };
  });
}

export const redditSource: SignalSource = {
  name: "reddit",

  async fetchSignals({ niche, limit }) {
    const queries = niche
      ? [
          `${niche} tool`,
          `${niche} software`,
          `looking for ${niche}`,
          `${niche} alternative`,
        ]
      : [
          "looking for tool",
          "wish there was software",
          "anyone know a good",
          "recommend me software",
          "need app for",
          "alternative to",
        ];

    const signals: NormalizedSignal[] = [];

    for (const q of queries.slice(0, Math.ceil(limit / 2))) {
      try {
        const results = await searchReddit(q, 10);
        signals.push(...results);
      } catch {
        // Skip failed queries
      }
    }

    return signals.slice(0, limit);
  },

  async healthCheck() {
    try {
      await searchReddit("test", 1);
      return true;
    } catch {
      return false;
    }
  },
};
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors (registry.ts imports are now partially satisfied).

- [ ] **Step 4: Commit**

```bash
git add src/lib/sources/google-trends.ts src/lib/sources/reddit.ts
git commit -m "feat: add Google Trends and Reddit data source adapters"
```

---

### Task 7: Data Source Adapters (Hacker News + Product Hunt)

**Files:**
- Create: `src/lib/sources/hackernews.ts`
- Create: `src/lib/sources/producthunt.ts`

- [ ] **Step 1: Write Hacker News adapter**

```typescript
// src/lib/sources/hackernews.ts
import type { SignalSource, NormalizedSignal } from "./types";

const HN_SEARCH = "https://hn.algolia.com/api/v1/search_by_date";

async function searchHN(query: string, limit: number): Promise<NormalizedSignal[]> {
  const params = new URLSearchParams({ query, hitsPerPage: String(limit), tags: "story" });
  const res = await fetch(`${HN_SEARCH}?${params.toString()}`);
  if (!res.ok) throw new Error(`HN API returned ${res.status}`);

  const json = await res.json();
  const hits = json?.hits ?? [];

  return hits.map((h: { title: string; points: number; num_comments: number; url: string }) => ({
    keyword: h.title?.slice(0, 100) ?? query,
    volume: null,
    trend: h.points > 50 ? ("up" as const) : ("flat" as const),
    mentionCount: (h.points ?? 0) + (h.num_comments ?? 0),
    sentimentSummary: `HN discussion (${h.points} points, ${h.num_comments} comments): ${h.title}`,
    rawData: {
      points: h.points,
      comments: h.num_comments,
      url: h.url,
    },
  }));
}

export const hackernewsSource: SignalSource = {
  name: "hackernews",

  async fetchSignals({ niche, limit }) {
    const queries = niche
      ? [niche, `${niche} startup`, `build ${niche}`]
      : ["Show HN", "launch", "startup", "SaaS", "build"];

    const signals: NormalizedSignal[] = [];

    for (const q of queries.slice(0, Math.ceil(limit / 2))) {
      try {
        const results = await searchHN(q, 10);
        signals.push(...results);
      } catch {
        // Skip failed queries
      }
    }

    return signals.slice(0, limit);
  },

  async healthCheck() {
    try {
      await searchHN("test", 1);
      return true;
    } catch {
      return false;
    }
  },
};
```

- [ ] **Step 2: Write Product Hunt adapter**

```typescript
// src/lib/sources/producthunt.ts
import type { SignalSource, NormalizedSignal } from "./types";

const PH_API = "https://api.producthunt.com/v2/api/graphql";

async function fetchPHPosts(
  topic: string | null,
  limit: number
): Promise<NormalizedSignal[]> {
  const query = `
    query($first: Int, $topic: String) {
      posts(first: $first, topic: $topic, order: VOTES) {
        edges {
          node {
            name
            tagline
            description
            votesCount
            commentsCount
            url
            topics { edges { node { name } } }
          }
        }
      }
    }
  `;

  const res = await fetch(PH_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { first: limit, topic: topic || undefined },
    }),
  });

  if (!res.ok) throw new Error(`PH API returned ${res.status}`);

  const json = await res.json();
  const posts = json?.data?.posts?.edges ?? [];

  return posts.map(
    (e: {
      node: {
        name: string;
        tagline: string;
        description: string;
        votesCount: number;
        commentsCount: number;
        url: string;
        topics: { edges: { node: { name: string } }[] };
      };
    }) => ({
      keyword: e.node.name,
      volume: null,
      trend: e.node.votesCount > 100 ? ("up" as const) : ("flat" as const),
      mentionCount: e.node.votesCount + e.node.commentsCount,
      sentimentSummary: `Product Hunt: ${e.node.tagline} — ${e.node.description?.slice(0, 150) ?? ""}`,
      rawData: {
        votes: e.node.votesCount,
        comments: e.node.commentsCount,
        url: e.node.url,
        topics: e.node.topics?.edges?.map((t) => t.node.name) ?? [],
      },
    })
  );
}

export const producthuntSource: SignalSource = {
  name: "producthunt",

  async fetchSignals({ niche, limit }) {
    try {
      return await fetchPHPosts(niche ?? null, limit);
    } catch {
      return [];
    }
  },

  async healthCheck() {
    try {
      await fetchPHPosts(null, 1);
      return true;
    } catch {
      return false;
    }
  },
};
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors. All source imports in registry.ts are now satisfied.

- [ ] **Step 4: Commit**

```bash
git add src/lib/sources/hackernews.ts src/lib/sources/producthunt.ts
git commit -m "feat: add Hacker News and Product Hunt data source adapters"
```

---

### Task 8: LLM Provider Abstraction + DeepSeek

**Files:**
- Create: `src/lib/llm/types.ts`
- Create: `src/lib/llm/deepseek.ts`

- [ ] **Step 1: Write LLM provider interface**

```typescript
// src/lib/llm/types.ts
import type { ZodSchema } from "zod";

export interface LLMProvider {
  name: string;
  generateStructured<T>(params: {
    systemPrompt: string;
    userPrompt: string;
    schema: ZodSchema<T>;
  }): Promise<T>;
}
```

- [ ] **Step 2: Write DeepSeek provider**

```typescript
// src/lib/llm/deepseek.ts
import type { LLMProvider } from "./types";
import type { ZodSchema } from "zod";

export function createDeepSeekProvider(apiKey: string): LLMProvider {
  return {
    name: "deepseek",

    async generateStructured<T>({
      systemPrompt,
      userPrompt,
      schema,
    }: {
      systemPrompt: string;
      userPrompt: string;
      schema: ZodSchema<T>;
    }): Promise<T> {
      const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!res.ok) {
        throw new Error(`DeepSeek API returned ${res.status}: ${await res.text()}`);
      }

      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("DeepSeek returned empty response");
      }

      const parsed = JSON.parse(content);
      const validated = schema.parse(parsed);
      return validated;
    },
  };
}

let defaultProvider: LLMProvider | null = null;

export function getLLMProvider(): LLMProvider {
  if (!defaultProvider) {
    defaultProvider = createDeepSeekProvider(process.env.DEEPSEEK_API_KEY!);
  }
  return defaultProvider;
}
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/llm/types.ts src/lib/llm/deepseek.ts
git commit -m "feat: add LLM provider interface and DeepSeek implementation"
```

---

### Task 9: Synthesis — LLM Prompt Templates + Parser

**Files:**
- Create: `src/lib/synthesis/prompt.ts`
- Create: `src/lib/synthesis/parser.ts`

- [ ] **Step 1: Write Zod schema for LLM output**

```typescript
// src/lib/synthesis/parser.ts
import { z } from "zod";

export const synthesizedCompetitorSchema = z.object({
  name: z.string(),
  url: z.string().url().or(z.literal("")),
  description: z.string(),
  strength: z.enum(["strong", "moderate", "weak"]),
});

export const synthesizedIdeaSchema = z.object({
  name: z.string().min(3).max(100),
  tagline: z.string().min(5).max(200),
  description: z.string().min(20).max(1000),
  targetAudience: z.string().min(5).max(500),
  monetizationModel: z.enum(["subscription", "one_time", "usage_based", "hybrid"]),
  confidenceScore: z.number().int().min(0).max(100),
  signals: z.array(
    z.object({
      source: z.enum(["google_trends", "reddit", "hackernews", "producthunt"]),
      keyword: z.string(),
      volumeEstimate: z.number().int().nullable(),
      trendDirection: z.enum(["up", "flat", "down"]),
      mentionCount: z.number().int(),
      sentimentSummary: z.string(),
    })
  ),
  competitors: z.array(synthesizedCompetitorSchema),
  suggestedTechStack: z.array(z.string()),
  estimatedTAM: z.string(),
  acquisitionChannels: z.array(z.string()),
  pricingSuggestions: z.array(
    z.object({
      plan: z.string(),
      price: z.string(),
      features: z.array(z.string()),
    })
  ),
  mvpFeatureSet: z.array(z.string()),
});

export const synthesizedOutputSchema = z.object({
  ideas: z.array(synthesizedIdeaSchema).min(1).max(10),
});

export type SynthesizedOutput = z.infer<typeof synthesizedOutputSchema>;
export type SynthesizedIdea = z.infer<typeof synthesizedIdeaSchema>;
export type SynthesizedCompetitor = z.infer<typeof synthesizedCompetitorSchema>;
```

- [ ] **Step 2: Write prompt template**

```typescript
// src/lib/synthesis/prompt.ts
import type { NormalizedSignal } from "../sources/types";

export function buildSystemPrompt(): string {
  return `You are an expert market analyst and startup ideation engine. Your task is to analyze market signals from multiple sources and generate micro-SaaS business ideas that have proven audience demand.

For each idea you generate, you MUST base it directly on the provided signals. Every idea must reference at least one signal as evidence of demand.

Rules:
- Prioritize ideas with strong multi-source validation (same need appearing across Google Trends, Reddit, HN, Product Hunt)
- Avoid generic ideas. Be specific about the product and who it serves.
- Confidence score must reflect signal strength: 80+ if multiple sources corroborate, 60-79 if strong single source, below 60 if signals are weak.
- Monetization model must fit the product type. SaaS tools → subscription. Digital products → one_time. API/platform → usage_based. Mix when appropriate → hybrid.
- Tech stack suggestions should be practical and modern.
- Pricing should reflect real market rates for similar products.
- MVP feature set should be buildable by one developer in 4-8 weeks.

Output valid JSON matching the requested schema.`;
}

export function buildUserPrompt(
  signals: { source: string; signals: NormalizedSignal[] }[],
  niche: string | null,
  batchSize: number
): string {
  const signalSummary = signals
    .map(
      (s) =>
        `## ${s.source}\n${s.signals
          .slice(0, 15)
          .map(
            (sig) =>
              `- Keyword: "${sig.keyword}" | Trend: ${sig.trend} | Mentions: ${sig.mentionCount} | Sentiment: ${sig.sentimentSummary.slice(0, 200)}`
          )
          .join("\n")}`
    )
    .join("\n\n");

  return `Generate ${batchSize} micro-SaaS ideas${niche ? ` in the "${niche}" niche` : " across promising markets"}.

Use the following market signals as your evidence base. Only generate ideas that are supported by these signals.

${signalSummary}

For each idea, provide:
1. A compelling product name
2. A one-line tagline
3. A detailed description of what the product does
4. The target audience (be specific)
5. The best monetization model (subscription, one_time, usage_based, or hybrid)
6. A confidence score (0-100) based on signal strength
7. The specific market signals that support this idea (at least 2)
8. 3-5 existing competitors or adjacent products
9. A suggested tech stack (specific frameworks/tools)
10. An estimated TAM description
11. 3-5 customer acquisition channels
12. 2-3 pricing plan suggestions with features
13. A list of MVP features (keep it small — 4-8 weeks of work)

Respond with JSON following this exact structure:
{
  "ideas": [
    {
      "name": "...",
      "tagline": "...",
      "description": "...",
      "targetAudience": "...",
      "monetizationModel": "subscription",
      "confidenceScore": 85,
      "signals": [{ "source": "reddit", "keyword": "...", "volumeEstimate": null, "trendDirection": "up", "mentionCount": 120, "sentimentSummary": "..." }],
      "competitors": [{ "name": "...", "url": "...", "description": "...", "strength": "moderate" }],
      "suggestedTechStack": ["Next.js", "Stripe", "PostgreSQL"],
      "estimatedTAM": "Small businesses struggling with...",
      "acquisitionChannels": ["SEO content marketing", "Reddit r/smallbusiness"],
      "pricingSuggestions": [{ "plan": "Starter", "price": "$29/mo", "features": ["..."] }],
      "mvpFeatureSet": ["User signup and onboarding", "..."]
    }
  ]
}`;
}
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/synthesis/prompt.ts src/lib/synthesis/parser.ts
git commit -m "feat: add synthesis prompt templates and output parser"
```

---

### Task 10: Generation Orchestrator

**Files:**
- Create: `src/lib/generation/orchestrator.ts`

- [ ] **Step 1: Write generation orchestrator**

```typescript
// src/lib/generation/orchestrator.ts
import { db } from "../db/client";
import { ideaGenerations, ideas, ideaSignals, ideaCompetitors, ideaDetails } from "../db/schema";
import { fetchAllSignals } from "../sources/registry";
import { getLLMProvider } from "../llm/deepseek";
import { buildSystemPrompt, buildUserPrompt } from "../synthesis/prompt";
import { synthesizedOutputSchema } from "../synthesis/parser";
import type { SynthesizedOutput } from "../synthesis/parser";

export interface GenerationResult {
  generationId: string;
  ideaIds: string[];
}

export async function runGeneration(params: {
  userId: string;
  niche?: string;
  batchSize?: number;
}): Promise<GenerationResult> {
  const batchSize = params.batchSize ?? 7;
  const niche = params.niche ?? null;

  // 1. Create generation record
  const [generation] = await db
    .insert(ideaGenerations)
    .values({
      userId: params.userId,
      niche,
      batchSize,
      status: "running",
    })
    .returning({ id: ideaGenerations.id });

  try {
    // 2. Fetch signals from all sources in parallel
    const allSignals = await fetchAllSignals({ niche: niche ?? undefined, limit: 20 });

    // 3. Build prompts and call LLM
    const llm = getLLMProvider();
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(allSignals, niche, batchSize);

    const result: SynthesizedOutput = await llm.generateStructured({
      systemPrompt,
      userPrompt,
      schema: synthesizedOutputSchema,
    });

    // 4. Insert ideas, signals, competitors, and details
    const ideaIds: string[] = [];

    for (const idea of result.ideas) {
      const [insertedIdea] = await db
        .insert(ideas)
        .values({
          generationId: generation.id,
          name: idea.name,
          tagline: idea.tagline,
          description: idea.description,
          targetAudience: idea.targetAudience,
          monetizationModel: idea.monetizationModel,
          confidenceScore: idea.confidenceScore,
        })
        .returning({ id: ideas.id });

      ideaIds.push(insertedIdea.id);

      // Insert signals
      if (idea.signals.length > 0) {
        await db.insert(ideaSignals).values(
          idea.signals.map((s) => ({
            ideaId: insertedIdea.id,
            source: s.source,
            keyword: s.keyword,
            volumeEstimate: s.volumeEstimate,
            trendDirection: s.trendDirection,
            mentionCount: s.mentionCount,
            sentimentSummary: s.sentimentSummary,
          }))
        );
      }

      // Insert competitors
      if (idea.competitors.length > 0) {
        await db.insert(ideaCompetitors).values(
          idea.competitors.map((c) => ({
            ideaId: insertedIdea.id,
            name: c.name,
            url: c.url || null,
            description: c.description,
            strength: c.strength,
          }))
        );
      }

      // Insert details
      await db.insert(ideaDetails).values({
        ideaId: insertedIdea.id,
        suggestedTechStack: idea.suggestedTechStack,
        estimatedTAM: idea.estimatedTAM,
        acquisitionChannels: idea.acquisitionChannels,
        pricingSuggestions: idea.pricingSuggestions,
        mvpFeatureSet: idea.mvpFeatureSet,
      });
    }

    // 5. Mark generation complete
    const avgConfidence = Math.round(
      result.ideas.reduce((sum, i) => sum + i.confidenceScore, 0) / result.ideas.length
    );

    await db
      .update(ideaGenerations)
      .set({ status: "complete", confidence: avgConfidence })
      .where(eq(ideaGenerations.id, generation.id));

    return { generationId: generation.id, ideaIds };
  } catch (error) {
    // Mark as failed
    await db
      .update(ideaGenerations)
      .set({ status: "failed" })
      .where(eq(ideaGenerations.id, generation.id));

    throw error;
  }
}
```

- [ ] **Step 2: Add missing import for `eq`**

Verify `import { eq } from "drizzle-orm"` is present in orchestrator.ts. It's needed for the `.where(eq(...))` calls.

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/generation/orchestrator.ts
git commit -m "feat: add generation orchestrator"
```

---

### Task 11: API Routes — Generations

**Files:**
- Create: `src/app/api/generations/route.ts`
- Create: `src/app/api/generations/[id]/route.ts`

- [ ] **Step 1: Write POST + GET for `/api/generations`**

```typescript
// src/app/api/generations/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { runGeneration } from "@/lib/generation/orchestrator";
import { db } from "@/lib/db/client";
import { ideaGenerations } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { niche, batchSize } = body;

    const result = await runGeneration({
      userId: session.user.id,
      niche,
      batchSize,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Generation failed:", error);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await db
    .select()
    .from(ideaGenerations)
    .where(eq(ideaGenerations.userId, session.user.id))
    .orderBy(desc(ideaGenerations.createdAt))
    .limit(20);

  return NextResponse.json(results);
}
```

- [ ] **Step 2: Write GET for `/api/generations/[id]`**

```typescript
// src/app/api/generations/[id]/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";
import { ideaGenerations, ideas } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [generation] = await db
    .select()
    .from(ideaGenerations)
    .where(
      and(eq(ideaGenerations.id, id), eq(ideaGenerations.userId, session.user.id))
    );

  if (!generation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const generationIdeas = await db
    .select()
    .from(ideas)
    .where(eq(ideas.generationId, id));

  return NextResponse.json({ ...generation, ideas: generationIdeas });
}
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/generations/
git commit -m "feat: add generation API routes"
```

---

### Task 12: API Routes — Ideas

**Files:**
- Create: `src/app/api/ideas/route.ts`
- Create: `src/app/api/ideas/[id]/route.ts`

- [ ] **Step 1: Write GET for `/api/ideas`**

```typescript
// src/app/api/ideas/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";
import { ideas, ideaGenerations } from "@/lib/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
  const monetizationModel = url.searchParams.get("monetizationModel");
  const minConfidence = url.searchParams.get("minConfidence");
  const saved = url.searchParams.get("saved");
  const niche = url.searchParams.get("niche");

  // Get user's generation IDs
  const userGens = await db
    .select({ id: ideaGenerations.id })
    .from(ideaGenerations)
    .where(eq(ideaGenerations.userId, session.user.id));

  const genIds = userGens.map((g) => g.id);
  if (genIds.length === 0) {
    return NextResponse.json({ ideas: [], total: 0, page, limit });
  }

  // Build conditions
  const conditions = [inArray(ideas.generationId, genIds)];

  if (monetizationModel) {
    conditions.push(eq(ideas.monetizationModel, monetizationModel as typeof ideas.monetizationModel.enumValues[number]));
  }
  if (minConfidence) {
    conditions.push(gte(ideas.confidenceScore, parseInt(minConfidence, 10)));
  }
  if (saved === "true") {
    conditions.push(eq(ideas.isSaved, 1));
  }

  const offset = (page - 1) * limit;

  const results = await db
    .select()
    .from(ideas)
    .where(and(...conditions))
    .orderBy(desc(ideas.confidenceScore))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ ideas: results, page, limit });
}
```

- [ ] **Step 2: Add missing `gte` import**

Verify `gte` is imported from `drizzle-orm` at the top of the file.

- [ ] **Step 3: Write GET + PATCH + DELETE for `/api/ideas/[id]`**

```typescript
// src/app/api/ideas/[id]/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";
import {
  ideas,
  ideaSignals,
  ideaCompetitors,
  ideaDetails,
  ideaGenerations,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
  if (!idea) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify ownership via generation
  const [gen] = await db
    .select({ userId: ideaGenerations.userId })
    .from(ideaGenerations)
    .where(eq(ideaGenerations.id, idea.generationId));

  if (!gen || gen.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const signals = await db
    .select()
    .from(ideaSignals)
    .where(eq(ideaSignals.ideaId, id));

  const competitors = await db
    .select()
    .from(ideaCompetitors)
    .where(eq(ideaCompetitors.ideaId, id));

  const [details] = await db
    .select()
    .from(ideaDetails)
    .where(eq(ideaDetails.ideaId, id));

  return NextResponse.json({ ...idea, signals, competitors, details });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { isSaved, notes } = body;

  const updateData: Record<string, unknown> = {};
  if (isSaved !== undefined) updateData.isSaved = isSaved ? 1 : 0;
  if (notes !== undefined) updateData.notes = notes;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(ideas)
    .set(updateData)
    .where(
      and(eq(ideas.id, id))
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await db.delete(ideas).where(eq(ideas.id, id));

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/ideas/
git commit -m "feat: add ideas API routes"
```

---

### Task 13: API Routes — Sources Health

**Files:**
- Create: `src/app/api/sources/route.ts`

- [ ] **Step 1: Write GET for `/api/sources`**

```typescript
// src/app/api/sources/route.ts
import { NextResponse } from "next/server";
import { checkAllSourcesHealth } from "@/lib/sources/registry";

export async function GET() {
  const health = await checkAllSourcesHealth();
  return NextResponse.json({ sources: health });
}
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/sources/
git commit -m "feat: add data source health check endpoint"
```

---

### Task 14: Dashboard Layout + Landing Page

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/components/Navbar.tsx`
- Modify: `src/app/page.tsx` (landing page)

- [ ] **Step 1: Write Navbar component**

```typescript
// src/components/Navbar.tsx
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg">
          IdeaGen
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            Generator
          </Link>
          <Link href="/dashboard/ideas" className="text-gray-600 hover:text-gray-900">
            Ideas
          </Link>
          <Link href="/dashboard/generations" className="text-gray-600 hover:text-gray-900">
            History
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Write dashboard layout**

```typescript
// src/app/(dashboard)/layout.tsx
import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Write landing page (replace default)**

```typescript
// src/app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-center mb-4">
        Micro-SaaS Ideas with Proven Audience
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-xl mb-8">
        Generate validated business ideas backed by real search volume, community
        demand, and competitor analysis. Build with confidence.
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-100"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx src/app/\(dashboard\)/layout.tsx src/app/page.tsx
git commit -m "feat: add dashboard layout, navbar, and landing page"
```

---

### Task 15: Frontend Components — GenerationForm + GenerationStatus

**Files:**
- Create: `src/components/GenerationForm.tsx`
- Create: `src/components/GenerationStatus.tsx`

- [ ] **Step 1: Write GenerationStatus component**

```typescript
// src/components/GenerationStatus.tsx
"use client";

export function GenerationStatus({ isGenerating }: { isGenerating: boolean }) {
  if (!isGenerating) return null;

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-6 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-3" />
      <p className="text-indigo-700 font-medium">Generating ideas...</p>
      <p className="text-indigo-500 text-sm mt-1">
        Fetching market signals and synthesizing ideas. This usually takes 15–45 seconds.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Write GenerationForm component**

```typescript
// src/components/GenerationForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GenerationStatus } from "./GenerationStatus";

export function GenerationForm() {
  const [niche, setNiche] = useState("");
  const [batchSize, setBatchSize] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim() || undefined,
          batchSize,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(data.error ?? "Generation failed");
      }

      const data = await res.json();
      router.push(`/dashboard/generations/${data.generationId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-1">
            Niche (optional)
          </label>
          <input
            id="niche"
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g., productivity, developer tools, e-commerce"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="batchSize" className="block text-sm font-medium text-gray-700 mb-1">
            Number of ideas: {batchSize}
          </label>
          <input
            id="batchSize"
            type="range"
            min={3}
            max={10}
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>3</span>
            <span>10</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="rounded bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Ideas"}
        </button>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      <div className="mt-6">
        <GenerationStatus isGenerating={isGenerating} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/GenerationForm.tsx src/components/GenerationStatus.tsx
git commit -m "feat: add GenerationForm and GenerationStatus components"
```

---

### Task 16: Frontend Components — IdeaCard + SignalBadge

**Files:**
- Create: `src/components/SignalBadge.tsx`
- Create: `src/components/IdeaCard.tsx`

- [ ] **Step 1: Write SignalBadge component**

```typescript
// src/components/SignalBadge.tsx
export function SignalBadge({
  trend,
  source,
}: {
  trend: "up" | "flat" | "down";
  source: string;
}) {
  const trendColors = {
    up: "bg-green-100 text-green-800",
    flat: "bg-yellow-100 text-yellow-800",
    down: "bg-red-100 text-red-800",
  };

  const trendLabels = { up: "↑", flat: "→", down: "↓" };

  const sourceLabels: Record<string, string> = {
    google_trends: "Google",
    reddit: "Reddit",
    hackernews: "HN",
    producthunt: "PH",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${trendColors[trend]}`}
    >
      {sourceLabels[source] ?? source} {trendLabels[trend]}
    </span>
  );
}
```

- [ ] **Step 2: Write IdeaCard component**

```typescript
// src/components/IdeaCard.tsx
"use client";

import Link from "next/link";
import { SignalBadge } from "./SignalBadge";

interface IdeaCardProps {
  id: string;
  name: string;
  tagline: string;
  monetizationModel: string;
  confidenceScore: number;
  isSaved: number;
  signals?: { source: string; trendDirection: string }[];
}

export function IdeaCard({ id, name, tagline, monetizationModel, confidenceScore, isSaved, signals = [] }: IdeaCardProps) {
  const modelLabels: Record<string, string> = {
    subscription: "Subscription",
    one_time: "One-time",
    usage_based: "Usage-based",
    hybrid: "Hybrid",
  };

  const confidenceColor =
    confidenceScore >= 80
      ? "text-green-700"
      : confidenceScore >= 60
        ? "text-yellow-700"
        : "text-red-700";

  return (
    <Link
      href={`/dashboard/ideas/${id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          <p className="text-sm text-gray-500 mt-1">{tagline}</p>
        </div>
        <div className="ml-3 flex-shrink-0 flex flex-col items-end gap-1">
          <span className={`text-sm font-bold ${confidenceColor}`}>
            {confidenceScore}%
          </span>
          <span className="text-xs text-gray-400">{modelLabels[monetizationModel] ?? monetizationModel}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-3">
        {signals.slice(0, 3).map((s, i) => (
          <SignalBadge key={i} trend={s.trendDirection as "up" | "flat" | "down"} source={s.source} />
        ))}
        {isSaved === 1 && (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 ml-auto">
            Saved
          </span>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/SignalBadge.tsx src/components/IdeaCard.tsx
git commit -m "feat: add SignalBadge and IdeaCard components"
```

---

### Task 17: Frontend Components — IdeaDetail + IdeaFilters

**Files:**
- Create: `src/components/IdeaDetail.tsx`
- Create: `src/components/IdeaFilters.tsx`

- [ ] **Step 1: Write IdeaFilters component**

```typescript
// src/components/IdeaFilters.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function IdeaFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentModel = searchParams.get("monetizationModel") ?? "";
  const currentConfidence = searchParams.get("minConfidence") ?? "";
  const currentSaved = searchParams.get("saved") ?? "";

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={currentModel}
        onChange={(e) => setFilter("monetizationModel", e.target.value)}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm"
      >
        <option value="">All models</option>
        <option value="subscription">Subscription</option>
        <option value="one_time">One-time</option>
        <option value="usage_based">Usage-based</option>
        <option value="hybrid">Hybrid</option>
      </select>

      <select
        value={currentConfidence}
        onChange={(e) => setFilter("minConfidence", e.target.value)}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm"
      >
        <option value="">Any confidence</option>
        <option value="80">80%+ (High)</option>
        <option value="60">60%+ (Medium)</option>
        <option value="0">All</option>
      </select>

      <select
        value={currentSaved}
        onChange={(e) => setFilter("saved", e.target.value)}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm"
      >
        <option value="">All ideas</option>
        <option value="true">Saved only</option>
      </select>
    </div>
  );
}
```

- [ ] **Step 2: Write IdeaDetail component**

```typescript
// src/components/IdeaDetail.tsx
"use client";

import { useState } from "react";
import { SignalBadge } from "./SignalBadge";

interface IdeaDetailProps {
  idea: {
    id: string;
    name: string;
    tagline: string;
    description: string;
    targetAudience: string;
    monetizationModel: string;
    confidenceScore: number;
    isSaved: number;
    notes: string | null;
  };
  signals: {
    id: string;
    source: string;
    keyword: string;
    volumeEstimate: number | null;
    trendDirection: string;
    mentionCount: number;
    sentimentSummary: string;
  }[];
  competitors: {
    id: string;
    name: string;
    url: string | null;
    description: string | null;
    strength: string;
  }[];
  details: {
    suggestedTechStack: string[];
    estimatedTAM: string;
    acquisitionChannels: string[];
    pricingSuggestions: { plan: string; price: string; features: string[] }[];
    mvpFeatureSet: string[];
  } | null;
}

export function IdeaDetail({ idea, signals, competitors, details }: IdeaDetailProps) {
  const [saved, setSaved] = useState(idea.isSaved === 1);
  const [saving, setSaving] = useState(false);

  async function toggleSave() {
    setSaving(true);
    try {
      await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSaved: !saved }),
      });
      setSaved(!saved);
    } catch {
      // ignore errors — optimistic update
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{idea.name}</h1>
            <p className="text-lg text-gray-600 mt-1">{idea.tagline}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-lg font-bold ${
                idea.confidenceScore >= 80
                  ? "text-green-700"
                  : idea.confidenceScore >= 60
                    ? "text-yellow-700"
                    : "text-red-700"
              }`}
            >
              {idea.confidenceScore}%
            </span>
            <button
              onClick={toggleSave}
              disabled={saving}
              className={`rounded px-3 py-1 text-sm font-medium border ${
                saved
                  ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Description
        </h2>
        <p className="text-gray-800 mt-2">{idea.description}</p>
        <p className="text-gray-600 mt-2">
          <strong>Target audience:</strong> {idea.targetAudience}
        </p>
        <p className="text-gray-600">
          <strong>Monetization:</strong> {idea.monetizationModel}
        </p>
      </section>

      {/* Market Signals */}
      {signals.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Market Signals
          </h2>
          <div className="space-y-3">
            {signals.map((s) => (
              <div key={s.id} className="rounded border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <SignalBadge
                    trend={s.trendDirection as "up" | "flat" | "down"}
                    source={s.source}
                  />
                  <span className="font-medium text-sm">{s.keyword}</span>
                </div>
                <p className="text-sm text-gray-600">{s.sentimentSummary}</p>
                <div className="flex gap-4 text-xs text-gray-400 mt-1">
                  {s.volumeEstimate != null && <span>Volume: {s.volumeEstimate}</span>}
                  <span>Mentions: {s.mentionCount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competitors */}
      {competitors.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Competitors
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {competitors.map((c) => (
              <div key={c.id} className="rounded border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{c.strength}</span>
                </div>
                {c.description && (
                  <p className="text-xs text-gray-500 mt-1">{c.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Details */}
      {details && (
        <>
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {(details.suggestedTechStack ?? []).map((t) => (
                <span
                  key={t}
                  className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Estimated TAM
            </h2>
            <p className="text-gray-800">{details.estimatedTAM}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Pricing Suggestions
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {(details.pricingSuggestions ?? []).map((p) => (
                <div key={p.plan} className="rounded border border-gray-200 p-3">
                  <div className="font-semibold text-sm">{p.plan}</div>
                  <div className="text-lg font-bold text-indigo-600">{p.price}</div>
                  <ul className="mt-2 space-y-1">
                    {(p.features ?? []).map((f) => (
                      <li key={f} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="text-green-500 mt-0.5">&#10003;</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Acquisition Channels
            </h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {(details.acquisitionChannels ?? []).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              MVP Feature Set
            </h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {(details.mvpFeatureSet ?? []).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
        </>
      )}
    </article>
  );
}
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/IdeaDetail.tsx src/components/IdeaFilters.tsx
git commit -m "feat: add IdeaDetail and IdeaFilters components"
```

---

### Task 18: Dashboard Pages

**Files:**
- Create: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Write dashboard hub page**

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { GenerationForm } from "@/components/GenerationForm";
import { IdeaCard } from "@/components/IdeaCard";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";
import { ideas, ideaGenerations, ideaSignals } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    return null; // Middleware handles redirect
  }

  // Fetch recent ideas
  const recentGens = await db
    .select({ id: ideaGenerations.id })
    .from(ideaGenerations)
    .where(eq(ideaGenerations.userId, session.user.id))
    .orderBy(desc(ideaGenerations.createdAt))
    .limit(3);

  const genIds = recentGens.map((g) => g.id);

  let recentIdeas: (typeof ideas.$inferSelect & { signals: { source: string; trendDirection: string }[] })[] = [];

  if (genIds.length > 0) {
    const { inArray } = await import("drizzle-orm");
    recentIdeas = await db
      .select()
      .from(ideas)
      .where(inArray(ideas.generationId, genIds))
      .orderBy(desc(ideas.confidenceScore))
      .limit(6);

    // Fetch signals for display
    const ideaIds = recentIdeas.map((i) => i.id);
    if (ideaIds.length > 0) {
      const allSignals = await db
        .select({
          ideaId: ideaSignals.ideaId,
          source: ideaSignals.source,
          trendDirection: ideaSignals.trendDirection,
        })
        .from(ideaSignals)
        .where(inArray(ideaSignals.ideaId, ideaIds));

      const signalsByIdea = new Map<string, { source: string; trendDirection: string }[]>();
      for (const s of allSignals) {
        const arr = signalsByIdea.get(s.ideaId) ?? [];
        arr.push({ source: s.source, trendDirection: s.trendDirection ?? "flat" });
        signalsByIdea.set(s.ideaId, arr);
      }

      recentIdeas = recentIdeas.map((idea) => ({
        ...idea,
        signals: signalsByIdea.get(idea.id) ?? [],
      }));
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Generate Ideas</h1>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <GenerationForm />
        </div>
      </section>

      {recentIdeas.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Ideas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                id={idea.id}
                name={idea.name}
                tagline={idea.tagline}
                monetizationModel={idea.monetizationModel}
                confidenceScore={idea.confidenceScore}
                isSaved={idea.isSaved}
                signals={idea.signals}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite dashboard page to avoid `await import`**

The `await import("drizzle-orm")` pattern is awkward. Move `inArray` to the top-level import:

```typescript
import { eq, desc, inArray } from "drizzle-orm";
```

And replace the `await import` line with just using `inArray` directly. Then remove the `{ inArray } = await import(...)` block.

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: add dashboard hub page with generation form and recent ideas"
```

---

### Task 19: Generation History + Idea Browse Pages

**Files:**
- Create: `src/app/(dashboard)/dashboard/generations/page.tsx`
- Create: `src/app/(dashboard)/dashboard/ideas/page.tsx`

- [ ] **Step 1: Write generation history page**

```typescript
// src/app/(dashboard)/dashboard/generations/page.tsx
import Link from "next/link";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";
import { ideaGenerations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function GenerationsPage() {
  const session = await getSession();

  const generations = await db
    .select()
    .from(ideaGenerations)
    .where(eq(ideaGenerations.userId, session!.user!.id))
    .orderBy(desc(ideaGenerations.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Generation History</h1>

      {generations.length === 0 ? (
        <p className="text-gray-500">No generations yet. Go to the dashboard to generate your first ideas.</p>
      ) : (
        <div className="space-y-3">
          {generations.map((gen) => (
            <Link
              key={gen.id}
              href={`/dashboard/generations/${gen.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">
                    {gen.niche ? `Niche: ${gen.niche}` : "Broad search"}
                  </span>
                  <span className="text-sm text-gray-500 ml-3">
                    {gen.batchSize} ideas
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      gen.status === "complete"
                        ? "bg-green-100 text-green-800"
                        : gen.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : gen.status === "running"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {gen.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(gen.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write ideas browse page**

```typescript
// src/app/(dashboard)/dashboard/ideas/page.tsx
import { IdeaCard } from "@/components/IdeaCard";
import { IdeaFilters } from "@/components/IdeaFilters";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";
import { ideas, ideaGenerations, ideaSignals } from "@/lib/db/schema";
import { eq, desc, and, gte, inArray } from "drizzle-orm";

interface SearchParams {
  page?: string;
  monetizationModel?: string;
  minConfidence?: string;
  saved?: string;
}

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  const params = await searchParams;

  const page = parseInt(params.page ?? "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get user's generation IDs
  const userGens = await db
    .select({ id: ideaGenerations.id })
    .from(ideaGenerations)
    .where(eq(ideaGenerations.userId, session!.user!.id));

  const genIds = userGens.map((g) => g.id);
  if (genIds.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">All Ideas</h1>
        <p className="text-gray-500">No ideas yet. Generate some first.</p>
      </div>
    );
  }

  // Build conditions
  const conditions = [inArray(ideas.generationId, genIds)];

  if (params.monetizationModel) {
    conditions.push(
      eq(ideas.monetizationModel, params.monetizationModel as typeof ideas.monetizationModel.enumValues[number])
    );
  }
  if (params.minConfidence) {
    conditions.push(gte(ideas.confidenceScore, parseInt(params.minConfidence, 10)));
  }
  if (params.saved === "true") {
    conditions.push(eq(ideas.isSaved, 1));
  }

  const results = await db
    .select()
    .from(ideas)
    .where(and(...conditions))
    .orderBy(desc(ideas.confidenceScore))
    .limit(limit)
    .offset(offset);

  // Fetch signals for display
  const ideaIds = results.map((i) => i.id);
  let signalsByIdea = new Map<string, { source: string; trendDirection: string }[]>();

  if (ideaIds.length > 0) {
    const allSignals = await db
      .select({
        ideaId: ideaSignals.ideaId,
        source: ideaSignals.source,
        trendDirection: ideaSignals.trendDirection,
      })
      .from(ideaSignals)
      .where(inArray(ideaSignals.ideaId, ideaIds));

    for (const s of allSignals) {
      const arr = signalsByIdea.get(s.ideaId) ?? [];
      arr.push({ source: s.source, trendDirection: s.trendDirection ?? "flat" });
      signalsByIdea.set(s.ideaId, arr);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Ideas</h1>
      <IdeaFilters />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((idea) => (
          <IdeaCard
            key={idea.id}
            id={idea.id}
            name={idea.name}
            tagline={idea.tagline}
            monetizationModel={idea.monetizationModel}
            confidenceScore={idea.confidenceScore}
            isSaved={idea.isSaved}
            signals={signalsByIdea.get(idea.id) ?? []}
          />
        ))}
      </div>

      {results.length === 0 && (
        <p className="text-gray-500">No ideas match your filters.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/generations/page.tsx src/app/\(dashboard\)/dashboard/ideas/page.tsx
git commit -m "feat: add generation history and ideas browse pages"
```

---

### Task 20: Idea Detail Page

**Files:**
- Create: `src/app/(dashboard)/dashboard/ideas/[id]/page.tsx`
- Create: `src/app/(dashboard)/dashboard/generations/[id]/page.tsx`

- [ ] **Step 1: Write idea detail page**

```typescript
// src/app/(dashboard)/dashboard/ideas/[id]/page.tsx
import { IdeaDetail } from "@/components/IdeaDetail";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";
import {
  ideas,
  ideaSignals,
  ideaCompetitors,
  ideaDetails,
  ideaGenerations,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
  if (!idea) return notFound();

  // Verify ownership
  const [gen] = await db
    .select({ userId: ideaGenerations.userId })
    .from(ideaGenerations)
    .where(eq(ideaGenerations.id, idea.generationId));

  if (!gen || gen.userId !== session!.user!.id) return notFound();

  const signals = await db
    .select()
    .from(ideaSignals)
    .where(eq(ideaSignals.ideaId, id));

  const competitors = await db
    .select()
    .from(ideaCompetitors)
    .where(eq(ideaCompetitors.ideaId, id));

  const [details] = await db
    .select()
    .from(ideaDetails)
    .where(eq(ideaDetails.ideaId, id));

  return (
    <div className="max-w-3xl">
      <a
        href="/dashboard/ideas"
        className="text-sm text-indigo-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to ideas
      </a>
      <IdeaDetail
        idea={idea}
        signals={signals}
        competitors={competitors}
        details={
          details
            ? {
                suggestedTechStack: details.suggestedTechStack as string[],
                estimatedTAM: details.estimatedTAM ?? "",
                acquisitionChannels: details.acquisitionChannels as string[],
                pricingSuggestions: details.pricingSuggestions as {
                  plan: string;
                  price: string;
                  features: string[];
                }[],
                mvpFeatureSet: details.mvpFeatureSet as string[],
              }
            : null
        }
      />
    </div>
  );
}
```

- [ ] **Step 2: Write generation detail page**

```typescript
// src/app/(dashboard)/dashboard/generations/[id]/page.tsx
import { IdeaCard } from "@/components/IdeaCard";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db/client";
import { ideaGenerations, ideas, ideaSignals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function GenerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  const [generation] = await db
    .select()
    .from(ideaGenerations)
    .where(
      and(
        eq(ideaGenerations.id, id),
        eq(ideaGenerations.userId, session!.user!.id)
      )
    );

  if (!generation) return notFound();

  const generationIdeas = await db
    .select()
    .from(ideas)
    .where(eq(ideas.generationId, id));

  // Fetch signals for display
  const ideaIds = generationIdeas.map((i) => i.id);
  let signalsByIdea = new Map<string, { source: string; trendDirection: string }[]>();

  if (ideaIds.length > 0) {
    const { inArray } = await import("drizzle-orm");
    const allSignals = await db
      .select({
        ideaId: ideaSignals.ideaId,
        source: ideaSignals.source,
        trendDirection: ideaSignals.trendDirection,
      })
      .from(ideaSignals)
      .where(inArray(ideaSignals.ideaId, ideaIds));

    for (const s of allSignals) {
      const arr = signalsByIdea.get(s.ideaId) ?? [];
      arr.push({ source: s.source, trendDirection: s.trendDirection ?? "flat" });
      signalsByIdea.set(s.ideaId, arr);
    }
  }

  return (
    <div className="space-y-6">
      <a
        href="/dashboard/generations"
        className="text-sm text-indigo-600 hover:underline inline-block"
      >
        &larr; Back to history
      </a>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {generation.niche ? `Niche: ${generation.niche}` : "Broad Search"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Generated {generation.batchSize} ideas &middot;{" "}
          {new Date(generation.createdAt).toLocaleDateString()} &middot;{" "}
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              generation.status === "complete"
                ? "bg-green-100 text-green-800"
                : generation.status === "failed"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {generation.status}
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {generationIdeas.map((idea) => (
          <IdeaCard
            key={idea.id}
            id={idea.id}
            name={idea.name}
            tagline={idea.tagline}
            monetizationModel={idea.monetizationModel}
            confidenceScore={idea.confidenceScore}
            isSaved={idea.isSaved}
            signals={signalsByIdea.get(idea.id) ?? []}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Fix generation detail page — remove `await import`**

Same pattern as before. Move `inArray` to a top-level import:

```typescript
import { eq, and, inArray, desc } from "drizzle-orm";
```

And remove the `const { inArray } = await import(...)` block entirely.

- [ ] **Step 4: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/ideas/ src/app/\(dashboard\)/dashboard/generations/
git commit -m "feat: add idea detail and generation detail pages"
```

---

### Task 21: Run Database Migration + Integration Verification

**Files:**
- Modify: `.env` (create from .env.example with real values)

- [ ] **Step 1: Create `.env` from `.env.example`**

Copy `.env.example` to `.env` and fill in real values for `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `DEEPSEEK_API_KEY`.

- [ ] **Step 2: Push schema to Neon**

```bash
npx drizzle-kit push
```
Expected: tables created in Neon. Check output for any errors.

- [ ] **Step 3: Run dev server and verify startup**

```bash
npm run dev
```
Expected: dev server starts without errors. Visit http://localhost:3000 — landing page should render. Verify `/login` and `/signup` pages render.

- [ ] **Step 4: Verify TypeScript compilation one final time**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete initial implementation — all pages, API routes, and components"
```
