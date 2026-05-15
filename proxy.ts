import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const protectedPrefixes = ["/dashboard", "/api/generations", "/api/ideas"];
const authPrefixes = ["/login", "/signup", "/sign-in"];

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isProtectedRoute = protectedPrefixes.some((prefix) =>
		pathname.startsWith(prefix),
	);
	const isAuthPage = authPrefixes.some((prefix) =>
		pathname.startsWith(prefix),
	);

	// Only check session for protected or auth routes
	if (!isProtectedRoute && !isAuthPage) {
		return NextResponse.next();
	}

	const session = await auth.api.getSession({
		headers: request.headers,
	});
	const isAuthenticated = !!session;

	if (isProtectedRoute && !isAuthenticated) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	if (isAuthPage && isAuthenticated) {
		const dashboardUrl = new URL("/dashboard", request.url);
		return NextResponse.redirect(dashboardUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (images, etc.)
		 * - api/auth/* (auth API routes — must be accessible for sign in/up)
		 */
		"/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
