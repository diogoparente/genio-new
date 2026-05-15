import type { NormalizedSignal, SignalSource } from "./types";

/* ------------------------------------------------------------------ */
/*  Product Hunt adapter — uses the Product Hunt GraphQL API v2        */
/*  Requires PH_ACCESS_TOKEN env var (or PH_DEVELOPER_TOKEN).          */
/* ------------------------------------------------------------------ */

const PH_API_URL = "https://api.producthunt.com/v2/api/graphql";

const POSTS_QUERY = `
	query($first: Int, $query: String) {
		posts(first: $first, order: RANKING, query: $query) {
			edges {
				node {
					id
					name
					tagline
					description
					votesCount
					commentsCount
					createdAt
					topics(first: 3) {
						edges {
							node {
								name
							}
						}
					}
				}
			}
		}
	}
`;

interface PHPostNode {
	id: string;
	name: string;
	tagline: string;
	description: string;
	votesCount: number;
	commentsCount: number;
	createdAt: string;
	topics?: {
		edges: Array<{ node: { name: string } }>;
	};
}

interface PHPostsResponse {
	data?: {
		posts?: {
			edges: Array<{ node: PHPostNode }>;
		};
	};
	errors?: Array<{ message: string }>;
}

function getToken(): string | null {
	return (
		process.env.PH_ACCESS_TOKEN ||
		process.env.PH_DEVELOPER_TOKEN ||
		process.env.PRODUCT_HUNT_TOKEN ||
		null
	);
}

export const producthuntSource: SignalSource = {
	name: "producthunt",

	async fetchSignals(params) {
		try {
			const token = getToken();
			if (!token) {
				// Product Hunt API requires auth; return empty gracefully
				console.warn(
					"[producthunt] No PH_ACCESS_TOKEN set — skipping Product Hunt signals.",
				);
				return [];
			}

			const query = params.niche ?? "saas";
			const res = await fetch(PH_API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
					Accept: "application/json",
				},
				body: JSON.stringify({
					query: POSTS_QUERY,
					variables: { first: params.limit, query },
				}),
				signal: AbortSignal.timeout(10_000),
			});

			if (!res.ok) return [];

			const json: PHPostsResponse = await res.json();

			if (json.errors) {
				console.warn(
					"[producthunt] GraphQL errors:",
					json.errors.map((e) => e.message).join(", "),
				);
				return [];
			}

			const edges = json.data?.posts?.edges ?? [];

			return edges.map(({ node }) => {
				const topicNames =
					node.topics?.edges.map((t) => t.node.name).join(", ") ?? "";
				return {
					source: "producthunt",
					keyword: node.name,
					volume: node.votesCount ?? null,
					trend: "flat" as const,
					mentionCount: (node.commentsCount ?? 0) + 1,
					sentimentSummary:
						`${node.tagline} | Topics: ${topicNames}`.slice(0, 200),
					rawData: {
						id: node.id,
						name: node.name,
						tagline: node.tagline,
						votesCount: node.votesCount,
						commentsCount: node.commentsCount,
						createdAt: node.createdAt,
					},
				};
			});
		} catch {
			return [];
		}
	},

	async healthCheck() {
		try {
			const token = getToken();
			if (!token) return false;

			const res = await fetch(PH_API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
					Accept: "application/json",
				},
				body: JSON.stringify({
					query: `{ posts(first: 1) { edges { node { id } } } }`,
				}),
				signal: AbortSignal.timeout(5_000),
			});
			return res.ok;
		} catch {
			return false;
		}
	},
};
