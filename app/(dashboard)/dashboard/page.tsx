import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { GenerationForm } from "@/components/GenerationForm";
import { listIdeas, fetchSignalsForIdeas } from "@/lib/ideas/reader";
import { IdeaCard } from "@/components/IdeaCard";
import { getTranslations } from "@/lib/i18n";

export default async function DashboardPage() {
	const t = await getTranslations();
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	const userName = session.user?.name;

	const recent = await listIdeas(session.user.id, { limit: 4 });
	const recentIdeaIds = recent.ideas.map((i) => i.id);
	const allSignals = await fetchSignalsForIdeas(recentIdeaIds);
	const signalsByIdea = new Map<string, typeof allSignals>();
	for (const s of allSignals) {
		const existing = signalsByIdea.get(s.ideaId) ?? [];
		existing.push(s);
		signalsByIdea.set(s.ideaId, existing);
	}

	return (
		<div className="space-y-8">
			<div className="bg-[var(--color-neu-surface)] shadow-neu rounded-[var(--radius-neu)] p-8">
				<h1 className="text-3xl font-bold text-[var(--color-neu-text-primary)] mb-2">
					{t.dashboard.welcomeBack}{userName ? `, ${userName}` : ""}
				</h1>
				<p className="text-[var(--color-neu-text-secondary)] text-lg">
					{t.dashboard.generateFirst}
				</p>
			</div>

			<GenerationForm
				labels={{
					title: t.dashboard.generateIdeas,
					description: t.dashboard.nicheDescription,
					nicheLabel: t.dashboard.nicheLabel,
					nichePlaceholder: t.dashboard.nichePlaceholder,
					batchSizePrefix: t.dashboard.batchSizePrefix,
					generateButton: t.dashboard.generateButton,
					generating: t.dashboard.generating,
					error: t.dashboard.error,
					statusTitle: t.dashboard.generatingStatus,
					statusDescription: t.dashboard.generatingDescription,
				}}
			/>

			{recent.ideas.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold text-[var(--color-neu-text-primary)]">
							{t.dashboard.recentIdeas}
						</h2>
						<Link
							href="/dashboard/ideas"
							className="text-sm font-medium text-[var(--color-neu-accent)] hover:underline"
						>
							{t.dashboard.allIdeas} →
						</Link>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						{recent.ideas.map((idea) => (
							<IdeaCard
								key={idea.id}
								idea={idea}
								signals={signalsByIdea.get(idea.id) ?? []}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
