import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { createMetadata } from "@/lib/metadata";
import { getTranslations } from "@/lib/i18n";

export const metadata: Metadata = createMetadata({
	title: "Sign Up",
});

export default async function SignupPage() {
	const t = await getTranslations();

	const labels = {
		title: t.auth.createAccount,
		subtitle: t.auth.signUpSubtitle,
		emailLabel: t.auth.emailLabel,
		passwordLabel: t.auth.passwordLabel,
		nameLabel: t.auth.nameLabel,
		submitLabel: t.auth.signUpButton,
		loadingLabel: t.auth.creatingAccount,
		haveAccountText: t.auth.haveAccount,
		haveAccountLink: t.auth.signInLink,
	};

	return <AuthForm mode="signup" labels={labels} />;
}
