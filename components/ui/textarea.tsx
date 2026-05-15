import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-2xl bg-background px-3 py-2 text-base shadow-inset transition-all duration-300 ease-out outline-none focus-visible:shadow-inset-deep focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0E5EC] dark:focus-visible:ring-offset-[#22252A] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"aria-invalid:ring-2 aria-invalid:ring-destructive/50",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
