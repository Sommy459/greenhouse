"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SortValue } from "@/features/catalog/types";
import { CATEGORY_LINKS } from "@/lib/navigation";
import { shopRoutes } from "@/lib/routes";

/** Products per page on category, collection, search and store pages: 25 fills the Figma grid's 7 rows. */
export const PAGE_SIZE = 25;

export const SORT_OPTIONS: { value: SortValue; label: string }[] = [
	{ value: "newest", label: "Newest" },
	{ value: "relevance", label: "Best match" },
	{ value: "price_asc", label: "Price: low to high" },
	{ value: "price_desc", label: "Price: high to low" },
];

/** Filter ▾ → Categories: the API filters by one category at a time. */
export const CATEGORY_OPTIONS = CATEGORY_LINKS.map((c) => ({
	value: c.href.replace(shopRoutes.CATEGORY(""), ""),
	label: c.label,
}));

/** Filter ▾ → Show. */
export const SHOW_OPTIONS = [
	{ value: "certified", label: "Certified only" },
	{ value: "in_stock", label: "In stock" },
] as const;

/** A whole-dollar amount from the URL, or undefined. */
const dollarsParam = (raw: string | null) => {
	const n = Number(raw);
	return raw && Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
};

/**
 * Sort, the Filter menu's choices and the page live in the URL (?sort=price_asc&category=clothing&certified=1&min=5
 * &max=40&page=2), so a filtered page can be shared, bookmarked and reached with Back. Prices are whole dollars.
 */
export function useListingParams({ defaultSort = "newest" }: { defaultSort?: SortValue } = {}) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();

	const sortParam = params.get("sort");
	const sort: SortValue = SORT_OPTIONS.some((o) => o.value === sortParam) ? (sortParam as SortValue) : defaultSort;
	const pageParam = Number(params.get("page"));
	const page = Number.isFinite(pageParam) && pageParam >= 1 ? Math.floor(pageParam) : 1;
	const categoryParam = params.get("category");
	const category = CATEGORY_OPTIONS.some((o) => o.value === categoryParam) ? categoryParam! : undefined;
	const certified = params.get("certified") === "1";
	const inStock = params.get("in_stock") === "1";
	const minPrice = dollarsParam(params.get("min"));
	const maxPrice = dollarsParam(params.get("max"));

	/** Writes the given keys (empty removes one). Anything but a page change goes back to page 1. */
	const update = (changes: Record<string, string | undefined>, { scroll = false, replace = false } = {}) => {
		const next = new URLSearchParams(params.toString());
		for (const [key, value] of Object.entries(changes)) {
			if (!value) next.delete(key);
			else next.set(key, value);
		}
		if (!("page" in changes)) next.delete("page");
		if (next.get("page") === "1") next.delete("page");
		if (next.get("sort") === defaultSort) next.delete("sort");
		const qs = next.toString();
		const href = qs ? `${pathname}?${qs}` : pathname;
		if (replace) router.replace(href, { scroll });
		else router.push(href, { scroll });
	};

	return {
		sort,
		page,
		category,
		certified,
		inStock,
		minPrice,
		maxPrice,
		/** Ticked by the visitor (a category page's own category doesn't count). */
		filterCount: (category ? 1 : 0) + (certified ? 1 : 0) + (inStock ? 1 : 0) + (minPrice != null || maxPrice != null ? 1 : 0),
		setSort: (value: SortValue) => update({ sort: value }),
		setCategory: (value: string | undefined) => update({ category: value }, { replace: true }),
		setShow: (values: string[]) =>
			update(
				{ certified: values.includes("certified") ? "1" : undefined, in_stock: values.includes("in_stock") ? "1" : undefined },
				{ replace: true },
			),
		setPrice: (min: number | undefined, max: number | undefined) =>
			update({ min: min != null ? String(min) : undefined, max: max != null ? String(max) : undefined }, { replace: true }),
		clearFilters: () =>
			update({ category: undefined, certified: undefined, in_stock: undefined, min: undefined, max: undefined }),
		setPage: (value: number) => update({ page: String(value) }, { scroll: true }),
	};
}
