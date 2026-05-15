import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({ message: "MCP endpoint not configured for génio" });
}

export async function POST() {
	return NextResponse.json({ message: "MCP endpoint not configured for génio" });
}

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
	return new NextResponse(null, {
		headers: {
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "authorization, content-type",
		},
	});
}
