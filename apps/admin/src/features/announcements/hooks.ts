"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";

export const AUDIENCES = ["all", "customers", "vendors", "staff", "users"] as const;
export type Audience = (typeof AUDIENCES)[number];
export const AUDIENCE_LABEL: Record<Audience, string> = {
	all: "Everyone",
	customers: "Customers",
	vendors: "Vendors",
	staff: "Admins",
	users: "Chosen accounts",
};

/** An announcement (GET /admin/notifications): lands in each recipient's inbox. */
export interface Announcement {
	id: string;
	audience: Audience;
	title: string;
	body: string;
	link: string | null;
	recipientCount: number;
	readCount: number;
	sentBy: string;
	sentByName: string | null;
	createdAt: string;
}

export interface AnnouncementBody {
	audience: Audience;
	userIds?: string[];
	title: string;
	body: string;
	link?: string | null;
}

const KEY = ["admin", "announcements"];

export function useAnnouncements(page: number, limit: number) {
	return useQuery({
		queryKey: [...KEY, page, limit],
		queryFn: () => getPage<Announcement>(backendRoutes.NOTIFICATIONS, { page, limit }),
		placeholderData: keepPreviousData,
	});
}

/** Sends straight away. Never retried: a retry would send it twice. */
export function useSendAnnouncement() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (body: AnnouncementBody) => (await api.post(backendRoutes.NOTIFICATIONS, body)).data.data as Announcement,
		retry: false,
		onSuccess: (a) => {
			queryClient.invalidateQueries({ queryKey: KEY });
			toast.success(`Sent to ${a.recipientCount.toLocaleString("en-US")} inbox${a.recipientCount === 1 ? "" : "es"}`);
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}
