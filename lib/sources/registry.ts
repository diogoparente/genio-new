import { googleTrendsSource } from "./google-trends";
import { redditSource } from "./reddit";
import { hackernewsSource } from "./hackernews";
import { producthuntSource } from "./producthunt";
import type { NormalizedSignal, SignalSource } from "./types";

const sources: SignalSource[] = [
	googleTrendsSource,
	redditSource,
	hackernewsSource,
	producthuntSource,
];

interface FetchAllSignalsResult {
	source: string;
	signals: NormalizedSignal[];
	error?: string;
}

export async function fetchAllSignals(params: {
	niche?: string;
	limit?: number;
}): Promise<FetchAllSignalsResult[]> {
	const limit = params.limit ?? 20;
	const results = await Promise.allSettled(
		sources.map(async (source) => {
			const signals = await source.fetchSignals({
				niche: params.niche,
				limit,
			});
			return { source: source.name, signals };
		}),
	);

	return results.map((r, i) => {
		if (r.status === "fulfilled") {
			return r.value;
		}
		return {
			source: sources[i]?.name ?? "unknown",
			signals: [],
			error: r.reason instanceof Error ? r.reason.message : String(r.reason),
		};
	});
}

interface HealthCheckResult {
	source: string;
	healthy: boolean;
	error?: string;
}

export async function checkAllSourcesHealth(): Promise<HealthCheckResult[]> {
	const results = await Promise.allSettled(
		sources.map(async (source) => ({
			source: source.name,
			healthy: await source.healthCheck(),
		})),
	);

	return results.map((r, i) => {
		if (r.status === "fulfilled") {
			return r.value;
		}
		return {
			source: sources[i]?.name ?? "unknown",
			healthy: false,
			error: r.reason instanceof Error ? r.reason.message : String(r.reason),
		};
	});
}
