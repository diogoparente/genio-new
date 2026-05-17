import { db } from "@/lib/db/client";
import {
	ideaGenerations,
	ideas,
	ideaSignals,
	ideaCompetitors,
	ideaDetails,
} from "@/lib/db/schema";
import { fetchAllSignals } from "@/lib/sources/registry";
import { getLLMProvider } from "@/lib/llm/provider";
import { synthesizedOutputSchema } from "@/lib/synthesis/parser";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/synthesis/prompt";
import type { NormalizedSignal } from "@/lib/sources/types";
import { eq } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/*  runGeneration — core pipeline entry point                          */
/* ------------------------------------------------------------------ */

interface RunGenerationParams {
	userId: string;
	niche?: string;
	batchSize?: number;
}

function generateId(): string {
	return crypto.randomUUID();
}

export async function runGeneration(params: RunGenerationParams) {
	const { userId, niche, batchSize = 7 } = params;
	const generationId = generateId();

	// 1. Create generation record (status: "running")
	await db.insert(ideaGenerations).values({
		id: generationId,
		userId,
		niche: niche ?? null,
		batchSize,
		status: "running",
	});

	try {
		// 2. Fetch signals from all sources in parallel
		const sourceResults = await fetchAllSignals({ niche, limit: 20 });
		const allSignals: NormalizedSignal[] = [];
		let successfulSources = 0;
		for (const r of sourceResults) {
			if (!r.error) successfulSources++;
			allSignals.push(...r.signals);
		}

		if (successfulSources === 0 && allSignals.length === 0) {
			await db
				.update(ideaGenerations)
				.set({ status: "failed" })
				.where(eq(ideaGenerations.id, generationId));
			throw new Error(
				"All signal sources are currently unavailable. Please try again later.",
			);
		}

		// 3. Build prompts and call LLM
		const provider = getLLMProvider();
		const systemPrompt = buildSystemPrompt();
		const userPrompt = buildUserPrompt(allSignals, niche, batchSize);

		const result = await provider.generateStructured({
			systemPrompt,
			userPrompt,
			schema: synthesizedOutputSchema,
			expectedCount: batchSize,
		});

		if (result.discarded > 0) {
			console.warn(
				`[genio] Generation ${generationId}: ${result.discarded} ideas discarded by validation` +
					(result.truncated ? " (output was truncated)" : "") +
					(result.retried ? " (retry performed)" : ""),
			);
		}

		// 4. Insert ideas and related data into DB
		let totalConfidence = 0;

		for (const synthIdea of result.data.ideas) {
			const ideaId = generateId();

			// Insert the idea record
			await db.insert(ideas).values({
				id: ideaId,
				generationId,
				name: synthIdea.name,
				tagline: synthIdea.tagline,
				description: synthIdea.description,
				targetAudience: synthIdea.targetAudience,
				monetizationModel: synthIdea.monetizationModel,
				confidenceScore: synthIdea.confidenceScore,
			});

			totalConfidence += synthIdea.confidenceScore;

			// Insert signals referenced by this idea
			if (synthIdea.signals.length > 0) {
				await db.insert(ideaSignals).values(
					synthIdea.signals.map((s) => ({
						id: generateId(),
						ideaId,
						source: s.source,
						keyword: s.keyword,
						volumeEstimate: s.volume ?? null,
						trendDirection: s.trend,
						mentionCount: s.mentionCount,
						sentimentSummary: s.sentimentSummary,
					})),
				);
			}

			// Insert competitors for this idea
			if (synthIdea.competitors.length > 0) {
				await db.insert(ideaCompetitors).values(
					synthIdea.competitors.map((c) => ({
						id: generateId(),
						ideaId,
						name: c.name,
						url: c.url ?? null,
						description: c.description ?? null,
						strength: c.strength,
					})),
				);
			}

			// Insert deep details
			await db.insert(ideaDetails).values({
				id: generateId(),
				ideaId,
				suggestedTechStack: synthIdea.suggestedTechStack
					? JSON.stringify(synthIdea.suggestedTechStack)
					: null,
				estimatedTAM: synthIdea.estimatedTAM ?? null,
				acquisitionChannels: synthIdea.acquisitionChannels
					? JSON.stringify(synthIdea.acquisitionChannels)
					: null,
				pricingSuggestions: synthIdea.pricingSuggestions
					? JSON.stringify(synthIdea.pricingSuggestions)
					: null,
				mvpFeatureSet: synthIdea.mvpFeatureSet
					? JSON.stringify(synthIdea.mvpFeatureSet)
					: null,
			});
		}

		// 5. Mark generation complete with average confidence score
		const avgConfidence =
			result.data.ideas.length > 0
				? totalConfidence / result.data.ideas.length
				: 0;

		await db
			.update(ideaGenerations)
			.set({ status: "completed", confidence: avgConfidence })
			.where(eq(ideaGenerations.id, generationId));

		return { generationId, ideaCount: result.data.ideas.length };
	} catch (error) {
		// 6. Mark generation as failed
		await db
			.update(ideaGenerations)
			.set({ status: "failed" })
			.where(eq(ideaGenerations.id, generationId));

		throw error;
	}
}
