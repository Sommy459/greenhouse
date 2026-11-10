"use client";

import Link from "next/link";
import { ListFilter, Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { AdminProductCard, AdminProductCardSkeleton } from "@/features/products/components/AdminProductCard";
import { NewCategoryDialog } from "@/features/products/components/NewCategoryDialog";
import { useAdminProducts } from "@/features/products/hooks";
import { PRODUCT_VISIBILITIES, type ProductSort, type ProductVisibility } from "@/features/products/types";
import { StatusFilter } from "@/components/StatusFilter";
import { consoleRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 9;
const SORTS: { value: ProductSort; label: string }[] = [
	{ value: "newest", label: "Newest" },
	{ value: "best_selling", label: "Best selling" },
	{ value: "price_low", label: "Price: low to high" },
	{ value: "price_high", label: "Price: high to low" },
];
const VISIBILITY_LABEL: Record<ProductVisibility, string> = { visible: "Visible in store", hidden: "Hidden" };
const ACTION =
	"inline-flex h-10 items-center gap-2 rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lg active:translate-y-0 active:scale-95 motion-reduce:hover:translate-y-0 lg:h-12 lg:text-base";
const OUTLINE =
	"inline-flex h-10 items-center gap-2 rounded-lg border border-grey-600 bg-white px-3 text-sm font-semibold text-ink transition-colors hover:border-primary-500 lg:h-12";

/** Search, sort, dates and page live in the URL, so a refresh or a shared link shows the same list. */
function useProductParams() {
	const { get, list, page, set } = useUrlParams();
	const sort = SORTS.some((s) => s.value === get("sort")) ? (get("sort") as ProductSort) : "newest";
	const visibility = list("visibility", PRODUCT_VISIBILITIES);
	return { search: get("search"), sort, page, from: get("from"), to: get("to"), visibility, set };
}

/** Figma admin "Product": every product on the platform as cards, with search, dates, visibility, sort and pages. */
export function ProductsView() {
	const { search, sort, page, from, to, visibility, set } = useProductParams();
	const { data, isPending, isError, isFetching, refetch } = useAdminProducts({
		search: search || undefined,
		sort,
		page,
		limit: PAGE_SIZE,
		from: from || undefined,
		to: to || undefined,
		visibility: visibility.join(",") || undefined,
	});
	const products = data?.items ?? [];
	const total = data?.meta.total ?? 0;
	const filtered = !!(search || from || to || visibility.length);

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="animate-rise">
					<h1 className="text-2xl font-medium text-ink lg:text-[28px]">Product</h1>
					<p className="mt-1 text-sm text-ink" aria-live="polite">
						{filtered ? `Showing ${total} matching product${total === 1 ? "" : "s"}` : "Showing All Products"}
					</p>
				</div>
				<div className="animate-rise flex flex-wrap gap-3 lg:gap-4" style={{ "--i": 1 } as React.CSSProperties}>
					<NewCategoryDialog triggerClassName={ACTION} />
					<Link href={consoleRoutes.NEW_PRODUCT} className={ACTION}>
						<Plus className="size-5" aria-hidden /> Add Product
					</Link>
				</div>
			</div>

			<div
				className="animate-rise mt-5 flex flex-wrap items-center justify-between gap-3"
				style={{ "--i": 2 } as React.CSSProperties}
			>
				<SearchBox
					value={search}
					onChange={(value) => set({ search: value || undefined })}
					placeholder="search category"
					label="Search products or categories"
					className="max-w-[340px]"
				/>
				<div className="flex gap-2">
					<DateRangePicker
						from={from}
						to={to}
						onApply={(range) => set(range)}
						title="Date added"
						triggerClassName={`${OUTLINE} px-4`}
					/>
					<StatusFilter
						id="product-visibility"
						options={PRODUCT_VISIBILITIES}
						labels={VISIBILITY_LABEL}
						value={visibility}
						onChange={(next) => set({ visibility: next.join(",") || undefined })}
						legend="Visibility"
						variant="sliders"
						triggerClassName={`${OUTLINE} px-4`}
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button type="button" aria-label="Sort products" className={OUTLINE}>
								<ListFilter className="size-5" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52">
							<DropdownMenuLabel>Sort by</DropdownMenuLabel>
							<DropdownMenuRadioGroup
								value={sort}
								onValueChange={(value) => set({ sort: value === "newest" ? undefined : value })}
							>
								{SORTS.map((s) => (
									<DropdownMenuRadioItem key={s.value} value={s.value}>
										{s.label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="mt-6">
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load products.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && products.length === 0 ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>{filtered ? "No products match." : "No products yet."}</p>
						{filtered && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => set({ search: undefined, from: undefined, to: undefined, visibility: undefined })}
								className="mt-4"
							>
								Clear search and filters
							</Button>
						)}
					</div>
				) : (
					<ul
						className={`grid gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3 xl:gap-5 ${isFetching && !isPending ? "opacity-60" : ""}`}
					>
						{isPending
							? Array.from({ length: PAGE_SIZE }, (_, i) => (
									<li key={i}>
										<AdminProductCardSkeleton />
									</li>
								))
							: products.map((product, i) => (
									<li key={product.id} className="animate-rise" style={{ "--i": i % 3 } as React.CSSProperties}>
										<AdminProductCard product={product} />
									</li>
								))}
					</ul>
				)}
			</div>

			{data && data.meta.total_pages > 1 && (
				<div className="mt-6">
					<Pagination
						page={data.meta.page}
						totalPages={data.meta.total_pages}
						onChange={(n) => set({ page: n > 1 ? String(n) : undefined })}
					/>
				</div>
			)}
		</div>
	);
}
