"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";

/** A password field with the eye toggle from the Figma screens. Pass react-hook-form's `field` props through. */
export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
	const [visible, setVisible] = useState(false);
	const Icon = visible ? EyeOff : Eye;

	return (
		<div className="relative">
			<Input type={visible ? "text" : "password"} className={cn("pr-14", className)} {...props} />
			<button
				type="button"
				onClick={() => setVisible((v) => !v)}
				aria-label={visible ? "Hide password" : "Show password"}
				aria-pressed={visible}
				className="absolute top-1/2 right-4 -translate-y-1/2 text-grey-800 hover:text-ink"
			>
				<Icon className="size-5" strokeWidth={1.5} />
			</button>
		</div>
	);
}
