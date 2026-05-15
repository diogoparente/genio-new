import type { Metadata } from "next/types";

const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export function createMetadata(override: Metadata): Metadata {
	return {
		...override,
		openGraph: {
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			url: baseUrl,
			siteName: "génio",
			...override.openGraph,
		},
		twitter: {
			card: "summary_large_image",
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			...override.twitter,
		},
	};
}
