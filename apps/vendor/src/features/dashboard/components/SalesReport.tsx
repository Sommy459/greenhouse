"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import type { VendorDashboard } from "@/features/dashboard/types";
import { naira, nairaShort } from "@/lib/format";

const TICK = { fill: "var(--color-grey-900)", fontSize: 12 };
const SERIES = [
	{ key: "revenue", label: "Revenue", color: "var(--color-primary-500)" },
	{ key: "payouts", label: "Payouts", color: "var(--color-primary-100)" },
] as const;

/**
 * Figma "Sales Report": two bars a month. The design paired Revenue with Sales (a count) on one axis; both series here
 * are naira so they share it honestly: revenue from paid orders, and payouts released to the wallet after delivery.
 */
export function SalesReport({ months }: { months: VendorDashboard["sales_by_month"] }) {
	const totals = SERIES.map((s) => ({ ...s, total: months.reduce((sum, m) => sum + m[s.key], 0) }));

	return (
		<section
			aria-labelledby="sales-report"
			className="flex min-w-0 flex-col rounded-xl border border-grey-600 bg-white p-4 lg:p-5"
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<h2 id="sales-report" className="text-lg font-medium text-ink lg:text-[22px]">
					Sales Report
				</h2>
				<ul className="flex gap-5 text-sm text-grey-900" aria-label="Legend">
					{SERIES.map((s) => (
						<li key={s.key} className="flex items-center gap-2">
							<span aria-hidden className="size-2.5 rounded-full" style={{ background: s.color }} />
							{s.label}
						</li>
					))}
				</ul>
			</div>
			<div className="mt-6 h-[300px] min-w-0 lg:h-[360px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={months}
						margin={{ top: 8, right: 0, bottom: 0, left: 4 }}
						barCategoryGap="24%"
						barGap={2}
						accessibilityLayer
					>
						<CartesianGrid vertical={false} stroke="var(--color-grey-600)" strokeDasharray="4 4" />
						<XAxis
							dataKey="month"
							tickLine={false}
							axisLine={{ stroke: "var(--color-grey-600)" }}
							tick={TICK}
							tickMargin={10}
							interval={0}
						/>
						<YAxis tickLine={false} axisLine={false} tick={TICK} tickFormatter={nairaShort} width={52} />
						<Tooltip cursor={{ fill: "var(--color-primary-50)", radius: 4 }} content={<MonthTooltip />} />
						{SERIES.map((s) => (
							<Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} animationDuration={900} />
						))}
					</BarChart>
				</ResponsiveContainer>
			</div>
			{/* The numbers behind the chart, for screen readers. */}
			<table className="sr-only">
				<caption>Revenue and payouts by month: {totals.map((t) => `${t.label} ${naira(t.total)}`).join(", ")}</caption>
				<thead>
					<tr>
						<th scope="col">Month</th>
						<th scope="col">Revenue</th>
						<th scope="col">Payouts</th>
					</tr>
				</thead>
				<tbody>
					{months.map((m) => (
						<tr key={m.month}>
							<th scope="row">{m.month}</th>
							<td>{naira(m.revenue)}</td>
							<td>{naira(m.payouts)}</td>
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
			{payload.map((p) => (
				<p key={p.dataKey} className="mt-0.5 flex items-center gap-2 text-sm text-ink">
					<span aria-hidden className="size-2 rounded-full" style={{ background: p.color }} />
					{p.name}: <span className="font-semibold">{naira(p.value ?? 0)}</span>
				</p>
			))}
		</div>
	);
}
