"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface IdeaFiltersTranslations {
	monetizationLabel?: string;
	allMonetization?: string;
	subscription?: string;
	oneTime?: string;
	usageBased?: string;
	hybrid?: string;
	confidenceLabel?: string;
	anyConfidence?: string;
	highConfidence?: string;
	mediumConfidence?: string;
	lowConfidence?: string;
	savedLabel?: string;
	allIdeas?: string;
	savedOnly?: string;
}

interface IdeaFiltersProps {
	labels?: IdeaFiltersTranslations;
}

const MONETIZATION_MODELS = [
	{ value: "", labelKey: "allMonetization", fallback: "All models" },
	{ value: "subscription", labelKey: "subscription", fallback: "Subscription" },
	{ value: "one-time", labelKey: "oneTime", fallback: "One-time" },
	{ value: "usage-based", labelKey: "usageBased", fallback: "Usage-based" },
	{ value: "hybrid", labelKey: "hybrid", fallback: "Hybrid" },
] as const;

const CONFIDENCE_LEVELS = [
	{ value: "", labelKey: "anyConfidence", fallback: "Any confidence" },
	{ value: "0.8", labelKey: "highConfidence", fallback: "High (80%+)" },
	{ value: "0.6", labelKey: "mediumConfidence", fallback: "Medium (60%+)" },
	{ value: "0", labelKey: "lowConfidence", fallback: "All" },
] as const;

const SAVED_FILTERS = [
	{ value: "", labelKey: "allIdeas", fallback: "All ideas" },
	{ value: "1", labelKey: "savedOnly", fallback: "Saved only" },
] as const;

export function IdeaFilters({ labels }: IdeaFiltersProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const currentMonetization = searchParams.get("monetizationModel") ?? "";
	const currentConfidence = searchParams.get("minConfidence") ?? "";
	const currentSaved = searchParams.get("saved") ?? "";

	const updateParam = useCallback(
		(key: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString());
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
			params.delete("page");
			router.push(`${pathname}?${params.toString()}`);
		},
		[router, pathname, searchParams],
	);

	const selectClass =
		"px-3 py-2 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-surface)] border border-[var(--neu-shadow-dark)] text-sm text-[var(--color-neu-text-primary)] shadow-neu-inset-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-neu-accent)]";

	return (
		<div className="flex flex-wrap gap-3">
			<select
				value={currentMonetization}
				onChange={(e) => updateParam("monetizationModel", e.target.value)}
				className={selectClass}
			>
				{MONETIZATION_MODELS.map((m) => (
					<option key={m.value} value={m.value}>
						{labels?.[m.labelKey as keyof IdeaFiltersTranslations] ?? m.fallback}
					</option>
				))}
			</select>

			<select
				value={currentConfidence}
				onChange={(e) => updateParam("minConfidence", e.target.value)}
				className={selectClass}
			>
				{CONFIDENCE_LEVELS.map((c) => (
					<option key={c.value} value={c.value}>
						{labels?.[c.labelKey as keyof IdeaFiltersTranslations] ?? c.fallback}
					</option>
				))}
			</select>

			<select
				value={currentSaved}
				onChange={(e) => updateParam("saved", e.target.value)}
				className={selectClass}
			>
				{SAVED_FILTERS.map((s) => (
					<option key={s.value} value={s.value}>
						{labels?.[s.labelKey as keyof IdeaFiltersTranslations] ?? s.fallback}
					</option>
				))}
			</select>
		</div>
	);
}
