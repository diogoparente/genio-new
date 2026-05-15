"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface AuthFormProps {
	mode: "login" | "signup";
	labels?: {
		title?: string;
		subtitle?: string;
		emailLabel?: string;
		passwordLabel?: string;
		nameLabel?: string;
		submitLabel?: string;
		loadingLabel?: string;
		noAccountText?: string;
		noAccountLink?: string;
		haveAccountText?: string;
		haveAccountLink?: string;
		signInLink?: string;
		signUpLink?: string;
	};
}

export function AuthForm({ mode, labels }: AuthFormProps) {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	function validate(): string | null {
		if (mode === "signup" && !name.trim()) {
			return "Name is required.";
		}
		if (!email.trim()) {
			return "Email is required.";
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			return "Please enter a valid email address.";
		}
		if (!password) {
			return "Password is required.";
		}
		if (mode === "signup" && password.length < 8) {
			return "Password must be at least 8 characters.";
		}
		return null;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		const validationError = validate();
		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);

		try {
			if (mode === "login") {
				await authClient.signIn.email(
					{
						email: email.trim(),
						password,
						callbackURL: "/dashboard",
					},
					{
						onSuccess() {
							toast.success("Successfully signed in!");
							router.push("/dashboard");
						},
						onError(context) {
							setError(context.error.message);
							toast.error(context.error.message);
						},
					},
				);
			} else {
				await authClient.signUp.email(
					{
						email: email.trim(),
						password,
						name: name.trim(),
						callbackURL: "/dashboard",
					},
					{
						onSuccess() {
							toast.success("Account created successfully!");
							router.push("/dashboard");
						},
						onError(context) {
							setError(context.error.message);
							toast.error(context.error.message);
						},
					},
				);
			}
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "An unexpected error occurred";
			setError(message);
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-[var(--color-neu-surface)] shadow-neu rounded-[var(--radius-neu)] p-8">
				<h1 className="text-2xl font-bold mb-2 text-[var(--color-neu-text-primary)]">
					{labels?.title ?? (mode === "login" ? "Welcome back" : "Create your account")}
				</h1>
				<p className="text-[var(--color-neu-text-secondary)] mb-6">
					{labels?.subtitle ?? (mode === "login"
						? "Sign in to access your dashboard"
						: "Start generating micro-SaaS ideas")}
				</p>

				{error && (
					<div className="mb-4 p-3 rounded-[var(--radius-neu-sm)] bg-red-50 text-red-700 text-sm border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					{mode === "signup" && (
						<div>
							<label
								htmlFor="auth-name"
								className="block text-sm font-medium text-[var(--color-neu-text-primary)] mb-1.5"
							>
								{labels?.nameLabel ?? "Name"}
							</label>
							<input
								id="auth-name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Your name"
								autoComplete="name"
								disabled={loading}
								className="w-full px-4 py-2.5 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-surface)] border border-[var(--neu-shadow-dark)] text-[var(--color-neu-text-primary)] placeholder:text-[var(--color-neu-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-neu-accent)] transition-shadow shadow-neu-inset-sm"
							/>
						</div>
					)}

					<div>
						<label
							htmlFor="auth-email"
							className="block text-sm font-medium text-[var(--color-neu-text-primary)] mb-1.5"
						>
							{labels?.emailLabel ?? "Email"}
						</label>
						<input
							id="auth-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							autoComplete="email"
							disabled={loading}
							className="w-full px-4 py-2.5 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-surface)] border border-[var(--neu-shadow-dark)] text-[var(--color-neu-text-primary)] placeholder:text-[var(--color-neu-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-neu-accent)] transition-shadow shadow-neu-inset-sm"
						/>
					</div>

					<div>
						<label
							htmlFor="auth-password"
							className="block text-sm font-medium text-[var(--color-neu-text-primary)] mb-1.5"
						>
							{labels?.passwordLabel ?? "Password"}
						</label>
						<input
							id="auth-password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder={
								mode === "signup"
									? "At least 8 characters"
									: "Your password"
							}
							autoComplete={
								mode === "login" ? "current-password" : "new-password"
							}
							disabled={loading}
							className="w-full px-4 py-2.5 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-surface)] border border-[var(--neu-shadow-dark)] text-[var(--color-neu-text-primary)] placeholder:text-[var(--color-neu-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-neu-accent)] transition-shadow shadow-neu-inset-sm"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full py-2.5 px-4 rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-accent)] text-white font-semibold shadow-neu-accent hover:shadow-neu-accent-hover active:shadow-neu-accent-inset transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? (
							<span className="flex items-center justify-center gap-2">
								<svg
									className="animate-spin h-4 w-4"
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
								{labels?.loadingLabel ?? (mode === "login" ? "Signing in..." : "Creating account...")}
							</span>
						) : (
							labels?.submitLabel ?? (mode === "login" ? "Sign in" : "Create account")
						)}
					</button>
				</form>
			</div>

			<p className="mt-6 text-center text-sm text-[var(--color-neu-text-secondary)]">
				{mode === "login" ? (
					<>
						{labels?.noAccountText ?? "Don't have an account?"}{" "}
						<Link
							href="/signup"
							className="text-[var(--color-neu-accent)] hover:underline font-medium"
						>
							{labels?.noAccountLink ?? "Sign up"}
						</Link>
					</>
				) : (
					<>
						{labels?.haveAccountText ?? "Already have an account?"}{" "}
						<Link
							href="/login"
							className="text-[var(--color-neu-accent)] hover:underline font-medium"
						>
							{labels?.haveAccountLink ?? "Sign in"}
						</Link>
					</>
				)}
			</p>
		</div>
	);
}
