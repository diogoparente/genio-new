import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { listGenerations } from "@/lib/ideas/reader";
import { getTranslations } from "@/lib/i18n";

interface GenerationsPageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GenerationsPage({ searchParams }: GenerationsPageProps) {
	const t = await getTranslations();
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	const params = await searchParams;
	const pageRaw = typeof params.page === "string" ? params.page : undefined;
	const page = pageRaw ? parseInt(pageRaw, 10) : 1;

	const result = await listGenerations(session.user.id, isNaN(page) ? 1 : page, 20);
	const totalPages = Math.ceil(result.total / result.limit);

	function statusBadge(status: string) {
		switch (status) {
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
						{status}
					</span>
				);
		}
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-[var(--color-neu-text-primary)]">
					{t.history.title}
				</h1>
				<p className="text-[var(--color-neu-text-secondary)] mt-2">
					{t.history.subtitle}
				</p>
			</div>

			{result.generations.length === 0 ? (
				<div className="bg-[var(--color-neu-surface)] shadow-neu rounded-[var(--radius-neu)] p-12 text-center">
					<p className="text-lg font-semibold text-[var(--color-neu-text-primary)]">
						{t.history.emptyTitle}
					</p>
					<p className="text-sm text-[var(--color-neu-text-secondary)] mt-2">
						{t.history.emptyDescription}
					</p>
					<Link
						href="/dashboard"
						className="inline-block mt-4 py-2 px-6 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-accent)] text-white font-semibold shadow-neu hover:shadow-neu-hover transition-all"
					>
						{t.history.createFirst}
					</Link>
				</div>
			) : (
				<div className="space-y-3">
					{result.generations.map((gen) => (
						<Link
							key={gen.id}
							href={`/dashboard/generations/${gen.id}`}
							className="flex items-center justify-between bg-[var(--color-neu-surface)] shadow-neu-sm hover:shadow-neu rounded-[var(--radius-neu)] p-6 transition-shadow"
						>
							<div>
								<h3 className="font-semibold text-[var(--color-neu-text-primary)]">
									{gen.niche ? `${gen.niche}` : t.history.broadNiche}
								</h3>
								<p className="text-sm text-[var(--color-neu-text-secondary)] mt-1">
									{gen.batchSize} {t.history.ideasRequested}
									{gen.confidence !== null &&
										` \u00B7 ${(gen.confidence * 100).toFixed(0)}% avg`}
									{" \u00B7 "}
									{new Date(gen.createdAt).toLocaleDateString()}
								</p>
							</div>
							<div className="flex items-center gap-3 shrink-0">
								{statusBadge(gen.status)}
								<svg
									className="w-5 h-5 text-[var(--color-neu-text-muted)]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</Link>
					))}
				</div>
			)}

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
								href={`/dashboard/generations?${href.toString()}`}
								className="px-4 py-2 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-surface)] text-[var(--color-neu-text-secondary)] text-sm font-medium shadow-neu-sm hover:shadow-neu transition-shadow"
							>
								{p}
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
