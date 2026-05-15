"use client";

interface SignalBadgeProps {
	source: string;
	trendDirection?: "up" | "flat" | "down";
	keyword?: string;
}

const SOURCE_ABBREV: Record<string, string> = {
	"google-trends": "Google",
	reddit: "Reddit",
	hackernews: "HN",
	producthunt: "PH",
};

const TREND_ICON: Record<string, { symbol: string; color: string }> = {
	up: { symbol: "\u25B2", color: "text-green-500" },
	flat: { symbol: "\u2192", color: "text-yellow-500" },
	down: { symbol: "\u25BC", color: "text-red-500" },
};

export function SignalBadge({ source, trendDirection, keyword }: SignalBadgeProps) {
	const abbrev = SOURCE_ABBREV[source] ?? source;
	const trend = trendDirection ? TREND_ICON[trendDirection] : null;

	return (
		<span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-[var(--radius-neu-full)] bg-[var(--color-neu-surface-lowered)] text-[var(--color-neu-text-secondary)]">
			{trend && (
				<span className={trend.color} aria-hidden="true">
					{trend.symbol}
				</span>
			)}
			{keyword ? `${abbrev}: ${keyword}` : abbrev}
		</span>
	);
}
