"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface MobileMenuProps {
    signInLabel: string;
    getStartedLabel: string;
    currentLanguage: string;
}

export function MobileMenu({
    signInLabel,
    getStartedLabel,
    currentLanguage,
}: MobileMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <SheetPrimitive.Root open={open} onOpenChange={setOpen}>
            <SheetPrimitive.Trigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-[var(--radius-neu-sm)] p-2 text-[var(--color-neu-text-secondary)] hover:text-[var(--color-neu-text-primary)] hover:bg-[var(--color-neu-surface)] transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </SheetPrimitive.Trigger>
            <SheetPrimitive.Portal>
                <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <SheetPrimitive.Content className="fixed inset-y-0 right-0 z-50 w-[280px] bg-[var(--color-neu-bg)] border-l border-[var(--neu-shadow-dark)]/20 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
                    <SheetPrimitive.Close className="absolute right-3 top-3 rounded-[var(--radius-neu-sm)] p-1.5 text-[var(--color-neu-text-secondary)] hover:text-[var(--color-neu-text-primary)] hover:bg-[var(--color-neu-surface)] transition-colors">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </SheetPrimitive.Close>

                    <div className="flex flex-col h-full pt-12">
                        {/* Nav links */}
                        <nav className="flex flex-col gap-1 px-3 py-4">
                            <Link
                                href="/login"
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-[var(--radius-neu-full)] transition-all duration-200 hover:-translate-y-0.5 bg-[var(--color-neu-surface)] text-[var(--color-neu-text-primary)] shadow-neu-sm hover:shadow-neu"
                            >
                                {signInLabel}
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-[var(--radius-neu-full)] transition-all duration-200 hover:-translate-y-0.5 bg-[var(--color-neu-accent)] text-white shadow-neu-sm hover:shadow-neu"
                            >
                                {getStartedLabel}
                            </Link>
                        </nav>

                        <div className="mt-auto border-t border-[var(--neu-shadow-dark)]/20 px-6 py-4 flex items-center justify-between">
                            <LanguageSwitcher currentLanguage={currentLanguage} />
                            <ThemeToggle />
                        </div>
                    </div>
                </SheetPrimitive.Content>
            </SheetPrimitive.Portal>
        </SheetPrimitive.Root>
    );
}
