import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import {
	ideas,
	ideaGenerations,
	ideaSignals,
	ideaCompetitors,
	ideaDetails,
} from "@/lib/db/schema";
import { and, desc, eq, gte, like } from "drizzle-orm";
import { z } from "zod";

async function getSession() {
	return await auth.api.getSession({ headers: await headers() });
}

const querySchema = z.object({
	monetizationModel: z.string().optional(),
	minConfidence: z.coerce.number().min(0).max(1).optional(),
	saved: z
		.enum(["true", "false"])
		.optional()
		.transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
	page: z.coerce.number().int().min(1).optional().default(1),
	limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

/* GET /api/ideas — list ideas with filters (ownership verified via generation) */
export async function GET(request: Request) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const url = new URL(request.url);
	const rawParams: Record<string, string> = {};
	for (const [k, v] of url.searchParams.entries()) {
		rawParams[k] = v;
	}

	const parsed = querySchema.safeParse(rawParams);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.message },
			{ status: 400 },
		);
	}

	const { monetizationModel, minConfidence, saved, page, limit } =
		parsed.data;

	// Verify ownership: join with ideaGenerations on user_id
	const conditions = [eq(ideaGenerations.userId, session.user.id)];

	if (monetizationModel) {
		conditions.push(eq(ideas.monetizationModel, monetizationModel));
	}
	if (minConfidence !== undefined) {
		conditions.push(gte(ideas.confidenceScore, minConfidence));
	}
	if (saved !== undefined) {
		conditions.push(eq(ideas.isSaved, saved ? 1 : 0));
	}

	const offset = (page - 1) * limit;

	const rows = await db
		.select({
			idea: {
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
			},
		})
		.from(ideas)
		.innerJoin(
			ideaGenerations,
			eq(ideaGenerations.id, ideas.generationId),
		)
		.where(and(...conditions))
		.orderBy(desc(ideas.createdAt))
		.limit(limit)
		.offset(offset);

	return NextResponse.json({ ideas: rows.map((r) => r.idea), page, limit });
}
