"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@repo/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { cn } from "@repo/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { CATEGORY_OPTIONS, SHOW_OPTIONS, SORT_OPTIONS } from "@/features/catalog/listing-params";
import type { SortValue } from "@/features/catalog/types";

const TRIGGER =
	"flex items-center gap-1 text-sm text-ink outline-none hover:text-primary-500 data-[state=open]:text-primary-500 [&[data-state=open]>svg]:rotate-180";

interface Props {
	/** The ticked category; null hides the section (a category page is already one category). */
	category: string | undefined | null;
	show: string[];
	minPrice: number | undefined;
	maxPrice: number | undefined;
	/** Shown on "Filter" when anything is ticked by the visitor. */
	filterCount: number;
	onCategoryChange: (value: string | undefined) => void;
	onShowChange: (values: string[]) => void;
	onPriceChange: (min: number | undefined, max: number | undefined) => void;
	sort: SortValue;
	onSortChange: (value: SortValue) => void;
}

/** Figma: "Filter ▾" on the left, "Sort by ▾" on the right (desktop); side by side on mobile. */
export function ListingToolbar(props: Props) {
	return (
		<div className="flex items-center gap-6 lg:justify-between">
			<FilterMenu {...props} />
			<SortMenu value={props.sort} onChange={props.onSortChange} />
		</div>
	);
}

/**
 * The Figma filter dropdown, with the filters the API supports: one category, Certified only / In stock, and a price
 * range in dollars. Ticks apply straight away; the menu stays open.
 */
function FilterMenu({ category, show, minPrice, maxPrice, filterCount, onCategoryChange, onShowChange, onPriceChange }: Props) {
	return (
		<Popover>
			<PopoverTrigger className={TRIGGER}>
				Filter
				{filterCount > 0 && (
					<span className="grid size-[18px] place-items-center rounded-full bg-primary-500 text-[10px] font-semibold text-white">
						{filterCount}
					</span>
				)}
				<ChevronDown className="size-4 transition-transform" aria-hidden />
			</PopoverTrigger>
			<PopoverContent
				align="start"
				sideOffset={10}
				className="max-h-[70dvh] w-[230px] overflow-y-auto rounded-[7px] border-grey-600 bg-grey-500 px-3.5 py-1 shadow-lg"
			>
				{category !== null && (
					<FilterSection
						title="Categories"
						options={CATEGORY_OPTIONS}
						selected={category ? [category] : []}
						// One at a time: ticking another replaces it.
						onChange={(values) => onCategoryChange(values.filter((v) => v !== category).at(-1))}
						defaultOpen
						allLabel="All"
					/>
				)}
				<FilterSection
					title="Show"
					options={SHOW_OPTIONS}
					selected={show}
					onChange={onShowChange}
					defaultOpen={category === null}
				/>
				<PriceSection key={`${minPrice}-${maxPrice}`} min={minPrice} max={maxPrice} onApply={onPriceChange} />
			</PopoverContent>
		</Popover>
	);
}

/** Price (USD): from and to, applied with the button or Enter. */
function PriceSection({
	min,
	max,
	onApply,
}: {
	min: number | undefined;
	max: number | undefined;
	onApply: (min: number | undefined, max: number | undefined) => void;
}) {
	const [from, setFrom] = useState(min != null ? String(min) : "");
	const [to, setTo] = useState(max != null ? String(max) : "");
	const value = (raw: string) =>
		raw.trim() === "" || !Number.isFinite(Number(raw)) ? undefined : Math.max(0, Math.floor(Number(raw)));
	const FIELD =
		"h-8 w-full rounded-[5px] border border-grey-600 bg-white px-2 text-sm text-ink outline-none focus-visible:border-primary-300";

	return (
		<form
			noValidate
			onSubmit={(e) => {
				e.preventDefault();
				const a = value(from);
				const b = value(to);
				onApply(a != null && b != null && a > b ? b : a, a != null && b != null && a > b ? a : b);
			}}
			className="border-b border-grey-600 py-2.5 last:border-b-0"
		>
			<p className="text-[15px] text-ink">Price (USD)</p>
			<div className="mt-2 flex items-center gap-2">
				<input
					aria-label="Lowest price, dollars"
					inputMode="numeric"
					placeholder="Min $"
					value={from}
					onChange={(e) => setFrom(e.target.value)}
					className={FIELD}
				/>
				<span className="text-grey-800">–</span>
				<input
					aria-label="Highest price, dollars"
					inputMode="numeric"
					placeholder="Max $"
					value={to}
					onChange={(e) => setTo(e.target.value)}
					className={FIELD}
				/>
			</div>
			<button
				type="submit"
				className="mt-2 h-8 w-full rounded-[5px] bg-primary-500 text-sm font-medium text-white hover:bg-primary-400"
			>
				Apply
			</button>
		</form>
	);
}

