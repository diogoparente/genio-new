import { LibsqlDialect } from "@libsql/kysely-libsql";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

function createAuth() {
	const dialect = (() => {
		if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
			return new LibsqlDialect({
				url: process.env.TURSO_DATABASE_URL,
				authToken: process.env.TURSO_AUTH_TOKEN,
			});
		}
		return null;
	})();

	if (!dialect) {
		throw new Error(
			"No database configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.",
		);
	}

	const authOptions = {
		appName: "génio",
		database: {
			dialect,
			type: "sqlite",
		},
		emailAndPassword: {
			enabled: true,
		},
		socialProviders: {},
		plugins: [nextCookies()],
		trustedOrigins: [
			...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
			"http://localhost:3000",
		],
	} satisfies BetterAuthOptions;

	return betterAuth(authOptions);
}

let _auth: ReturnType<typeof createAuth> | null = null;

export function getAuth() {
	if (!_auth) {
		_auth = createAuth();
	}
	return _auth;
}

// Lazy proxy: defers DB connection from module evaluation to first property access.
// This allows Next.js build to succeed without a database connection.
const authProxy: ReturnType<typeof createAuth> = new Proxy(
	{} as ReturnType<typeof createAuth>,
	{
		get(_, prop, receiver) {
			return Reflect.get(
				getAuth() as Record<string | symbol, unknown>,
				prop,
				receiver,
			);
		},
		ownKeys() {
			return Reflect.ownKeys(getAuth() as object);
		},
		getOwnPropertyDescriptor(_, prop) {
			return Reflect.getOwnPropertyDescriptor(getAuth() as object, prop);
		},
	},
);

export const auth = authProxy;

export type Session = ReturnType<typeof createAuth> extends {
	$Infer: infer T;
}
	? T extends { Session: infer S }
		? S
		: never
	: never;
