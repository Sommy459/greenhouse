"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { isSignedIn, useSession } from "@/features/auth/session";
import type { InboxMessage } from "@/features/inbox/types";

const KEY = ["inbox"];

/** Inbox (C11): order updates and notes from Fysi, newest first. */
export function useInbox(page: number, limit = 10) {
	return useQuery({
		queryKey: [...KEY, page, limit],
		queryFn: () => getPage<InboxMessage>(backendRoutes.INBOX, { page, limit }),
		placeholderData: keepPreviousData,
	});
}

/** For the badge on "Inbox"; checks back every minute while signed in. */
export function useUnreadCount() {
	const signedIn = useSession(isSignedIn);
	return useQuery({
		queryKey: [...KEY, "unread"],
		queryFn: async () => (await getData<{ unread: number }>(backendRoutes.INBOX_UNREAD)).unread,
		enabled: signedIn,
		refetchInterval: 60_000,
	});
}

function useInboxAction<V>(request: (vars: V) => Promise<unknown>) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		retry: false,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
		onError: (error) => toast.error(errorMessage(error)),
	});
}

export const useMarkRead = () => useInboxAction((id: string) => api.post(backendRoutes.INBOX_READ(id)));
export const useMarkAllRead = () => useInboxAction(() => api.post(backendRoutes.INBOX_READ_ALL));
export const useDeleteMessage = () => useInboxAction((id: string) => api.delete(backendRoutes.INBOX_ITEM(id)));
