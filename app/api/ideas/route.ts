import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { listIdeas } from "@/lib/ideas/reader";
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

	const { monetizationModel, minConfidence, saved, page, limit } = parsed.data;

	const result = await listIdeas(session.user.id, {
		monetizationModel,
		minConfidence,
		saved,
		page,
		limit,
	});

	return NextResponse.json(result);
}
