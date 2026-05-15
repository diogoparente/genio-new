"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavbarLabels {
	generator?: string;
	ideas?: string;
	history?: string;
}

interface NavbarProps {
	labels?: NavbarLabels;
}

export default function Navbar({ labels }: NavbarProps) {
	const pathname = usePathname();

	const navLinks = [
		{ href: "/dashboard", label: labels?.generator ?? "Generator" },
		{ href: "/dashboard/ideas", label: labels?.ideas ?? "Ideas" },
		{ href: "/dashboard/generations", label: labels?.history ?? "History" },
	] as const;

	return (
		<nav className="sticky top-0 z-40 bg-[var(--color-neu-surface)] shadow-neu border-b border-[var(--neu-shadow-dark)]">
			<div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
				<Link
					href="/dashboard"
					className="text-xl font-bold text-[var(--color-neu-text-primary)] tracking-tight"
				>
					génio
				</Link>

				<div className="flex items-center gap-1">
					{navLinks.map((link) => {
						const isActive = pathname.startsWith(link.href);
						return (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									"px-4 py-2 rounded-[var(--radius-neu-sm)] text-sm font-medium transition-all",
									isActive
										? "text-[var(--color-neu-accent)] shadow-neu-inset-sm"
										: "text-[var(--color-neu-text-secondary)] hover:text-[var(--color-neu-text-primary)] hover:bg-[var(--color-neu-surface-lowered)]",
								)}
							>
								{link.label}
							</Link>
						);
					})}
				</div>
			</div>
		</nav>
	);
}
