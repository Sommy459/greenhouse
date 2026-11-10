"use client";

import clsx from "clsx";
import { useState } from "react";
import { Skeleton } from "@repo/ui/skeleton";
import { useTrafficStats } from "@/features/campaigns/hooks";
import { TRAFFIC_LABEL } from "@/features/campaigns/options";
import { TRAFFIC_RANGES, type TrafficRange } from "@/features/campaigns/types";
import { count } from "@/lib/format";

/** Figma "Traffic Statistics": new vendors, conversion and bounce rate for today, this week or this month. */
export function TrafficStatistics() {
	const [range, setRange] = useState<TrafficRange>("today");
	const { data, isPending, isError } = useTrafficStats(range);
	const rows = data
		? [
				{ label: "New vendors", value: count(data.new_vendors) },
				{ label: "Conversion rate", value: `${data.conversion_rate.toFixed(1)}%` },
				{ label: "Bounce rate", value: `${data.bounce_rate.toFixed(1)}%` },
			]
		: [];

	return (
		<section aria-labelledby="traffic-stats" className="min-w-0">
			<h2 id="traffic-stats" className="text-xl font-medium text-ink lg:text-[28px]">
				Traffic Statistics
			</h2>
			<div role="tablist" aria-label="Traffic range" className="mt-4 flex gap-2">
				{TRAFFIC_RANGES.map((r) => (
					<button
						key={r}
						type="button"
						role="tab"
						aria-selected={range === r}
						onClick={() => setRange(r)}
						className={clsx(
							"h-11 rounded-lg px-5 text-base font-medium transition-colors",
							range === r ? "bg-primary-500 text-white" : "bg-white text-grey-800 hover:text-primary-500",
						)}
					>
						{TRAFFIC_LABEL[r]}
					</button>
				))}
			</div>

			{isError ? (
				<p className="mt-8 text-sm text-grey-900">Couldn&apos;t load traffic.</p>
			) : (
				<dl className="mt-8 space-y-5">
					{isPending
						? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-6 w-full" />)
						: rows.map((row) => (
								<div key={row.label} className="flex items-center justify-between gap-4">
									<dt className="text-base font-medium text-primary-500">{row.label}</dt>
									<dd className="text-base font-semibold text-ink tabular-nums">{row.value}</dd>
								</div>
							))}
				</dl>
			)}
		</section>
	);
}
