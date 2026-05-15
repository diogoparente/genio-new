import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { createMetadata } from "@/lib/metadata";
import { getTranslations } from "@/lib/i18n";

export const metadata: Metadata = createMetadata({
	title: "Sign In",
});

export default async function LoginPage() {
	const t = await getTranslations();

	const labels = {
		title: t.auth.welcomeBack,
		subtitle: t.auth.signInSubtitle,
		emailLabel: t.auth.emailLabel,
		passwordLabel: t.auth.passwordLabel,
		nameLabel: t.auth.nameLabel,
		submitLabel: t.auth.signInButton,
		loadingLabel: t.auth.signingIn,
		noAccountText: t.auth.noAccount,
		noAccountLink: t.auth.signUpLink,
	};

	return <AuthForm mode="login" labels={labels} />;
}
