import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { listIdeas } from "@/lib/ideas/reader";
import { fetchSignalsForIdeas } from "@/lib/ideas/reader";
import { getTranslations } from "@/lib/i18n";
import { IdeaCard } from "@/components/IdeaCard";
import { IdeaFilters } from "@/components/IdeaFilters";

interface IdeasPageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function IdeasPage({ searchParams }: IdeasPageProps) {
	const t = await getTranslations();
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	const params = await searchParams;
	const monetizationModel =
		typeof params.monetizationModel === "string" ? params.monetizationModel : undefined;
	const minConfidenceRaw =
		typeof params.minConfidence === "string" ? params.minConfidence : undefined;
	const savedRaw = typeof params.saved === "string" ? params.saved : undefined;
	const pageRaw = typeof params.page === "string" ? params.page : undefined;

	const minConfidence = minConfidenceRaw ? parseFloat(minConfidenceRaw) : undefined;
	const saved = savedRaw === "1" ? true : savedRaw === "" ? undefined : undefined;
	const page = pageRaw ? parseInt(pageRaw, 10) : 1;

	const result = await listIdeas(session.user.id, {
		monetizationModel,
		minConfidence: isNaN(minConfidence as number) ? undefined : minConfidence,
		saved,
		page: isNaN(page) ? 1 : page,
		limit: 12,
	});

	// Batch-fetch signals for all ideas on this page
	const ideaIds = result.ideas.map((i) => i.id);
	const allSignals = await fetchSignalsForIdeas(ideaIds);
	const signalsByIdea = new Map<string, typeof allSignals>();
	for (const s of allSignals) {
		const existing = signalsByIdea.get(s.ideaId) ?? [];
		existing.push(s);
		signalsByIdea.set(s.ideaId, existing);
	}

	const totalPages = Math.ceil(result.total / result.limit);

	const filterLabels = {
		monetizationLabel: t.ideas.monetizationLabel,
		allMonetization: t.ideas.allMonetization,
		subscription: t.ideas.subscription,
		oneTime: t.ideas.oneTime,
		usageBased: t.ideas.usageBased,
		hybrid: t.ideas.hybrid,
		confidenceLabel: t.ideas.confidenceLabel,
		anyConfidence: t.ideas.anyConfidence,
		highConfidence: t.ideas.highConfidence,
		mediumConfidence: t.ideas.mediumConfidence,
		lowConfidence: t.ideas.lowConfidence,
		savedLabel: t.ideas.savedLabel,
		allIdeas: t.ideas.allIdeas,
		savedOnly: t.ideas.savedOnly,
	};

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-[var(--color-neu-text-primary)]">
					{t.ideas.title}
				</h1>
				<p className="text-[var(--color-neu-text-secondary)] mt-2">
					{t.ideas.subtitle}
				</p>
			</div>

			<IdeaFilters labels={filterLabels} />

			{result.ideas.length === 0 ? (
				<div className="bg-[var(--color-neu-surface)] shadow-neu rounded-[var(--radius-neu)] p-12 text-center">
					<p className="text-lg font-semibold text-[var(--color-neu-text-primary)]">
						{t.ideas.emptyTitle}
					</p>
					<p className="text-sm text-[var(--color-neu-text-secondary)] mt-2">
						{t.ideas.emptyDescription}
					</p>
					<Link
						href="/dashboard"
						className="inline-block mt-4 py-2 px-6 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-accent)] text-white font-semibold shadow-neu hover:shadow-neu-hover transition-all"
					>
						{t.ideas.generateFirst}
					</Link>
				</div>
			) : (
				<>
					<div className="grid gap-6 md:grid-cols-2">
						{result.ideas.map((idea) => (
							<IdeaCard
								key={idea.id}
								idea={idea}
								signals={signalsByIdea.get(idea.id) ?? []}
							/>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-center gap-2">
							{Array.from({ length: totalPages }, (_, i) => {
								const p = i + 1;
								const isCurrent = p === result.page;
								const href = new URLSearchParams(params as Record<string, string>);
								href.set("page", String(p));

								return isCurrent ? (
									<span
										key={p}
										className="px-4 py-2 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-accent)] text-white text-sm font-semibold shadow-neu-sm"
									>
										{p}
									</span>
								) : (
									<Link
										key={p}
										href={`/dashboard/ideas?${href.toString()}`}
										className="px-4 py-2 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-surface)] text-[var(--color-neu-text-secondary)] text-sm font-medium shadow-neu-sm hover:shadow-neu transition-shadow"
									>
										{p}
									</Link>
								);
							})}
						</div>
					)}
				</>
			)}
		</div>
	);
}
