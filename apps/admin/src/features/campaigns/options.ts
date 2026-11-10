import type { AdStatus, TrafficRange } from "@/features/campaigns/types";

export const AD_STATUS_LABEL: Record<AdStatus, string> = { online: "Online", paused: "Paused", ended: "Ended" };

export const AD_STATUS_TONE: Record<AdStatus, string> = {
	online: "bg-success-50 text-success-700",
	paused: "bg-warning-50 text-warning-700",
	ended: "bg-grey-500 text-grey-900",
};

export const TRAFFIC_LABEL: Record<TrafficRange, string> = { today: "Today", week: "Week", month: "Month" };
