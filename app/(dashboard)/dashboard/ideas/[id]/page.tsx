import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getIdeaWithRelations, verifyIdeaOwnership } from "@/lib/ideas/reader";
import { SignalBadge } from "@/components/SignalBadge";
import { BootstrapPrompt } from "@/components/BootstrapPrompt";
import { SaveIdeaButton } from "@/components/SaveIdeaButton";

interface IdeaDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	const { id } = await params;

	const isOwner = await verifyIdeaOwnership(id, session.user.id);
	if (!isOwner) {
		notFound();
	}

	const data = await getIdeaWithRelations(id);
	if (!data) {
		notFound();
	}

	const { idea, signals, competitors, detail } = data;

	const techStack: string[] = detail?.suggestedTechStack
		? JSON.parse(detail.suggestedTechStack)
		: [];
	const pricingSuggestions: string[] = detail?.pricingSuggestions
		? JSON.parse(detail.pricingSuggestions)
		: [];
	const acquisitionChannels: string[] = detail?.acquisitionChannels
		? JSON.parse(detail.acquisitionChannels)
		: [];
	const mvpFeatures: string[] = detail?.mvpFeatureSet
		? JSON.parse(detail.mvpFeatureSet)
		: [];

	function strengthDot(strength: string) {
		switch (strength) {
			case "high":
				return "bg-red-400";
			case "medium":
				return "bg-yellow-400";
			default:
				return "bg-green-400";
		}
	}

	return (
		<div className="space-y-8">
			{/* Back link */}
			<Link
				href="/dashboard/ideas"
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
				Back to Ideas
			</Link>

			{/* Idea header */}
			<div className="bg-[var(--color-neu-surface)] shadow-neu rounded-[var(--radius-neu)] p-8">
				<div className="flex items-start justify-between flex-wrap gap-4">
					<div>
						<h1 className="text-2xl font-bold text-[var(--color-neu-text-primary)]">
							{idea.name}
						</h1>
						<p className="text-[var(--color-neu-accent-secondary)] font-medium mt-1">
							{idea.tagline}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-xs font-bold px-3 py-1 rounded-[var(--radius-neu-full)] bg-[var(--color-neu-accent)]/15 text-[var(--color-neu-accent)]">
							{(idea.confidenceScore * 100).toFixed(0)}% confidence
						</span>
						<SaveIdeaButton ideaId={idea.id} isSaved={idea.isSaved === 1} />
					</div>
				</div>
			</div>

			{/* Description + Audience */}
			<div className="bg-[var(--color-neu-surface)] shadow-neu-sm rounded-[var(--radius-neu)] p-6 space-y-4">
				<div>
					<h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-neu-text-muted)] mb-2">
						Description
					</h2>
					<p className="text-[var(--color-neu-text-secondary)] leading-relaxed">
						{idea.description}
					</p>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<h3 className="text-sm font-semibold text-[var(--color-neu-text-primary)]">
							Target Audience
						</h3>
						<p className="text-sm text-[var(--color-neu-text-secondary)] mt-1">
							{idea.targetAudience}
						</p>
					</div>
					<div>
						<h3 className="text-sm font-semibold text-[var(--color-neu-text-primary)]">
							Monetization
						</h3>
						<p className="text-sm text-[var(--color-neu-text-secondary)] mt-1 capitalize">
							{idea.monetizationModel}
						</p>
					</div>
				</div>
			</div>

			{/* Market Signals */}
			{signals.length > 0 && (
				<div className="bg-[var(--color-neu-surface)] shadow-neu-sm rounded-[var(--radius-neu)] p-6">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-neu-text-muted)] mb-4">
						Market Signals
					</h2>
					<div className="flex flex-wrap gap-2">
						{signals.map((s) => (
							<SignalBadge
								key={s.id}
								source={s.source}
								trendDirection={s.trendDirection as "up" | "flat" | "down"}
								keyword={s.keyword}
							/>
						))}
					</div>
				</div>
			)}

			{/* Competitors */}
			{competitors.length > 0 && (
				<div className="bg-[var(--color-neu-surface)] shadow-neu-sm rounded-[var(--radius-neu)] p-6">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-neu-text-muted)] mb-4">
						Competitors
					</h2>
					<div className="grid gap-3 sm:grid-cols-2">
						{competitors.map((c) => (
							<div
								key={c.id}
								className="flex items-start gap-3 bg-[var(--color-neu-surface-lowered)] rounded-[var(--radius-neu-sm)] p-3"
							>
								<span
									className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 ${strengthDot(c.strength)}`}
								/>
								<div className="min-w-0">
									{c.url ? (
										<a
											href={c.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm font-medium text-[var(--color-neu-text-primary)] hover:underline block truncate"
										>
											{c.name}
										</a>
									) : (
										<span className="text-sm font-medium text-[var(--color-neu-text-primary)] block truncate">
											{c.name}
										</span>
									)}
									{c.description && (
										<p className="text-xs text-[var(--color-neu-text-secondary)] mt-0.5">
											{c.description}
										</p>
									)}
									<span className="text-xs text-[var(--color-neu-text-muted)] capitalize">
										{c.strength} competition
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Details */}
			{detail && (
				<div className="bg-[var(--color-neu-surface)] shadow-neu-sm rounded-[var(--radius-neu)] p-6">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-neu-text-muted)] mb-4">
						Build Details
					</h2>
					<div className="grid gap-6 sm:grid-cols-2">
						{techStack.length > 0 && (
							<div>
								<h3 className="text-sm font-semibold text-[var(--color-neu-text-primary)] mb-2">
									Tech Stack
								</h3>
								<div className="flex flex-wrap gap-1.5">
									{techStack.map((tech) => (
										<span
											key={tech}
											className="px-2 py-0.5 text-xs rounded-[var(--radius-neu-full)] bg-[var(--color-neu-accent-secondary)]/15 text-[var(--color-neu-accent-secondary)]"
										>
											{tech}
										</span>
									))}
								</div>
							</div>
						)}

						{detail.estimatedTAM && (
							<div>
								<h3 className="text-sm font-semibold text-[var(--color-neu-text-primary)] mb-2">
									Estimated TAM
								</h3>
								<p className="text-sm text-[var(--color-neu-text-secondary)]">
									{detail.estimatedTAM}
								</p>
							</div>
						)}

						{pricingSuggestions.length > 0 && (
							<div className="sm:col-span-2">
								<h3 className="text-sm font-semibold text-[var(--color-neu-text-primary)] mb-2">
									Pricing Suggestions
								</h3>
								<div className="flex flex-wrap gap-2">
									{pricingSuggestions.map((p) => (
										<span
											key={p}
											className="px-3 py-1 text-xs rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-surface-lowered)] text-[var(--color-neu-text-secondary)] shadow-neu-inset-sm"
										>
											{p}
										</span>
									))}
								</div>
							</div>
						)}

						{acquisitionChannels.length > 0 && (
							<div className="sm:col-span-2">
								<h3 className="text-sm font-semibold text-[var(--color-neu-text-primary)] mb-2">
									Acquisition Channels
								</h3>
								<ul className="list-disc list-inside text-sm text-[var(--color-neu-text-secondary)] space-y-0.5">
									{acquisitionChannels.map((ch) => (
										<li key={ch}>{ch}</li>
									))}
								</ul>
							</div>
						)}

						{mvpFeatures.length > 0 && (
							<div className="sm:col-span-2">
								<h3 className="text-sm font-semibold text-[var(--color-neu-text-primary)] mb-2">
									MVP Features (4-8 weeks)
								</h3>
								<ul className="list-decimal list-inside text-sm text-[var(--color-neu-text-secondary)] space-y-0.5">
									{mvpFeatures.map((f, i) => (
										<li key={i}>{f}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Bootstrap Prompt */}
			<BootstrapPrompt
				ideaName={idea.name}
				description={idea.description}
				targetAudience={idea.targetAudience}
				techStack={techStack}
				mvpFeatures={mvpFeatures}
			/>
		</div>
	);
}
