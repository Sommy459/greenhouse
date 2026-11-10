"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";

/** `data` of GET /admin/profile/notifications: which e-mails this admin gets (Figma "Email Notification"). */
export interface NotificationPrefs {
	/** New vendor sign-ups, their listings, and vendor issues. */
	vendor_onboarding: boolean;
	/** New customer sign-ups and customer issues. */
	customer_onboarding: boolean;
	/** Comments and reviews. */
	comments: boolean;
}

export const NOTIFICATION_OPTIONS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
	{
		key: "vendor_onboarding",
		label: "Onboarding vendor",
		description: "Notify me when a vendor signs up or uploads a product, and when there's an issue.",
	},
	{
		key: "customer_onboarding",
		label: "Onboarding customer",
		description: "Notify me when a customer signs up, and when there's an issue.",
	},
	{ key: "comments", label: "Comment", description: "Notify me about any comment and review." },
];

const KEY = ["admin", "profile", "notifications"];

export function useNotificationPrefs() {
	return useQuery({ queryKey: KEY, queryFn: () => getData<NotificationPrefs>(backendRoutes.NOTIFICATION_PREFS) });
}

/** One switch: shows the change at once, puts it back if the API refuses. */
export function useSetNotificationPref() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (next: NotificationPrefs) =>
			(await api.put(backendRoutes.NOTIFICATION_PREFS, next)).data.data as NotificationPrefs,
		retry: false,
		onMutate: async (next) => {
			await queryClient.cancelQueries({ queryKey: KEY });
			const previous = queryClient.getQueryData<NotificationPrefs>(KEY);
			queryClient.setQueryData(KEY, next);
			return { previous };
		},
		onError: (error, _next, context) => {
			if (context?.previous) queryClient.setQueryData(KEY, context.previous);
			toast.error(errorMessage(error, "Couldn't save that. Try again."));
		},
		onSuccess: (saved) => {
			queryClient.setQueryData(KEY, saved);
			toast.success("Notification settings saved");
		},
	});
}
