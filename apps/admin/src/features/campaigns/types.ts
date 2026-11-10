/** Placeholder shapes until matched to the API. Campaigns (vendor ads) are outside the MVP (PRD release step 4). */

import type { SalesPeriod } from "@/features/analytics/types";

export const AD_STATUSES = ["online", "paused", "ended"] as const;
export type AdStatus = (typeof AD_STATUSES)[number];

/** Figma tabs: ads from every vendor, or from vendors who signed up in the last 30 days. */
export type CampaignTab = "all" | "new";

/** "Traffic Statistics": Today · Week · Month. */
export const TRAFFIC_RANGES = ["today", "week", "month"] as const;
export type TrafficRange = (typeof TRAFFIC_RANGES)[number];

/** Filters shared by the chart, the ad table and Export. */
export interface CampaignFilters {
	tab?: CampaignTab;
	/** Shop name. */
	search?: string;
	/** Comma-separated ad statuses. */
	status?: string;
}

/** `data` of GET /admin/campaigns/stats. */
export interface CampaignStats {
	period: SalesPeriod;
	/** One bar each, oldest first. */
	impressions: { label: string; value: number }[];
	/** Today's impressions against yesterday's, in percent (the "2% increase in data today" badge). */
	change_today: number;
	/** Vendors with at least one ad (the "All Vendors" count). */
	advertisers: number;
}

/** `data` of GET /admin/campaigns/traffic. */
export interface TrafficStats {
	range: TrafficRange;
	new_vendors: number;
	/** Percent of ad clicks that became orders. */
	conversion_rate: number;
	/** Percent of ad clicks that left without a second page. */
	bounce_rate: number;
}

/** A row of GET /admin/campaigns/ads (Figma "New Ad"). */
export interface CampaignAd {
	id: string;
	vendor: { id: string; shop_name: string; location: string };
	impressions: number;
	clicks: number;
	category: string;
	status: AdStatus;
	created_at: string;
}

export interface AdListParams extends CampaignFilters {
	from?: string;
	to?: string;
	/** Comma-separated category names. */
	category?: string;
	page: number;
	limit: number;
}
