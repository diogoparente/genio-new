import type { NormalizedSignal, SignalSource } from "./types";

/* ------------------------------------------------------------------ */
/*  Google Trends adapter                                              */
/*  Uses the unofficial trends.google.com explore endpoint.            */
/*  Handles the JSON hijacking prefix (")]}\',\n" or similar).         */
/* ------------------------------------------------------------------ */

const TRENDS_URL = "https://trends.google.com/trends/api/explore";

function stripJsonPrefix(raw: string): string {
	// Google prepends a hijacking guard like ")]}',\n"
	const idx = raw.indexOf("{");
	if (idx > 0) return raw.slice(idx);
	const arrIdx = raw.indexOf("[");
	if (arrIdx > 0) return raw.slice(arrIdx);
	return raw;
}

function extractKeywords(data: Record<string, unknown>): string[] {
	const keywords: string[] = [];
	try {
		const widgets = (data as { widgets?: Array<{ title?: string; tokens?: Array<{ token?: string }> }> }).widgets;
		if (widgets) {
			for (const w of widgets) {
				if (w.tokens) {
					for (const t of w.tokens) {
						if (t.token) keywords.push(t.token);
					}
				}
				if (w.title && !keywords.includes(w.title)) {
					keywords.push(w.title);
				}
			}
		}
	} catch {
		// best-effort extraction
	}
	return keywords;
}

export const googleTrendsSource: SignalSource = {
	name: "google-trends",

	async fetchSignals(params) {
		try {
			const query = params.niche ?? "saas micro startup";
			const url = `${TRENDS_URL}?hl=en-US&tz=-60&req=${encodeURIComponent(
				JSON.stringify({
					comparisonItem: [
						{ keyword: query, geo: "", time: "today 12-m" },
					],
					category: 0,
					property: "",
				}),
			)}&token=APP6OhEAAA`;

			const res = await fetch(url, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (compatible; GenioBot/1.0; +https://genio.dev)",
				},
				signal: AbortSignal.timeout(10_000),
			});

			if (!res.ok) return [];

			const raw = await res.text();
			const jsonText = stripJsonPrefix(raw);
			const data = JSON.parse(jsonText);
			const keywords = extractKeywords(data);

			return keywords.slice(0, params.limit).map((kw) => ({
				source: "google-trends",
				keyword: kw,
				volume: null,
				trend: "flat" as const,
				mentionCount: 0,
				sentimentSummary: "",
				rawData: { keyword: kw },
			}));
		} catch {
			return [];
		}
	},

	async healthCheck() {
		try {
			const res = await fetch(
				"https://trends.google.com/trends/api/explore?hl=en-US&tz=-60&req=%7B%7D&token=APP6OhEAAA",
				{ signal: AbortSignal.timeout(5_000) },
			);
			return res.ok || res.status === 400; // 400 = malformed request but endpoint alive
		} catch {
			return false;
		}
	},
};
