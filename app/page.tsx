import Link from "next/link";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
	title: "génio — Validate micro-SaaS ideas with real market signals",
	description:
		"génio helps founders discover, score, and validate micro-SaaS ideas using real market data. Stop guessing, start building with confidence.",
});

/* ------------------------------------------------------------------ */
/*  Data (all hardcoded — no API dependencies)                        */
/* ------------------------------------------------------------------ */

const features = [
	{
		title: "Market Signals",
		description:
			"Tap into real-time data from search trends, social chatter, and community forums to identify growing demand before it peaks.",
		icon: (
			<svg
				width="28"
				height="28"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M3 3v18h18" />
				<path d="m19 9-5 5-4-4-3 3" />
			</svg>
		),
	},
	{
		title: "Competitive Analysis",
		description:
			"See who is already in the space, what they charge, and where they fall short so you can position your product to win.",
		icon: (
			<svg
				width="28"
				height="28"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<ellipse cx="12" cy="5" rx="9" ry="3" />
				<path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5" />
				<path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" />
			</svg>
		),
	},
	{
		title: "Confidence Scoring",
		description:
			"Every idea gets a 0-100 score based on demand strength, competition saturation, and execution feasibility — so you bet on the right horse.",
		icon: (
			<svg
				width="28"
				height="28"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M12 20V10" />
				<path d="M18 20V4" />
				<path d="M6 20v-4" />
			</svg>
		),
	},
	{
		title: "Bootstrap Prompts",
		description:
			"Turn a validated idea into an MVP faster with curated AI prompts that scaffold your landing page, tech stack, and first features.",
		icon: (
			<svg
				width="28"
				height="28"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
			</svg>
		),
	},
];

const steps = [
	{
		step: "01",
		title: "Pick a niche",
		description:
			"Choose from dozens of underserved markets or define your own. génio zeroes in on sectors with rising demand and thin competition.",
	},
	{
		step: "02",
		title: "Generate ideas",
		description:
			"génio analyses signals across multiple data sources and returns a ranked shortlist of micro-SaaS concepts with revenue estimates.",
	},
	{
		step: "03",
		title: "Build with confidence",
		description:
			"Pick the top-scoring idea, grab your bootstrap prompt, and start shipping — backed by data, not guesswork.",
	},
];

const stats = [
	{ value: "10k+", label: "Ideas generated" },
	{ value: "4", label: "Live data sources" },
	{ value: "92%", label: "Signal accuracy" },
	{ value: "0", label: "Cost to start" },
];

const pricingFeatures = [
	"Unlimited idea generation",
	"Full market-signal breakdown",
	"Confidence scoring for every idea",
	"Competitive landscape reports",
	"AI bootstrap prompts",
	"Email support within 24 hours",
];