interface SectionProps {
	title: string;
	options: readonly { value: string; label: string; swatch?: string }[];
	selected: string[];
	onChange: (values: string[]) => void;
	defaultOpen?: boolean;
	/** Adds a first box (e.g. "All") that is ticked when nothing else is, and clears the others when ticked. */
	allLabel?: string;
}

const BOX = "size-4 rounded-[4px] shadow-none [&_svg]:size-3";
const PLAIN_BOX = "border-grey-600 bg-white data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-500";

/** One expandable row of the filter card: the title and chevron, then its checkboxes. */
function FilterSection({ title, options, selected, onChange, defaultOpen = false, allLabel }: SectionProps) {
	const [open, setOpen] = useState(defaultOpen);
	const id = `filter-${title.toLowerCase()}`;
	const toggle = (value: string, on: boolean) => onChange(on ? [...selected, value] : selected.filter((v) => v !== value));
	const ticked = selected.length;

	return (
		<section className="border-b border-grey-600 last:border-b-0">
			<button
				type="button"
				aria-expanded={open}
				aria-controls={id}
				onClick={() => setOpen((o) => !o)}
				className="flex h-[42px] w-full items-center justify-between text-[15px] text-ink outline-none hover:text-primary-500 focus-visible:text-primary-500"
			>
				<span>
					{title}
					{ticked > 0 && <span className="ml-1.5 text-xs text-primary-500">({ticked})</span>}
				</span>
				<ChevronDown className={cn("size-5 transition-transform", open && "rotate-180")} strokeWidth={1.5} aria-hidden />
			</button>

			{open && (
				<fieldset id={id} className="animate-rise pb-2">
					<legend className="sr-only">{title}</legend>
					<ul>
						{allLabel && (
							<li>
								<label className="flex h-[31px] cursor-pointer items-center gap-3 text-sm text-ink hover:text-primary-500">
									<Checkbox checked={ticked === 0} onCheckedChange={() => onChange([])} className={cn(BOX, PLAIN_BOX)} />
									{allLabel}
								</label>
							</li>
						)}
						{options.map(({ value, label, swatch }) => (
							<li key={value}>
								<label className="flex h-[31px] cursor-pointer items-center gap-3 text-sm text-ink hover:text-primary-500">
									<Checkbox
										checked={selected.includes(value)}
										onCheckedChange={(c) => toggle(value, c === true)}
										className={cn(
											BOX,
											swatch
												? // Colour: the filled square is the box; ticked adds a white tick and a ring.
													cn(
														"border-0 data-[state=checked]:text-white data-[state=checked]:ring-2 data-[state=checked]:ring-primary-300 data-[state=checked]:ring-offset-1",
														swatch,
													)
												: PLAIN_BOX,
										)}
									/>
									{label}
								</label>
							</li>
						))}
					</ul>
				</fieldset>
			)}
		</section>
	);
}

function SortMenu({ value, onChange }: { value: SortValue; onChange: (value: SortValue) => void }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className={TRIGGER}>
				Sort by <ChevronDown className="size-4 transition-transform" aria-hidden />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52 rounded-[7px] border-grey-600 bg-white">
				<DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as SortValue)}>
					{SORT_OPTIONS.map((o) => (
						<DropdownMenuRadioItem key={o.value} value={o.value} className="cursor-pointer text-sm focus:text-primary-500">
							{o.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
