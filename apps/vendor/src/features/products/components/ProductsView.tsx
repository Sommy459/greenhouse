"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Box, EyeOff, Plus, RotateCcw, Share, ShoppingCart, Undo2, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { StatCard, StatCardsSkeleton } from "@/components/StatCard";
import { StatusFilter } from "@/components/StatusFilter";
import { ProductsTable } from "@/features/products/components/ProductsTable";
import { useExportProducts, useMyProducts, useProductStats, useSetProductsStatus } from "@/features/products/hooks";
import { STOCK_LABEL } from "@/features/products/options";
import { STOCK_STATES, type ProductSort } from "@/features/products/types";
import { count } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 6;
const SORTS: ProductSort[] = ["name_asc", "name_desc", "sku_asc", "sku_desc", "quantity_asc", "quantity_desc"];
const ACTION = "h-12 rounded-lg px-5";
const OUTLINE =
	"inline-flex h-12 items-center gap-2.5 rounded-lg border border-grey-600 bg-white px-4 text-base font-medium text-ink transition-colors hover:border-primary-500 hover:text-primary-500";

/** Figma Vendor Hub "Product": four totals, then All Products with search, dates, a status filter, sortable columns and pages. */
export function ProductsView() {
	const { get, list, page, set } = useUrlParams();
	const search = get("search");
	const from = get("from");
	const to = get("to");
	const states = list("state", STOCK_STATES);
	const sort = SORTS.includes(get("sort") as ProductSort) ? (get("sort") as ProductSort) : undefined;
	const [selected, setSelected] = useState<Set<string>>(new Set());

	const filters = {
		search: search || undefined,
		state: states.join(",") || undefined,
		from: from || undefined,
		to: to || undefined,
	};
	const stats = useProductStats();
	const { data, isPending, isError, isFetching, refetch } = useMyProducts({ ...filters, sort, page, limit: PAGE_SIZE });
	const exportProducts = useExportProducts();
	const setStatus = useSetProductsStatus();
	const products = data?.items ?? [];
	const filtered = !!(search || from || to || states.length);
	const picked = [...selected];

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Product" crumb="Manage Products">
				<div className="flex flex-wrap gap-3 lg:gap-5">
					<Button
						type="button"
						isLoading={exportProducts.isPending}
						onClick={() => exportProducts.mutate(picked.length ? { ids: picked.join(",") } : filters)}
						className={ACTION}
						title={picked.length ? "Export the ticked products" : "Export every product in this list"}
					>
						<Share className="size-5" aria-hidden />
						{picked.length ? `Export ${picked.length}` : "Export"}
					</Button>
					<Button asChild className={ACTION}>
						<Link href={consoleRoutes.NEW_PRODUCT}>
							<Plus className="size-5" aria-hidden />
							Add Product
						</Link>
					</Button>
				</div>
			</ListHeader>

			<div className="mt-8">
				{stats.isPending || !stats.data ? (
					stats.isError ? null : (
						<StatCardsSkeleton />
					)
				) : (
					<ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
						<StatCard
							index={1}
							label="Total Products"
							value={count(stats.data.total)}
							change={stats.data.total_change}
							icon={Box}
							tone="bg-info-50 text-info-500"
						/>
						<StatCard
							index={2}
							label="Sold Products"
							value={count(stats.data.sold)}
							change={stats.data.sold_change}
							icon={ShoppingCart}
							tone="bg-success-50 text-success-700"
						/>
						<StatCard
							index={3}
							label="Refunded Items"
							value={count(stats.data.refunded)}
							change={stats.data.refunded_change}
							icon={Undo2}
							tone="bg-lime-100 text-lime-800"
						/>
						<StatCard
							index={4}
							label="Cancelled"
							value={count(stats.data.cancelled)}
							change={stats.data.cancelled_change}
							icon={X}
							tone="bg-grey-600 text-primary-500"
						/>
					</ul>
				)}
			</div>

			<section aria-labelledby="all-products" className="animate-rise mt-8 lg:mt-10" style={{ "--i": 5 } as React.CSSProperties}>
				<div className="flex items-center gap-3">
					<h2 id="all-products" className="text-xl font-medium text-ink lg:text-[28px]">
						All Products
					</h2>
					{data && (
						<span className="rounded-md border border-primary-500 bg-primary-50 px-2.5 py-0.5 text-base text-ink">
							{count(data.meta.total)}
						</span>
					)}
				</div>

				<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
					<SearchBox
						value={search}
						onChange={(value) => set({ search: value || undefined })}
						placeholder="search"
						label="Search your products by name or SKU"
						className="w-full sm:w-[420px] lg:w-[470px]"
					/>
					<div className="flex gap-3">
						<DateRangePicker
							from={from}
							to={to}
							onApply={(range) => set(range)}
							title="Date added"
							label="Select dates"
							triggerClassName={OUTLINE}
						/>
						<StatusFilter
							id="product-state"
							options={STOCK_STATES}
							labels={STOCK_LABEL}
							value={states}
							onChange={(next) => set({ state: next.join(",") || undefined })}
							triggerClassName={OUTLINE}
						/>
					</div>
				</div>

				{picked.length > 0 && (
					<div
						role="region"
						aria-label="Ticked products"
						className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-primary-50 px-4 py-3 text-sm text-ink"
					>
						<span className="font-medium">{picked.length} ticked</span>
						<Button
							type="button"
							size="sm"
							variant="outline"
							disabled={setStatus.isPending}
							onClick={() => setStatus.mutate({ ids: picked, status: "inactive" }, { onSuccess: () => setSelected(new Set()) })}
							className="bg-white"
						>
							<EyeOff className="size-4" aria-hidden /> Hide from store
						</Button>
						<Button
							type="button"
							size="sm"
							variant="outline"
							disabled={setStatus.isPending}
							onClick={() => setStatus.mutate({ ids: picked, status: "active" }, { onSuccess: () => setSelected(new Set()) })}
							className="bg-white"
						>
							<RotateCcw className="size-4" aria-hidden /> Show in store
						</Button>
						<button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-primary-500 hover:underline">
							Clear
						</button>
					</div>
				)}

				<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
					{isError ? (
						<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
							<p>Couldn&apos;t load your products.</p>
							<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
								Try again
							</Button>
						</div>
					) : !isPending && products.length === 0 ? (
						<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
							<p>{filtered ? "No products match." : "You haven't listed anything yet."}</p>
							{filtered ? (
								<Button
									variant="outline"
									size="sm"
									onClick={() => set({ search: undefined, from: undefined, to: undefined, state: undefined })}
									className="mt-4"
								>
									Clear search and filters
								</Button>
							) : (
								<Button asChild size="sm" className="mt-4">
									<Link href={consoleRoutes.NEW_PRODUCT}>Add your first product</Link>
								</Button>
							)}
						</div>
					) : (
						<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
							<ProductsTable
								products={products}
								loading={isPending}
								rows={PAGE_SIZE}
								selected={selected}
								onSelectedChange={setSelected}
								sort={sort}
								onSortChange={(next) => set({ sort: next })}
							/>
							{data && (
								<div className="border-t border-grey-600">
									<Pagination
										page={data.meta.page}
										totalPages={data.meta.total_pages}
										onChange={(n) => set({ page: n > 1 ? String(n) : undefined })}
									/>
								</div>
							)}
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
