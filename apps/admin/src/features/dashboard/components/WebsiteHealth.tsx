"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipProps } from "recharts";
import type { Dashboard } from "@/features/dashboard/types";

const SLICES = [
	{ key: "speed", label: "Speed", color: "var(--color-primary-500)" },
	{ key: "error", label: "Error", color: "var(--color-grey-600)" },
] as const;

/** Figma "Website Health": a two-slice pie with a legend beside it. */
export function WebsiteHealth({ health }: { health: Dashboard["website_health"] }) {
	const data = SLICES.map((s) => ({ name: s.label, value: health[s.key], color: s.color }));

	return (
		<section className="rounded-xl border border-grey-600 bg-white p-5 lg:p-6" aria-labelledby="website-health">
			<h2 id="website-health" className="text-lg font-semibold text-ink">
				Website Health
			</h2>
			<div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
				<div className="aspect-square w-full max-w-[200px]">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={data}
								dataKey="value"
								startAngle={90}
								endAngle={-270}
								outerRadius="100%"
								stroke="none"
								animationDuration={900}
							>
								{data.map((d) => (
									<Cell key={d.name} fill={d.color} />
								))}
							</Pie>
							<Tooltip content={<SliceTooltip />} />
						</PieChart>
					</ResponsiveContainer>
				</div>
				<ul className="space-y-2 text-sm text-grey-900 sm:mt-2">
					{data.map((d) => (
						<li key={d.name} className="flex items-center gap-2">
							<span aria-hidden className="size-2.5 rounded-full" style={{ background: d.color }} />
							{d.name}
							<span className="font-medium text-ink">{d.value}%</span>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}

function SliceTooltip({ active, payload }: TooltipProps<number, string>) {
	if (!active || !payload?.length) return null;
	const slice = payload[0]!;
	return (
		<div className="rounded-lg border border-grey-600 bg-white px-3 py-2 text-xs shadow-md">
			{slice.name}: <span className="font-semibold text-ink">{slice.value}%</span>
		</div>
	);
}
