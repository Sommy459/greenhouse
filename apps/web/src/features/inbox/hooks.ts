"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import type { Paginated } from "@/features/catalog/types";
import type { InboxMessage } from "@/features/inbox/types";

/** Inbox (C11): order updates and notes from Fysi, newest first. */
export function useInbox(page: number, limit = 10) {
	return useQuery({
		queryKey: ["inbox", page, limit],
		queryFn: () => getData<Paginated<InboxMessage>>(backendRoutes.INBOX, { page, limit }),
		placeholderData: keepPreviousData,
	});
}
