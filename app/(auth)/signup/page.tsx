import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
	title: "Sign Up",
});

export default function SignupPage() {
	return <AuthForm mode="signup" />;
}
