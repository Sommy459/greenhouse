"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ChevronRight, ReceiptText, ShoppingCart, SquareCheckBig, Wallet } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { StatCard, StatCardsSkeleton } from "@/components/StatCard";
import { ActiveCustomers } from "@/features/dashboard/components/ActiveCustomers";
import { SalesReport } from "@/features/dashboard/components/SalesReport";
import { useVendorDashboard } from "@/features/dashboard/hooks";
import { RecentOrdersTable } from "@/features/orders/components/RecentOrdersTable";
import { useMyShop } from "@/features/shop/hooks";
import { count, longDate, naira } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

/** Figma Vendor Hub "Dashboard": welcome and today's date, four totals, Sales Report, Active Customers, Recent Orders. */
export function DashboardView() {
	const { data: shop } = useMyShop();
	const { data, isPending, isError, refetch } = useVendorDashboard();
	const [selected, setSelected] = useState<Set<string>>(new Set());
	// Rendered on the client only (the dashboard waits for the session), so the date is the viewer's own.
	const [today] = useState(() => new Date());

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="animate-rise min-w-0">
					<h1 className="text-2xl font-medium text-ink lg:text-[28px]">Welcome {shop?.shop_name ?? ""}</h1>
					<p className="mt-1 text-base text-grey-900">Take a look at all your report at a glance!</p>
				</div>
				<div
					className="animate-rise flex items-center gap-4 rounded-xl border border-grey-600 bg-white px-6 py-4"
					style={{ "--i": 1 } as React.CSSProperties}
				>
					<span className="grid size-12 place-items-center rounded-full bg-grey-500 text-ink">
						<CalendarDays className="size-6" aria-hidden />
					</span>
					<div>
						<p className="text-sm text-grey-900">Today&apos;s Date</p>
						<p className="text-lg font-medium text-ink">
							<time dateTime={today.toISOString().slice(0, 10)}>{longDate(today)}</time>
						</p>
					</div>
				</div>
			</div>

			{isError ? (
				<div className="mt-8 rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
					<p>Couldn&apos;t load your dashboard.</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : isPending ? (
				<div className="mt-8 space-y-8">
					<StatCardsSkeleton />
					<div className="grid gap-6 xl:grid-cols-[1fr_460px]">
						<Skeleton className="h-[460px] rounded-xl" />
						<Skeleton className="h-[460px] rounded-xl" />
					</div>
				</div>
			) : (
				<>
					<ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
						<StatCard
							index={1}
							label="Total Revenue"
							value={naira(data.totals.revenue)}
							change={data.totals.revenue_change}
							icon={SquareCheckBig}
							tone="bg-info-50 text-info-500"
						/>
						<StatCard
							index={2}
							label="Product SKUs"
							value={count(data.totals.skus)}
							change={data.totals.skus_change}
							icon={ShoppingCart}
							tone="bg-success-50 text-success-700"
						/>
						<StatCard
							index={3}
							label="Avg. Order Value"
							value={naira(data.totals.avg_order_value)}
							change={data.totals.avg_order_value_change}
							icon={ReceiptText}
							tone="bg-error-50 text-error-500"
						/>
						<StatCard
							index={4}
							label="Balance"
							value={naira(data.totals.balance)}
							change={data.totals.balance_change}
							icon={Wallet}
							tone="bg-warning-50 text-warning-700"
						/>
					</ul>

					<div className="animate-rise mt-8 grid gap-6 xl:grid-cols-[1fr_460px]" style={{ "--i": 5 } as React.CSSProperties}>
						<SalesReport months={data.sales_by_month} />
						<ActiveCustomers percent={data.active_customers} />
					</div>

					<section
						aria-labelledby="recent-orders"
						className="animate-rise mt-8 overflow-hidden rounded-xl border border-grey-600 bg-white"
						style={{ "--i": 6 } as React.CSSProperties}
					>
						<div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-5">
							<h2 id="recent-orders" className="text-lg font-semibold text-ink lg:text-[22px]">
								Recent Orders
							</h2>
							<Link
								href={consoleRoutes.ORDERS}
								className="flex items-center gap-1 text-lg text-ink transition-colors hover:text-primary-500"
							>
								See all <ChevronRight className="size-6" aria-hidden />
							</Link>
						</div>
						{data.recent_orders.length === 0 ? (
							<p className="border-t border-grey-600 py-14 text-center text-sm text-grey-900">
								No orders yet. They show here as soon as a customer pays.
							</p>
						) : (
							<RecentOrdersTable
								orders={data.recent_orders}
								loading={false}
								rows={0}
								selected={selected}
								onSelectedChange={setSelected}
							/>
						)}
					</section>
				</>
			)}
		</div>
	);
}
