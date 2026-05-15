/* ------------------------------------------------------------------ */
/*  In-memory rate limiter for API endpoints                          */
/*  Per-user sliding window — keyed by userId                         */
/* ------------------------------------------------------------------ */

interface Entry {
	count: number;
	resetAt: number;
}

const store = new Map<string, Entry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60_000; // every 60s
let lastCleanup = Date.now();

function cleanup() {
	const now = Date.now();
	if (now - lastCleanup < CLEANUP_INTERVAL) return;
	lastCleanup = now;
	for (const [key, entry] of store) {
		if (now >= entry.resetAt) {
			store.delete(key);
		}
	}
}

export interface RateLimitConfig {
	/** Max requests allowed in the window */
	maxRequests: number;
	/** Window duration in milliseconds */
	windowMs: number;
}

export function checkRateLimit(
	key: string,
	config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
	cleanup();

	const now = Date.now();
	const entry = store.get(key);

	if (!entry || now >= entry.resetAt) {
		const resetAt = now + config.windowMs;
		store.set(key, { count: 1, resetAt });
		return { allowed: true, remaining: config.maxRequests - 1, resetAt };
	}

	entry.count++;
	if (entry.count > config.maxRequests) {
		return { allowed: false, remaining: 0, resetAt: entry.resetAt };
	}

	return {
		allowed: true,
		remaining: config.maxRequests - entry.count,
		resetAt: entry.resetAt,
	};
}
