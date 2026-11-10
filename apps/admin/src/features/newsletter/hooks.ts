"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";

export interface Subscriber {
	id: string;
	email: string;
	status: "subscribed" | "unsubscribed";
	/** Where they signed up, e.g. "footer". */
	source: string | null;
	hasAccount: boolean;
	subscribedAt: string;
	unsubscribedAt: string | null;
}

export const CAMPAIGN_STATUSES = ["draft", "scheduled", "sending", "sent", "cancelled"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export const CAMPAIGN_AUDIENCES = ["newsletter", "customers", "vendors", "all_users"] as const;
export type CampaignAudience = (typeof CAMPAIGN_AUDIENCES)[number];

export const AUDIENCE_LABEL: Record<CampaignAudience, string> = {
	newsletter: "Newsletter subscribers",
	customers: "Customers",
	vendors: "Vendors",
	all_users: "Every account",
};
export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
	draft: "Draft",
	scheduled: "Scheduled",
	sending: "Sending",
	sent: "Sent",
	cancelled: "Cancelled",
};
export const CAMPAIGN_STATUS_TONE: Record<CampaignStatus, string> = {
	draft: "bg-grey-500 text-grey-900",
	scheduled: "bg-info-50 text-info-500",
	sending: "bg-warning-50 text-warning-700",
	sent: "bg-success-50 text-success-700",
	cancelled: "bg-grey-500 text-grey-900",
};

/** An email campaign (GET /admin/campaigns). Only drafts can be edited. */
export interface Campaign {
	id: string;
	name: string;
	subject: string;
	preheader: string | null;
	heading: string;
	body: string;
	ctaLabel: string | null;
	ctaUrl: string | null;
	audience: CampaignAudience;
	status: CampaignStatus;
	recipientCount: number;
	sentCount: number;
	failedCount: number;
	scheduledAt: string | null;
	sentAt: string | null;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export type CampaignBody = Pick<
	Campaign,
	"name" | "subject" | "preheader" | "heading" | "body" | "ctaLabel" | "ctaUrl" | "audience"
>;

const SUBS = ["admin", "subscribers"];
const KEY = ["admin", "campaigns"];

export function useSubscribers(params: { status?: Subscriber["status"]; q?: string; page: number; limit: number }) {
	return useQuery({
		queryKey: [...SUBS, params],
		queryFn: () => getPage<Subscriber>(backendRoutes.SUBSCRIBERS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function useCampaigns(params: { status?: CampaignStatus; page: number; limit: number }) {
	return useQuery({
		queryKey: [...KEY, "list", params],
		queryFn: () => getPage<Campaign>(backendRoutes.CAMPAIGNS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function useCampaign(id: string) {
	return useQuery({ queryKey: [...KEY, id], queryFn: () => getData<Campaign>(backendRoutes.CAMPAIGN(id)) });
}

function useCampaignMutation<V, R>(request: (vars: V) => Promise<R>, success: (r: R, v: V) => string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		retry: false,
		onSuccess: (r, v) => {
			if (r && typeof r === "object" && "id" in r) queryClient.setQueryData([...KEY, (r as unknown as Campaign).id], r);
			queryClient.invalidateQueries({ queryKey: [...KEY, "list"] });
			toast.success(success(r, v));
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** Create a draft (no id) or edit one. */
export function useSaveCampaign(id?: string) {
	return useCampaignMutation(
		async (body: CampaignBody) =>
			(id ? await api.patch(backendRoutes.CAMPAIGN(id), body) : await api.post(backendRoutes.CAMPAIGNS, body)).data
				.data as Campaign,
		() => (id ? "Draft saved" : "Draft created"),
	);
}

/** Sends a copy to one address (yours if left empty). */
export function useTestCampaign(id: string) {
	return useCampaignMutation(
		async (email: string | undefined) => {
			await api.post(backendRoutes.CAMPAIGN_ACTION(id, "test"), email ? { email } : {});
			return email;
		},
		(email) => `Test sent to ${email || "your email"}`,
	);
}

/** Send now, or schedule (`scheduledAt`). Never retried: a retry could email everyone twice. */
export function useSendCampaign(id: string) {
	return useCampaignMutation(
		async (scheduledAt: string | undefined) =>
			(await api.post(backendRoutes.CAMPAIGN_ACTION(id, "send"), scheduledAt ? { scheduledAt } : {})).data.data as Campaign,
		(c) => (c.status === "scheduled" ? "Campaign scheduled" : "Campaign is sending"),
	);
}

/** Stops a scheduled campaign. */
export function useCancelCampaign(id: string) {
	return useCampaignMutation(
		async () => (await api.post(backendRoutes.CAMPAIGN_ACTION(id, "cancel"))).data.data as Campaign,
		() => "Campaign cancelled",
	);
}

export function useDeleteCampaign(id: string) {
	return useCampaignMutation(
		async () => {
			await api.delete(backendRoutes.CAMPAIGN(id));
			return null;
		},
		() => "Draft deleted",
	);
}
