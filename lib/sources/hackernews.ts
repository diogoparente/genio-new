import type { NormalizedSignal, SignalSource } from "./types";

/* ------------------------------------------------------------------ */
/*  Hacker News adapter — uses the Algolia HN Search API               */
/* ------------------------------------------------------------------ */

const HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search_by_date";

interface HNHit {
	title?: string;
	story_title?: string;
	comment_text?: string;
	points?: number;
	num_comments?: number;
	created_at_i?: number;
	objectID: string;
}

interface HNSearchResponse {
	hits: HNHit[];
}

export const hackernewsSource: SignalSource = {
	name: "hackernews",

	async fetchSignals(params) {
		try {
			const query = params.niche ?? "startup";
			const url = `${HN_SEARCH_URL}?query=${encodeURIComponent(
				query,
			)}&tags=story&hitsPerPage=${params.limit}`;
			const res = await fetch(url, {
				signal: AbortSignal.timeout(10_000),
			});

			if (!res.ok) return [];

			const json: HNSearchResponse = await res.json();

			return (json.hits ?? []).map((hit) => {
				const title = hit.title ?? hit.story_title ?? query;
				const text = `${title} ${hit.comment_text ?? ""}`;
				return {
					source: "hackernews",
					keyword: title.substring(0, 60),
					volume: hit.points ?? null,
					trend: "flat" as const,
					mentionCount: (hit.num_comments ?? 0) + 1,
					sentimentSummary: text.length > 200 ? text.slice(0, 197) + "..." : text,
					rawData: {
						objectID: hit.objectID,
						title,
						points: hit.points,
						numComments: hit.num_comments,
						createdAt: hit.created_at_i,
					},
				};
			});
		} catch {
			return [];
		}
	},

	async healthCheck() {
		try {
			const res = await fetch(
				`${HN_SEARCH_URL}?query=test&tags=story&hitsPerPage=1`,
				{ signal: AbortSignal.timeout(5_000) },
			);
			return res.ok;
		} catch {
			return false;
		}
	},
};
