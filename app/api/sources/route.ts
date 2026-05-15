import { NextResponse } from "next/server";
import { checkAllSourcesHealth } from "@/lib/sources/registry";

/* GET /api/sources — health check for all signal sources */
export async function GET() {
	const results = await checkAllSourcesHealth();
	const allHealthy = results.every((r) => r.healthy);

	return NextResponse.json({
		healthy: allHealthy,
		sources: results,
	});
}
