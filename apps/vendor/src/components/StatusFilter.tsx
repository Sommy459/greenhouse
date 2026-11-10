"use client";

import clsx from "clsx";
import { ListFilter, SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@repo/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";

interface Props<T extends string> {
	/** Ids are prefixed with this, e.g. "customer-status". */
	id: string;
	options: readonly T[];
	labels: Record<T, string>;
	value: T[];
	onChange: (value: T[]) => void;
	/** The popover heading. */
	legend?: string;
	/** "list" = page lists ("Filter"); "sliders" = card headers ("Filters"). */
	variant?: "list" | "sliders";
	/** Replaces the trigger's default look (card headers use their outline button). */
	triggerClassName?: string;
}

/** Figma "Filter": tick values (account statuses, categories). Ticks apply straight away; none ticked means all. */
export function StatusFilter<T extends string>({
	id,
	options,
	labels,
	value,
	onChange,
	legend = "Status",
	variant = "list",
	triggerClassName,
}: Props<T>) {
	const Icon = variant === "sliders" ? SlidersHorizontal : ListFilter;
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={clsx(
						triggerClassName ??
							"inline-flex h-10 shrink-0 items-center gap-2.5 rounded-lg border bg-white px-4 text-base font-medium transition-colors hover:border-primary-500 hover:text-primary-500 lg:h-12",
						value.length ? "border-primary-500 text-primary-500" : "border-grey-600 text-ink",
					)}
				>
					<Icon className="size-5" aria-hidden />
					{variant === "sliders" ? "Filters" : "Filter"}
					{value.length > 0 && (
						<span className="grid size-5 place-items-center rounded-full bg-primary-500 text-xs text-white">{value.length}</span>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-56">
				<fieldset>
					<legend className="mb-3 text-xs font-semibold text-grey-900 uppercase">{legend}</legend>
					<div className="space-y-2.5">
						{options.map((s) => (
							<div key={s} className="flex items-center gap-2">
								<Checkbox
									id={`${id}-${s}`}
									checked={value.includes(s)}
									onCheckedChange={() => onChange(value.includes(s) ? value.filter((v) => v !== s) : [...value, s])}
								/>
								<label htmlFor={`${id}-${s}`} className="cursor-pointer text-sm text-ink">
									{labels[s]}
								</label>
							</div>
						))}
					</div>
				</fieldset>
				{value.length > 0 && (
					<button
						type="button"
						onClick={() => onChange([])}
						className="mt-4 text-sm font-medium text-primary-500 hover:underline"
					>
						Clear filter
					</button>
				)}
			</PopoverContent>
		</Popover>
	);
}
