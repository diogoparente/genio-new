import { db } from "@/lib/db/client";
import {
	ideas,
	ideaGenerations,
	ideaSignals,
	ideaCompetitors,
	ideaDetails,
} from "@/lib/db/schema";
import { and, desc, eq, gte, sql, count } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface IdeaRow {
	id: string;
	generationId: string;
	name: string;
	tagline: string;
	description: string;
	targetAudience: string;
	monetizationModel: string;
	confidenceScore: number;
	isSaved: number;
	notes: string | null;
	createdAt: string;
}

export interface IdeaFilters {
	monetizationModel?: string;
	minConfidence?: number;
	saved?: boolean;
	page?: number;
	limit?: number;
}

export interface GenerationRow {
	id: string;
	userId: string;
	niche: string | null;
	batchSize: number;
	status: string;
	confidence: number | null;
	createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  listIdeas — paginated + filtered ideas owned by user              */
/* ------------------------------------------------------------------ */

export async function listIdeas(
	userId: string,
	filters: IdeaFilters = {},
): Promise<{ ideas: IdeaRow[]; page: number; limit: number; total: number }> {
	const page = filters.page ?? 1;
	const limit = Math.min(filters.limit ?? 20, 50);
	const offset = (page - 1) * limit;

	const conditions = [eq(ideaGenerations.userId, userId)];

	if (filters.monetizationModel) {
		conditions.push(eq(ideas.monetizationModel, filters.monetizationModel));
	}
	if (filters.minConfidence !== undefined) {
		conditions.push(gte(ideas.confidenceScore, filters.minConfidence));
	}
	if (filters.saved === true) {
		conditions.push(eq(ideas.isSaved, 1));
	}

	const where = and(...conditions);

	const [countRow] = await db
		.select({ count: count() })
		.from(ideas)
		.innerJoin(ideaGenerations, eq(ideas.generationId, ideaGenerations.id))
		.where(where);

	const rows = await db
		.select({
			id: ideas.id,
			generationId: ideas.generationId,
			name: ideas.name,
			tagline: ideas.tagline,
			description: ideas.description,
			targetAudience: ideas.targetAudience,
			monetizationModel: ideas.monetizationModel,
			confidenceScore: ideas.confidenceScore,
			isSaved: ideas.isSaved,
			notes: ideas.notes,
			createdAt: ideas.createdAt,
		})
		.from(ideas)
		.innerJoin(ideaGenerations, eq(ideas.generationId, ideaGenerations.id))
		.where(where)
		.orderBy(desc(ideas.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		ideas: rows,
		page,
		limit,
		total: countRow?.count ?? 0,
	};
}

/* ------------------------------------------------------------------ */
/*  getIdeaWithRelations — single idea + signals + competitors + detail */
/* ------------------------------------------------------------------ */

export async function getIdeaWithRelations(ideaId: string) {
	const [idea] = await db.select().from(ideas).where(eq(ideas.id, ideaId)).limit(1);
	if (!idea) return null;

	const [signals, competitors, [detail]] = await Promise.all([
		db.select().from(ideaSignals).where(eq(ideaSignals.ideaId, ideaId)),
		db
			.select()
			.from(ideaCompetitors)
			.where(eq(ideaCompetitors.ideaId, ideaId)),
		db
			.select()
			.from(ideaDetails)
			.where(eq(ideaDetails.ideaId, ideaId))
			.limit(1),
	]);

	return { idea, signals, competitors, detail: detail ?? null };
}

/* ------------------------------------------------------------------ */
/*  verifyIdeaOwnership                                               */
/* ------------------------------------------------------------------ */

export async function verifyIdeaOwnership(
	ideaId: string,
	userId: string,
): Promise<boolean> {
	const [row] = await db
		.select({ id: ideas.id })
		.from(ideas)
		.innerJoin(ideaGenerations, eq(ideas.generationId, ideaGenerations.id))
		.where(and(eq(ideas.id, ideaId), eq(ideaGenerations.userId, userId)))
		.limit(1);
	return row !== undefined;
}

/* ------------------------------------------------------------------ */
/*  listGenerations — paginated generation history for user           */
/* ------------------------------------------------------------------ */

export async function listGenerations(
	userId: string,
	page = 1,
	limit = 20,
): Promise<{ generations: GenerationRow[]; page: number; limit: number; total: number }> {
	const offset = (page - 1) * limit;

	const [countRow] = await db
		.select({ count: count() })
		.from(ideaGenerations)
		.where(eq(ideaGenerations.userId, userId));

	const rows = await db
		.select()
		.from(ideaGenerations)
		.where(eq(ideaGenerations.userId, userId))
		.orderBy(desc(ideaGenerations.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		generations: rows,
		page,
		limit,
		total: countRow?.count ?? 0,
	};
}

/* ------------------------------------------------------------------ */
/*  fetchSignalsForIdeas — batch fetch signals for multiple ideas     */
/* ------------------------------------------------------------------ */

export async function fetchSignalsForIdeas(ideaIds: string[]) {
	if (ideaIds.length === 0) return [];
	return db
		.select()
		.from(ideaSignals)
		.where(sql`${ideaSignals.ideaId} IN ${ideaIds}`);
}
