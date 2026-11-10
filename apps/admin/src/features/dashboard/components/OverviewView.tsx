"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeftRight, CalendarDays, CircleAlert, RefreshCcw, Store } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { PeriodBars } from "@/components/PeriodBars";
import { useSession } from "@/features/auth/session";
import { useDashboard } from "@/features/dashboard/hooks";
import type { DashboardPeriod } from "@/features/dashboard/types";
import { count, longDate, price } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

/**
 * Admin Overview (PRD A4), from GET /admin/dashboard: the four work queues first (each opens its list), then the period's
 * totals and payment volume per day or week. Rendered only in the browser (inside RequireAdmin), so today is the viewer's.
 */
export function OverviewView() {
	const firstName = useSession((s) => s.user?.name.split(" ")[0]);
	const [period, setPeriod] = useState<DashboardPeriod>("day");
	const { data, isPending, isError, refetch } = useDashboard(period);
	const [today] = useState(() => new Date());

	const totals = (data?.series ?? []).reduce(
		(t, s) => ({
			vendors: t.vendors + s.newVendors,
			customers: t.customers + s.newCustomers,
			orders: t.orders + s.paidOrders,
			volume: t.volume + s.volume.cents,
			failed: t.failed + s.failedPayments,
		}),
		{ vendors: 0, customers: 0, orders: 0, volume: 0, failed: 0 },
	);
	const label = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

	return (
		<div className="space-y-6 px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="animate-rise">
					<h1 className="text-2xl font-medium text-ink lg:text-[28px]">Welcome{firstName ? ` ${firstName}` : ""}</h1>
					<p className="mt-1 text-sm text-grey-900 lg:text-base">What needs you, and how Fysi is doing.</p>
				</div>
				<div
					className="animate-rise flex items-center gap-3 rounded-xl border border-grey-600 bg-white px-4 py-3 lg:px-5"
					style={{ "--i": 1 } as React.CSSProperties}
				>
					<span className="flex size-10 items-center justify-center rounded-full bg-grey-500">
						<CalendarDays className="size-5 text-ink" aria-hidden />
					</span>
					<div>
						<p className="text-xs text-grey-900">Today&apos;s Date</p>
						<p className="font-semibold text-ink lg:text-lg">{longDate(today)}</p>
					</div>
				</div>
			</div>

			{isError ? (
				<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
					<p>Couldn&apos;t load the dashboard.</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : isPending || !data ? (
				<div className="space-y-6">
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{Array.from({ length: 4 }, (_, i) => (
							<Skeleton key={i} className="h-32 rounded-xl" />
						))}
					</div>
					<Skeleton className="h-80 rounded-xl" />
				</div>
			) : (
				<>
					<ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Work queues">
						{[
							{ label: "Vendors to review", value: data.queues.vendorsPending, href: consoleRoutes.VENDOR_QUEUE, icon: Store },
							{
								label: "Payments to refund",
								value: data.queues.paymentsToRefund,
								href: consoleRoutes.PAYMENTS,
								icon: RefreshCcw,
							},
							{
								label: "Disputed orders",
								value: data.queues.disputes,
								href: `${consoleRoutes.ORDERS}?escrow=disputed`,
								icon: CircleAlert,
							},
							{
								label: "Failed transfers",
								value: data.queues.transfersFailed,
								href: `${consoleRoutes.PAYMENTS}?tab=transfers`,
								icon: ArrowLeftRight,
							},
						].map(({ label: name, value, href, icon: Icon }, i) => (
							<li key={name} className="animate-rise" style={{ "--i": i } as React.CSSProperties}>
								<Link
									href={href}
									className={clsx(
										"hover-lift block h-full rounded-xl border bg-white p-5 transition-colors hover:border-primary-500",
										value > 0 ? "border-warning-700/40" : "border-grey-600",
									)}
								>
									<span
										className={clsx(
											"grid size-11 place-items-center rounded-full",
											value > 0 ? "bg-warning-50 text-warning-700" : "bg-grey-500 text-grey-900",
										)}
									>
										<Icon className="size-5" aria-hidden />
									</span>
									<p className="mt-4 text-sm text-grey-900">{name}</p>
									<p className="text-2xl font-semibold text-ink">{count(value)}</p>
								</Link>
							</li>
						))}
					</ul>

					<section className="rounded-xl border border-grey-600 bg-white p-5 lg:p-6" aria-labelledby="activity-title">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<h2 id="activity-title" className="text-lg font-semibold text-ink">
								Payment volume
							</h2>
							<div role="tablist" aria-label="Period" className="flex rounded-lg border border-grey-600 p-0.5">
								{(["day", "week"] as const).map((p) => (
									<button
										key={p}
										type="button"
										role="tab"
										aria-selected={period === p}
										onClick={() => setPeriod(p)}
										className={clsx(
											"rounded-md px-3 py-1.5 text-sm",
											period === p ? "bg-primary-500 text-white" : "text-ink hover:bg-grey-500",
										)}
									>
										{p === "day" ? "Last 14 days" : "Last 12 weeks"}
									</button>
								))}
							</div>
						</div>
						<dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
							{[
								["Volume", price(totals.volume)],
								["Paid orders", count(totals.orders)],
								["New customers", count(totals.customers)],
								["New vendors", count(totals.vendors)],
								["Failed payments", count(totals.failed)],
							].map(([name, value]) => (
								<div key={name}>
									<dt className="text-xs text-grey-900">{name}</dt>
									<dd className="text-lg font-semibold text-ink">{value}</dd>
								</div>
							))}
						</dl>
						<div className="mt-6 h-72">
							<PeriodBars
								data={data.series.map((s) => ({ label: label(s.period), value: s.volume.cents / 100 }))}
								format={(v) => `$${count(Math.round(v))}`}
								caption={`Payment volume per ${period}: ${price(totals.volume)} in total`}
								axisWidth={56}
							/>
						</div>
					</section>
				</>
			)}
		</div>
	);
}
