import Link from "next/link";
import { headers } from "next/headers";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./mobile-menu";
import { SignOutButton } from "./sign-out-button";
import { getLanguage, getTranslations } from "@/lib/i18n";
import { auth } from "@/lib/auth";

const Header = async () => {
  const lang = await getLanguage();
  const t = await getTranslations();
  const session = await auth.api.getSession({ headers: await headers() });
  const loggedIn = Boolean(session?.user);
  const pathname = (await headers()).get("x-pathname") || "";
  const isDashboard = pathname.startsWith("/dashboard");

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

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-3">
        <ThemeToggle />
        <LanguageSwitcher currentLanguage={lang} />
        {loggedIn ? (
          <>
            {!isDashboard && (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-[var(--radius-neu-full)] transition-all duration-200 hover:-translate-y-0.5 bg-[var(--color-neu-surface)] text-[var(--color-neu-text-primary)] shadow-neu-sm hover:shadow-neu"
              >
                {t.common.app}
              </Link>
            )}
            <SignOutButton
              label={t.common.signOut}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-[var(--radius-neu-full)] transition-all duration-200 hover:-translate-y-0.5 bg-[var(--color-neu-surface)] text-[var(--color-neu-text-primary)] shadow-neu-sm hover:shadow-neu"
            />
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-[var(--radius-neu-full)] transition-all duration-200 hover:-translate-y-0.5 bg-[var(--color-neu-surface)] text-[var(--color-neu-text-primary)] shadow-neu-sm hover:shadow-neu"
            >
              {t.common.signIn}
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-[var(--color-neu-accent)] text-white px-4 py-2 rounded-[var(--radius-neu-full)] shadow-neu-sm hover:shadow-neu transition-shadow"
            >
              {t.common.getStarted}
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <div className="flex md:hidden items-center gap-1">
        <MobileMenu
          loggedIn={loggedIn}
          isDashboard={isDashboard}
          signInLabel={t.common.signIn}
          signUpLabel={t.common.getStarted}
          signOutLabel={t.common.signOut}
          appLabel={t.common.app}
          currentLanguage={lang}
        />
      </div>
    </header>
  );
};

export default Header;
