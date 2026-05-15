"use client";

import Link from "next/link";
import { SignalBadge } from "./SignalBadge";

interface IdeaCardProps {
	idea: {
		id: string;
		name: string;
		tagline: string;
		confidenceScore: number;
		monetizationModel: string;
		isSaved: number;
	};
	signals?: Array<{
		id: string;
		source: string;
		keyword: string;
		trendDirection: string;
	}>;
}

function confidenceColor(score: number): string {
	if (score >= 0.8) return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
	if (score >= 0.6) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
	return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300";
}

export function IdeaCard({ idea, signals = [] }: IdeaCardProps) {
	const pct = (idea.confidenceScore * 100).toFixed(0);

	return (
		<Link
			href={`/dashboard/ideas/${idea.id}`}
			className="block bg-[var(--color-neu-surface)] shadow-neu-sm hover:shadow-neu rounded-[var(--radius-neu)] p-6 space-y-3 transition-shadow"
		>
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<h3 className="text-lg font-bold text-[var(--color-neu-text-primary)] truncate">
						{idea.name}
					</h3>
					<p className="text-sm text-[var(--color-neu-accent-secondary)] font-medium mt-0.5">
						{idea.tagline}
					</p>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					{idea.isSaved === 1 && (
						<span className="text-xs text-[var(--color-neu-accent)]" title="Saved">
							★
						</span>
					)}
					<span
						className={`text-xs font-bold px-2 py-0.5 rounded-[var(--radius-neu-full)] ${confidenceColor(idea.confidenceScore)}`}
					>
						{pct}%
					</span>
				</div>
			</div>

			{signals.length > 0 && (
				<div className="flex flex-wrap gap-1.5">
					{signals.slice(0, 4).map((s) => (
						<SignalBadge
							key={s.id}
							source={s.source}
							trendDirection={s.trendDirection as "up" | "flat" | "down"}
							keyword={s.keyword}
						/>
					))}
					{signals.length > 4 && (
						<span className="text-xs text-[var(--color-neu-text-muted)] self-center">
							+{signals.length - 4} more
						</span>
					)}
				</div>
			)}
		</Link>
	);
}
