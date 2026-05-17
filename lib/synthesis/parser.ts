import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Helpers for lenient LLM output parsing                             */
/* ------------------------------------------------------------------ */

/**
 * Maps common LLM synonym variations back to canonical enum values.
 * Handles: different casing, numbers, and synonymous strings.
 */
function normalizeEnumSynonym<T extends string>(
	mappings: Record<T, string[]>,
): (val: unknown) => unknown {
	const reverseMap = new Map<string, T>();
	for (const [canonical, synonyms] of Object.entries(mappings) as [
		T,
		string[],
	][]) {
		for (const syn of synonyms) {
			reverseMap.set(syn, canonical);
		}
	}
	return (val: unknown) => {
		if (typeof val === "number") {
			val = String(val);
		}
		if (typeof val === "string") {
			const lower = val.toLowerCase().trim();
			const mapped = reverseMap.get(lower);
			if (mapped) return mapped;
		}
		return val;
	};
}

function normalizeConfidenceScore(val: unknown): unknown {
	// LLMs often return string numbers, or scale 0-100
	if (typeof val === "string") {
		const num = Number(val);
		if (!Number.isNaN(num)) val = num;
	}
	if (typeof val === "number") {
		if (val > 1 && val <= 100) return val / 100;
		return val;
	}
	return val;
}

function normalizeLowercase(val: unknown): unknown {
	if (typeof val === "string") return val.toLowerCase().trim();
	return val;
}

function normalizeUrl(val: unknown): unknown {
	// Accept anything; if it's not a valid URL, store as empty string
	if (typeof val === "string") {
		const trimmed = val.trim();
		if (trimmed === "") return "";
		try {
			new URL(trimmed);
			return trimmed;
		} catch {
			return ""; // Invalid URL → empty string fallback
		}
	}
	return val ?? "";
}

/* ------------------------------------------------------------------ */
/*  Lenient schemas — designed to accept typical LLM output quirks     */
/* ------------------------------------------------------------------ */

export const synthesizedCompetitorSchema = z.object({
	name: z.string().min(1),
	url: z.preprocess(normalizeUrl, z.string()),
	description: z.string().optional().default(""),
	strength: z.preprocess(
		normalizeLowercase,
		z.enum(["low", "medium", "high"]),
	),
});

export const synthesizedIdeaSchema = z.looseObject({
	name: z.string().min(1),
	tagline: z.string().min(1),
	description: z.string().min(1),
	targetAudience: z.string().min(1),
	monetizationModel: z.string().min(1),
	confidenceScore: z.preprocess(
		normalizeConfidenceScore,
		z.number().min(0).max(1),
	),
	signals: z.array(
		z.object({
			source: z.string(),
			keyword: z.string(),
			volume: z.preprocess(
				(val) => {
					if (val === null || val === undefined) return undefined;
					if (typeof val === "string") {
						const n = Number(val);
						return Number.isNaN(n) ? undefined : n;
					}
					return val;
				},
				z.number().nullable().optional(),
			),
			trend: z.preprocess(
				normalizeEnumSynonym({
					up: [
						"up",
						"rising",
						"upward",
						"growing",
						"positive",
						"increase",
						"uptrend",
					],
					flat: [
						"flat",
						"stable",
						"steady",
						"unchanged",
						"neutral",
						"sideways",
					],
					down: [
						"down",
						"declining",
						"downward",
						"decreasing",
						"falling",
						"negative",
						"decrease",
						"downtrend",
					],
				}),
				z.enum(["up", "flat", "down"]),
			),
			mentionCount: z.coerce.number().int().nonnegative(),
			sentimentSummary: z.string(),
		}),
	),
	competitors: z.array(synthesizedCompetitorSchema),
	suggestedTechStack: z.array(z.string()).optional().default([]),
	estimatedTAM: z.string().optional().default(""),
	acquisitionChannels: z.array(z.string()).optional().default([]),
	pricingSuggestions: z.array(z.string()).optional().default([]),
	mvpFeatureSet: z.array(z.string()).optional().default([]),
}); // looseObject allows extra fields the LLM might add

export const synthesizedOutputSchema = z.object({
	ideas: z.array(synthesizedIdeaSchema).min(1).max(10),
});

/* ------------------------------------------------------------------ */
/*  Strict schemas (kept for reference / testing)                      */
/* ------------------------------------------------------------------ */

export const strictCompetitorSchema = z.object({
	name: z.string().min(1),
	url: z.url().optional().or(z.literal("")),
	description: z.string().optional(),
	strength: z.enum(["low", "medium", "high"]),
});

export const strictIdeaSchema = z.object({
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
	competitors: z.array(strictCompetitorSchema),
	suggestedTechStack: z.array(z.string()).optional(),
	estimatedTAM: z.string().optional(),
	acquisitionChannels: z.array(z.string()).optional(),
	pricingSuggestions: z.array(z.string()).optional(),
	mvpFeatureSet: z.array(z.string()).optional(),
});

/* ------------------------------------------------------------------ */
/*  Exported types                                                     */
/* ------------------------------------------------------------------ */

export type SynthesizedIdea = z.infer<typeof synthesizedIdeaSchema>;
export type SynthesizedCompetitor = z.infer<typeof synthesizedCompetitorSchema>;
export type SynthesizedOutput = z.infer<typeof synthesizedOutputSchema>;
