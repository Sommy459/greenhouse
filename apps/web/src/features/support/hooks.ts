"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { ISSUE_TYPES, RESOLUTIONS, type ReportValues } from "@/features/support/report";
import type { Ticket, TicketSummary } from "@/features/support/types";

const KEY = ["support", "tickets"];
const label = (list: readonly { value: string; label: string }[], value: string) =>
	list.find((o) => o.value === value)?.label ?? value;

/**
 * Report a Product / Problem (C13) → a support ticket (POST /support/tickets). Guests send their name and email; signed-in
 * customers' come from the account. Not retried (it would file the report twice).
 */
export function useSubmitReport({ onSent }: { onSent: (ticket: Ticket) => void }) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (v: ReportValues) => {
			const message = [
				v.description,
				`Preferred resolution: ${label(RESOLUTIONS, v.preferred_resolution)}`,
				v.product_name && `Product: ${v.product_name}`,
				v.comments && `Comments: ${v.comments}`,
			]
				.filter(Boolean)
				.join("\n\n");
			return (
				await api.post(backendRoutes.TICKETS, {
					category: v.order_number ? "order" : "product",
					subject: `${label(ISSUE_TYPES, v.issue_type)}${v.product_name ? `: ${v.product_name}` : ""}`.slice(0, 150),
					message,
					orderNumber: v.order_number || undefined,
					name: v.name,
					email: v.email,
				})
			).data.data as Ticket;
		},
		retry: false,
		onSuccess: (ticket) => {
			queryClient.invalidateQueries({ queryKey: KEY });
			onSent(ticket);
		},
		onError: (error) => toast.error(errorMessage(error, "We couldn't send your report. Please try again.")),
	});
}

/** The customer's support requests, newest first. */
export function useTickets(page: number) {
	return useQuery({
		queryKey: [...KEY, page],
		queryFn: () => getPage<TicketSummary>(backendRoutes.TICKETS, { page, limit: 10 }),
		placeholderData: keepPreviousData,
	});
}

export function useTicket(id: string) {
	return useQuery({ queryKey: [...KEY, "detail", id], queryFn: () => getData<Ticket>(backendRoutes.TICKET(id)) });
}

function useTicketAction<V>(id: string, request: (vars: V) => Promise<Ticket>, fallback: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		retry: false,
		onSuccess: (ticket) => {
			queryClient.setQueryData([...KEY, "detail", id], ticket);
			queryClient.invalidateQueries({ queryKey: [...KEY] });
		},
		onError: (error) => toast.error(errorMessage(error, fallback)),
	});
}

export function useReplyToTicket(id: string) {
	return useTicketAction(
		id,
		async (body: string) => (await api.post(backendRoutes.TICKET_MESSAGES(id), { body })).data.data as Ticket,
		"Couldn't send your reply. Try again.",
	);
}

export function useCloseTicket(id: string) {
	return useTicketAction(
		id,
		async () => (await api.post(backendRoutes.TICKET_CLOSE(id))).data.data as Ticket,
		"Couldn't close the request. Try again.",
	);
}