const faqs = [
	{
		question: "What exactly is génio?",
		answer:
			"génio is an idea-validation engine for micro-SaaS founders. It pulls real-world market signals — search volume, forum discussions, competitor data — and scores business ideas so you know which ones are worth building.",
	},
	{
		question: "How does the confidence score work?",
		answer:
			"The score (0-100) combines three factors: demand strength (are people searching for this?), competition density (how many alternatives exist?), and execution feasibility (can a solo founder ship it?).",
	},
	{
		question: "Is génio really free during beta?",
		answer:
			"Yes. While we are in beta, every account gets full access at $0/month. When paid plans launch, beta users will be grandfathered into a generous free tier.",
	},
	{
		question: "Where does the market data come from?",
		answer:
			"génio aggregates public signals from four sources: search-engine trend APIs, social-platform public feeds, niche-community forums, and app-store metadata.",
	},
	{
		question: "Do I need a technical background to use génio?",
		answer:
			"Not at all. génio is built for founders of every background. The interface walks you through niche selection, idea review, and scoring in plain language.",
	},
	{
		question: "Can I export my validated ideas?",
		answer:
			"Absolutely. Every idea card, score breakdown, and bootstrap prompt can be exported as PDF or copied to your clipboard.",
	},
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
	return (
		<div className="flex flex-col gap-20 pb-8">
			{/* Hero */}
			<section className="pt-10 sm:pt-16 text-center flex flex-col items-center gap-6">
				<div className="inline-flex items-center gap-2 bg-[var(--color-neu-surface)] border border-[var(--neu-shadow-dark)]/15 rounded-[var(--radius-neu-full)] px-4 py-1.5 text-xs font-medium text-[var(--color-neu-accent-secondary)] shadow-neu-inset-sm">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-neu-accent-secondary)] opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-neu-accent-secondary)]" />
					</span>
					Free during beta — no credit card required
				</div>

				<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)] leading-tight max-w-3xl">
					Validate micro-SaaS ideas with{" "}
					<span className="text-[var(--color-neu-accent)]">real market data</span>
					, not gut feelings
				</h1>

				<p className="text-lg sm:text-xl text-[var(--color-neu-text-secondary)] max-w-xl">
					génio scans search trends, competitor landscapes, and community
					signals to surface startup ideas worth your time — and shows you how
					to build them.
				</p>

				<div className="flex flex-col sm:flex-row gap-3 items-center">
					<Link
						href="/signup"
						className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3 rounded-[var(--radius-neu-full)] transition-all duration-200 hover:-translate-y-0.5 bg-[var(--color-neu-accent)] text-white shadow-neu-accent hover:shadow-neu-accent-hover"
					>
						Start validating for free
					</Link>
					<Link
						href="#how-it-works"
						className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3 rounded-[var(--radius-neu-full)] transition-all duration-200 hover:-translate-y-0.5 bg-[var(--color-neu-surface)] text-[var(--color-neu-text-primary)] shadow-neu-sm hover:shadow-neu"
					>
						See how it works
					</Link>
				</div>
			</section>

			{/* Features Grid */}
			<section id="features">
				<div className="text-center max-w-2xl mx-auto">
					<p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-neu-accent-secondary)] mb-3">
						Features
					</p>
					<h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)] mb-4">
						Everything you need to spot a winner
					</h2>
					<p className="text-lg text-[var(--color-neu-text-secondary)]">
						Four pillars that turn raw signals into actionable micro-SaaS
						ideas you can trust.
					</p>
				</div>
				<div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
					{features.map((f) => (
						<div
							key={f.title}
							className="bg-[var(--color-neu-surface)] rounded-[var(--radius-neu)] shadow-neu-sm hover:shadow-neu transition-shadow p-6"
						>
							<div className="w-12 h-12 flex items-center justify-center rounded-[var(--radius-neu-sm)] bg-[var(--color-neu-bg)] shadow-neu-inset-sm text-[var(--color-neu-accent-secondary)] mb-4">
								{f.icon}
							</div>
							<h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)] mb-2">
								{f.title}
							</h3>
							<p className="text-sm text-[var(--color-neu-text-secondary)] leading-relaxed">
								{f.description}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* How It Works */}
			<section id="how-it-works">
				<div className="text-center max-w-2xl mx-auto">
					<p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-neu-accent-secondary)] mb-3">
						How It Works
					</p>
					<h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)] mb-4">
						From hunch to validated idea in three steps
					</h2>
					<p className="text-lg text-[var(--color-neu-text-secondary)]">
						No spreadsheets, no manual research, no second-guessing.
					</p>
				</div>
				<div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10 relative">
					{steps.map((s, i) => (
						<div
							key={s.step}
							className="relative flex flex-col items-center text-center"
						>
							<div className="w-16 h-16 rounded-full bg-[var(--color-neu-surface)] shadow-neu-sm flex items-center justify-center mb-4">
								<span className="text-xl font-bold font-[family-name:var(--font-display)] text-[var(--color-neu-accent)]">
									{s.step}
								</span>
							</div>

							{i < 2 && (
								<div className="hidden md:block absolute top-8 left-[calc(50%+4rem)] w-[calc(100%-8rem)] h-0.5 bg-gradient-to-r from-[var(--color-neu-accent-secondary)]/40 to-[var(--color-neu-accent-secondary)]/10" />
							)}

							<h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)] mb-2">
								{s.title}
							</h3>
							<p className="text-sm text-[var(--color-neu-text-secondary)] leading-relaxed max-w-xs">
								{s.description}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Stats / Social Proof */}
			<section>
				<div className="bg-[var(--color-neu-surface)] rounded-[var(--radius-neu-lg)] shadow-neu-sm p-8 md:p-12">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
						{stats.map((s) => (
							<div key={s.label}>
								<p className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-display)] text-[var(--color-neu-accent)]">
									{s.value}
								</p>
								<p className="text-sm text-[var(--color-neu-text-muted)] mt-1">
									{s.label}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Pricing Card */}
			<section id="pricing">
				<div className="text-center max-w-2xl mx-auto">
					<p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-neu-accent-secondary)] mb-3">
						Pricing
					</p>
					<h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)] mb-4">
						Join the beta, completely free
					</h2>
					<p className="text-lg text-[var(--color-neu-text-secondary)]">
						Early adopters get full access. No tricks, no trials that expire.
					</p>
				</div>
				<div className="mt-10 max-w-md mx-auto">
					<div className="bg-[var(--color-neu-surface)] rounded-[var(--radius-neu-lg)] shadow-neu p-8 border-2 border-[var(--color-neu-accent-secondary)]/30 relative">
						<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-neu-accent-secondary)] text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-[var(--radius-neu-full)] shadow-neu-sm">
							Beta
						</div>

						<div className="text-center mt-4">
							<p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-neu-text-muted)]">
								Starter
							</p>
							<div className="mt-3 flex items-baseline justify-center gap-1">
								<span className="text-5xl font-extrabold font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)]">
									$0
								</span>
								<span className="text-[var(--color-neu-text-secondary)]">
									/month
								</span>
							</div>
							<p className="text-sm text-[var(--color-neu-text-muted)] mt-2">
								Free while in beta — lock in early access
							</p>
						</div>

						<ul className="mt-8 space-y-3">
							{pricingFeatures.map((feat) => (
								<li
									key={feat}
									className="flex items-start gap-3 text-sm text-[var(--color-neu-text-secondary)]"
								>
									<svg
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="text-[var(--color-neu-accent-secondary)] shrink-0 mt-0.5"
									>
										<path d="M20 6 9 17l-5-5" />
									</svg>
									{feat}
								</li>
							))}
						</ul>

						<div className="mt-8 text-center">
							<Link
								href="/signup"
								className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3 rounded-[var(--radius-neu-full)] transition-all duration-200 hover:-translate-y-0.5 bg-[var(--color-neu-accent)] text-white shadow-neu-accent hover:shadow-neu-accent-hover"
							>
								Get started free
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ Accordion */}
			<section id="faq">
				<div className="text-center max-w-2xl mx-auto">
					<p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-neu-accent-secondary)] mb-3">
						FAQ
					</p>
					<h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)] mb-4">
						Questions? We have answers.
					</h2>
				</div>
				<div className="mt-10 max-w-2xl mx-auto space-y-3">
					{faqs.map((faq) => (
						<details
							key={faq.question}
							className="group bg-[var(--color-neu-surface)] rounded-[var(--radius-neu)] shadow-neu-sm overflow-hidden"
						>
							<summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-medium font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)] hover:text-[var(--color-neu-accent)] transition-colors select-none">
								<span>{faq.question}</span>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="shrink-0 text-[var(--color-neu-text-muted)] transition-transform duration-200 group-open:rotate-180"
								>
									<path d="m6 9 6 6 6-6" />
								</svg>
							</summary>
							<div className="px-6 pb-4 text-sm text-[var(--color-neu-text-secondary)] leading-relaxed">
								{faq.answer}
							</div>
						</details>
					))}
				</div>
			</section>

			{/* Final CTA */}
			<section className="text-center py-12">
				<div className="bg-[var(--color-neu-surface)] rounded-[var(--radius-neu-lg)] shadow-neu p-10 sm:p-14">
					<h2 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)] mb-4">
						Ready to stop guessing?
					</h2>
					<p className="text-lg text-[var(--color-neu-text-secondary)] mb-8 max-w-md mx-auto">
						Join beta users who validate ideas with data instead of
						intuition. Free while in beta.
					</p>
					<Link
						href="/signup"
						className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3 rounded-[var(--radius-neu-full)] transition-all duration-200 hover:-translate-y-0.5 bg-[var(--color-neu-accent)] text-white shadow-neu-accent hover:shadow-neu-accent-hover"
					>
						Create your free account
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-[var(--neu-shadow-dark)]/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-neu-text-muted)]">
				<p>&copy; {new Date().getFullYear()} génio. All rights reserved.</p>
				<nav className="flex items-center gap-6">
					<Link
						href="/login"
						className="hover:text-[var(--color-neu-text-primary)] transition-colors"
					>
						Sign In
					</Link>
					<Link
						href="/signup"
						className="hover:text-[var(--color-neu-text-primary)] transition-colors"
					>
						Sign Up
					</Link>
					<Link
						href="#features"
						className="hover:text-[var(--color-neu-text-primary)] transition-colors"
					>
						Features
					</Link>
					<Link
						href="#pricing"
						className="hover:text-[var(--color-neu-text-primary)] transition-colors"
					>
						Pricing
					</Link>
					<Link
						href="#faq"
						className="hover:text-[var(--color-neu-text-primary)] transition-colors"
					>
						FAQ
					</Link>
				</nav>
			</footer>
		</div>
	);
}
