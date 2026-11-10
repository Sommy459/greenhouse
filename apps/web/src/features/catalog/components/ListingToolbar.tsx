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
import {
	AVAILABILITY_OPTIONS,
	CATEGORY_OPTIONS,
	COLOR_OPTIONS,
	SORT_OPTIONS,
	type SortValue,
} from "@/features/catalog/listing-params";

const TRIGGER =
	"flex items-center gap-1 text-sm text-ink outline-none hover:text-primary-500 data-[state=open]:text-primary-500 [&[data-state=open]>svg]:rotate-180";

export interface FilterState {
	categories: string[];
	colors: string[];
	availability: string[];
}

interface Props {
	filters: FilterState;
	/** Shown on "Filter" when anything is ticked by the visitor. */
	filterCount: number;
	onCategoriesChange: (values: string[]) => void;
	onColorsChange: (values: string[]) => void;
	onAvailabilityChange: (values: string[]) => void;
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
 * Figma filter dropdown: Categories, Color and Availability, each opening its checkbox list (Figma "catalogue drop
 * down" for Categories). Ticks apply straight away; the menu stays open so several can be ticked.
 */
function FilterMenu({ filters, filterCount, onCategoriesChange, onColorsChange, onAvailabilityChange }: Props) {
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
				className="max-h-[70dvh] w-[210px] overflow-y-auto rounded-[7px] border-grey-600 bg-grey-500 px-3.5 py-1 shadow-lg"
			>
				<FilterSection
					title="Categories"
					options={CATEGORY_OPTIONS}
					selected={filters.categories}
					onChange={onCategoriesChange}
					defaultOpen
				/>
				<FilterSection title="Color" options={COLOR_OPTIONS} selected={filters.colors} onChange={onColorsChange} />
				<FilterSection
					title="Availability"
					options={AVAILABILITY_OPTIONS}
					selected={filters.availability}
					onChange={onAvailabilityChange}
					allLabel="All"
				/>
			</PopoverContent>
		</Popover>
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
