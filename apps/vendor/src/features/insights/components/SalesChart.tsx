"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import type { Period, SeriesPoint } from "@/features/insights/types";
import { price } from "@/lib/format";

const TICK = { fill: "var(--color-grey-900)", fontSize: 12 };
const SERIES = [
	{ key: "sales", label: "Sales", color: "var(--color-primary-500)" },
	{ key: "net", label: "After commission", color: "var(--color-primary-100)" },
] as const;

const short = (dollars: number) => (dollars >= 1000 ? `$${Math.round(dollars / 100) / 10}k` : `$${Math.round(dollars)}`);

function label(iso: string, period: Period) {
	const d = new Date(iso);
	return period === "month"
		? d.toLocaleDateString("en-GB", { month: "short" })
		: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Figma "Sales Report": two bars per period, sales and what's left after Fysi's commission (both in dollars). */
export function SalesChart({
	series,
	period,
	title = "Sales Report",
}: {
	series: SeriesPoint[];
	period: Period;
	title?: string;
}) {
	const data = series.map((s) => ({ label: label(s.period, period), sales: s.sales.cents / 100, net: s.net.cents / 100 }));
	const total = series.reduce((t, s) => t + s.sales.cents, 0);

	return (
		<section
			aria-labelledby="sales-chart"
			className="flex min-w-0 flex-col rounded-xl border border-grey-600 bg-white p-4 lg:p-5"
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<h2 id="sales-chart" className="text-lg font-medium text-ink lg:text-[22px]">
					{title}
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
			<div className="mt-6 h-[300px] min-w-0 lg:h-[340px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{ top: 8, right: 0, bottom: 0, left: 4 }}
						barCategoryGap="24%"
						barGap={2}
						accessibilityLayer
					>
						<CartesianGrid vertical={false} stroke="var(--color-grey-600)" strokeDasharray="4 4" />
						<XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "var(--color-grey-600)" }} tick={TICK} tickMargin={10} />
						<YAxis tickLine={false} axisLine={false} tick={TICK} tickFormatter={short} width={52} />
						<Tooltip cursor={{ fill: "var(--color-primary-50)", radius: 4 }} content={<ChartTooltip />} />
						{SERIES.map((s) => (
							<Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} animationDuration={900} />
						))}
					</BarChart>
				</ResponsiveContainer>
			</div>
			<p className="sr-only">Sales in this range: {price(total)}.</p>
		</section>
	);
}

function ChartTooltip({ active, payload, label: name }: TooltipProps<number, string>) {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-lg border border-grey-600 bg-white px-3 py-2 text-sm shadow-md">
			<p className="font-medium text-ink">{name}</p>
			{payload.map((p) => (
				<p key={p.dataKey as string} className="text-grey-900">
					{p.name}: {price(Math.round(Number(p.value) * 100))}
				</p>
			))}
		</div>
	);
}
