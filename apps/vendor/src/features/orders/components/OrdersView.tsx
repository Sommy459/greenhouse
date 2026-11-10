"use client";

import clsx from "clsx";
import { useState } from "react";
import Link from "next/link";
import { CircleGauge, Share } from "lucide-react";
import { Button } from "@repo/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { StatusFilter } from "@/components/StatusFilter";
import { OrderDetailsDialog } from "@/features/orders/components/OrderDetailsDialog";
import { OrdersTable, type OpenSection } from "@/features/orders/components/OrdersTable";
import { useExportOrders, useMyOrders } from "@/features/orders/hooks";
import { ORDER_STATUS_LABEL, TAB_LABEL } from "@/features/orders/options";
import { ORDER_STATUSES, ORDER_TABS, type OrderSort, type OrderTab } from "@/features/orders/types";
import { count } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 8;
const SECTIONS: OpenSection[] = ["details", "tracking", "update"];
const OUTLINE =
	"inline-flex h-12 items-center gap-2.5 rounded-lg border border-grey-600 bg-white px-4 text-base font-medium text-ink transition-colors hover:border-primary-500 hover:text-primary-500";

/**
 * Figma Vendor Hub "Orders": tabs (All, Shipped, Cancelled, Delivery Failed, Returned), search, dates, a status filter,
 * the order table and pages; Export, Track Orders, and Order Details as a dialog over the list (`?order=`).
 */
export function OrdersView() {
	const { get, list, page, set } = useUrlParams();
	const tab: OrderTab = (ORDER_TABS as readonly string[]).includes(get("tab")) ? (get("tab") as OrderTab) : "all";
	const search = get("search");
	const from = get("from");
	const to = get("to");
	const statuses = list("status", ORDER_STATUSES);
	const sort: OrderSort = get("sort") === "product_asc" || get("sort") === "product_desc" ? (get("sort") as OrderSort) : "newest";
	const section: OpenSection = SECTIONS.includes(get("section") as OpenSection) ? (get("section") as OpenSection) : "details";
	const [selected, setSelected] = useState<Set<string>>(new Set());
	// Opening or closing Order Details keeps the page the list is on.
	const keepPage = page > 1 ? String(page) : undefined;

	const filters = {
		tab: tab === "all" ? undefined : tab,
		search: search || undefined,
		from: from || undefined,
		to: to || undefined,
		status: statuses.join(",") || undefined,
	};
	const { data, isPending, isError, isFetching, refetch } = useMyOrders({
		...filters,
		sort: sort === "newest" ? undefined : sort,
		page,
		limit: PAGE_SIZE,
	});
	// The "All Orders" count: every order, whatever the tab, search or filter.
	const everyone = useMyOrders({ page: 1, limit: 1 });
	const exportOrders = useExportOrders();
	const orders = data?.items ?? [];
	const filtered = !!(search || from || to || statuses.length);
	const open = (id: string, s: OpenSection) => set({ order: id, section: s === "details" ? undefined : s, page: keepPage });

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<h1 className="animate-rise text-2xl font-medium text-ink lg:text-[28px]">Orders</h1>
				<div className="animate-rise flex flex-wrap gap-3 lg:gap-5" style={{ "--i": 1 } as React.CSSProperties}>
					<Button
						type="button"
						isLoading={exportOrders.isPending}
						onClick={() => exportOrders.mutate(selected.size > 0 ? { ids: [...selected].join(",") } : filters)}
						className="h-12 rounded-lg px-5"
						title={selected.size > 0 ? "Export the ticked orders" : "Export every order in this list"}
					>
						<Share className="size-5" aria-hidden />
						{selected.size > 0 ? `Export ${selected.size}` : "Export"}
					</Button>
					<Button asChild className="h-12 rounded-lg px-5">
						<Link href={consoleRoutes.TRACK_ORDERS}>
							<CircleGauge className="size-5" aria-hidden />
							Track Orders
						</Link>
					</Button>
				</div>
			</div>

			<div
				role="tablist"
				aria-label="Orders"
				className="animate-rise hide-scroll mt-8 flex overflow-x-auto border-b border-grey-600 lg:mt-12"
				style={{ "--i": 2 } as React.CSSProperties}
			>
				{ORDER_TABS.map((t) => (
					<button
						key={t}
						type="button"
						role="tab"
						aria-selected={tab === t}
						onClick={() => set({ tab: t === "all" ? undefined : t })}
						className={clsx(
							"-mb-px flex shrink-0 items-center gap-2 border-b-2 px-5 pb-4 text-base whitespace-nowrap transition-colors lg:px-6",
							tab === t ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
						)}
					>
						{TAB_LABEL[t]}
						{t === "all" && everyone.data && (
							<span className="rounded-full bg-primary-500 px-2 py-px text-xs font-medium text-white">
								{count(everyone.data.meta.total)}
							</span>
						)}
					</button>
				))}
			</div>

			<div
				className="animate-rise mt-8 flex flex-wrap items-center justify-between gap-3"
				style={{ "--i": 3 } as React.CSSProperties}
			>
				<SearchBox
					value={search}
					onChange={(value) => set({ search: value || undefined })}
					placeholder="search"
					label="Search orders by ID or product"
					className="w-full sm:w-[420px] lg:w-[470px]"
				/>
				<div className="flex gap-3">
					<DateRangePicker
						from={from}
						to={to}
						onApply={(range) => set(range)}
						title="Order date"
						label="Select dates"
						triggerClassName={OUTLINE}
					/>
					<StatusFilter
						id="order-status"
						options={ORDER_STATUSES}
						labels={ORDER_STATUS_LABEL}
						value={statuses}
						onChange={(next) => set({ status: next.join(",") || undefined })}
						triggerClassName={OUTLINE}
					/>
				</div>
			</div>

			<div className={clsx("mt-8 transition-opacity lg:mt-10", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load your orders.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && orders.length === 0 ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>
							{filtered ? "No orders match." : tab === "all" ? "No orders yet." : `No ${TAB_LABEL[tab].toLowerCase()} orders.`}
						</p>
						{filtered && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => set({ search: undefined, from: undefined, to: undefined, status: undefined })}
								className="mt-4"
							>
								Clear search and filters
							</Button>
						)}
					</div>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<OrdersTable
							orders={orders}
							loading={isPending}
							rows={PAGE_SIZE}
							selected={selected}
							onSelectedChange={setSelected}
							sort={sort}
							onSortChange={(next) => set({ sort: next === "newest" ? undefined : next })}
							onOpen={open}
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

			<OrderDetailsDialog
				orderId={get("order") || null}
				section={section}
				onClose={() => set({ order: undefined, section: undefined, page: keepPage })}
			/>
		</div>
	);
}
