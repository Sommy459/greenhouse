"use client";

import clsx from "clsx";
import { Skeleton } from "@repo/ui/skeleton";
import { PeriodBars } from "@/components/PeriodBars";
import { PeriodTabs } from "@/components/PeriodTabs";
import { PERIOD_LABEL } from "@/features/analytics/options";
import { SALES_PERIODS, type SalesPeriod } from "@/features/analytics/types";
import type { CampaignStats } from "@/features/campaigns/types";
import { count } from "@/lib/format";

interface Props {
	data: CampaignStats | undefined;
	period: SalesPeriod;
	onPeriodChange: (period: SalesPeriod) => void;
	loading: boolean;
}

/** Figma "Impression & data": ad impressions per day, week or month, and today's change on yesterday. */
export function ImpressionsChart({ data, period, onPeriodChange, loading }: Props) {
	const change = data?.change_today ?? 0;
	const total = data?.impressions.reduce((sum, d) => sum + d.value, 0) ?? 0;

	return (
		<section aria-labelledby="impressions" className="flex min-w-0 flex-col">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex flex-wrap items-center gap-3">
					<h2 id="impressions" className="text-xl font-medium text-ink lg:text-[28px]">
						Impression &amp; data
					</h2>
					{data && (
						<span
							className={clsx(
								"rounded-full px-3 py-1 text-sm font-medium",
								change < 0 ? "bg-error-50 text-error-500" : "bg-primary-50 text-primary-500",
							)}
						>
							{change === 0
								? "No change in data today"
								: `${Math.abs(change)}% ${change > 0 ? "increase" : "decrease"} in data today`}
						</span>
					)}
				</div>
				<PeriodTabs
					label="Impressions period"
					options={SALES_PERIODS}
					labels={PERIOD_LABEL}
					value={period}
					onChange={onPeriodChange}
				/>
			</div>

			<div className="mt-8 h-[300px] min-w-0 lg:h-[400px]">
				{loading || !data ? (
					<Skeleton className="size-full" />
				) : data.impressions.length === 0 ? (
					<p className="pt-20 text-center text-sm text-grey-900">No ads match.</p>
				) : (
					<PeriodBars
						data={data.impressions}
						format={count}
						caption={`Ad impressions, ${PERIOD_LABEL[period].toLowerCase()}: ${count(total)} in total`}
					/>
				)}
			</div>
		</section>
	);
}
