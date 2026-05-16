"use client";

import { useRouter } from "next/navigation";

const languages = [
	{ code: "en", name: "English", flag: "\u{1F1EC}\u{1F1E7}" },
	{ code: "pt", name: "Portugu\u00eas", flag: "\u{1F1E7}\u{1F1F7}" },
	{ code: "es", name: "Espa\u00f1ol", flag: "\u{1F1EA}\u{1F1F8}" },
	{ code: "fr", name: "Fran\u00e7ais", flag: "\u{1F1EB}\u{1F1F7}" },
	{ code: "de", name: "Deutsch", flag: "\u{1F1E9}\u{1F1EA}" },
	{ code: "ja", name: "\u65E5\u672C\u8A9E", flag: "\u{1F1EF}\u{1F1F5}" },
	{ code: "ko", name: "\uD55C\uAD6D\uC5B4", flag: "\u{1F1F0}\u{1F1F7}" },
];

export function LanguageSwitcher({ currentLanguage = "en" }: { currentLanguage?: string }) {
	const router = useRouter();

	function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const lang = e.target.value;
		document.cookie = `genio-lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
		router.refresh();
	}

	return (
		<select
			value={currentLanguage}
			onChange={handleChange}
			aria-label="Select language"
			className="appearance-none cursor-pointer text-sm font-medium pl-2.5 pr-7 py-2 rounded-[var(--radius-neu-full)] bg-[var(--color-neu-surface)] text-[var(--color-neu-text-primary)] border border-[var(--neu-shadow-dark)]/20 shadow-neu-inset-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-neu-accent)]/50 transition-shadow hover:shadow-neu-sm bg-no-repeat"
			style={{
				backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23636e72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
				backgroundPosition: "right 8px center",
			}}
		>
			{languages.map((l) => (
				<option key={l.code} value={l.code}>
					{l.flag} {l.name}
				</option>
			))}
		</select>
	);
}
