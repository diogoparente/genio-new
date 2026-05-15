"use client";

interface GenerationStatusProps {
	isGenerating: boolean;
}

export function GenerationStatus({ isGenerating }: GenerationStatusProps) {
	if (!isGenerating) return null;

	return (
		<div className="bg-[var(--color-neu-surface)] shadow-neu-sm rounded-[var(--radius-neu)] p-8 text-center">
			<div className="flex flex-col items-center gap-4">
				<svg
					className="animate-spin h-10 w-10 text-[var(--color-neu-accent)]"
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
				<div>
					<p className="text-lg font-semibold text-[var(--color-neu-text-primary)]">
						Generating ideas...
					</p>
					<p className="text-sm text-[var(--color-neu-text-secondary)] mt-1">
						Analyzing market signals and synthesizing opportunities.
						<br />
						This may take up to a minute.
					</p>
				</div>
			</div>
		</div>
	);
}
