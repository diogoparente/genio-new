import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

function createDb() {
	const url = process.env.TURSO_DATABASE_URL;
	const authToken = process.env.TURSO_AUTH_TOKEN;

	if (!url) {
		throw new Error(
			"TURSO_DATABASE_URL is not set. Cannot initialize database client.",
		);
	}

	const client = createClient({ url, authToken });
	return drizzle(client, { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

function getDb() {
	if (!_db) {
		_db = createDb();
	}
	return _db;
}

// Lazy proxy: defers DB connection from module evaluation to first property access.
// This allows Next.js build to succeed without a database connection.
const dbProxy = new Proxy({} as ReturnType<typeof createDb>, {
	get(_, prop, receiver) {
		return Reflect.get(
			getDb() as Record<string | symbol, unknown>,
			prop,
			receiver,
		);
	},
	ownKeys() {
		return Reflect.ownKeys(getDb() as object);
	},
	getOwnPropertyDescriptor(_, prop) {
		return Reflect.getOwnPropertyDescriptor(getDb() as object, prop);
	},
});

export const db = dbProxy;
