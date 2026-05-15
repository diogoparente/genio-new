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

	const ideasWithDetails = await Promise.all(
		ideaRows.map(async (idea) => {
			const [signals, competitors, [detail]] = await Promise.all([
				db
					.select()
					.from(ideaSignals)
					.where(eq(ideaSignals.ideaId, idea.id)),
				db
					.select()
					.from(ideaCompetitors)
					.where(eq(ideaCompetitors.ideaId, idea.id)),
				db
					.select()
					.from(ideaDetails)
					.where(eq(ideaDetails.ideaId, idea.id))
					.limit(1),
			]);
			return { idea, signals, competitors, detail };
		}),
	);

	const statusBadge = () => {
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
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
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
	};

	return (
		<div className="space-y-8">
			{/* Back link */}
			<Link
				href="/dashboard"
				className="inline-flex items-center gap-1.5 text-sm text-[var(--color-neu-text-secondary)] hover:text-[var(--color-neu-text-primary)] transition-colors"
			>
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Back to Dashboard
			</Link>

			{/* Generation header */}
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

			{/* Generated ideas */}
			{generation.status === "running" && ideasWithDetails.length === 0 && (
				<div className="bg-[var(--color-neu-surface)] shadow-neu rounded-[var(--radius-neu)] p-12 text-center">
					<svg
						className="animate-spin h-10 w-10 text-[var(--color-neu-accent)] mx-auto mb-4"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
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
						className="inline-block mt-4 py-2 px-6 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-accent)] text-white font-semibold shadow-neu-accent hover:shadow-neu-accent-hover transition-all"
					>
						Try Again
					</Link>
				</div>
			)}

			{ideasWithDetails.length > 0 && (
				<div className="grid gap-6 md:grid-cols-2">
					{ideasWithDetails.map(({ idea, signals, competitors, detail }) => (
						<div
							key={idea.id}
							className="bg-[var(--color-neu-surface)] shadow-neu-sm rounded-[var(--radius-neu)] p-6 space-y-4"
						>
							<div>
								<div className="flex items-start justify-between gap-2">
									<h3 className="text-lg font-bold text-[var(--color-neu-text-primary)]">
										{idea.name}
									</h3>
									<span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-[var(--radius-neu-full)] bg-[var(--color-neu-accent)]/15 text-[var(--color-neu-accent)]">
										{(idea.confidenceScore * 100).toFixed(0)}%
									</span>
								</div>
								<p className="text-sm text-[var(--color-neu-accent-secondary)] font-medium mt-0.5">
									{idea.tagline}
								</p>
							</div>

							<p className="text-sm text-[var(--color-neu-text-secondary)] leading-relaxed">
								{idea.description}
							</p>

							<div className="grid grid-cols-2 gap-3 text-xs">
								<div>
									<span className="font-semibold text-[var(--color-neu-text-primary)]">
										Audience
									</span>
									<p className="text-[var(--color-neu-text-secondary)] mt-0.5">
										{idea.targetAudience}
									</p>
								</div>
								<div>
									<span className="font-semibold text-[var(--color-neu-text-primary)]">
										Monetization
									</span>
									<p className="text-[var(--color-neu-text-secondary)] mt-0.5">
										{idea.monetizationModel}
									</p>
								</div>
							</div>

							{/* Signals */}
							{signals.length > 0 && (
								<div>
									<span className="text-xs font-semibold text-[var(--color-neu-text-primary)]">
										Market Signals
									</span>
									<div className="flex flex-wrap gap-1.5 mt-1.5">
										{signals.map((s) => (
											<span
												key={s.id}
												className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-[var(--radius-neu-full)] bg-[var(--color-neu-surface-lowered)] text-[var(--color-neu-text-secondary)]"
											>
												{s.trendDirection === "up" ? (
													<span className="text-green-500">&#8593;</span>
												) : s.trendDirection === "down" ? (
													<span className="text-red-500">&#8595;</span>
												) : (
													<span className="text-gray-400">&#8594;</span>
												)}
												{s.keyword}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Competitors */}
							{competitors.length > 0 && (
								<div>
									<span className="text-xs font-semibold text-[var(--color-neu-text-primary)]">
										Competitors
									</span>
									<ul className="mt-1 space-y-1">
										{competitors.map((c) => (
											<li
												key={c.id}
												className="text-xs text-[var(--color-neu-text-secondary)] flex items-center gap-1.5"
											>
												<span
													className={`inline-block w-1.5 h-1.5 rounded-full ${
														c.strength === "high"
															? "bg-red-400"
															: c.strength === "medium"
																? "bg-yellow-400"
																: "bg-green-400"
													}`}
												/>
												{c.url ? (
													<a
														href={c.url}
														target="_blank"
														rel="noopener noreferrer"
														className="hover:underline"
													>
														{c.name}
													</a>
												) : (
													c.name
												)}
												<span className="text-[var(--color-neu-text-muted)]">
													({c.strength})
												</span>
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Detail extras */}
							{detail && (
								<div className="space-y-2 text-xs border-t border-[var(--neu-shadow-dark)]/20 pt-3">
									{detail.suggestedTechStack && (
										<div>
											<span className="font-semibold text-[var(--color-neu-text-primary)]">
												Tech Stack:{" "}
											</span>
											<span className="text-[var(--color-neu-text-secondary)]">
												{JSON.parse(detail.suggestedTechStack).join(", ")}
											</span>
										</div>
									)}
									{detail.estimatedTAM && (
										<div>
											<span className="font-semibold text-[var(--color-neu-text-primary)]">
												Est. TAM:{" "}
											</span>
											<span className="text-[var(--color-neu-text-secondary)]">
												{detail.estimatedTAM}
											</span>
										</div>
									)}
									{detail.pricingSuggestions && (
										<div>
											<span className="font-semibold text-[var(--color-neu-text-primary)]">
												Pricing:{" "}
											</span>
											<span className="text-[var(--color-neu-text-secondary)]">
												{JSON.parse(detail.pricingSuggestions).join(", ")}
											</span>
										</div>
									)}
									{detail.mvpFeatureSet && (
										<div>
											<span className="font-semibold text-[var(--color-neu-text-primary)]">
												MVP:{" "}
											</span>
											<span className="text-[var(--color-neu-text-secondary)]">
												{JSON.parse(detail.mvpFeatureSet).join(", ")}
											</span>
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
