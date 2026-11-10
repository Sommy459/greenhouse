"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { errorMessage, getData } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { SalesPeriod } from "@/features/analytics/types";
import type { Paginated } from "@/features/products/types";
import type {
	AdListParams,
	CampaignAd,
	CampaignFilters,
	CampaignStats,
	TrafficRange,
	TrafficStats,
} from "@/features/campaigns/types";

/** Figma "Impression & data" for the tab, search and filter. */
export function useCampaignStats(params: CampaignFilters & { period: SalesPeriod }) {
	return useQuery({
		queryKey: ["admin", "campaigns", "stats", params],
		queryFn: () => getData<CampaignStats>(backendRoutes.CAMPAIGN_STATS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** Figma "Traffic Statistics". */
export function useTrafficStats(range: TrafficRange) {
	return useQuery({
		queryKey: ["admin", "campaigns", "traffic", range],
		queryFn: () => getData<TrafficStats>(backendRoutes.CAMPAIGN_TRAFFIC, { range }),
		placeholderData: keepPreviousData,
	});
}

/** Figma "New Ad": newest first. */
export function useCampaignAds(params: AdListParams) {
	return useQuery({
		queryKey: ["admin", "campaigns", "ads", params],
		queryFn: () => getData<Paginated<CampaignAd>>(backendRoutes.CAMPAIGN_ADS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** "Export": the ads matching the tab, search and filter, as a CSV. */
export function useExportCampaigns() {
	const toast = useToast();
	return useMutation({
		mutationFn: (params: CampaignFilters) => downloadCsv(backendRoutes.CAMPAIGNS_EXPORT, { ...params }, "fysi-campaigns"),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't export the campaigns. Try again.")),
	});
}
