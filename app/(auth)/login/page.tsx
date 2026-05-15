import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
	title: "Sign In",
});

export default function LoginPage() {
	return <AuthForm mode="login" />;
}
