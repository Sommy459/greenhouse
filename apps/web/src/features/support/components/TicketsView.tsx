"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { ListingPagination } from "@/features/catalog/components/ListingPagination";
import { useCloseTicket, useReplyToTicket, useTicket, useTickets } from "@/features/support/hooks";
import { TICKET_STATUS_LABEL, TICKET_STATUS_TONE } from "@/features/support/types";
import { errorMessage } from "@/lib/api/client";
import { accountRoutes, supportRoutes } from "@/lib/routes";

const when = (iso: string) =>
	new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** The customer's support requests (from Report a Problem / contact), newest first. */
export function TicketsView() {
	const [page, setPage] = useState(1);
	const { data, isPending, isError, refetch } = useTickets(page);
	const tickets = data?.items ?? [];

	return (
		<div className="pb-6 lg:pb-16">
			<Link href={accountRoutes.DASHBOARD} className="inline-flex items-center gap-3 text-lg text-ink lg:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				<span>Support</span>
			</Link>
			<div className="mt-6 flex flex-wrap items-center justify-between gap-3 lg:mt-0">
				<h1 className="text-2xl text-ink lg:text-[28px]">My requests</h1>
				<Button asChild className="gap-2">
					<Link href={supportRoutes.REPORT}>
						<Plus className="size-4" aria-hidden /> New request
					</Link>
				</Button>
			</div>
			<div className="mt-6">
				{isError ? (
					<div className="rounded-md bg-white py-16 text-center text-sm text-grey-900">
						<p>We couldn&apos;t load your requests.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<Skeleton className="h-48 rounded-md" />
				) : tickets.length === 0 ? (
					<p className="rounded-md bg-white py-16 text-center text-base text-grey-900">
						No requests yet. Need help? Start one above.
					</p>
				) : (
					<ul className="divide-y divide-grey-600 rounded-md border border-grey-600 bg-white">
						{tickets.map((t) => (
							<li key={t.id}>
								<Link
									href={accountRoutes.SUPPORT_TICKET(t.id)}
									className="flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-grey-500"
								>
									<span className="min-w-0 flex-1">
										<span className="block truncate font-medium text-ink">{t.subject}</span>
										<span className="text-xs text-grey-800">
											{t.number}
											{t.orderNumber && ` · order ${t.orderNumber}`} · updated {when(t.lastMessageAt)}
										</span>
									</span>
									<span className={clsx("rounded-full px-3 py-1 text-xs font-medium", TICKET_STATUS_TONE[t.status])}>
										{TICKET_STATUS_LABEL[t.status]}
									</span>
								</Link>
							</li>
						))}
					</ul>
				)}
				{data && data.meta.total_pages > 1 && (
					<div className="mt-6">
						<ListingPagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={setPage} />
					</div>
				)}
			</div>
		</div>
	);
}

/** One request: the conversation with Fysi's team, reply, and close it once sorted. */
export function TicketView({ id }: { id: string }) {
	const { data: ticket, isPending, isError, error, refetch } = useTicket(id);
	const reply = useReplyToTicket(id);
	const close = useCloseTicket(id);
	const [body, setBody] = useState("");

	return (
		<div className="pb-6 lg:pb-16">
			<Link href={accountRoutes.SUPPORT} className="inline-flex items-center gap-3 text-lg text-ink hover:text-primary-500">
				<ChevronLeft className="size-6" aria-hidden />
				<span>My requests</span>
			</Link>
			{isError ? (
				<div className="mt-6 rounded-md bg-white py-16 text-center text-sm text-grey-900">
					<p>{errorMessage(error, "We couldn't load this request.")}</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : isPending ? (
				<Skeleton className="mt-6 h-64 rounded-md" />
			) : (
				<>
					<div className="mt-6 flex flex-wrap items-start justify-between gap-3">
						<div>
							<h1 className="text-2xl text-ink">{ticket.subject}</h1>
							<p className="text-sm text-grey-900">
								{ticket.number}
								{ticket.orderNumber && ` · order ${ticket.orderNumber}`} · opened {when(ticket.createdAt)}
							</p>
						</div>
						<span className={clsx("rounded-full px-3 py-1 text-xs font-medium", TICKET_STATUS_TONE[ticket.status])}>
							{TICKET_STATUS_LABEL[ticket.status]}
						</span>
					</div>
					<ol className="mt-6 space-y-4">
						{ticket.messages.map((m) => (
							<li
								key={m.id}
								className={clsx(
									"max-w-[85%] rounded-lg p-4 text-sm",
									m.authorType === "staff"
										? "border border-primary-500 bg-primary-50"
										: "ml-auto border border-grey-600 bg-white",
								)}
							>
								<p className="text-xs text-grey-800">
									{m.authorType === "staff" ? `${m.authorName} · Fysi` : "You"} · {when(m.createdAt)}
								</p>
								<p className="mt-1 whitespace-pre-line text-ink">{m.body}</p>
							</li>
						))}
					</ol>
					{ticket.canReply && (
						<form
							noValidate
							className="mt-6 rounded-md border border-grey-600 bg-white p-4"
							onSubmit={(e) => {
								e.preventDefault();
								if (body.trim()) reply.mutate(body.trim(), { onSuccess: () => setBody("") });
							}}
						>
							<label htmlFor="ticket-reply" className="text-sm font-medium text-ink">
								Reply
							</label>
							<Textarea id="ticket-reply" value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="mt-1.5" />
							<div className="mt-3 flex flex-wrap justify-between gap-2">
								{ticket.status !== "closed" ? (
									<Button type="button" variant="outline" onClick={() => close.mutate(undefined)} isLoading={close.isPending}>
										It&apos;s sorted: close request
									</Button>
								) : (
									<span />
								)}
								<Button type="submit" isLoading={reply.isPending} disabled={!body.trim()}>
									Send reply
								</Button>
							</div>
						</form>
					)}
				</>
			)}
		</div>
	);
}
