import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

function createClientAndDb() {
	const url = process.env.TURSO_DATABASE_URL;
	const authToken = process.env.TURSO_AUTH_TOKEN;

	if (!url) {
		throw new Error(
			"TURSO_DATABASE_URL is not set. Cannot initialize database client.",
		);
	}

	const client = createClient({ url, authToken });
	const db = drizzle(client, { schema });
	return { client, db };
}

let _state: ReturnType<typeof createClientAndDb> | null = null;

function getState() {
	if (!_state) {
		_state = createClientAndDb();
	}
	return _state;
}

// Lazy proxy for the drizzle instance — defers DB connection from module
// evaluation to first property access so Next.js build succeeds offline.
const dbProxy = new Proxy({} as ReturnType<typeof createClientAndDb>["db"], {
	get(_, prop, receiver) {
		return Reflect.get(
			getState().db as Record<string | symbol, unknown>,
			prop,
			receiver,
		);
	},
	ownKeys() {
		return Reflect.ownKeys(getState().db as object);
	},
	getOwnPropertyDescriptor(_, prop) {
		return Reflect.getOwnPropertyDescriptor(getState().db as object, prop);
	},
});

export const db = dbProxy;

/** Shared Turso client — reuse this when creating a Kysely dialect for Better Auth. */
export function getTursoClient() {
	return getState().client;
}
