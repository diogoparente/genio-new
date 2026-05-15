import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Zod schemas for validating LLM-synthesized micro-SaaS ideas        */
/* ------------------------------------------------------------------ */

export const synthesizedCompetitorSchema = z.object({
	name: z.string().min(1),
	url: z.string().url().optional().or(z.literal("")),
	description: z.string().optional(),
	strength: z.enum(["low", "medium", "high"]),
});

export const synthesizedIdeaSchema = z.object({
	name: z.string().min(1),
	tagline: z.string().min(1),
	description: z.string().min(1),
	targetAudience: z.string().min(1),
	monetizationModel: z.string().min(1),
	confidenceScore: z.number().min(0).max(1),
	signals: z.array(
		z.object({
			source: z.string(),
			keyword: z.string(),
			volume: z.number().nullable().optional(),
			trend: z.enum(["up", "flat", "down"]),
			mentionCount: z.number().int().nonnegative(),
			sentimentSummary: z.string(),
		}),
	),
	competitors: z.array(synthesizedCompetitorSchema),
	suggestedTechStack: z.array(z.string()).optional(),
	estimatedTAM: z.string().optional(),
	acquisitionChannels: z.array(z.string()).optional(),
	pricingSuggestions: z.array(z.string()).optional(),
	mvpFeatureSet: z.array(z.string()).optional(),
});

export const synthesizedOutputSchema = z.object({
	ideas: z.array(synthesizedIdeaSchema).min(1).max(10),
});

export type SynthesizedIdea = z.infer<typeof synthesizedIdeaSchema>;
export type SynthesizedCompetitor = z.infer<typeof synthesizedCompetitorSchema>;
export type SynthesizedOutput = z.infer<typeof synthesizedOutputSchema>;
