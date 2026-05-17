import Link from "next/link";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { getTranslations } from "@/lib/i18n";

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

const steps = [{ step: "01" }, { step: "02" }, { step: "03" }];

const stats = [
  { value: "10k+" },
  { value: "4" },
  { value: "92%" },
  { value: "0" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function LandingPage() {
  const t = await getTranslations();

  const featureData = [
    {
      title: t.landing.featureMarketSignals,
      description: t.landing.featureMarketSignalsDesc,
      icon: features[0].icon,
    },
    {
      title: t.landing.featureCompetitiveAnalysis,
      description: t.landing.featureCompetitiveAnalysisDesc,
      icon: features[1].icon,
    },
    {
      title: t.landing.featureConfidenceScoring,
      description: t.landing.featureConfidenceScoringDesc,
      icon: features[2].icon,
    },
    {
      title: t.landing.featureBootstrapPrompts,
      description: t.landing.featureBootstrapPromptsDesc,
      icon: features[3].icon,
    },
  ];

  const stepData = [
    {
      step: steps[0].step,
      title: t.landing.step1Title,
      description: t.landing.step1Desc,
    },
    {
      step: steps[1].step,
      title: t.landing.step2Title,
      description: t.landing.step2Desc,
    },
    {
      step: steps[2].step,
      title: t.landing.step3Title,
      description: t.landing.step3Desc,
    },
  ];

  const statsData = [
    { value: stats[0].value, label: t.landing.statsIdeas },
    { value: stats[1].value, label: t.landing.statsSources },
    { value: stats[2].value, label: t.landing.statsAccuracy },
    { value: stats[3].value, label: t.landing.statsCost },
  ];

  const pricingFeatures = [
    t.landing.pricingFeature1,
    t.landing.pricingFeature2,
    t.landing.pricingFeature3,
    t.landing.pricingFeature4,
    t.landing.pricingFeature5,
    t.landing.pricingFeature6,
  ];

  const faqs = [
    {
      question: t.landing.faq1q,
      answer: t.landing.faq1a,
    },
    {
      question: t.landing.faq2q,
      answer: t.landing.faq2a,
    },
    {
      question: t.landing.faq3q,
      answer: t.landing.faq3a,
    },
    {
      question: t.landing.faq4q,
      answer: t.landing.faq4a,
    },
    {
      question: t.landing.faq5q,
      answer: t.landing.faq5a,
    },
    {
      question: t.landing.faq6q,
      answer: t.landing.faq6a,
    },
  ];

  return (
    <div className="flex flex-col gap-20 pb-8">
      {/* Hero */}
      <section className="bg-[var(--color-neu-bg)]">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-20">
          {/* Beta badge — centered above the grid */}
          <div className="flex justify-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-[var(--color-neu-surface)] border border-[var(--neu-shadow-dark)]/15 rounded-[var(--radius-neu-full)] px-4 py-1.5 text-xs font-medium text-[var(--color-neu-accent-secondary)] shadow-neu-inset-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-neu-accent-secondary)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-neu-accent-secondary)]" />
              </span>
              {t.landing.betaBadge}
            </div>
          </div>

          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-5">
            {/* Left column — headline */}
            <div className="col-span-1 lg:col-span-3">
              <h1 className="text-3xl font-medium tracking-tight font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)] md:text-5xl">
                {t.landing.heroTitle}
              </h1>
            </div>

            {/* Right column — description + CTAs */}
            <div className="col-span-1 lg:col-span-2">
              <p className="text-lg font-medium text-[var(--color-neu-text-secondary)] md:text-2xl lg:text-xl">
                {t.landing.heroSubtitle}
              </p>
              <div className="relative z-10 mt-6 flex justify-center">
                <Link
                  href="/signup"
                  className="rounded-lg bg-[var(--color-neu-accent)] px-4 py-2 text-sm font-medium text-white shadow-[0px_0px_10px_0px_rgba(255,255,255,0.2)_inset] ring ring-white/20 ring-offset-2 ring-offset-[var(--color-neu-accent)] transition-all duration-200 ring-inset hover:shadow-[0px_0px_20px_0px_rgba(255,255,255,0.4)_inset] hover:ring-white/40 active:scale-[0.98]"
                >
                  {t.common.startValidating}
                </Link>
              </div>
            </div>
          </div>

          {/* Image showcase with noise texture */}
          <div className="relative mx-auto my-12 h-64 w-full max-w-7xl py-4 sm:h-[480px] md:my-20 md:h-[480px] md:py-20 lg:h-[720px]">
            <canvas
              className="pointer-events-none absolute inset-0 h-full w-full rounded-3xl"
              width={1356}
              height={1440}
              style={{ display: "block" }}
            />
            <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full rounded-3xl opacity-[0.35] dark:opacity-[0.20]">
              <filter id="noiseFilter">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="1"
                  numOctaves="3"
                  stitchTiles="stitch"
                />
              </filter>
              <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
            <div className="relative z-20 h-full w-full overflow-hidden rounded-lg">
              <img
                alt="Hero"
                className="mx-auto h-full w-full max-w-[90%] rounded-lg object-cover object-left-top md:max-w-[85%]"
                src="https://assets.aceternity.com/screenshots/3.jpg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-neu-accent-secondary)] mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)] mb-4">
            {t.landing.featuresTitle}
          </h2>
          <p className="text-lg text-[var(--color-neu-text-secondary)]">
            {t.landing.featuresSubtitle}
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureData.map((f) => (
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
            {t.landing.howItWorksTitle}
          </h2>
          <p className="text-lg text-[var(--color-neu-text-secondary)]">
            {t.landing.howItWorksSubtitle}
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {stepData.map((s, i) => (
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
            {statsData.map((s) => (
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
            {t.landing.pricingTitle}
          </h2>
          <p className="text-lg text-[var(--color-neu-text-secondary)]">
            {t.landing.pricingSubtitle}
          </p>
        </div>
        <div className="mt-10 max-w-md mx-auto">
          <div className="bg-[var(--color-neu-surface)] rounded-[var(--radius-neu-lg)] shadow-neu p-8 border-2 border-[var(--color-neu-accent-secondary)]/30 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-neu-accent-secondary)] text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-[var(--radius-neu-full)] shadow-neu-sm">
              Beta
            </div>

            <div className="text-center mt-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-neu-text-muted)]">
                {t.landing.pricingPlan}
              </p>
              <div className="mt-3 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold font-[family-name:var(--font-display)] text-[var(--color-neu-text-primary)]">
                  {t.landing.pricingPrice}
                </span>
                <span className="text-[var(--color-neu-text-secondary)]">
                  {t.landing.pricingPeriod}
                </span>
              </div>
              <p className="text-sm text-[var(--color-neu-text-muted)] mt-2">
                {t.landing.pricingDescription}
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
                className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3 rounded-[var(--radius-neu-full)] transition-all duration-200 hover:-translate-y-0.5 bg-[var(--color-neu-accent)] text-white shadow-neu hover:shadow-neu-hover"
              >
                {t.common.getStarted}
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
            {t.landing.faqTitle}
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
            {t.landing.finalCTATitle}
          </h2>
          <p className="text-lg text-[var(--color-neu-text-secondary)] mb-8 max-w-md mx-auto">
            {t.landing.finalCTASubtitle}
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3 rounded-[var(--radius-neu-full)] transition-all duration-200 hover:-translate-y-0.5 bg-[var(--color-neu-accent)] text-white shadow-neu hover:shadow-neu-hover"
          >
            {t.common.createFreeAccount}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--neu-shadow-dark)]/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-neu-text-muted)]">
        <p>
          &copy; {new Date().getFullYear()} génio. {t.footer.allRightsReserved}
        </p>
        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="hover:text-[var(--color-neu-text-primary)] transition-colors"
          >
            {t.footer.signIn}
          </Link>
          <Link
            href="/signup"
            className="hover:text-[var(--color-neu-text-primary)] transition-colors"
          >
            {t.footer.signUp}
          </Link>
          <Link
            href="#features"
            className="hover:text-[var(--color-neu-text-primary)] transition-colors"
          >
            {t.footer.features}
          </Link>
          <Link
            href="#pricing"
            className="hover:text-[var(--color-neu-text-primary)] transition-colors"
          >
            {t.footer.pricing}
          </Link>
          <Link
            href="#faq"
            className="hover:text-[var(--color-neu-text-primary)] transition-colors"
          >
            {t.footer.faq}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
