import Link from "next/link";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const Header = () => {
	return (
		<header className="h-14 bg-[var(--color-neu-bg)] border-b border-[var(--neu-shadow-dark)]/20 flex justify-between items-center fixed top-0 z-50 w-full px-4">
			<Link href="/">
				<div className="flex items-center gap-2">
					<Logo />
					<span className="select-none font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-neu-text-primary)]">
						génio
					</span>
				</div>
			</Link>

			<div className="flex items-center gap-3">
				<Link
					href="/login"
					className="text-sm font-medium text-[var(--color-neu-text-secondary)] hover:text-[var(--color-neu-text-primary)] transition-colors"
				>
					Sign In
				</Link>
				<Link
					href="/signup"
					className="text-sm font-semibold bg-[var(--color-neu-accent)] text-white px-4 py-2 rounded-[var(--radius-neu-full)] shadow-neu-sm hover:shadow-neu transition-shadow"
				>
					Get Started
				</Link>
				<ThemeToggle />
			</div>
		</header>
	);
};

export default Header;
