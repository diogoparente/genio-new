import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Design System — Neumorphic Reference",
};

/* ------------------------------------------------------------------ */
/*  Color token swatch data                                           */
/* ------------------------------------------------------------------ */

interface Swatch {
	name: string;
	cssVar: string;
	color: string;
	textColor?: string;
}

const brandSwatches: Swatch[] = [
	{ name: "Background", cssVar: "--color-neu-bg", color: "#e0e5ec" },
	{ name: "Accent", cssVar: "--color-neu-accent", color: "#ff9a75" },
	{ name: "Accent Secondary", cssVar: "--color-neu-accent-secondary", color: "#38b2ac" },
];

const surfaceSwatches: Swatch[] = [
	{ name: "Surface", cssVar: "--color-neu-surface", color: "#e0e5ec" },
	{ name: "Surface Raised", cssVar: "--color-neu-surface-raised", color: "#e6ebf0" },
	{ name: "Surface Lowered", cssVar: "--color-neu-surface-lowered", color: "#d5dae1" },
];

const textSwatches: Swatch[] = [
	{ name: "Text Primary", cssVar: "--color-neu-text-primary", color: "#2d3436" },
	{ name: "Text Secondary", cssVar: "--color-neu-text-secondary", color: "#636e72" },
	{ name: "Text Muted", cssVar: "--color-neu-text-muted", color: "#88959b" },
];

const shadowSwatches: Swatch[] = [
	{ name: "Dark Shadow", cssVar: "--neu-shadow-dark", color: "#bec3c9" },
	{ name: "Light Shadow", cssVar: "--neu-shadow-light", color: "#ffffff" },
	{
		name: "Accent Dark",
		cssVar: "--neu-shadow-accent-dark",
		color: "#d47a5e",
	},
	{
		name: "Accent Light",
		cssVar: "--neu-shadow-accent-light",
		color: "#ffb89e",
	},
	{
		name: "Accent Sec. Dark",
		cssVar: "--neu-shadow-accent-secondary-dark",
		color: "#2a8f8a",
	},
	{
		name: "Accent Sec. Light",
		cssVar: "--neu-shadow-accent-secondary-light",
		color: "#4ec5c0",
	},
];

/* ------------------------------------------------------------------ */
/*  Reusable presentational components                                */
/* ------------------------------------------------------------------ */

function SectionHeading({ children }: { children: React.ReactNode }) {
	return (
		<h2
			className="text-2xl font-bold mb-6"
			style={{
				fontFamily: "var(--font-display)",
				color: "var(--color-neu-text-primary)",
			}}
		>
			{children}
		</h2>
	);
}

function ShadowCard({
	label,
	className,
	bg,
}: {
	label: string;
	className: string;
	bg?: string;
}) {
	return (
		<div className="flex flex-col items-center gap-3">
			<div
				className={`w-32 h-32 rounded-[var(--radius-neu)] flex items-center justify-center ${className}`}
				style={{ background: bg ?? "var(--color-neu-surface)" }}
			>
				<span
					className="text-xs text-center px-2 font-medium"
					style={{
						fontFamily: "var(--font-body)",
						color: bg ? "#ffffff" : "var(--color-neu-text-secondary)",
					}}
				>
					{label}
				</span>
			</div>
			<code
				className="text-[10px] px-2 py-0.5 rounded-[var(--radius-neu-sm)]"
				style={{
					fontFamily: "var(--font-body)",
					color: "var(--color-neu-text-muted)",
				}}
			>
				{className}
			</code>
		</div>
	);
}

function SwatchChip({ swatch }: { swatch: Swatch }) {
	return (
		<div className="flex items-center gap-4">
			<div
				className="w-14 h-14 rounded-[var(--radius-neu-sm)] shadow-neu-sm flex-shrink-0 border"
				style={{
					background: swatch.color,
					borderColor: swatch.color,
				}}
			/>
			<div className="min-w-0">
				<p
					className="text-sm font-semibold truncate"
					style={{
						fontFamily: "var(--font-display)",
						color: "var(--color-neu-text-primary)",
					}}
				>
					{swatch.name}
				</p>
				<p
					className="text-xs"
					style={{
						fontFamily: "var(--font-body)",
						color: "var(--color-neu-text-muted)",
					}}
				>
					{swatch.cssVar}
				</p>
				<p
					className="text-xs font-mono"
					style={{ color: "var(--color-neu-text-secondary)" }}
				>
					{swatch.color}
				</p>
			</div>
		</div>
	);
}

