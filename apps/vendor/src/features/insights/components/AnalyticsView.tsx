"use client";

import clsx from "clsx";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { ChangeBadge } from "@/components/StatCard";
import { SalesChart } from "@/features/insights/components/SalesChart";
import { useAnalytics, useExportCsv, useProductStats } from "@/features/insights/hooks";
import type { Metric, Period } from "@/features/insights/types";
import { count, price, type Money } from "@/lib/format";
import { backendRoutes } from "@/lib/routes";

const RANGES: { days: number; label: string; period: Period }[] = [
	{ days: 7, label: "7 days", period: "day" },
	{ days: 30, label: "30 days", period: "day" },
	{ days: 90, label: "90 days", period: "week" },
	{ days: 365, label: "12 months", period: "month" },
];
const iso = (d: Date) => d.toISOString().slice(0, 10);
const TH = "px-3 py-3 text-left text-sm font-medium whitespace-nowrap text-ink";

/** Sales analytics (GET /vendor/analytics) and how each product performs (GET /vendor/product-stats). */
export function AnalyticsView() {
	const [range, setRange] = useState(() => {
		const to = new Date();
		return { days: 30, from: iso(new Date(to.getTime() - 29 * 86_400_000)), to: iso(to), period: "day" as Period };
	});
	const [sort, setSort] = useState<"sales" | "units" | "views" | "title">("sales");
	const [page, setPage] = useState(1);
	const analytics = useAnalytics({ from: range.from, to: range.to, period: range.period });
	const stats = useProductStats({ from: range.from, to: range.to, sort, page });
	const exportCsv = useExportCsv();
	const a = analytics.data;

	const pick = (days: number, period: Period) => {
		const to = new Date();
		setRange({ days, from: iso(new Date(to.getTime() - (days - 1) * 86_400_000)), to: iso(to), period });
		setPage(1);
	};

	const cards: { label: string; metric?: Metric<Money> | Metric<number>; money?: boolean }[] = a
		? [
				{ label: "Sales", metric: a.sales, money: true },
				{ label: "After commission", metric: a.net, money: true },
				{ label: "Orders", metric: a.orders },
				{ label: "Units sold", metric: a.units },
				{ label: "Average order", metric: a.averageOrder, money: true },
				{ label: "Product views", metric: a.views },
				{ label: "Refunds", metric: a.refunds, money: true },
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

			{analytics.isError ? (
				<div className="mt-8 rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
					<p>Couldn&apos;t load analytics.</p>
					<Button variant="outline" size="sm" onClick={() => analytics.refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : !a ? (
				<Skeleton className="mt-8 h-96 rounded-xl" />
			) : (
				<>
					<ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{cards.map((c) => (
							<li key={c.label} className="rounded-xl border border-grey-600 bg-white p-4">
								<p className="text-sm text-grey-900">{c.label}</p>
								<p className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold text-ink">
									{c.money ? price(c.metric!.value as Money) : count(c.metric!.value as number)}
									{c.metric!.change != null && <ChangeBadge change={Math.round(c.metric!.change)} />}
								</p>
							</li>
						))}
						<li className="rounded-xl border border-grey-600 bg-white p-4">
							<p className="text-sm text-grey-900">Views that became orders</p>
							<p className="mt-1 text-2xl font-semibold text-ink">
								{a.conversionRate != null ? `${a.conversionRate.toFixed(1)}%` : "—"}
							</p>
						</li>
					</ul>

					<div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
						<SalesChart series={a.series} period={range.period} title="Sales" />
						<section className="rounded-xl border border-grey-600 bg-white p-5" aria-labelledby="top-title">
							<h2 id="top-title" className="text-lg font-medium text-ink">
								Top products
							</h2>
							{a.topProducts.length === 0 ? (
								<p className="mt-3 text-sm text-grey-900">No sales in this range.</p>
							) : (
								<ol className="mt-3 space-y-3">
									{a.topProducts.map((t, i) => (
										<li key={t.productId} className="flex items-center gap-3 text-sm">
											<span className="grid size-7 place-items-center rounded-full bg-primary-50 text-xs font-semibold text-primary-500">
												{i + 1}
											</span>
											<span className="min-w-0 flex-1 truncate text-ink">{t.title}</span>
											<span className="text-right text-grey-900">
												{price(t.sales)}
												<span className="block text-xs">{count(t.units)} sold</span>
											</span>
										</li>
									))}
								</ol>
							)}
						</section>
					</div>
				</>
			)}

			<section className="mt-6 overflow-hidden rounded-xl border border-grey-600 bg-white" aria-labelledby="per-product">
				<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
					<h2 id="per-product" className="text-lg font-medium text-ink">
						Product performance
					</h2>
					<div className="flex items-center gap-2">
						<select
							value={sort}
							onChange={(e) => setSort(e.target.value as typeof sort)}
							aria-label="Sort by"
							className="h-9 rounded-lg border border-grey-600 bg-white px-2 text-sm"
						>
							<option value="sales">Most sales</option>
							<option value="units">Most units</option>
							<option value="views">Most views</option>
							<option value="title">Name</option>
						</select>
						<Button
							variant="outline"
							size="sm"
							isLoading={exportCsv.isPending}
							onClick={() =>
								exportCsv.mutate({
									url: backendRoutes.PRODUCTS_CSV,
									params: { from: range.from, to: range.to },
									name: "fysi-products",
								})
							}
							className="gap-1.5"
						>
							<Download className="size-4" aria-hidden /> CSV
						</Button>
					</div>
				</div>
				<div className="relative overflow-x-auto border-t border-grey-600">
					<table className="w-full min-w-[860px]">
						<thead className="bg-grey-500">
							<tr>
								{["Product", "Views", "Orders", "Units", "Sales", "Conversion", "Wishlisted", "Rating", "Stock"].map((h, i) => (
									<th key={h} scope="col" className={clsx(TH, i === 0 && "pl-5")}>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-grey-600">
							{stats.isPending
								? Array.from({ length: 4 }, (_, i) => (
										<tr key={i}>
											<td colSpan={9} className="px-5 py-3">
												<Skeleton className="h-8 w-full" />
											</td>
										</tr>
									))
								: (stats.data?.items ?? []).map((p) => (
										<tr key={p.productId} className="text-sm text-ink hover:bg-grey-500">
											<td className="max-w-64 truncate py-3 pr-3 pl-5 font-medium">{p.title}</td>
											<td className="px-3 py-3">{count(p.views)}</td>
											<td className="px-3 py-3">{count(p.orders)}</td>
											<td className="px-3 py-3">{count(p.units)}</td>
											<td className="px-3 py-3 whitespace-nowrap">{price(p.sales)}</td>
											<td className="px-3 py-3">{p.conversionRate != null ? `${p.conversionRate.toFixed(1)}%` : "—"}</td>
											<td className="px-3 py-3">{count(p.wishlisted)}</td>
											<td className="px-3 py-3 whitespace-nowrap">
												{p.rating.average != null ? `${p.rating.average.toFixed(1)} (${p.rating.count})` : "—"}
											</td>
											<td className="px-3 py-3">{count(p.stock)}</td>
										</tr>
									))}
						</tbody>
					</table>
				</div>
				{stats.data && stats.data.meta.total_pages > 1 && (
					<div className="border-t border-grey-600">
						<Pagination page={stats.data.meta.page} totalPages={stats.data.meta.total_pages} onChange={setPage} />
					</div>
				)}
			</section>
		</div>
	);
}
