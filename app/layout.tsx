import "./globals.css";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata } from "next";
import { BackgroundRippleEffect } from "@/components/background-ripple-effect";
import Header from "@/components/header";
import Providers from "@/components/providers";
import { createMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

const jakarta = Plus_Jakarta_Sans({
	subsets: ["latin"],
	variable: "--font-display",
	display: "swap",
});

const dmSans = DM_Sans({
	subsets: ["latin"],
	variable: "--font-body",
	display: "swap",
	weight: ["400", "500", "700"],
});

export const metadata: Metadata = createMetadata({
	title: {
		template: "%s | Better Auth",
		default: "Better Auth",
	},
	description: "The most comprehensive authentication framework for TypeScript",
	metadataBase: new URL("https://demo.better-auth.com"),
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon/favicon.ico" sizes="any" />
			</head>
			<body className={`${jakarta.variable} ${dmSans.variable} font-sans`}>
				<Providers>
					<div className="min-h-[calc(100vh-3.5rem)] mt-14 w-full relative">
						{/* Site Header */}
						<Header />

						{/* Background Ripple Effect */}
						<div className="absolute inset-0 z-0">
							<BackgroundRippleEffect />
						</div>

						{/* Content */}
						<div className="relative z-10 max-w-4xl w-full p-6 mx-auto">
							{children}
						</div>
					</div>
				</Providers>
			</body>
		</html>
	);
}
