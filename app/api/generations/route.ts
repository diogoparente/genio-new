import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { ideaGenerations } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { runGeneration } from "@/lib/generation/orchestrator";
import { z } from "zod";

async function getSession() {
	return await auth.api.getSession({ headers: await headers() });
}

const createBodySchema = z.object({
	niche: z.string().optional(),
	batchSize: z.number().int().min(3).max(10).optional().default(7),
});

/* POST /api/generations — create a new generation run */
export async function POST(request: Request) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

	const parsed = createBodySchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.message },
			{ status: 400 },
		);
	}

	try {
		const result = await runGeneration({
			userId: session.user.id,
			niche: parsed.data.niche,
			batchSize: parsed.data.batchSize,
		});
		return NextResponse.json(result, { status: 201 });
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Generation failed";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

/* GET /api/generations — list user's generations (latest 20) */
export async function GET() {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const rows = await db
		.select()
		.from(ideaGenerations)
		.where(eq(ideaGenerations.userId, session.user.id))
		.orderBy(desc(ideaGenerations.createdAt))
		.limit(20);

	return NextResponse.json({ generations: rows });
}
