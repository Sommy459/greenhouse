"use client";

import clsx from "clsx";
import { useState } from "react";
import { ChartLine, Share, ShoppingCart, Ticket, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Skeleton } from "@repo/ui/skeleton";
import { Pagination } from "@/components/Pagination";
import { StatCard, StatCardsSkeleton } from "@/components/StatCard";
import { useExportPerformance, usePromotionPerformance } from "@/features/promotions/hooks";
import { period, STATUS_LABEL, STATUS_TONE } from "@/features/promotions/options";
import type { PromotionStatus } from "@/features/promotions/types";
import { count, naira } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 8;
/** Open promotions haven't started, so they have no sales to monitor. */
const TABS = ["ongoing", "cancelled", "expired"] as const satisfies readonly PromotionStatus[];
const TH = "px-3 py-5 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-7 text-base whitespace-nowrap text-ink";

/**
 * Figma Vendor Hub "Monitor Promotions": sales from promotions, the products' usual sales before them and the uplift;
 * then each product in a promotion with what it sold. `?promotion=` (from Promotion Management → Monitor) narrows it to
 * one promotion. Export saves the ticked rows, or every row that matches.
 */
export function MonitorPromotionsView() {
	const { get, page, set } = useUrlParams();
	const status = (TABS as readonly string[]).includes(get("status")) ? (get("status") as PromotionStatus) : undefined;
	const promotion = get("promotion") || undefined;
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const exportRows = useExportPerformance();

	const { data, isPending, isError, isFetching, refetch } = usePromotionPerformance({
		promotion,
		status,
		page,
		limit: PAGE_SIZE,
	});
	const everything = usePromotionPerformance({ promotion, page: 1, limit: 1 });
	const rows = data?.items ?? [];
	const ids = rows.map((r) => r.id);
	const ticked = ids.filter((id) => selected.has(id)).length;
	const summary = data?.summary;

	const toggle = (id: string) => {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		setSelected(next);
	};

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="animate-rise min-w-0">
					<h1 className="text-2xl font-medium text-ink lg:text-[28px]">Monitor Promotions</h1>
					{data?.promotion && (
						<p className="mt-3 flex flex-wrap items-center gap-2 text-base text-grey-900">
							Showing
							<span className="inline-flex items-center gap-1 rounded-full bg-primary-50 py-1 pr-1 pl-3 text-sm font-medium text-primary-500">
								{data.promotion.name}
								<button
									type="button"
									onClick={() => {
										setSelected(new Set());
										set({ promotion: undefined });
									}}
									aria-label="Show every promotion"
									className="grid size-6 place-items-center rounded-full hover:bg-primary-100"
								>
									<X className="size-3.5" aria-hidden />
								</button>
							</span>
						</p>
					)}
				</div>
				<Button
					type="button"
					isLoading={exportRows.isPending}
					disabled={!data || data.meta.total === 0}
					onClick={() => exportRows.mutate(selected.size ? { ids: [...selected].join(",") } : { promotion, status })}
					className="animate-rise h-12 rounded-lg px-5"
					style={{ "--i": 1 } as React.CSSProperties}
				>
					<Share className="size-5" aria-hidden />
					{selected.size ? `Export ${count(selected.size)}` : "Export"}
				</Button>
			</div>

			<div className="mt-8 lg:mt-12">
				{summary ? (
					<ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
						<StatCard
							label="Total Sales from Promotions"
							value={naira(summary.sales)}
							change={summary.sales_change}
							icon={Ticket}
							tone="bg-info-50 text-info-500"
						/>
						<StatCard
							label="Avg. Sales before campaign"
							value={naira(summary.baseline)}
							change={summary.baseline_change}
							icon={ShoppingCart}
							tone="bg-success-50 text-success-700"
							index={1}
						/>
						<StatCard
							label="Uplift"
							value={`${count(summary.uplift)}%`}
							change={summary.uplift_change}
							icon={ChartLine}
							tone="bg-error-50 text-error-500"
							index={2}
						/>
					</ul>
				) : isError ? null : (
					<StatCardsSkeleton count={3} />
				)}
			</div>

			<div
				role="tablist"
				aria-label="Promotion status"
				className="animate-rise hide-scroll mt-10 flex w-fit max-w-full overflow-x-auto border-b border-grey-600 lg:mt-14"
				style={{ "--i": 3 } as React.CSSProperties}
			>
				{([undefined, ...TABS] as (PromotionStatus | undefined)[]).map((s) => (
					<button
						key={s ?? "all"}
						type="button"
						role="tab"
						aria-selected={status === s}
						onClick={() => set({ status: s })}
						className={clsx(
							"-mb-px flex shrink-0 items-center gap-2 border-b-2 px-6 pb-4 text-base transition-colors",
							status === s ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
						)}
					>
						{s ? STATUS_LABEL[s] : "All"}
						{!s && everything.data && (
							<span className="rounded-full bg-primary-500 px-2 py-px text-xs font-medium text-white">
								{count(everything.data.meta.total)}
							</span>
						)}
					</button>
				))}
			</div>

			<div className={clsx("mt-7 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load your promotion sales.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && rows.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						{status
							? `No sales from ${STATUS_LABEL[status].toLowerCase()} promotions.`
							: "No promotion sales yet. They show here once a promotion starts."}
					</p>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[980px]">
								<thead className="border-b border-grey-600 bg-grey-500">
									<tr>
										<th scope="col" className="w-14 py-5 pl-8">
											<Checkbox
												aria-label="Select all rows on this page"
												disabled={isPending || ids.length === 0}
												checked={ids.length > 0 && ticked === ids.length ? true : ticked > 0 ? "indeterminate" : false}
												onCheckedChange={() => {
													const next = new Set(selected);
													if (ticked === ids.length) ids.forEach((id) => next.delete(id));
													else ids.forEach((id) => next.add(id));
													setSelected(next);
												}}
												className="size-5"
											/>
										</th>
										{["Product", "Seller SKU", "Item Sold", "Revenue", "Period"].map((h) => (
											<th key={h} scope="col" className={TH}>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: PAGE_SIZE }, (_, i) => (
												<tr key={i}>
													<td colSpan={6} className="px-8 py-4">
														<Skeleton className="h-12 w-full" />
													</td>
												</tr>
											))
										: rows.map((r, i) => (
												<tr
													key={r.id}
													data-selected={selected.has(r.id)}
													className="animate-rise transition-colors hover:bg-grey-500 data-[selected=true]:bg-primary-50"
													style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
												>
													<td className="py-7 pl-8">
														<Checkbox
															aria-label={`Select ${r.product.name} in ${r.promotion.name}`}
															checked={selected.has(r.id)}
															onCheckedChange={() => toggle(r.id)}
															className="size-5"
														/>
													</td>
													<td className={clsx(TD, "font-semibold")}>
														{r.product.name}
														<span className="mt-1 flex items-center gap-2 text-sm font-normal text-grey-900">
															{r.promotion.name}
															<span
																className={clsx("rounded-full px-2 py-px text-xs font-medium", STATUS_TONE[r.promotion.status])}
															>
																{STATUS_LABEL[r.promotion.status]}
															</span>
														</span>
													</td>
													<td className={TD}>{r.product.sku}</td>
													<td className={TD}>
														{count(r.items_sold)} Item{r.items_sold === 1 ? "" : "s"}
													</td>
													<td className={TD}>{naira(r.revenue, 2)}</td>
													<td className={TD}>{period(r.duration_days)}</td>
												</tr>
											))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>

			{data && data.meta.total > 0 && (
				<div className="mt-8 rounded-xl bg-white">
					<Pagination
						page={data.meta.page}
						totalPages={data.meta.total_pages}
						onChange={(n) => set({ page: n > 1 ? String(n) : undefined })}
					/>
				</div>
			)}
		</div>
	);
}
