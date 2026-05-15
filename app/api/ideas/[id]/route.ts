import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import {
	ideas,
	ideaSignals,
	ideaCompetitors,
	ideaDetails,
} from "@/lib/db/schema";
import { getIdeaWithRelations, verifyIdeaOwnership } from "@/lib/ideas/reader";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function getSession() {
	return await auth.api.getSession({ headers: await headers() });
}

/* GET /api/ideas/[id] — idea + signals + competitors + details */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	const owns = await verifyIdeaOwnership(id, session.user.id);
	if (!owns) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const data = await getIdeaWithRelations(id);
	if (!data) {
		return NextResponse.json({ error: "Idea not found" }, { status: 404 });
	}

	return NextResponse.json({
		idea: data.idea,
		signals: data.signals,
		competitors: data.competitors,
		details: data.detail ?? null,
	});
}

const patchSchema = z.object({
	isSaved: z.boolean().optional(),
	notes: z.string().optional(),
});

/* PATCH /api/ideas/[id] — update isSaved / notes */
export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	const owns = await verifyIdeaOwnership(id, session.user.id);
	if (!owns) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ error: "Invalid JSON body" },
			{ status: 400 },
		);
	}

	const parsed = patchSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.message },
			{ status: 400 },
		);
	}

	const updates: Record<string, unknown> = {};
	if (parsed.data.isSaved !== undefined) {
		updates.isSaved = parsed.data.isSaved ? 1 : 0;
	}
	if (parsed.data.notes !== undefined) {
		updates.notes = parsed.data.notes;
	}

	if (Object.keys(updates).length === 0) {
		return NextResponse.json({ idea: null });
	}

	await db.update(ideas).set(updates).where(eq(ideas.id, id));

	const [updated] = await db
		.select()
		.from(ideas)
		.where(eq(ideas.id, id))
		.limit(1);

	return NextResponse.json({ idea: updated ?? null });
}

/* DELETE /api/ideas/[id] — delete an idea and its relations */
export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	const owns = await verifyIdeaOwnership(id, session.user.id);
	if (!owns) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	await db.delete(ideaDetails).where(eq(ideaDetails.ideaId, id));
	await db.delete(ideaCompetitors).where(eq(ideaCompetitors.ideaId, id));
	await db.delete(ideaSignals).where(eq(ideaSignals.ideaId, id));
	await db.delete(ideas).where(eq(ideas.id, id));

	return NextResponse.json({ deleted: true });
}
