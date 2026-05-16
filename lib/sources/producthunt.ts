import type { NormalizedSignal, SignalSource } from "./types";

/* ------------------------------------------------------------------ */
/*  Product Hunt adapter — GraphQL API v2                              */
/*  Auth (priority order):                                             */
/*    1. PH_DEVELOPER_TOKEN     — developer token (no expiry)          */
/*    2. PH_ACCESS_TOKEN        — alias for developer token            */
/*    3. PH_APP_CLIENT_CREDENTIALS_TOKEN — pre-obtained OAuth token    */
/*    4. PH_APP_API_KEY + PH_APP_API_SECRET — auto-fetch token         */
/* ------------------------------------------------------------------ */

const PH_API_URL = "https://api.producthunt.com/v2/api/graphql";
const PH_TOKEN_URL = "https://api.producthunt.com/v2/oauth/token";

/* ---- GraphQL queries ----------------------------------------------- */

const POSTS_QUERY = `
  query($first: Int, $order: PostsOrder) {
    posts(first: $first, order: $order) {
      edges {
        node {
          id
          name
          tagline
          description
          url
          website
          votesCount
          commentsCount
          createdAt
          featuredAt
          thumbnail {
            url
          }
          user {
            name
            headline
          }
          makers {
            name
            headline
          }
          topics(first: 5) {
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

const FEATURED_POSTS_QUERY = `
  query($first: Int) {
    posts(first: $first, order: FEATURED_AT, featured: true) {
      edges {
        node {
          id
          name
          tagline
          description
          url
          website
          votesCount
          commentsCount
          createdAt
          featuredAt
          thumbnail {
            url
          }
          user {
            name
            headline
          }
          makers {
            name
            headline
          }
          topics(first: 5) {
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

const HEALTH_QUERY = `
  query {
    posts(first: 1) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

/* ---- Types -------------------------------------------------------- */

interface PHTopicEdge {
    node: { name: string };
}

interface PHPostNode {
    id: string;
    name: string;
    tagline: string;
    description: string;
    url: string;
    website: string | null;
    votesCount: number;
    commentsCount: number;
    createdAt: string;
    featuredAt: string | null;
    thumbnail: { url: string } | null;
    user: { name: string; headline: string | null } | null;
    makers: Array<{ name: string; headline: string | null }>;
    topics?: {
        edges: PHTopicEdge[];
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

/* ---- Authentication ----------------------------------------------- */

interface TokenCache {
    token: string;
    expiresAt: number;
}

let _cachedToken: TokenCache | null = null;

async function fetchClientCredentialsToken(
    apiKey: string,
    apiSecret: string,
): Promise<string> {
    const res = await fetch(PH_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: apiKey,
            client_secret: apiSecret,
            grant_type: "client_credentials",
        }),
        signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
        throw new Error(
            `Failed to fetch Product Hunt token: ${res.status} ${await res.text().catch(() => "")}`,
        );
    }

    const json = (await res.json()) as {
        access_token: string;
        expires_in?: number;
    };

    if (!json.access_token) {
        throw new Error("Product Hunt token response missing access_token.");
    }

    // Cache token with 5-minute safety margin on expiry
    const expiresIn = (json.expires_in ?? 3600) - 300;
    _cachedToken = {
        token: json.access_token,
        expiresAt: Date.now() + expiresIn * 1000,
    };

    return json.access_token;
}

async function getAccessToken(): Promise<string | null> {
    // 1. Developer token (simplest — no expiry, use for localhost)
    if (process.env.PH_DEVELOPER_TOKEN) {
        return process.env.PH_DEVELOPER_TOKEN;
    }
    if (process.env.PH_ACCESS_TOKEN) {
        return process.env.PH_ACCESS_TOKEN;
    }

    // 2. Pre-obtained client credentials token
    if (process.env.PH_APP_CLIENT_CREDENTIALS_TOKEN) {
        return process.env.PH_APP_CLIENT_CREDENTIALS_TOKEN;
    }

    // 3. Auto-fetch client credentials token
    const apiKey = process.env.PH_APP_API_KEY;
    const apiSecret = process.env.PH_APP_API_SECRET;

    if (apiKey && apiSecret) {
        if (_cachedToken && _cachedToken.expiresAt > Date.now()) {
            return _cachedToken.token;
        }
        return fetchClientCredentialsToken(apiKey, apiSecret);
    }

    return null;
}

/* ---- GraphQL helper ------------------------------------------------ */

async function graphqlRequest<T>(
    query: string,
    variables: Record<string, unknown> = {},
): Promise<T> {
    const token = await getAccessToken();
    if (!token) return {} as T;

    const res = await fetch(PH_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return {} as T;

    return res.json() as Promise<T>;
}

/* ---- Mapping ------------------------------------------------------ */

function deriveTrend(createdAt: string, featuredAt: string | null): "up" | "flat" | "down" {
    if (featuredAt) return "up";
    const ageDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays < 7) return "up";
    if (ageDays > 90) return "down";
    return "flat";
}

function mapPostToSignal(node: PHPostNode): NormalizedSignal {
    const topicNames =
        node.topics?.edges.map((t) => t.node.name).join(", ") ?? "";
    const makerNames = node.makers?.length
        ? ` | Makers: ${node.makers.map((m) => m.name).join(", ")}`
        : "";

    return {
        source: "producthunt",
        keyword: node.name,
        volume: node.votesCount,
        trend: deriveTrend(node.createdAt, node.featuredAt),
        mentionCount: node.commentsCount + 1,
        sentimentSummary: `${node.tagline} | Topics: ${topicNames}${makerNames}`.slice(
            0,
            200,
        ),
        rawData: {
            id: node.id,
            name: node.name,
            tagline: node.tagline,
            description: node.description,
            url: node.url,
            website: node.website,
            votesCount: node.votesCount,
            commentsCount: node.commentsCount,
            createdAt: node.createdAt,
            featuredAt: node.featuredAt,
            thumbnail: node.thumbnail?.url ?? null,
            topics: topicNames,
        },
    };
}

/* ---- Source implementation ---------------------------------------- */

export const producthuntSource: SignalSource = {
    name: "producthunt",

    async fetchSignals(params) {
        try {
            const niche = params.niche;

            // When a niche is provided, fetch ranked posts and filter
            // client-side by keyword relevance. Otherwise fetch featured.
            const query = niche ? POSTS_QUERY : FEATURED_POSTS_QUERY;
            const variables: Record<string, unknown> = niche
                ? { first: params.limit * 3, order: "RANKING" }
                : { first: params.limit };

            const json = await graphqlRequest<PHPostsResponse>(query, variables);

            if (json.errors) {
                console.warn(
                    "[producthunt] GraphQL errors:",
                    json.errors.map((e) => e.message).join(", "),
                );
                return [];
            }

            let edges = json.data?.posts?.edges ?? [];

            if (niche) {
                const keywords = niche.toLowerCase().split(/\s+/);
                edges = edges.filter(({ node }) => {
                    const haystack = [
                        node.name,
                        node.tagline,
                        node.description,
                        node.topics?.edges.map((t) => t.node.name).join(" ") ?? "",
                    ]
                        .join(" ")
                        .toLowerCase();
                    return keywords.some((kw) => haystack.includes(kw));
                });
            }

            return edges.slice(0, params.limit).map(({ node }) =>
                mapPostToSignal(node),
            );
        } catch {
            return [];
        }
    },

    async healthCheck() {
        try {
            const token = await getAccessToken();
            if (!token) return false;

            const json = await graphqlRequest<PHPostsResponse>(HEALTH_QUERY);
            return (json?.data?.posts?.edges?.length ?? 0) > 0;
        } catch {
            return false;
        }
    },
};