function FontSample({
	fontFamily,
	fontLabel,
	weight,
	weightLabel,
}: {
	fontFamily: string;
	fontLabel: string;
	weight: number;
	weightLabel: string;
}) {
	return (
		<div className="flex flex-col gap-2">
			<p
				className="text-lg leading-snug"
				style={{ fontFamily, fontWeight: weight, color: "var(--color-neu-text-primary)" }}
			>
				{fontLabel} {weightLabel} — The quick brown fox
			</p>
			<div className="flex flex-wrap gap-4">
				{["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl"].map(
					(size) => (
						<span
							key={size}
							className={size}
							style={{
								fontFamily,
								fontWeight: weight,
								color: "var(--color-neu-text-primary)",
							}}
						>
							Aa
						</span>
					),
				)}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function DesignSystemPage() {
	return (
		<div className="space-y-16 py-12">
			{/* ---- Header ---- */}
			<div className="text-center space-y-3">
				<h1
					className="text-4xl font-bold tracking-tight"
					style={{
						fontFamily: "var(--font-display)",
						color: "var(--color-neu-text-primary)",
					}}
				>
					Neumorphic Design System
				</h1>
				<p
					className="text-base max-w-lg mx-auto"
					style={{
						fontFamily: "var(--font-body)",
						color: "var(--color-neu-text-secondary)",
					}}
				>
					Visual reference for shadows, colors, typography, and spacing
					tokens. All values are driven by CSS custom properties defined in{" "}
					<code style={{ color: "var(--color-neu-accent)" }}>
						app/globals.css
					</code>
					.
				</p>
			</div>

			{/* ---- 1. Raised Shadows ---- */}
			<section>
				<SectionHeading>Raised Shadows</SectionHeading>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
					<ShadowCard label="shadow-neu" className="shadow-neu" />
					<ShadowCard label="shadow-neu-sm" className="shadow-neu-sm" />
					<ShadowCard label="shadow-neu-hover" className="shadow-neu-hover" />
					<ShadowCard
						label="shadow-neu-accent"
						className="shadow-neu-accent"
						bg="var(--color-neu-accent)"
					/>
					<ShadowCard
						label="shadow-neu-accent-hover"
						className="shadow-neu-accent-hover"
						bg="var(--color-neu-accent)"
					/>
				</div>
			</section>

			{/* ---- 2. Inset Shadows ---- */}
			<section>
				<SectionHeading>Inset Shadows (Wells)</SectionHeading>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
					<ShadowCard label="shadow-neu-inset" className="shadow-neu-inset" />
					<ShadowCard label="shadow-neu-inset-deep" className="shadow-neu-inset-deep" />
					<ShadowCard label="shadow-neu-inset-sm" className="shadow-neu-inset-sm" />
					<ShadowCard
						label="shadow-neu-accent-inset"
						className="shadow-neu-accent-inset"
						bg="var(--color-neu-accent)"
					/>
				</div>
			</section>

			{/* ---- 3. Color Swatches ---- */}
			<section>
				<SectionHeading>Color Tokens</SectionHeading>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Brand */}
					<div
						className="rounded-[var(--radius-neu)] shadow-neu p-6 space-y-4"
						style={{ background: "var(--color-neu-surface)" }}
					>
						<h3
							className="text-sm font-semibold uppercase tracking-wider"
							style={{
								fontFamily: "var(--font-display)",
								color: "var(--color-neu-text-muted)",
							}}
						>
							Brand
						</h3>
						<div className="space-y-4">
							{brandSwatches.map((s) => (
								<SwatchChip key={s.cssVar} swatch={s} />
							))}
						</div>
					</div>

					{/* Surfaces */}
					<div
						className="rounded-[var(--radius-neu)] shadow-neu p-6 space-y-4"
						style={{ background: "var(--color-neu-surface)" }}
					>
						<h3
							className="text-sm font-semibold uppercase tracking-wider"
							style={{
								fontFamily: "var(--font-display)",
								color: "var(--color-neu-text-muted)",
							}}
						>
							Surfaces
						</h3>
						<div className="space-y-4">
							{surfaceSwatches.map((s) => (
								<SwatchChip key={s.cssVar} swatch={s} />
							))}
						</div>
					</div>

					{/* Text */}
					<div
						className="rounded-[var(--radius-neu)] shadow-neu p-6 space-y-4"
						style={{ background: "var(--color-neu-surface)" }}
					>
						<h3
							className="text-sm font-semibold uppercase tracking-wider"
							style={{
								fontFamily: "var(--font-display)",
								color: "var(--color-neu-text-muted)",
							}}
						>
							Text
						</h3>
						<div className="space-y-4">
							{textSwatches.map((s) => (
								<SwatchChip key={s.cssVar} swatch={s} />
							))}
						</div>
					</div>

					{/* Shadows */}
					<div
						className="rounded-[var(--radius-neu)] shadow-neu p-6 space-y-4"
						style={{ background: "var(--color-neu-surface)" }}
					>
						<h3
							className="text-sm font-semibold uppercase tracking-wider"
							style={{
								fontFamily: "var(--font-display)",
								color: "var(--color-neu-text-muted)",
							}}
						>
							Shadows
						</h3>
						<div className="space-y-4">
							{shadowSwatches.map((s) => (
								<SwatchChip key={s.cssVar} swatch={s} />
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ---- 4. Typography ---- */}
			<section>
				<SectionHeading>Typography</SectionHeading>

				<div className="space-y-10">
					{/* Display font: Plus Jakarta Sans */}
					<div
						className="rounded-[var(--radius-neu)] shadow-neu p-6 space-y-6"
						style={{ background: "var(--color-neu-surface)" }}
					>
						<h3
							className="text-sm font-semibold uppercase tracking-wider"
							style={{
								fontFamily: "var(--font-body)",
								color: "var(--color-neu-text-muted)",
							}}
						>
							Display — Plus Jakarta Sans
						</h3>

						<FontSample
							fontFamily="var(--font-display)"
							fontLabel="Plus Jakarta Sans"
							weight={400}
							weightLabel="Regular"
						/>
						<FontSample
							fontFamily="var(--font-display)"
							fontLabel="Plus Jakarta Sans"
							weight={600}
							weightLabel="Semi-Bold"
						/>
						<FontSample
							fontFamily="var(--font-display)"
							fontLabel="Plus Jakarta Sans"
							weight={700}
							weightLabel="Bold"
						/>
					</div>

					{/* Body font: DM Sans */}
					<div
						className="rounded-[var(--radius-neu)] shadow-neu p-6 space-y-6"
						style={{ background: "var(--color-neu-surface)" }}
					>
						<h3
							className="text-sm font-semibold uppercase tracking-wider"
							style={{
								fontFamily: "var(--font-body)",
								color: "var(--color-neu-text-muted)",
							}}
						>
							Body — DM Sans
						</h3>

						<FontSample
							fontFamily="var(--font-body)"
							fontLabel="DM Sans"
							weight={400}
							weightLabel="Regular"
						/>
						<FontSample
							fontFamily="var(--font-body)"
							fontLabel="DM Sans"
							weight={500}
							weightLabel="Medium"
						/>
						<FontSample
							fontFamily="var(--font-body)"
							fontLabel="DM Sans"
							weight={700}
							weightLabel="Bold"
						/>
					</div>
				</div>
			</section>

			{/* ---- 5. Border Radius ---- */}
			<section>
				<SectionHeading>Border Radius Tokens</SectionHeading>
				<div className="flex flex-wrap gap-6 items-end">
					{([
						{ label: "sm (16px)", token: "var(--radius-neu-sm)", size: 64 },
						{ label: "default (24px)", token: "var(--radius-neu)", size: 80 },
						{ label: "lg (32px)", token: "var(--radius-neu-lg)", size: 96 },
						{ label: "xl (40px)", token: "var(--radius-neu-xl)", size: 112 },
						{
							label: "full (9999px)",
							token: "var(--radius-neu-full)",
							size: 112,
						},
					] as const).map(({ label, token, size }) => (
						<div key={label} className="flex flex-col items-center gap-2">
							<div
								className="shadow-neu-sm flex items-center justify-center"
								style={{
									width: size,
									height: size,
									borderRadius: token,
									background: "var(--color-neu-surface)",
								}}
							/>
							<span
								className="text-xs"
								style={{
									fontFamily: "var(--font-body)",
									color: "var(--color-neu-text-muted)",
								}}
							>
								{label}
							</span>
						</div>
					))}
				</div>
			</section>

			{/* ---- 6. Combined Demo ---- */}
			<section>
				<SectionHeading>Combined Demo</SectionHeading>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Raised "card" with inset button well */}
					<div
						className="rounded-[var(--radius-neu)] shadow-neu p-8 flex flex-col gap-6"
						style={{ background: "var(--color-neu-surface)" }}
					>
						<h3
							className="text-lg font-semibold"
							style={{
								fontFamily: "var(--font-display)",
								color: "var(--color-neu-text-primary)",
							}}
						>
							Raised Card
						</h3>
						<p
							className="text-sm"
							style={{
								fontFamily: "var(--font-body)",
								color: "var(--color-neu-text-secondary)",
							}}
						>
							This card uses <code>shadow-neu</code> for a raised neumorphic
							effect. Below is an inset well with pressed content.
						</p>
						<div
							className="rounded-[var(--radius-neu)] shadow-neu-inset p-4"
							style={{ background: "var(--color-neu-surface-lowered)" }}
						>
							<span
								className="text-sm"
								style={{
									fontFamily: "var(--font-body)",
									color: "var(--color-neu-text-muted)",
								}}
							>
								Inset well (shadow-neu-inset)
							</span>
						</div>
					</div>

					{/* Accent card */}
					<div
						className="rounded-[var(--radius-neu)] shadow-neu-accent p-8 flex flex-col gap-4"
						style={{ background: "var(--color-neu-accent)" }}
					>
						<h3
							className="text-lg font-semibold"
							style={{
								fontFamily: "var(--font-display)",
								color: "#ffffff",
							}}
						>
							Accent Card
						</h3>
						<p
							className="text-sm"
							style={{
								fontFamily: "var(--font-body)",
								color: "#ffffff",
								opacity: 0.85,
							}}
						>
							This card uses the accent color background with{" "}
							<code>shadow-neu-accent</code>. The shadow uses darker/lighter
							tints of the accent.
						</p>
						<div
							className="rounded-[var(--radius-neu)] shadow-neu-accent-inset p-4"
							style={{ background: "var(--color-neu-accent)" }}
						>
							<span
								className="text-sm"
								style={{
									fontFamily: "var(--font-body)",
									color: "#ffffff",
									opacity: 0.7,
								}}
							>
								Accent inset well (shadow-neu-accent-inset)
							</span>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
