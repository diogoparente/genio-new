import { cookies } from "next/headers";
import en from "./translations/en.json";

type Translations = typeof en;
type NestedKeyOf<T, K extends keyof T = keyof T> = K extends string
	? T[K] extends Record<string, unknown>
		? `${K}.${NestedKeyOf<T[K]>}`
		: K
	: never;

export type TranslationKey = NestedKeyOf<Translations>;

export const SUPPORTED_LANGUAGES = ["en", "pt", "es", "fr", "de", "ja", "ko"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_COOKIE = "genio-lang";

export async function getLanguage(): Promise<Language> {
	const cookieStore = await cookies();
	const lang = cookieStore.get(LANGUAGE_COOKIE)?.value;
	if (lang && SUPPORTED_LANGUAGES.includes(lang as Language)) {
		return lang as Language;
	}
	return "en";
}

export async function getTranslations(): Promise<Translations> {
	const lang = await getLanguage();
	if (lang === "en") return en;
	const mod = await import(`./translations/${lang}.json`);
	return mod.default ?? mod;
}

// For client components: pass the language as a prop instead of calling getTranslations
export function getLanguageFromCookie(cookieValue: string | undefined): Language {
	if (cookieValue && SUPPORTED_LANGUAGES.includes(cookieValue as Language)) {
		return cookieValue as Language;
	}
	return "en";
}
