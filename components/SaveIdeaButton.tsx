"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SaveIdeaButtonProps {
	ideaId: string;
	isSaved: boolean;
}

export function SaveIdeaButton({ ideaId, isSaved: initialSaved }: SaveIdeaButtonProps) {
	const router = useRouter();
	const [saved, setSaved] = useState(initialSaved);
	const [loading, setLoading] = useState(false);

	async function toggle() {
		setLoading(true);
		try {
			const res = await fetch(`/api/ideas/${ideaId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isSaved: !saved }),
			});
			if (res.ok) {
				setSaved(!saved);
				router.refresh();
			}
		} catch {
			// silently fail, state reverts on refresh
		} finally {
			setLoading(false);
		}
	}

	return (
		<button
			type="button"
			onClick={toggle}
			disabled={loading}
			className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-neu-sm)] text-sm font-semibold transition-all disabled:opacity-50 ${
				saved
					? "bg-yellow-100 text-yellow-800 shadow-neu-inset-sm dark:bg-yellow-900 dark:text-yellow-200"
					: "bg-[var(--color-neu-surface)] text-[var(--color-neu-text-secondary)] shadow-neu-sm hover:shadow-neu"
			}`}
		>
			{saved ? "★ Saved" : "☆ Save"}
		</button>
	);
}
