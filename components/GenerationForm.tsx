"use client";

import { useState, useId, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GenerationStatus } from "./GenerationStatus";

interface GenerationFormLabels {
	title?: string;
	description?: string;
	nicheLabel?: string;
	nichePlaceholder?: string;
	batchSizePrefix?: string;
	generateButton?: string;
	generating?: string;
	error?: string;
	statusTitle?: string;
	statusDescription?: string;
}

interface GenerationFormProps {
	labels?: GenerationFormLabels;
}

export function GenerationForm({ labels }: GenerationFormProps) {
	const router = useRouter();
	const [niche, setNiche] = useState("");
	const [batchSize, setBatchSize] = useState(7);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState("");
	const submittingRef = useRef(false);
	const abortRef = useRef<AbortController | null>(null);

	const nicheInputId = useId();
	const batchSliderId = useId();

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			abortRef.current?.abort();
		};
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (submittingRef.current) return;
		submittingRef.current = true;

		setError("");
		setIsGenerating(true);

		const controller = new AbortController();
		abortRef.current = controller;
		const timeout = setTimeout(() => controller.abort(), 90_000);

		try {
			const res = await fetch("/api/generations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					niche: niche.trim() || undefined,
					batchSize,
				}),
				signal: controller.signal,
			});

			if (!res.ok) {
				const body = await res.json().catch(() => null);
				throw new Error(
					body?.error ?? `Request failed with status ${res.status}`,
				);
			}

			const data: { generationId: string } = await res.json();
			router.push(`/dashboard/generations/${data.generationId}`);
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") {
				setError("Request timed out. Please try again.");
			} else {
				setError(
					err instanceof Error ? err.message : "An unexpected error occurred",
				);
			}
			setIsGenerating(false);
		} finally {
			clearTimeout(timeout);
			abortRef.current = null;
			submittingRef.current = false;
		}
	}

	return (
		<div className="space-y-6">
			{isGenerating && (
				<GenerationStatus
					isGenerating={isGenerating}
					statusTitle={labels?.statusTitle}
					statusDescription={labels?.statusDescription}
				/>
			)}

			<form
				onSubmit={handleSubmit}
				className="bg-[var(--color-neu-surface)] shadow-neu rounded-[var(--radius-neu)] p-8 space-y-6"
			>
				<div>
					<h2 className="text-xl font-bold text-[var(--color-neu-text-primary)] mb-1">
						{labels?.title ?? "Generate Ideas"}
					</h2>
					<p className="text-sm text-[var(--color-neu-text-secondary)]">
						{labels?.description ??
							"Optionally specify a niche, or leave blank for broad market exploration."}
					</p>
				</div>

				{/* Niche input */}
				<div>
					<label
						htmlFor={nicheInputId}
						className="block text-sm font-medium text-[var(--color-neu-text-primary)] mb-1.5"
					>
						{labels?.nicheLabel ?? "Niche (optional)"}
					</label>
					<input
						id={nicheInputId}
						type="text"
						value={niche}
						onChange={(e) => setNiche(e.target.value)}
						placeholder={labels?.nichePlaceholder ?? 'e.g. "productivity tools for remote teams"'}
						disabled={isGenerating}
						className="w-full px-4 py-2.5 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-surface)] border border-[var(--neu-shadow-dark)] text-[var(--color-neu-text-primary)] placeholder:text-[var(--color-neu-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-neu-accent)] transition-shadow shadow-neu-inset-sm disabled:opacity-50"
					/>
				</div>

				{/* Batch size slider */}
				<div>
					<label
						htmlFor={batchSliderId}
						className="block text-sm font-medium text-[var(--color-neu-text-primary)] mb-1.5"
					>
						{labels?.batchSizePrefix ?? "Ideas to generate:"}{" "}
						<span className="text-[var(--color-neu-accent)] font-bold">
							{batchSize}
						</span>
					</label>
					<div className="flex items-center gap-3">
						<span className="text-xs text-[var(--color-neu-text-muted)]">3</span>
						<input
							id={batchSliderId}
							type="range"
							min={3}
							max={10}
							step={1}
							value={batchSize}
							onChange={(e) => setBatchSize(Number(e.target.value))}
							disabled={isGenerating}
							className="flex-1 h-2 rounded-full bg-[var(--color-neu-surface)] shadow-neu-inset-sm appearance-none cursor-pointer
								[&::-webkit-slider-thumb]:appearance-none
								[&::-webkit-slider-thumb]:w-5
								[&::-webkit-slider-thumb]:h-5
								[&::-webkit-slider-thumb]:rounded-full
								[&::-webkit-slider-thumb]:bg-[var(--color-neu-accent)]
								[&::-webkit-slider-thumb]:shadow-neu-sm
								[&::-webkit-slider-thumb]:cursor-pointer
								disabled:opacity-50"
						/>
						<span className="text-xs text-[var(--color-neu-text-muted)]">
							10
						</span>
					</div>
				</div>

				{/* Error display */}
				{error && (
					<div className="p-3 rounded-[var(--radius-neu-sm)] bg-red-50 text-red-700 text-sm border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
						{error}
					</div>
				)}

				{/* Submit */}
				<button
					type="submit"
					disabled={isGenerating}
					className="w-full py-3 px-4 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-accent)] text-white font-semibold shadow-neu hover:shadow-neu-hover active:shadow-neu-inset transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isGenerating
						? (labels?.generating ?? "Generating...")
						: (labels?.generateButton ?? "Generate Ideas")}
				</button>
			</form>
		</div>
	);
}
