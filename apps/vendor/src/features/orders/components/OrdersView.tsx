"use client";

import clsx from "clsx";
import { Download } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { OrderDetailsDialog } from "@/features/orders/components/OrderDetailsDialog";
import { useExportCsv } from "@/features/insights/hooks";
import { useMyOrders } from "@/features/orders/hooks";
import { day, ESCROW_LABEL, itemsLabel, STATUS_LABEL, STATUS_TONE } from "@/features/orders/options";
import { ORDER_STATUSES, type OrderStatus } from "@/features/orders/types";
import { count, price } from "@/lib/format";
import { backendRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 10;
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-4 text-sm whitespace-nowrap text-ink";

/**
 * Figma Vendor Hub "Orders" (PRD V8), on the API: paid orders by status, each with its payout and escrow state. View
 * opens Order Details (?order=), where the vendor moves it on: Processing → Shipped (courier + tracking) → Delivered.
 */
export function OrdersView() {
	const { get, page, set } = useUrlParams();
	const status = (ORDER_STATUSES as readonly string[]).includes(get("status")) ? (get("status") as OrderStatus) : undefined;
	const open = get("order") || null;
	const { data, isPending, isError, isFetching, refetch } = useMyOrders({ status, page, limit: PAGE_SIZE });
	const toProcess = useMyOrders({ status: "paid", page: 1, limit: 1 });
	const orders = data?.items ?? [];
	const exportCsv = useExportCsv();

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Orders" crumb="Orders">
				<Button
					isLoading={exportCsv.isPending}
					onClick={() =>
						exportCsv.mutate({ url: backendRoutes.ORDERS_CSV, params: status ? { status } : {}, name: "fysi-orders" })
					}
					className="h-12 gap-2 rounded-lg px-5"
				>
					<Download className="size-5" aria-hidden /> Export CSV
				</Button>
			</ListHeader>

			<div
				role="tablist"
				aria-label="Order status"
				className="hide-scroll mt-8 flex w-fit max-w-full overflow-x-auto border-b border-grey-600"
			>
				{([undefined, ...ORDER_STATUSES] as (OrderStatus | undefined)[]).map((s) => (
					<button
						key={s ?? "all"}
						type="button"
						role="tab"
						aria-selected={status === s}
						onClick={() => set({ status: s })}
						className={clsx(
							"-mb-px flex shrink-0 items-center gap-2 border-b-2 px-5 pb-3 text-base transition-colors",
							status === s ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
						)}
					>
						{s ? STATUS_LABEL[s] : "All"}
						{s === "paid" && !!toProcess.data?.meta.total && (
							<span className="rounded-full bg-primary-500 px-2 py-px text-xs font-medium text-white">
								{count(toProcess.data.meta.total)}
							</span>
						)}
					</button>
				))}
			</div>

			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load your orders.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && orders.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						{status
							? `No ${STATUS_LABEL[status].toLowerCase()} orders.`
							: "No orders yet. They show up here once a customer pays."}
					</p>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[960px]">
								<thead className="border-b border-grey-600 bg-grey-500">
									<tr>
										{["Order", "Paid", "Items", "Customer", "Your payout", "Status", "Payment"].map((h, i) => (
											<th key={h} scope="col" className={clsx(TH, i === 0 && "pl-6")}>
												{h}
											</th>
										))}
										<th scope="col" className={clsx(TH, "pr-6")}>
											<span className="sr-only">Actions</span>
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: 5 }, (_, i) => (
												<tr key={i}>
													<td colSpan={8} className="px-6 py-3">
														<Skeleton className="h-10 w-full" />
													</td>
												</tr>
											))
										: orders.map((o) => (
												<tr key={o.id} className="transition-colors hover:bg-grey-500">
													<td className={clsx(TD, "pl-6 font-semibold")}>{o.orderNumber}</td>
													<td className={TD}>{o.paidAt ? day(o.paidAt) : "—"}</td>
													<td className={clsx(TD, "max-w-56 truncate")}>{itemsLabel(o)}</td>
													<td className={TD}>{o.customerName}</td>
													<td className={TD}>{price(o.payout)}</td>
													<td className={TD}>
														<span className={clsx("rounded-full px-3 py-1 text-xs font-medium", STATUS_TONE[o.status])}>
															{STATUS_LABEL[o.status]}
														</span>
														{o.problemReason && <span className="ml-2 text-xs font-medium text-error-500">Problem</span>}
													</td>
													<td className={clsx(TD, "text-grey-900")}>{ESCROW_LABEL[o.escrowStatus]}</td>
													<td className="py-4 pr-6 pl-3 text-right">
														<button
															type="button"
															onClick={() => set({ order: o.id })}
															className="text-sm font-medium text-primary-500 hover:underline"
															aria-label={`View order ${o.orderNumber}`}
														>
															View
														</button>
													</td>
												</tr>
											))}
								</tbody>
							</table>
						</div>
						{data && data.meta.total_pages > 1 && (
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
				id={open}
				onClose={() => set({ order: undefined, section: undefined, page: page > 1 ? String(page) : undefined })}
			/>
		</div>
	);
}
