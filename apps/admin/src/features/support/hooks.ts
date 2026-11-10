"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Ticket, TicketCategory, TicketDetail, TicketPriority, TicketStatus } from "@/features/support/types";

const KEY = ["admin", "tickets"];

export function useTickets(params: {
	status?: TicketStatus;
	category?: TicketCategory;
	priority?: TicketPriority;
	q?: string;
	page: number;
	limit: number;
}) {
	return useQuery({
		queryKey: [...KEY, "list", params],
		queryFn: () => getPage<Ticket>(backendRoutes.TICKETS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function useTicket(id: string) {
	return useQuery({ queryKey: [...KEY, id], queryFn: () => getData<TicketDetail>(backendRoutes.TICKET(id)) });
}

function useTicketMutation<V>(id: string, request: (vars: V) => Promise<TicketDetail>, success: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		retry: false,
		onSuccess: (ticket) => {
			queryClient.setQueryData([...KEY, id], ticket);
			queryClient.invalidateQueries({ queryKey: [...KEY, "list"] });
			toast.success(success);
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** Status, priority or who has it (`null` unassigns). */
export function useUpdateTicket(id: string) {
	return useTicketMutation(
		id,
		async (body: { status?: TicketStatus; priority?: TicketPriority; assignedTo?: string | null }) =>
			(await api.patch(backendRoutes.TICKET(id), body)).data.data as TicketDetail,
		"Ticket updated",
	);
}

/** Replies are emailed to the requester; the status can change in the same step. */
export function useReplyToTicket(id: string) {
	return useTicketMutation(
		id,
		async (body: { body: string; status?: "open" | "pending" | "resolved" }) =>
			(await api.post(backendRoutes.TICKET_MESSAGES(id), body)).data.data as TicketDetail,
		"Reply sent",
	);
}
