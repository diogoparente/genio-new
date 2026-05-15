import type { NormalizedSignal, SignalSource } from "./types";

/* ------------------------------------------------------------------ */
/*  Reddit adapter — uses the public Reddit search JSON API            */
/* ------------------------------------------------------------------ */

const REDDIT_SEARCH_URL = "https://www.reddit.com/search.json";

interface RedditChild {
	data: {
		title?: string;
		selftext?: string;
		subreddit?: string;
		score?: number;
		num_comments?: number;
		created_utc?: number;
	};
}

interface RedditResponse {
	data: {
		children: Array<RedditChild>;
	};
}

function deriveSentiment(text: string): string {
	const lower = text.toLowerCase();
	const positive = ["great", "love", "amazing", "best", "awesome"];
	const negative = ["hate", "terrible", "worst", "bad", "broken"];
	let score = 0;
	for (const w of positive) if (lower.includes(w)) score++;
	for (const w of negative) if (lower.includes(w)) score--;
	if (score > 0) return "Positive mentions found";
	if (score < 0) return "Some critical discussion";
	return "Mixed or neutral discussion";
}

export const redditSource: SignalSource = {
	name: "reddit",

	async fetchSignals(params) {
		try {
			const query = params.niche ?? "micro saas";
			const url = `${REDDIT_SEARCH_URL}?q=${encodeURIComponent(query)}&sort=relevance&limit=${params.limit}&raw_json=1`;
			const res = await fetch(url, {
				headers: {
					"User-Agent": "genio/1.0 (market-research-bot)",
				},
				signal: AbortSignal.timeout(10_000),
			});

			if (!res.ok) return [];

			const json: RedditResponse = await res.json();
			const children = json?.data?.children ?? [];

			return children.slice(0, params.limit).map((child) => {
				const post = child.data;
				const text = `${post.title ?? ""} ${post.selftext ?? ""}`;
				return {
					source: "reddit",
					keyword: post.subreddit ?? query,
					volume: post.score ?? null,
					trend: "flat" as const,
					mentionCount: (post.num_comments ?? 0) + 1,
					sentimentSummary: deriveSentiment(text),
					rawData: {
						subreddit: post.subreddit,
						title: post.title,
						score: post.score,
						numComments: post.num_comments,
					},
				};
			});
		} catch {
			return [];
		}
	},

	async healthCheck() {
		try {
			const res = await fetch(`${REDDIT_SEARCH_URL}?q=test&limit=1`, {
				signal: AbortSignal.timeout(5_000),
			});
			return res.ok;
		} catch {
			return false;
		}
	},
};
