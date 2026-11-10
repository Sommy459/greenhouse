"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipProps } from "recharts";
import { Skeleton } from "@repo/ui/skeleton";
import { CATEGORY_COLORS, categoryOrder } from "@/features/analytics/options";
import type { SalesAnalytics } from "@/features/analytics/types";
import { naira } from "@/lib/format";

/** Figma "Sales Report": the period's sales by category, as a pie with a legend that names each share. */
export function SalesReport({ data, loading }: { data: SalesAnalytics | undefined; loading: boolean }) {
	const amounts = new Map((data?.by_category ?? []).map((c) => [c.category, c.amount]));
	// Fixed order, so a category keeps its colour and place whatever its rank.
	const slices = categoryOrder([...amounts.keys()]).map((category, i) => ({
		category,
		amount: amounts.get(category)!,
		color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]!,
	}));
	const total = slices.reduce((sum, s) => sum + s.amount, 0);
	const share = (amount: number) => (total ? Math.round((amount / total) * 100) : 0);

	return (
		<section
			aria-labelledby="sales-report"
			className="flex min-w-0 flex-col rounded-xl border border-grey-600 bg-white p-5 lg:p-8"
		>
			<div className="flex flex-wrap items-center gap-3">
				<h2 id="sales-report" className="text-xl font-medium text-ink lg:text-2xl">
					Sales Report
				</h2>
				{data && (
					<span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-500">{naira(data.total)}</span>
				)}
			</div>

			{loading || !data ? (
				<Skeleton className="mx-auto mt-8 size-[220px] rounded-full" />
			) : total === 0 ? (
				<p className="mt-10 text-center text-sm text-grey-900">No sales in this period.</p>
			) : (
				<>
					<div className="mx-auto mt-6 size-[240px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart accessibilityLayer>
								<Pie
									data={slices}
									dataKey="amount"
									nameKey="category"
									innerRadius={0}
									outerRadius="100%"
									startAngle={90}
									endAngle={-270}
									// 2px surface gap between slices (dataviz mark spec).
									stroke="var(--color-white)"
									strokeWidth={2}
									animationDuration={900}
								>
									{slices.map((s) => (
										<Cell key={s.category} fill={s.color} />
									))}
								</Pie>
								<Tooltip content={<SliceTooltip total={total} />} />
							</PieChart>
						</ResponsiveContainer>
					</div>
					<ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
						{slices.map((s) => (
							<li key={s.category} className="flex min-w-0 items-center gap-2.5 text-sm text-ink">
								<span aria-hidden className="size-3 shrink-0 rounded-sm" style={{ background: s.color }} />
								<span className="min-w-0 truncate">{s.category}</span>
								<span className="ml-auto shrink-0 text-grey-900 tabular-nums">{share(s.amount)}%</span>
							</li>
						))}
					</ul>
					<table className="sr-only">
						<caption>Sales by category, {naira(total)} in total</caption>
						<tbody>
							{slices.map((s) => (
								<tr key={s.category}>
									<th scope="row">{s.category}</th>
									<td>
										{naira(s.amount)} ({share(s.amount)}%)
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</>
			)}
		</section>
	);
}

function SliceTooltip({ active, payload, total }: TooltipProps<number, string> & { total: number }) {
	if (!active || !payload?.length) return null;
	const amount = payload[0]!.value ?? 0;
	return (
		<div className="rounded-lg border border-grey-600 bg-white px-3 py-2 text-xs shadow-md">
			<p className="text-grey-900">{payload[0]!.name}</p>
			<p className="mt-0.5 text-sm font-semibold text-ink">
				{naira(amount)} · {total ? Math.round((amount / total) * 100) : 0}%
			</p>
		</div>
	);
}
