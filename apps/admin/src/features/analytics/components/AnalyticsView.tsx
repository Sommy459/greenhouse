"use client";

import { useState } from "react";
import { Share } from "lucide-react";
import { Button } from "@repo/ui/button";
import { OverallSales } from "@/features/analytics/components/OverallSales";
import { ProductBestSellers } from "@/features/analytics/components/ProductBestSellers";
import { SalesReport } from "@/features/analytics/components/SalesReport";
import { useExportAnalytics, useSalesAnalytics } from "@/features/analytics/hooks";
import { PERIOD_LABEL } from "@/features/analytics/options";
import type { SalesPeriod } from "@/features/analytics/types";

/** Figma admin "Analytics": Overall Sales (by day, week or month), Sales Report by category, Product Best Sellers. */
export function AnalyticsView() {
	const [period, setPeriod] = useState<SalesPeriod>("monthly");
	const { data, isPending, isError, refetch } = useSalesAnalytics(period);
	const exportReport = useExportAnalytics();

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<h1 className="animate-rise text-2xl font-medium text-ink lg:text-[28px]">Analytics</h1>
				<Button
					type="button"
					size="sm"
					isLoading={exportReport.isPending}
					onClick={() => exportReport.mutate(period)}
					className="animate-rise h-12 rounded-lg px-5"
					style={{ "--i": 1 } as React.CSSProperties}
					title={`Export the ${PERIOD_LABEL[period].toLowerCase()} sales report`}
				>
					<Share className="size-5" aria-hidden />
					Export
				</Button>
			</div>

			{isError ? (
				<div className="mt-8 rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900 lg:mt-12">
					<p>Couldn&apos;t load the sales figures.</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : (
				<div
					className="animate-rise mt-8 grid gap-5 lg:mt-12 xl:grid-cols-[1229fr_472fr]"
					style={{ "--i": 2 } as React.CSSProperties}
				>
					<OverallSales data={data} period={period} onPeriodChange={setPeriod} loading={isPending} />
					<SalesReport data={data} loading={isPending} />
				</div>
			)}

			<div className="animate-rise mt-8 lg:mt-14" style={{ "--i": 3 } as React.CSSProperties}>
				<ProductBestSellers />
			</div>
		</div>
	);
}
