import type { NormalizedSignal } from "@/lib/sources/types";

/* ------------------------------------------------------------------ */
/*  Prompt templates for the LLM to generate micro-SaaS ideas          */
/* ------------------------------------------------------------------ */

export function buildSystemPrompt(): string {
	return `You are an experienced market analyst specializing in identifying profitable micro-SaaS opportunities.
You analyze market signals from multiple sources (Google Trends, Reddit, Hacker News, Product Hunt) to
synthesize validated business ideas.

For each idea you generate, you MUST include:
- A catchy product name (max 4 words)
- A compelling one-line tagline
- A detailed 2-3 sentence description of the product
- Target audience (who would pay for this)
- Monetization model (subscription, freemium, usage-based, marketplace, etc.)
- A confidence score between 0 and 1 based on signal strength
- The relevant market signals that support this idea
- 1-3 existing competitors with their strengths
- A suggested tech stack (3-6 technologies)
- Estimated TAM (a descriptive range, e.g. "$50M-$200M")
- Customer acquisition channels (2-4 suggestions)
- Pricing suggestions (2-3 tiers or models)
- An MVP feature set (3-6 features to build first)

Be specific, practical, and data-driven. Focus on niches with demonstrated demand but limited competition.
Do NOT generate generic ideas like "project management tool" — be specific about the niche and use case.

You MUST respond with valid JSON matching this exact structure:
{
  "ideas": [
    {
      "name": "...",
      "tagline": "...",
      "description": "...",
      "targetAudience": "...",
      "monetizationModel": "...",
      "confidenceScore": 0.85,
      "signals": [{ "source": "...", "keyword": "...", "volume": 1000, "trend": "up", "mentionCount": 50, "sentimentSummary": "..." }],
      "competitors": [{ "name": "...", "url": "...", "description": "...", "strength": "medium" }],
      "suggestedTechStack": ["...", "..."],
      "estimatedTAM": "...",
      "acquisitionChannels": ["...", "..."],
      "pricingSuggestions": ["...", "..."],
      "mvpFeatureSet": ["...", "..."]
    }
  ]
}`;
}

export function buildUserPrompt(
	signals: NormalizedSignal[],
	niche?: string,
	batchSize?: number,
): string {
	const count = batchSize ?? 7;
	const nicheContext = niche
		? `\nFocus specifically on the "${niche}" niche.`
		: "\nAnalyze the signals below and identify the most promising opportunities.";

	const signalBlock =
		signals.length > 0
			? signals
					.map(
						(s, i) =>
							`  ${i + 1}. [${s.source}] "${s.keyword}" — trend: ${s.trend}, mentions: ${s.mentionCount}, sentiment: ${s.sentimentSummary}`,
					)
					.join("\n")
			: "  (No external signals available — generate ideas based on current market trends and your knowledge.)";

	return `Generate ${count} validated micro-SaaS business ideas.${nicheContext}

## Market Signals
${signalBlock}

## Requirements
- Generate EXACTLY ${count} ideas, no more and no less.
- Each idea must reference at least one of the signals above where relevant.
- Confidence scores should reflect how well the signals support the idea.
- Be creative but realistic — these should be ideas someone could actually build and sell.

Respond with a JSON object containing an "ideas" array.`;
}
