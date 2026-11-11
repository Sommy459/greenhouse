import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./lib/utils";
import BtnLoader from "./btn-loader";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[25px] text-base font-bold transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 active:shadow-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
	{
		variants: {
			variant: {
				// The filled button keeps its colour when disabled, paler; the others fade (opacity-50 above).
				default: "bg-primary-500 text-white hover:bg-primary-500/90 disabled:bg-primary-300 disabled:opacity-100",
				destructive: "bg-error-500 text-white hover:bg-error-500/80 focus-visible:ring-destructive/20",
				outline: "border border-primary-500",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "bg-primary-50 hover:bg-primary-500 hover:text-white",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "w-full h-[43px] px-4 py-2 lg:h-[48px] has-[>svg]:px-3",
				sm: "h-[43px] rounded-[24px] gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-[60px] rounded-[30px] px-6 has-[>svg]:px-4",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	isLoading = false,
	asChild = false,
	disabled,
	children,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		isLoading?: boolean;
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	// `disabled` is pulled out of props so the spread can't overwrite it: a loading button must not take a second click
	// (a repeated order or payment submit). With asChild (a link) the child stays as it is; Slot needs exactly one child.
	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }), isLoading && "opacity-90 cursor-not-allowed")}
			{...props}
			disabled={asChild ? disabled : isLoading || disabled}
			aria-busy={isLoading || undefined}
		>
			{isLoading && !asChild ? (
				<span className="flex items-center gap-2">
					<BtnLoader />
					{/* <span className="opacity-80 animate-pulse">loading...</span> */}
				</span>
			) : (
				children
			)}
		</Comp>
	);
}

export { Button, buttonVariants };
