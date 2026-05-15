import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import type { auth } from "./auth";

export const authClient = createAuthClient({
	plugins: [],
	fetchOptions: {
		onError(e) {
			if (e.error.status === 429) {
				toast.error("Too many requests. Please try again later.");
			}
		},
	},
});

export type { auth };
