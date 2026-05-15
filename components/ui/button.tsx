import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0E5EC] dark:focus-visible:ring-offset-[#22252A] disabled:pointer-events-none disabled:opacity-50 active:translate-y-[0.5px]",
	{
		variants: {
			variant: {
				default:
					"bg-[#6C63FF] text-white shadow-[5px_5px_10px_rgba(0,0,0,0.15),-5px_-5px_10px_rgba(255,255,255,0.25)] hover:-translate-y-[1px] hover:shadow-[8px_8px_14px_rgba(0,0,0,0.2),-8px_-8px_14px_rgba(255,255,255,0.3)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.2)]",
				destructive:
					"bg-destructive text-destructive-foreground shadow-[5px_5px_10px_rgba(0,0,0,0.15),-5px_-5px_10px_rgba(255,255,255,0.2)] hover:-translate-y-[1px] hover:shadow-[8px_8px_14px_rgba(0,0,0,0.2),-8px_-8px_14px_rgba(255,255,255,0.25)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.15)]",
				outline:
					"bg-background text-foreground shadow-extruded hover:-translate-y-[1px] hover:shadow-extruded-lg active:shadow-inset-sm",
				secondary:
					"bg-background text-foreground shadow-extruded-sm hover:-translate-y-[1px] hover:shadow-extruded active:shadow-inset-sm",
				ghost:
					"hover:bg-transparent hover:text-foreground hover:shadow-extruded-sm active:shadow-inset-sm",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 px-3 text-xs rounded-xl",
				lg: "h-10 px-8 rounded-2xl",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = ({
	className,
	variant,
	size,
	asChild = false,
	...props
}: ButtonProps) => {
	const Comp = asChild ? Slot : "button";
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
};
Button.displayName = "Button";

export { Button, buttonVariants };
