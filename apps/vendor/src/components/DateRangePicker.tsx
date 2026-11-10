"use client";

import clsx from "clsx";
import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";

const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

interface Props {
	from: string;
	to: string;
	onApply: (range: { from?: string; to?: string }) => void;
	/** Heading inside the popover, e.g. "Date added". */
	title: string;
	triggerClassName: string;
	label?: string;
}

/** Figma "Select dates": a from/to pair (either end may be left open). Dates are ISO days (yyyy-mm-dd). */
export function DateRangePicker({ from, to, onApply, title, triggerClassName, label = "Select dates" }: Props) {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState({ from, to });
	const invalid = !!(draft.from && draft.to && draft.from > draft.to);
	const text = from || to ? `${from ? shortDate(from) : "…"} – ${to ? shortDate(to) : "…"}` : label;

	const onOpenChange = (next: boolean) => {
		if (next) setDraft({ from, to });
		setOpen(next);
	};
	const apply = (range: { from: string; to: string }) => {
		onApply({ from: range.from || undefined, to: range.to || undefined });
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<button type="button" className={clsx(triggerClassName, (from || to) && "border-primary-500 text-primary-500")}>
					<CalendarDays className="size-5" aria-hidden />
					{text}
				</button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-72 space-y-4">
				<div className="flex items-center justify-between">
					<p className="text-sm font-semibold text-ink">{title}</p>
					<button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded p-0.5 hover:bg-grey-500">
						<X className="size-4" />
					</button>
				</div>
				<div className="grid grid-cols-2 gap-3 text-xs text-grey-900">
					<label className="space-y-1">
						<span>From</span>
						<input
							type="date"
							value={draft.from}
							max={draft.to || undefined}
							onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
							className="h-9 w-full rounded-md border border-grey-600 px-2 text-sm text-ink"
						/>
					</label>
					<label className="space-y-1">
						<span>To</span>
						<input
							type="date"
							value={draft.to}
							min={draft.from || undefined}
							onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
							className="h-9 w-full rounded-md border border-grey-600 px-2 text-sm text-ink"
						/>
					</label>
				</div>
				{invalid && <p className="text-xs text-error-500">&quot;From&quot; must be on or before &quot;To&quot;.</p>}
				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={() => apply({ from: "", to: "" })}
						className="rounded-md px-3 py-1.5 text-sm font-medium text-grey-900 hover:bg-grey-500"
					>
						Clear
					</button>
					<button
						type="button"
						disabled={invalid}
						onClick={() => apply(draft)}
						className="rounded-md bg-primary-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:bg-primary-300"
					>
						Apply
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
