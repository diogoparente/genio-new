import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 focus:ring-offset-[#E0E5EC] dark:focus:ring-offset-[#22252A]",
	{
		variants: {
			variant: {
				default:
					"bg-[#6C63FF] text-white shadow-[3px_3px_6px_rgba(0,0,0,0.12),-3px_-3px_6px_rgba(255,255,255,0.2)]",
				secondary:
					"bg-background text-foreground shadow-extruded-sm",
				destructive:
					"bg-destructive text-destructive-foreground shadow-[3px_3px_6px_rgba(0,0,0,0.12),-3px_-3px_6px_rgba(255,255,255,0.15)]",
				outline: "bg-background text-foreground shadow-extruded-sm",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
