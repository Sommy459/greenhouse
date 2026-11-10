"use client";

import clsx from "clsx";
import { useState } from "react";
import { Share } from "lucide-react";
import { Button } from "@repo/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Pagination } from "@/components/Pagination";
import { ListHeader } from "@/components/ListHeader";
import { OrderDetailsDialog } from "@/features/orders/components/OrderDetailsDialog";
import { OrderFilters } from "@/features/orders/components/OrderFilters";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { useAdminOrders, useExportOrders } from "@/features/orders/hooks";
import { PERIOD_LABEL } from "@/features/orders/options";
import { ORDER_PERIODS, ORDER_STATUSES, PAYMENT_METHODS, type OrderPeriod, type OrderSort } from "@/features/orders/types";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 8;
const OUTLINE =
	"inline-flex h-12 items-center gap-2.5 rounded-lg border border-grey-600 bg-white px-4 text-base font-medium text-grey-900 transition-colors hover:border-primary-500 hover:text-primary-500";

/** Figma admin "Orders": period tabs, dates and filters, the order table, pages; Export downloads a CSV. */
export function OrdersView() {
	const { get, list, page, set } = useUrlParams();
	const period = (ORDER_PERIODS as readonly string[]).includes(get("period")) ? (get("period") as OrderPeriod) : "all";
	const from = get("from");
	const to = get("to");
	const statuses = list("status", ORDER_STATUSES);
	const payments = list("payment", PAYMENT_METHODS);
	const sort: OrderSort = get("sort") === "product_asc" || get("sort") === "product_desc" ? (get("sort") as OrderSort) : "newest";
	// Typed dates replace the quick range.
	const activePeriod = from || to ? undefined : period;
	const [selected, setSelected] = useState<Set<string>>(new Set());
	// Opening or closing Order Details keeps the page the list is on.
	const keepPage = page > 1 ? String(page) : undefined;

	const filters = {
		period: activePeriod === "all" ? undefined : activePeriod,
		from: from || undefined,
		to: to || undefined,
		status: statuses.join(",") || undefined,
		payment: payments.join(",") || undefined,
		sort: sort === "newest" ? undefined : sort,
	};
	const { data, isPending, isError, isFetching, refetch } = useAdminOrders({ ...filters, page, limit: PAGE_SIZE });
	const exportOrders = useExportOrders();
	const orders = data?.items ?? [];
	const filtered = !!(filters.period || from || to || statuses.length || payments.length);

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Orders" crumb="Order List">
				<Button
					type="button"
					size="sm"
					isLoading={exportOrders.isPending}
					onClick={() => exportOrders.mutate(selected.size > 0 ? { ids: [...selected].join(",") } : filters)}
					className="h-12 rounded-lg px-5"
					title={selected.size > 0 ? "Export the ticked orders" : "Export every order matching the filters"}
				>
					<Share className="size-5" aria-hidden />
					{selected.size > 0 ? `Export ${selected.size}` : "Export"}
				</Button>
			</ListHeader>

			<div
				className="animate-rise mt-8 flex flex-wrap items-center justify-between gap-3 lg:mt-14"
				style={{ "--i": 2 } as React.CSSProperties}
			>
				<div
					role="group"
					aria-label="Period"
					className="hide-scroll flex max-w-full overflow-x-auto rounded-lg border border-grey-600 bg-white p-1"
				>
					{ORDER_PERIODS.map((p) => (
						<button
							key={p}
							type="button"
							aria-pressed={activePeriod === p}
							onClick={() => set({ period: p === "all" ? undefined : p, from: undefined, to: undefined })}
							className={clsx(
								"h-10 shrink-0 rounded-md px-4 text-base whitespace-nowrap transition-colors",
								activePeriod === p ? "bg-primary-100/70 font-medium text-primary-500" : "text-grey-900 hover:text-ink",
							)}
						>
							{PERIOD_LABEL[p]}
						</button>
					))}
				</div>
				<div className="flex gap-3 lg:gap-6">
					<DateRangePicker
						from={from}
						to={to}
						onApply={(range) => set({ ...range, period: undefined })}
						title="Order date"
						label="Select Dates"
						triggerClassName={OUTLINE}
					/>
					<OrderFilters
						statuses={statuses}
						payments={payments}
						onChange={(f) => set({ status: f.statuses.join(",") || undefined, payment: f.payments.join(",") || undefined })}
						triggerClassName={OUTLINE}
					/>
				</div>
			</div>

			<div className={clsx("mt-8 transition-opacity lg:mt-12", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-lg border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load orders.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && orders.length === 0 ? (
					<div className="rounded-lg border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>{filtered ? "No orders match." : "No orders yet."}</p>
						{filtered && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => set({ period: undefined, from: undefined, to: undefined, status: undefined, payment: undefined })}
								className="mt-4"
							>
								Show all orders
							</Button>
						)}
					</div>
				) : (
					<>
						<OrdersTable
							orders={orders}
							loading={isPending}
							rows={PAGE_SIZE}
							selected={selected}
							onSelectedChange={setSelected}
							sort={sort}
							onSortChange={(next) => set({ sort: next === "newest" ? undefined : next })}
							onOpen={(id, tracking) => set({ order: id, section: tracking ? "tracking" : undefined, page: keepPage })}
						/>
						{data && (
							<div className="rounded-b-lg border border-t-0 border-grey-600">
								<Pagination
									page={data.meta.page}
									totalPages={data.meta.total_pages}
									onChange={(n) => set({ page: n > 1 ? String(n) : undefined })}
								/>
							</div>
						)}
					</>
				)}
			</div>

			<OrderDetailsDialog
				orderId={get("order") || null}
				showTracking={get("section") === "tracking"}
				onClose={() => set({ order: undefined, section: undefined, page: keepPage })}
			/>
		</div>
	);
}
