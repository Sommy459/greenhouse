"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { errorMessage, getData } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Paginated } from "@/features/products/types";
import type { SupportTicket, TicketListParams } from "@/features/support/types";

/** Figma "Help": customer problem reports, newest first. */
export function useSupportTickets(params: TicketListParams) {
	return useQuery({
		queryKey: ["admin", "support", params],
		queryFn: () => getData<Paginated<SupportTicket>>(backendRoutes.SUPPORT_TICKETS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** "Export": the reports matching the filter, as a CSV. */
export function useExportTickets() {
	const toast = useToast();
	return useMutation({
		mutationFn: (params: Omit<TicketListParams, "page" | "limit">) =>
			downloadCsv(backendRoutes.SUPPORT_TICKETS_EXPORT, params, "fysi-support"),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't export the reports. Try again.")),
	});
}
