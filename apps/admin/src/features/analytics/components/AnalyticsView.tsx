"use client";

import clsx from "clsx";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { PeriodBars } from "@/components/PeriodBars";
import { useAdminAnalytics } from "@/features/analytics/hooks";
import type { Metric, Period, Ranked } from "@/features/analytics/types";
import { count, price, type Money } from "@/lib/format";

const RANGES: { days: number; label: string; period: Period }[] = [
	{ days: 7, label: "7 days", period: "day" },
	{ days: 30, label: "30 days", period: "day" },
	{ days: 90, label: "90 days", period: "week" },
	{ days: 365, label: "12 months", period: "month" },
];
const iso = (d: Date) => d.toISOString().slice(0, 10);
const CARD = "rounded-xl border border-grey-600 bg-white p-5";
const short = (dollars: number) => (dollars >= 1000 ? `$${Math.round(dollars / 100) / 10}k` : `$${Math.round(dollars)}`);

function axisLabel(value: string, period: Period) {
	const d = new Date(value);
	return period === "month"
		? d.toLocaleDateString("en-GB", { month: "short" })
		: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Change({ change, inverse = false }: { change: number | null; inverse?: boolean }) {
	if (change == null) return null;
	const up = change >= 0;
	const good = inverse ? !up : up;
	const Icon = up ? ArrowUpRight : ArrowDownRight;
	return (
		<span className={clsx("inline-flex items-center gap-0.5 text-sm font-medium", good ? "text-success-700" : "text-error-500")}>
			<Icon className="size-4" aria-hidden />
			{Math.abs(Math.round(change))}%<span className="sr-only"> {up ? "up" : "down"} on the range before</span>
		</span>
	);
}

/** Marketplace analytics (GET /admin/analytics): money, orders and growth over a range, and what sells most. */
export function AnalyticsView() {
	const [range, setRange] = useState(() => {
		const to = new Date();
		return { days: 30, from: iso(new Date(to.getTime() - 29 * 86_400_000)), to: iso(to), period: "day" as Period };
	});
	const {
		data: a,
		isError,
		refetch,
		isFetching,
		isPending,
	} = useAdminAnalytics({ from: range.from, to: range.to, period: range.period });

	const pick = (days: number, period: Period) => {
		const to = new Date();
		setRange({ days, from: iso(new Date(to.getTime() - (days - 1) * 86_400_000)), to: iso(to), period });
	};

	const cards: { label: string; metric: Metric<Money> | Metric<number>; money?: boolean; inverse?: boolean }[] = a
		? [
				{ label: "Sales (GMV)", metric: a.gmv, money: true },
				{ label: "Fysi commission", metric: a.commission, money: true },
				{ label: "Orders", metric: a.orders },
				{ label: "Average order", metric: a.averageOrder, money: true },
				{ label: "Buyers", metric: a.buyers },
				{ label: "New customers", metric: a.newCustomers },
				{ label: "New vendors", metric: a.newVendors },
				{ label: "Refunds", metric: a.refunds, money: true, inverse: true },
			]
		: [];

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Analytics" crumb="Analytics">
				<div role="tablist" aria-label="Range" className="flex rounded-lg border border-grey-600 bg-white p-0.5">
					{RANGES.map((r) => (
						<button
							key={r.days}
							type="button"
							role="tab"
							aria-selected={range.days === r.days}
							onClick={() => pick(r.days, r.period)}
							className={clsx(
								"rounded-md px-3 py-1.5 text-sm",
								range.days === r.days ? "bg-primary-500 text-white" : "text-ink hover:bg-grey-500",
							)}
						>
							{r.label}
						</button>
					))}
				</div>
			</ListHeader>

			{isError ? (
				<div className={clsx(CARD, "mt-8 py-16 text-center text-sm text-grey-900")}>
					<p>Couldn&apos;t load analytics.</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : isPending || !a ? (
				<Skeleton className="mt-8 h-[520px] rounded-xl" />
			) : (
				<div className={clsx("transition-opacity", isFetching && "opacity-60")}>
					<ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{cards.map((c) => (
							<li key={c.label} className={CARD}>
								<p className="text-sm text-grey-900">{c.label}</p>
								<p className="mt-1 flex flex-wrap items-baseline gap-2 text-2xl font-semibold text-ink">
									{c.money ? price(c.metric.value as Money) : count(c.metric.value as number)}
									<Change change={c.metric.change} inverse={c.inverse} />
								</p>
							</li>
						))}
					</ul>
					<p className="mt-3 text-sm text-grey-900">
						Repeat buyers:{" "}
						<strong className="text-ink">{a.repeatBuyerRate != null ? `${a.repeatBuyerRate.toFixed(1)}%` : "—"}</strong>
						{Object.keys(a.vendorOrdersByStatus).length > 0 && (
							<>
								{" · "}Vendor orders:{" "}
								{Object.entries(a.vendorOrdersByStatus)
									.map(([s, n]) => `${count(n)} ${s.replace(/_/g, " ")}`)
									.join(", ")}
							</>
						)}
					</p>

					<div className="mt-6 grid gap-6 xl:grid-cols-2">
						<section className={CARD} aria-labelledby="gmv-chart">
							<h2 id="gmv-chart" className="text-lg font-medium text-ink">
								Sales
							</h2>
							<div className="mt-4 h-[280px] min-w-0">
								<PeriodBars
									data={a.series.map((s) => ({ label: axisLabel(s.period, range.period), value: s.gmv.cents / 100 }))}
									format={short}
									caption={`Sales by ${range.period}: ${price(a.gmv.value)} in total`}
									axisWidth={52}
								/>
							</div>
						</section>
						<section className={CARD} aria-labelledby="orders-chart">
							<h2 id="orders-chart" className="text-lg font-medium text-ink">
								Orders
							</h2>
							<div className="mt-4 h-[280px] min-w-0">
								<PeriodBars
									data={a.series.map((s) => ({ label: axisLabel(s.period, range.period), value: s.orders }))}
									format={(n) => count(n)}
									caption={`Orders by ${range.period}: ${count(a.orders.value)} in total`}
								/>
							</div>
						</section>
					</div>

					<div className="mt-6 grid gap-6 lg:grid-cols-3">
						<Top title="Top vendors" rows={a.topVendors} />
						<Top title="Top products" rows={a.topProducts} />
						<Top title="Top categories" rows={a.topCategories} />
					</div>
				</div>
			)}
		</div>
	);
}

function Top({ title, rows }: { title: string; rows: Ranked[] }) {
	return (
		<section className={CARD} aria-label={title}>
			<h2 className="text-lg font-medium text-ink">{title}</h2>
			{rows.length === 0 ? (
				<p className="mt-3 text-sm text-grey-900">No sales in this range.</p>
			) : (
				<ol className="mt-3 space-y-3">
					{rows.map((r, i) => (
						<li key={r.id} className="flex items-center gap-3 text-sm">
							<span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-semibold text-primary-500">
								{i + 1}
							</span>
							<span className="min-w-0 flex-1 truncate text-ink">{r.name}</span>
							<span className="text-right text-grey-900">
								{price(r.sales)}
								<span className="block text-xs">
									{count(r.orders)} order{r.orders === 1 ? "" : "s"}
								</span>
							</span>
						</li>
					))}
				</ol>
			)}
		</section>
	);
}
