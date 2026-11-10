"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ChevronRight, CircleAlert, Hourglass, PackageX, ShoppingCart, Star, Truck, Wallet } from "lucide-react";
import { Skeleton } from "@repo/ui/skeleton";
import { StatCard, StatCardsSkeleton } from "@/components/StatCard";
import { SalesChart } from "@/features/insights/components/SalesChart";
import { useAnalytics, useVendorDashboard } from "@/features/insights/hooks";
import { useMyOrders } from "@/features/orders/hooks";
import { day, itemsLabel, STATUS_LABEL, STATUS_TONE } from "@/features/orders/options";
import { useProfile } from "@/features/shop/hooks";
import { count, longDate, price } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

/**
 * Figma Vendor Hub "Dashboard" (GET /vendor/dashboard): the last 30 days' sales and orders, the payout still in escrow
 * and the rating; what needs doing (orders to ship, problems, stock); the Sales Report for the last 12 months; and the
 * latest orders.
 */
export function DashboardView() {
	const { data: profile } = useProfile();
	const dashboard = useVendorDashboard();
	const d = dashboard.data;
	const recent = useMyOrders({ page: 1, limit: 5 });
	// Rendered on the client only (the dashboard waits for the session), so the date is the viewer's own.
	const [today] = useState(() => new Date());
	const [yearAgo] = useState(() => new Date(today.getFullYear() - 1, today.getMonth() + 1, 1).toISOString().slice(0, 10));
	const analytics = useAnalytics({ from: yearAgo, to: today.toISOString().slice(0, 10), period: "month" });

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="animate-rise min-w-0">
					<h1 className="text-2xl font-medium text-ink lg:text-[28px]">Welcome {profile?.businessName ?? ""}</h1>
					<p className="mt-1 text-base text-grey-900">Take a look at your shop at a glance!</p>
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

			<div className="mt-8">
				{dashboard.isPending || !d ? (
					<StatCardsSkeleton />
				) : (
					<ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
						<StatCard
							label="Sales, last 30 days"
							value={price(d.last30DaysSales)}
							icon={Wallet}
							tone="bg-info-50 text-info-500"
						/>
						<StatCard
							label="Orders, last 30 days"
							value={count(d.last30DaysOrders)}
							icon={ShoppingCart}
							tone="bg-success-50 text-success-700"
							index={1}
						/>
						<StatCard
							label="Payout in escrow"
							value={price(d.pendingPayout)}
							icon={Hourglass}
							tone="bg-warning-50 text-warning-700"
							index={2}
						/>
						<StatCard
							label={`Rating (${count(d.rating.count)} review${d.rating.count === 1 ? "" : "s"})`}
							value={d.rating.average != null ? `${d.rating.average.toFixed(1)} / 5` : "—"}
							icon={Star}
							tone="bg-lime-100 text-lime-800"
							index={3}
						/>
					</ul>
				)}
			</div>

			{d && (
				<ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="To do">
					{[
						{ label: "Orders to ship", value: d.orders.toShip, href: `${consoleRoutes.ORDERS}?status=paid`, icon: Truck },
						{ label: "Problems reported", value: d.orders.problems, href: consoleRoutes.ORDERS, icon: CircleAlert },
						{
							label: "Out of stock / low",
							value: d.products.outOfStock + d.products.lowStock,
							href: consoleRoutes.PRODUCTS,
							icon: PackageX,
						},
						{
							label: "Waiting for customers to confirm",
							value: d.orders.awaitingConfirmation,
							href: `${consoleRoutes.ORDERS}?status=shipped`,
							icon: Hourglass,
						},
					].map(({ label, value, href, icon: Icon }) => (
						<li key={label}>
							<Link
								href={href}
								className={clsx(
									"flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm transition-colors hover:border-primary-500",
									value > 0 ? "border-warning-700/40" : "border-grey-600",
								)}
							>
								<Icon className={clsx("size-5", value > 0 ? "text-warning-700" : "text-grey-800")} aria-hidden />
								<span className="flex-1 text-ink">{label}</span>
								<span className="text-lg font-semibold text-ink">{count(value)}</span>
							</Link>
						</li>
					))}
				</ul>
			)}

			<div className="mt-8">
				{analytics.data ? (
					<SalesChart series={analytics.data.series} period="month" />
				) : (
					<Skeleton className="h-[420px] rounded-xl" />
				)}
			</div>

			<section
				className="animate-rise mt-8 overflow-hidden rounded-xl border border-grey-600 bg-white"
				aria-labelledby="recent-title"
			>
				<div className="flex items-center justify-between gap-4 px-6 py-5">
					<h2 id="recent-title" className="text-lg font-medium text-ink">
						Recent Orders
					</h2>
					<Link
						href={consoleRoutes.ORDERS}
						className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline"
					>
						See all <ChevronRight className="size-4" aria-hidden />
					</Link>
				</div>
				{recent.isPending ? (
					<div className="space-y-2 px-6 pb-6">
						{Array.from({ length: 3 }, (_, i) => (
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
				) : !recent.data?.items.length ? (
					<p className="border-t border-grey-600 px-6 py-10 text-center text-sm text-grey-900">
						No orders yet. They show up here once a customer pays.
					</p>
				) : (
					<div className="overflow-x-auto border-t border-grey-600">
						<table className="w-full min-w-[720px]">
							<thead className="bg-grey-500">
								<tr>
									{["Order", "Paid", "Items", "Your payout", "Status"].map((h, i) => (
										<th
											key={h}
											scope="col"
											className={clsx("px-3 py-3 text-left text-sm font-medium text-ink", i === 0 && "pl-6")}
										>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-grey-600">
								{recent.data.items.map((o) => (
									<tr key={o.id} className="hover:bg-grey-500">
										<td className="py-3 pr-3 pl-6 text-sm font-semibold text-ink">
											<Link href={consoleRoutes.ORDER(o.id)} className="hover:text-primary-500 hover:underline">
												{o.orderNumber}
											</Link>
										</td>
										<td className="px-3 py-3 text-sm text-ink">{o.paidAt ? day(o.paidAt) : "—"}</td>
										<td className="max-w-64 truncate px-3 py-3 text-sm text-ink">{itemsLabel(o)}</td>
										<td className="px-3 py-3 text-sm text-ink">{price(o.payout)}</td>
										<td className="px-3 py-3">
											<span className={clsx("rounded-full px-3 py-1 text-xs font-medium", STATUS_TONE[o.status])}>
												{STATUS_LABEL[o.status]}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</div>
	);
}
