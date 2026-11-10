"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";

const TICK = { fill: "var(--color-grey-900)", fontSize: 12 };

interface Props {
	/** Oldest first; `label` is what the axis shows ("Jan", "3 Nov"). */
	data: { label: string; value: number }[];
	/** Axis ticks and tooltip values, e.g. naira or a plain count. */
	format: (value: number) => string;
	/** For screen readers, e.g. "Sales, monthly: ₦300,000 in total". */
	caption: string;
	/** Y-axis width; naira labels need more room. */
	axisWidth?: number;
}

/** One forest-green bar per day, week or month (Figma "Overall Sales", "Impression & data"). Hover shows the value. */
export function PeriodBars({ data, format, caption, axisWidth = 44 }: Props) {
	return (
		<>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 8 }} barCategoryGap="30%" accessibilityLayer>
					<CartesianGrid vertical={false} stroke="var(--color-grey-600)" strokeDasharray="4 4" />
					<XAxis
						dataKey="label"
						tickLine={false}
						axisLine={{ stroke: "var(--color-grey-600)" }}
						tick={TICK}
						tickMargin={10}
						interval="preserveStartEnd"
						minTickGap={8}
					/>
					<YAxis tickLine={false} axisLine={false} tick={TICK} tickFormatter={format} width={axisWidth} />
					<Tooltip cursor={{ fill: "var(--color-primary-50)", radius: 4 }} content={<ValueTooltip format={format} />} />
					<Bar dataKey="value" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} animationDuration={900} />
				</BarChart>
			</ResponsiveContainer>
			{/* The numbers behind the chart, for screen readers. */}
			<table className="sr-only">
				<caption>{caption}</caption>
				<tbody>
					{data.map((d) => (
						<tr key={d.label}>
							<th scope="row">{d.label}</th>
							<td>{format(d.value)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
}

function ValueTooltip({ active, payload, label, format }: TooltipProps<number, string> & { format: (v: number) => string }) {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-lg border border-grey-600 bg-white px-3 py-2 text-xs shadow-md">
			<p className="text-grey-900">{label}</p>
			<p className="mt-0.5 text-sm font-semibold text-ink">{format(payload[0]!.value ?? 0)}</p>
		</div>
	);
}
