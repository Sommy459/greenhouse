"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Availability, ProductQuery } from "@/features/catalog/types";
import { CATEGORY_LINKS } from "@/lib/navigation";
import { shopRoutes } from "@/lib/routes";

/** Products per page on category and collection pages: 25 fills the Figma grid's 7 rows (3 of them are wide tiles). */
export const PAGE_SIZE = 25;

export type SortValue = NonNullable<ProductQuery["sort"]>;

export const SORT_OPTIONS: { value: SortValue; label: string }[] = [
	{ value: "newest", label: "Newest" },
	{ value: "price_asc", label: "Price: low to high" },
	{ value: "price_desc", label: "Price: high to low" },
	{ value: "rating", label: "Top rated" },
];

/** Filter ▾ → Categories: every category, in menu order. */
export const CATEGORY_OPTIONS = CATEGORY_LINKS.map((c) => ({
	value: c.href.replace(shopRoutes.CATEGORY(""), ""),
	label: c.label,
}));

/**
 * Filter ▾ → Color (Figma color dropdown): the coloured square is the tick box. `swatch` holds the full classes (fill,
 * also when ticked) so Tailwind sees them.
 */
export const COLOR_OPTIONS = [
	{ value: "red", label: "Red", swatch: "bg-swatch-red data-[state=checked]:bg-swatch-red" },
	{ value: "black", label: "Black", swatch: "bg-swatch-black data-[state=checked]:bg-swatch-black" },
	{ value: "brown", label: "Brown", swatch: "bg-swatch-brown data-[state=checked]:bg-swatch-brown" },
	{ value: "green", label: "Green", swatch: "bg-swatch-green data-[state=checked]:bg-swatch-green" },
];

/** Filter ▾ → Availability (Figma): "All" (none ticked), Popular, Sale. */
export const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
	{ value: "popular", label: "Popular" },
	{ value: "sale", label: "Sale" },
];

const listParam = (raw: string | null, allowed: readonly { value: string }[]) =>
	(raw ?? "").split(",").filter((v) => allowed.some((o) => o.value === v));

/**
 * Sort, the Filter menu's choices and the page live in the URL
 * (?sort=price_asc&categories=clothing,kitchen&colors=green&availability=in_stock&page=2), so a filtered page can be
 * shared, bookmarked and reached with Back.
 */
export function useListingParams() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();

	const sortParam = params.get("sort");
	const sort: SortValue = SORT_OPTIONS.some((o) => o.value === sortParam) ? (sortParam as SortValue) : "newest";
	const pageParam = Number(params.get("page"));
	const page = Number.isFinite(pageParam) && pageParam >= 1 ? Math.floor(pageParam) : 1;
	/** Ticked in the Filter menu. Empty categories means the page's own default. */
	const categories = listParam(params.get("categories"), CATEGORY_OPTIONS);
	const colors = listParam(params.get("colors"), COLOR_OPTIONS);
	const availability = listParam(params.get("availability"), AVAILABILITY_OPTIONS) as Availability[];

	/** Writes the given keys (empty removes one). Anything but a page change goes back to page 1. */
	const update = (changes: Record<string, string | undefined>, { scroll = false, replace = false } = {}) => {
		const next = new URLSearchParams(params.toString());
		for (const [key, value] of Object.entries(changes)) {
			if (!value) next.delete(key);
			else next.set(key, value);
		}
		if (!("page" in changes)) next.delete("page");
		if (next.get("page") === "1") next.delete("page");
		if (next.get("sort") === "newest") next.delete("sort");
		const qs = next.toString();
		const href = qs ? `${pathname}?${qs}` : pathname;
		if (replace) router.replace(href, { scroll });
		else router.push(href, { scroll });
	};

	/** Keeps the options' order, so the same choices always give the same URL. Ticks replace the history entry. */
	const setList = (key: string, options: readonly { value: string }[], values: string[]) =>
		update(
			{
				[key]:
					options
						.filter((o) => values.includes(o.value))
						.map((o) => o.value)
						.join(",") || undefined,
			},
			{ replace: true },
		);

	return {
		sort,
		page,
		categories,
		colors,
		availability,
		setSort: (value: SortValue) => update({ sort: value }),
		setCategories: (values: string[]) => setList("categories", CATEGORY_OPTIONS, values),
		setColors: (values: string[]) => setList("colors", COLOR_OPTIONS, values),
		setAvailability: (values: string[]) => setList("availability", AVAILABILITY_OPTIONS, values),
		clearFilters: () => update({ categories: undefined, colors: undefined, availability: undefined }),
		setPage: (value: number) => update({ page: String(value) }, { scroll: true }),
	};
}
