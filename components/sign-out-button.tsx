"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface SignOutButtonProps {
    label: string;
    className?: string;
}

export function SignOutButton({ label, className }: SignOutButtonProps) {
    const router = useRouter();

    async function handleSignOut() {
        await authClient.signOut();
        router.refresh();
    }

    return (
        <button
            type="button"
            onClick={handleSignOut}
            className={className}
        >
            {label}
        </button>
    );
}
