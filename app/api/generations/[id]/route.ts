import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import {
	ideaGenerations,
	ideas,
	ideaSignals,
	ideaCompetitors,
	ideaDetails,
} from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

async function getSession() {
	return await auth.api.getSession({ headers: await headers() });
}

/* GET /api/generations/[id] — generation detail + its ideas */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	const [generation] = await db
		.select()
		.from(ideaGenerations)
		.where(eq(ideaGenerations.id, id))
		.limit(1);

	if (!generation) {
		return NextResponse.json(
			{ error: "Generation not found" },
			{ status: 404 },
		);
	}

	if (generation.userId !== session.user.id) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const ideaRows = await db
		.select()
		.from(ideas)
		.where(eq(ideas.generationId, id))
		.orderBy(asc(ideas.confidenceScore));

	// Fetch related signals, competitors, and details for each idea
	const ideasWithRelations = await Promise.all(
		ideaRows.map(async (idea) => {
			const [signals, competitors, [detail]] = await Promise.all([
				db
					.select()
					.from(ideaSignals)
					.where(eq(ideaSignals.ideaId, idea.id)),
				db
					.select()
					.from(ideaCompetitors)
					.where(eq(ideaCompetitors.ideaId, idea.id)),
				db
					.select()
					.from(ideaDetails)
					.where(eq(ideaDetails.ideaId, idea.id))
					.limit(1),
			]);

			return {
				...idea,
				signals,
				competitors,
				details: detail ?? null,
			};
		}),
	);

	return NextResponse.json({ generation, ideas: ideasWithRelations });
}
