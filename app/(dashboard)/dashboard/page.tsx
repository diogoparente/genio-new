import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
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
					Welcome back{userName ? `, ${userName}` : ""}
				</h1>
				<p className="text-[var(--color-neu-text-secondary)] text-lg">
					Generate your first micro-SaaS idea
				</p>
			</div>

			<div className="bg-[var(--color-neu-surface)] shadow-neu rounded-[var(--radius-neu)] p-12 text-center">
				<div className="text-6xl mb-4" aria-hidden="true">
					<span role="img" aria-label="idea">
						💡
					</span>
				</div>
				<h2 className="text-xl font-semibold text-[var(--color-neu-text-primary)] mb-2">
					Ready to start?
				</h2>
				<p className="text-[var(--color-neu-text-secondary)] max-w-md mx-auto">
					Head over to the Generator to create validated micro-SaaS ideas
					backed by real market signals.
				</p>
			</div>
		</div>
	);
}
