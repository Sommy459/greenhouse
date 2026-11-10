"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Pagination } from "@/components/Pagination";
import { OrderFilters } from "@/features/orders/components/OrderFilters";
import { useAdminOrders } from "@/features/orders/hooks";
import { STATUS_LABEL, STATUS_TONE } from "@/features/orders/options";
import type { OrderStatus, PaymentMethod } from "@/features/orders/types";
import { naira } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

const PAGE_SIZE = 5;
type Tab = "orders" | "subscriptions" | "activities" | "reviews";
const TABS: { value: Tab; label: string }[] = [
	{ value: "orders", label: "All orders" },
	{ value: "subscriptions", label: "Subscriptions" },
	{ value: "activities", label: "Activities" },
	{ value: "reviews", label: "Review" },
];
const OUTLINE =
	"inline-flex h-11 items-center gap-2.5 rounded-lg border border-grey-600 bg-white px-4 text-base font-medium text-grey-900 transition-colors hover:border-primary-500 hover:text-primary-500";
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Figma "Order History" on Customers Details: this customer's orders, with dates, filters and pages. */
export function CustomerOrderHistory({ customerId, ordersCount }: { customerId: string; ordersCount: number }) {
	const [tab, setTab] = useState<Tab>("orders");
	const [page, setPage] = useState(1);
	const [range, setRange] = useState<{ from?: string; to?: string }>({});
	const [filters, setFilters] = useState<{ statuses: OrderStatus[]; payments: PaymentMethod[] }>({ statuses: [], payments: [] });

	const { data, isPending, isError, isFetching, refetch } = useAdminOrders({
		customer: customerId,
		from: range.from,
		to: range.to,
		status: filters.statuses.join(",") || undefined,
		payment: filters.payments.join(",") || undefined,
		page,
		limit: PAGE_SIZE,
	});
	const orders = data?.items ?? [];
	const filtered = !!(range.from || range.to || filters.statuses.length || filters.payments.length);

	return (
		<section aria-labelledby="order-history" className="overflow-hidden rounded-xl border border-grey-600 bg-white">
			<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 lg:px-9">
				<h2 id="order-history" className="text-xl font-medium text-ink lg:text-2xl">
					Order History
				</h2>
				{tab === "orders" && (
					<div className="flex gap-3 lg:gap-5">
						<DateRangePicker
							from={range.from ?? ""}
							to={range.to ?? ""}
							onApply={(next) => {
								setRange(next);
								setPage(1);
							}}
							title="Order date"
							label="Select Date"
							triggerClassName={OUTLINE}
						/>
						<OrderFilters
							statuses={filters.statuses}
							payments={filters.payments}
							onChange={(next) => {
								setFilters(next);
								setPage(1);
							}}
							triggerClassName={OUTLINE}
						/>
					</div>
				)}
			</div>

			<div
				role="tablist"
				aria-label="Customer history"
				className="hide-scroll flex overflow-x-auto border-b border-grey-600 bg-grey-500 px-0 lg:px-0"
			>
				{TABS.map((t) => (
					<button
						key={t.value}
						type="button"
						role="tab"
						aria-selected={tab === t.value}
						onClick={() => setTab(t.value)}
						className={clsx(
							"-mb-px flex shrink-0 items-center gap-2 border-b-2 px-6 py-5 text-base whitespace-nowrap transition-colors",
							tab === t.value ? "border-primary-500 text-primary-500" : "border-transparent text-ink hover:text-primary-500",
						)}
					>
						{t.label}
						{t.value === "orders" && (
							<span className="rounded-full bg-primary-500 px-2 py-px text-xs font-medium text-white">{ordersCount}</span>
						)}
					</button>
				))}
			</div>

			{tab !== "orders" ? (
				<p className="px-6 py-16 text-center text-sm text-grey-900">
					{TABS.find((t) => t.value === tab)!.label} aren&apos;t built yet: send the Figma for this tab.
				</p>
			) : isError ? (
				<div className="py-16 text-center text-sm text-grey-900">
					<p>Couldn&apos;t load this customer&apos;s orders.</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : !isPending && orders.length === 0 ? (
				<p className="py-16 text-center text-sm text-grey-900">{filtered ? "No orders match." : "No orders yet."}</p>
			) : (
				<div className={clsx("transition-opacity", isFetching && !isPending && "opacity-60")}>
					<div className="overflow-x-auto">
						<table className="w-full min-w-[600px]">
							<thead className="border-b border-grey-600">
								<tr className="text-left text-base font-medium text-ink">
									<th scope="col" className="py-5 pr-3 pl-6 font-medium lg:pl-7">
										Order ID
									</th>
									<th scope="col" className="px-3 py-5 font-medium">
										Product
									</th>
									<th scope="col" className="px-3 py-5 font-medium">
										Total
									</th>
									<th scope="col" className="px-3 py-5 font-medium">
										Status
									</th>
									<th scope="col" className="py-5 pr-5 pl-2 font-medium">
										Date
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-grey-600">
								{isPending
									? Array.from({ length: PAGE_SIZE }, (_, i) => (
											<tr key={i}>
												<td colSpan={5} className="px-6 py-4">
													<Skeleton className="h-14 w-full" />
												</td>
											</tr>
										))
									: orders.map((o) => (
											<tr key={o.id} className="transition-colors hover:bg-grey-500">
												<td className="py-5 pr-3 pl-6 text-base font-semibold whitespace-nowrap text-ink lg:pl-7">
													<Link href={consoleRoutes.ORDER(o.id)} className="hover:text-primary-500 hover:underline">
														{o.number}
													</Link>
												</td>
												<td className="px-3 py-4">
													<div className="flex items-center gap-3">
														<span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-grey-500">
															{o.first_item.image_url ? (
																<Image src={o.first_item.image_url} alt="" fill sizes="48px" className="object-cover" />
															) : (
																<Package className="size-5 text-grey-700" aria-hidden />
															)}
														</span>
														<div className="min-w-0 leading-tight">
															<p className="max-w-[170px] truncate text-base text-ink">{o.first_item.name}</p>
															{o.other_items > 0 && (
																<p className="mt-1 text-sm text-grey-900">
																	+{o.other_items} other product{o.other_items === 1 ? "" : "s"}
																</p>
															)}
														</div>
													</div>
												</td>
												<td className="px-3 py-5 text-base whitespace-nowrap text-grey-900">{naira(o.total, 2)}</td>
												<td className="px-3 py-5 whitespace-nowrap">
													<span className={clsx("rounded-full px-3 py-1 text-sm font-medium", STATUS_TONE[o.status])}>
														{STATUS_LABEL[o.status]}
													</span>
												</td>
												<td className="py-5 pr-5 pl-2 text-base whitespace-nowrap text-grey-900">
													<time dateTime={o.created_at}>{date(o.created_at)}</time>
												</td>
											</tr>
										))}
							</tbody>
						</table>
					</div>
					{data && <Pagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={setPage} goTo />}
				</div>
			)}
		</section>
	);
}
