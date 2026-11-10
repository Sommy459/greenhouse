"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import type { Dashboard } from "@/features/dashboard/types";
import { count } from "@/lib/format";

const TICK = { fill: "var(--color-grey-900)", fontSize: 12 };

/** Figma "Sales Summary": orders per month, one forest-green bar each. Hovering a month shows its number. */
export function SalesSummary({ months }: { months: Dashboard["sales_by_month"] }) {
	const total = months.reduce((sum, m) => sum + m.sales, 0);

	return (
		<section
			className="flex min-w-0 flex-col rounded-xl border border-grey-600 bg-white p-4 lg:p-5"
			aria-labelledby="sales-summary"
		>
			<h2 id="sales-summary" className="text-lg font-medium text-ink lg:text-xl">
				Sales Summary
			</h2>
			<div className="mt-6 h-[260px] min-w-0 flex-1 lg:h-auto lg:min-h-[260px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={months} margin={{ top: 8, right: 0, bottom: 0, left: -8 }} barCategoryGap="22%" accessibilityLayer>
						<CartesianGrid vertical={false} stroke="var(--color-grey-600)" strokeDasharray="4 4" />
						<XAxis
							dataKey="month"
							tickLine={false}
							axisLine={{ stroke: "var(--color-grey-600)" }}
							tick={TICK}
							tickMargin={8}
							interval={0}
						/>
						<YAxis tickLine={false} axisLine={false} tick={TICK} tickFormatter={count} width={44} />
						<Tooltip cursor={{ fill: "var(--color-primary-50)", radius: 4 }} content={<MonthTooltip />} />
						<Bar dataKey="sales" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} animationDuration={900} />
					</BarChart>
				</ResponsiveContainer>
			</div>
			{/* The numbers behind the chart, for screen readers. */}
			<table className="sr-only">
				<caption>Orders per month, {count(total)} in total</caption>
				<tbody>
					{months.map((m) => (
						<tr key={m.month}>
							<th scope="row">{m.month}</th>
							<td>{count(m.sales)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}

function MonthTooltip({ active, payload, label }: TooltipProps<number, string>) {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-lg border border-grey-600 bg-white px-3 py-2 text-xs shadow-md">
			<p className="text-grey-900">{label}</p>
			<p className="mt-0.5 text-sm font-semibold text-ink">{count(payload[0]!.value ?? 0)} orders</p>
		</div>
	);
}
