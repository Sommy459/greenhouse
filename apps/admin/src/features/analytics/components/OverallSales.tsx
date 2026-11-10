"use client";

import { Skeleton } from "@repo/ui/skeleton";
import { PeriodBars } from "@/components/PeriodBars";
import { PeriodTabs } from "@/components/PeriodTabs";
import { PERIOD_LABEL } from "@/features/analytics/options";
import { SALES_PERIODS, type SalesAnalytics, type SalesPeriod } from "@/features/analytics/types";
import { naira } from "@/lib/format";

interface Props {
	data: SalesAnalytics | undefined;
	period: SalesPeriod;
	onPeriodChange: (period: SalesPeriod) => void;
	loading: boolean;
}

/** Figma "Overall Sales": paid sales per day, week or month, one forest-green bar each, with the period's total. */
export function OverallSales({ data, period, onPeriodChange, loading }: Props) {
	return (
		<section
			aria-labelledby="overall-sales"
			className="flex min-w-0 flex-col rounded-xl border border-grey-600 bg-white p-5 lg:p-8"
		>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<h2 id="overall-sales" className="text-xl font-medium text-ink lg:text-2xl">
						Overall Sales
					</h2>
					{data && (
						<span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-500">{naira(data.total)}</span>
					)}
				</div>
				<PeriodTabs label="Sales period" options={SALES_PERIODS} labels={PERIOD_LABEL} value={period} onChange={onPeriodChange} />
			</div>

			<div className="mt-8 h-[300px] min-w-0 lg:h-[380px]">
				{loading || !data ? (
					<Skeleton className="size-full" />
				) : (
					<PeriodBars
						data={data.sales.map((s) => ({ label: s.label, value: s.amount }))}
						format={(v) => naira(v)}
						caption={`Sales, ${PERIOD_LABEL[period].toLowerCase()}: ${naira(data.total)} in total`}
						axisWidth={72}
					/>
				)}
			</div>
		</section>
	);
}
