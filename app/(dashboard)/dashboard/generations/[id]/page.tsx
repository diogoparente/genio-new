import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import {
	ideaGenerations,
	ideas,
	ideaSignals,
	ideaCompetitors,
	ideaDetails,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { IdeaCard } from "@/components/IdeaCard";

interface GenerationDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function GenerationDetailPage({
	params,
}: GenerationDetailPageProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	const { id } = await params;

	const [generation] = await db
		.select()
		.from(ideaGenerations)
		.where(eq(ideaGenerations.id, id))
		.limit(1);

	if (!generation || generation.userId !== session.user.id) {
		redirect("/dashboard");
	}

	const ideaRows = await db
		.select()
		.from(ideas)
		.where(eq(ideas.generationId, id));

	const ideasWithSignals = await Promise.all(
		ideaRows.map(async (idea) => {
			const signals = await db
				.select()
				.from(ideaSignals)
				.where(eq(ideaSignals.ideaId, idea.id));
			return { idea, signals };
		}),
	);

	function statusBadge() {
		switch (generation.status) {
			case "running":
				return (
					<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-neu-full)] bg-yellow-100 text-yellow-800 text-sm font-medium dark:bg-yellow-900 dark:text-yellow-200">
						<svg
							className="animate-spin h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
						</svg>
						Running
					</span>
				);
			case "completed":
				return (
					<span className="inline-flex items-center px-3 py-1 rounded-[var(--radius-neu-full)] bg-green-100 text-green-800 text-sm font-medium dark:bg-green-900 dark:text-green-200">
						Completed
					</span>
				);
			case "failed":
				return (
					<span className="inline-flex items-center px-3 py-1 rounded-[var(--radius-neu-full)] bg-red-100 text-red-800 text-sm font-medium dark:bg-red-900 dark:text-red-200">
						Failed
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center px-3 py-1 rounded-[var(--radius-neu-full)] bg-gray-100 text-gray-800 text-sm font-medium dark:bg-gray-800 dark:text-gray-200">
						{generation.status}
					</span>
				);
		}
	}

	return (
		<div className="space-y-8">
			<Link
				href="/dashboard/generations"
				className="inline-flex items-center gap-1.5 text-sm text-[var(--color-neu-text-secondary)] hover:text-[var(--color-neu-text-primary)] transition-colors"
			>
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
				</svg>
				Back to History
			</Link>

			<div className="bg-[var(--color-neu-surface)] shadow-neu rounded-[var(--radius-neu)] p-8">
				<div className="flex items-start justify-between flex-wrap gap-4">
					<div>
						<h1 className="text-2xl font-bold text-[var(--color-neu-text-primary)]">
							{generation.niche
								? `Ideas for "${generation.niche}"`
								: "Generated Ideas"}
						</h1>
						<p className="text-sm text-[var(--color-neu-text-secondary)] mt-1">
							{generation.batchSize} ideas requested
							{generation.confidence !== null &&
								` - Avg. confidence: ${(generation.confidence * 100).toFixed(0)}%`}
						</p>
					</div>
					{statusBadge()}
				</div>
			</div>

			{generation.status === "running" && ideasWithSignals.length === 0 && (
				<div className="bg-[var(--color-neu-surface)] shadow-neu rounded-[var(--radius-neu)] p-12 text-center">
					<svg className="animate-spin h-10 w-10 text-[var(--color-neu-accent)] mx-auto mb-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
					</svg>
					<p className="text-lg font-semibold text-[var(--color-neu-text-primary)]">
						Generating ideas...
					</p>
					<p className="text-sm text-[var(--color-neu-text-secondary)] mt-1">
						This page will update when ideas are ready.
					</p>
				</div>
			)}

			{generation.status === "failed" && (
				<div className="bg-[var(--color-neu-surface)] shadow-neu rounded-[var(--radius-neu)] p-8 text-center">
					<p className="text-lg font-semibold text-red-600 dark:text-red-400">
						Generation Failed
					</p>
					<p className="text-sm text-[var(--color-neu-text-secondary)] mt-2">
						Something went wrong while generating ideas. Please try again.
					</p>
					<Link
						href="/dashboard"
						className="inline-block mt-4 py-2 px-6 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-accent)] text-white font-semibold shadow-neu hover:shadow-neu-hover transition-all"
					>
						Try Again
					</Link>
				</div>
			)}

			{ideasWithSignals.length > 0 && (
				<div className="grid gap-6 md:grid-cols-2">
					{ideasWithSignals.map(({ idea, signals }) => (
						<IdeaCard key={idea.id} idea={idea} signals={signals} />
					))}
				</div>
			)}
		</div>
	);
}
