"use client";

import clsx from "clsx";
import { useState } from "react";
import { Share } from "lucide-react";
import { Button } from "@repo/ui/button";
import { SearchBox } from "@/components/SearchBox";
import { StatusFilter } from "@/components/StatusFilter";
import type { SalesPeriod } from "@/features/analytics/types";
import { AdsTable } from "@/features/campaigns/components/AdsTable";
import { ImpressionsChart } from "@/features/campaigns/components/ImpressionsChart";
import { TrafficStatistics } from "@/features/campaigns/components/TrafficStatistics";
import { useCampaignStats, useExportCampaigns } from "@/features/campaigns/hooks";
import { AD_STATUS_LABEL } from "@/features/campaigns/options";
import { AD_STATUSES, type CampaignTab } from "@/features/campaigns/types";
import { count } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";

const TABS: { value: CampaignTab; label: string }[] = [
	{ value: "all", label: "All Vendors" },
	{ value: "new", label: "New Vendors" },
];

/**
 * Figma admin "Campaign": vendor ads. The tabs, search and status filter narrow the chart, the ad table and Export;
 * Traffic Statistics covers the whole platform. Outside the MVP (PRD release step 4).
 */
export function CampaignView() {
	const { get, list, set } = useUrlParams();
	const tab: CampaignTab = get("tab") === "new" ? "new" : "all";
	const search = get("search");
	const statuses = list("status", AD_STATUSES);
	const [period, setPeriod] = useState<SalesPeriod>("monthly");

	const filters = { tab: tab === "all" ? undefined : tab, search: search || undefined, status: statuses.join(",") || undefined };
	const stats = useCampaignStats({ ...filters, period });
	// The "All Vendors" count: every advertising vendor, whatever the search or filter.
	const everyone = useCampaignStats({ period });
	const exportCampaigns = useExportCampaigns();

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<h1 className="animate-rise text-2xl font-medium text-ink lg:text-[28px]">Campaign</h1>
				<Button
					type="button"
					size="sm"
					isLoading={exportCampaigns.isPending}
					onClick={() => exportCampaigns.mutate(filters)}
					className="animate-rise h-12 rounded-lg px-5"
					style={{ "--i": 1 } as React.CSSProperties}
					title="Export the ads in this view"
				>
					<Share className="size-5" aria-hidden />
					Export
				</Button>
			</div>

			<div
				className="animate-rise mt-8 flex flex-wrap items-end justify-between gap-4 lg:mt-16"
				style={{ "--i": 2 } as React.CSSProperties}
			>
				<div role="tablist" aria-label="Vendors" className="flex border-b border-grey-600">
					{TABS.map((t) => (
						<button
							key={t.value}
							type="button"
							role="tab"
							aria-selected={tab === t.value}
							onClick={() => set({ tab: t.value === "all" ? undefined : t.value })}
							className={clsx(
								"-mb-px flex items-center gap-2 border-b-2 px-5 pb-3 text-base transition-colors lg:px-6",
								tab === t.value ? "border-primary-500 text-primary-500" : "border-transparent text-ink hover:text-primary-500",
							)}
						>
							{t.label}
							{t.value === "all" && everyone.data && (
								<span className="rounded-full bg-primary-500 px-2 py-px text-xs font-medium text-white">
									{count(everyone.data.advertisers)}
								</span>
							)}
						</button>
					))}
				</div>

				<div className="flex w-full gap-3 sm:w-auto lg:gap-6">
					<SearchBox
						value={search}
						onChange={(value) => set({ search: value || undefined })}
						placeholder="search vendors"
						label="Search ads by shop name"
						className="sm:w-[300px] lg:w-[380px]"
					/>
					<StatusFilter
						id="ad-status"
						options={AD_STATUSES}
						labels={AD_STATUS_LABEL}
						value={statuses}
						onChange={(next) => set({ status: next.join(",") || undefined })}
						legend="Ad status"
					/>
				</div>
			</div>

			<div
				className="animate-rise mt-10 grid gap-10 lg:mt-14 xl:grid-cols-[1fr_360px] xl:gap-14"
				style={{ "--i": 3 } as React.CSSProperties}
			>
				{stats.isError ? (
					<div className="py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load impressions.</p>
						<Button variant="outline" size="sm" onClick={() => stats.refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : (
					<ImpressionsChart data={stats.data} period={period} onPeriodChange={setPeriod} loading={stats.isPending} />
				)}
				<TrafficStatistics />
			</div>

			<div className="animate-rise mt-10 lg:mt-14" style={{ "--i": 4 } as React.CSSProperties}>
				<AdsTable key={JSON.stringify(filters)} filters={filters} />
			</div>
		</div>
	);
}
