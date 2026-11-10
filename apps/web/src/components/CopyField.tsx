"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

/** A labelled value (address, memo, link) with a copy button. */
export function CopyField({
	label,
	value,
	mono = true,
	className,
}: {
	label: string;
	value: string;
	mono?: boolean;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// Clipboard blocked: the value stays selectable.
		}
	};
	return (
		<div className={cn("min-w-0", className)}>
			<p className="text-xs text-grey-800">{label}</p>
			<div className="mt-1 flex items-center gap-2 rounded-md border border-grey-600 bg-white py-1.5 pr-1.5 pl-3">
				<span className={cn("min-w-0 flex-1 text-sm break-all text-ink select-all", mono && "font-mono")}>{value}</span>
				<button
					type="button"
					onClick={copy}
					aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
					className="grid size-8 shrink-0 place-items-center rounded-md text-grey-900 hover:bg-grey-500 hover:text-primary-500"
				>
					{copied ? <Check className="size-4 text-primary-500" /> : <Copy className="size-4" />}
				</button>
			</div>
		</div>
	);
}
