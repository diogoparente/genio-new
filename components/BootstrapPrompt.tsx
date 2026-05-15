"use client";

import { useState, useCallback } from "react";

interface BootstrapPromptProps {
	ideaName: string;
	description: string;
	targetAudience: string;
	techStack?: string[];
	mvpFeatures?: string[];
}

export function BootstrapPrompt({
	ideaName,
	description,
	targetAudience,
	techStack = [],
	mvpFeatures = [],
}: BootstrapPromptProps) {
	const [copied, setCopied] = useState(false);

	const prompt = [
		`Build a micro-SaaS app called "${ideaName}".`,
		"",
		`Description: ${description}`,
		`Target audience: ${targetAudience}`,
		techStack.length > 0 && `Tech stack: ${techStack.join(", ")}`,
		mvpFeatures.length > 0 && [
			"",
			"MVP features (scoped to 4-8 weeks):",
			...mvpFeatures.map((f, i) => `${i + 1}. ${f}`),
		],
	]
		.flat()
		.filter(Boolean)
		.join("\n");

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(prompt);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard API may be unavailable in some contexts
		}
	}, [prompt]);

	return (
		<div className="bg-[var(--color-neu-surface)] shadow-neu-sm rounded-[var(--radius-neu)] p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold text-[var(--color-neu-text-primary)]">
					Bootstrap Prompt
				</h3>
				<button
					type="button"
					onClick={handleCopy}
					className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-neu-sm)] text-sm font-semibold transition-all ${
						copied
							? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
							: "bg-[var(--color-neu-accent)] text-white shadow-neu-accent hover:shadow-neu-accent-hover active:shadow-neu-accent-inset"
					}`}
				>
					{copied ? (
						<>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<path d="M20 6 9 17l-5-5" />
							</svg>
							Copied!
						</>
					) : (
						<>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
								<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
							</svg>
							Copy Prompt
						</>
					)}
				</button>
			</div>

			<pre className="bg-[var(--color-neu-surface-lowered)] rounded-[var(--radius-neu-sm)] p-4 text-sm text-[var(--color-neu-text-secondary)] leading-relaxed whitespace-pre-wrap overflow-x-auto shadow-neu-inset-sm max-h-80 overflow-y-auto">
				{prompt}
			</pre>
		</div>
	);
}
