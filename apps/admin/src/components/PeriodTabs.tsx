"use client";

import clsx from "clsx";

interface Props<T extends string> {
	label: string;
	options: readonly T[];
	labels: Record<T, string>;
	value: T;
	onChange: (value: T) => void;
}

/** Figma chart-card tabs ("Daily · Week · Month"): plain text, the chosen one in green. */
export function PeriodTabs<T extends string>({ label, options, labels, value, onChange }: Props<T>) {
	return (
		<div role="tablist" aria-label={label} className="flex gap-1">
			{options.map((p) => (
				<button
					key={p}
					type="button"
					role="tab"
					aria-selected={value === p}
					onClick={() => onChange(p)}
					className={clsx(
						"rounded-md px-3 py-1.5 text-base transition-colors",
						value === p ? "font-medium text-primary-500" : "text-ink hover:text-primary-500",
					)}
				>
					{labels[p]}
				</button>
			))}
		</div>
	);
}
