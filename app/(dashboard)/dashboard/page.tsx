import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GenerationForm } from "@/components/GenerationForm";
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
		</div>
	);
}
