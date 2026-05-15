import Link from "next/link";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const Header = () => {
	return (
		<header className="h-14 bg-background shadow-extruded flex justify-between items-center fixed top-0 z-50 w-full px-4">
			<Link href="/">
				<div className="flex items-center gap-2">
					<Logo />
					<p className="select-none font-display font-bold">BETTER-AUTH.</p>
				</div>
			</Link>

			<ThemeToggle />
		</header>
	);
};

export default Header;
