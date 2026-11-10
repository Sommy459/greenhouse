"use client";

import clsx from "clsx";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { ListHeader } from "@/components/ListHeader";
import { useSession } from "@/features/auth/session";
import { useReplyToTicket, useTicket, useUpdateTicket } from "@/features/support/hooks";
import {
	CATEGORY_LABEL,
	PRIORITY_LABEL,
	STATUS_LABEL,
	STATUS_TONE,
	TICKET_PRIORITIES,
	TICKET_STATUSES,
	type TicketDetail,
	type TicketPriority,
	type TicketStatus,
} from "@/features/support/types";
import { errorMessage } from "@/lib/api/client";
import { consoleRoutes } from "@/lib/routes";

const CARD = "rounded-xl border border-grey-600 bg-white p-5 lg:p-6";
const SELECT = "h-11 w-full rounded-lg border border-grey-600 bg-white px-3 text-sm";
const when = (s: string) =>
	new Date(s).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** One ticket: the conversation, a reply (emailed to the requester), and its status, priority and owner. */
export function TicketView({ id }: { id: string }) {
	const { data: t, isPending, isError, error, refetch } = useTicket(id);
	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader
				title={t ? `${t.number} · ${t.subject}` : "Ticket"}
				crumb={t?.number ?? "Ticket"}
				parents={[{ label: "Support", href: consoleRoutes.SUPPORT }]}
			/>
			<div className="mt-6">
				{isError ? (
					<div className={clsx(CARD, "text-center text-sm text-grey-900")}>
						<p>{errorMessage(error, "Couldn't load this ticket.")}</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<Skeleton className="h-96 rounded-xl" />
				) : (
					<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
						<Conversation ticket={t} />
						<Side key={`${t.status}-${t.priority}-${t.assignedTo}`} ticket={t} />
					</div>
				)}
			</div>
		</div>
	);
}

function Conversation({ ticket: t }: { ticket: TicketDetail }) {
	const reply = useReplyToTicket(t.id);
	const [body, setBody] = useState("");
	const [then, setThen] = useState<"pending" | "resolved" | "open">("pending");
	const closed = t.status === "closed";

	return (
		<section className={clsx(CARD, "min-w-0")} aria-label="Conversation">
			<ol className="space-y-4">
				{t.messages.map((m) => (
					<li
						key={m.id}
						className={clsx(
							"max-w-[90%] rounded-lg p-4 text-sm",
							m.authorType === "staff" ? "ml-auto bg-primary-50 text-ink" : "bg-grey-500 text-ink",
						)}
					>
						<p className="text-xs text-grey-900">
							<strong className="font-semibold text-ink">{m.authorName}</strong>
							{m.authorType === "staff" ? " (Fysi)" : ""} · {when(m.createdAt)}
						</p>
						<p className="mt-1.5 whitespace-pre-line">{m.body}</p>
					</li>
				))}
			</ol>
			{closed ? (
				<p className="mt-6 text-sm text-grey-900">This ticket is closed. Reopen it to reply.</p>
			) : (
				<form
					noValidate
					className="mt-6 space-y-3 border-t border-grey-600 pt-5"
					onSubmit={(e) => {
						e.preventDefault();
						if (!body.trim()) return;
						reply.mutate({ body: body.trim(), status: then }, { onSuccess: () => setBody("") });
					}}
				>
					<Textarea
						value={body}
						onChange={(e) => setBody(e.target.value)}
						rows={4}
						aria-label="Reply"
						placeholder={`Reply to ${t.name} (emailed to ${t.email})`}
					/>
					<div className="flex flex-wrap items-center gap-3">
						<label className="flex items-center gap-2 text-sm text-ink">
							Then mark it
							<select
								value={then}
								onChange={(e) => setThen(e.target.value as typeof then)}
								className="h-10 rounded-lg border border-grey-600 bg-white px-2 text-sm"
							>
								<option value="pending">{STATUS_LABEL.pending}</option>
								<option value="resolved">{STATUS_LABEL.resolved}</option>
								<option value="open">{STATUS_LABEL.open}</option>
							</select>
						</label>
						<Button type="submit" disabled={!body.trim()} isLoading={reply.isPending} className="ml-auto h-11 rounded-lg px-6">
							Send reply
						</Button>
					</div>
				</form>
			)}
		</section>
	);
}

function Side({ ticket: t }: { ticket: TicketDetail }) {
	const me = useSession((s) => s.user);
	const update = useUpdateTicket(t.id);
	const rows: [string, React.ReactNode][] = [
		["From", `${t.name} · ${t.email}`],
		["Account", t.userRole ?? "No account"],
		["Topic", CATEGORY_LABEL[t.category]],
		["Order", t.orderNumber],
		["Opened", when(t.createdAt)],
		["Resolved", t.resolvedAt ? when(t.resolvedAt) : null],
	];
	return (
		<aside className={clsx(CARD, "h-fit space-y-5")} aria-label="Ticket">
			<span className={clsx("rounded-full px-3 py-1 text-xs font-medium", STATUS_TONE[t.status])}>{STATUS_LABEL[t.status]}</span>
			<dl className="space-y-2 text-sm">
				{rows.map(([k, v]) => (
					<div key={k} className="grid grid-cols-[90px_minmax(0,1fr)] gap-2">
						<dt className="text-grey-900">{k}</dt>
						<dd className="break-words text-ink">{v || "—"}</dd>
					</div>
				))}
			</dl>
			<label className="grid gap-1.5 text-sm font-medium text-ink">
				Status
				<select
					value={t.status}
					disabled={update.isPending}
					onChange={(e) => update.mutate({ status: e.target.value as TicketStatus })}
					className={SELECT}
				>
					{TICKET_STATUSES.map((s) => (
						<option key={s} value={s}>
							{STATUS_LABEL[s]}
						</option>
					))}
				</select>
			</label>
			<label className="grid gap-1.5 text-sm font-medium text-ink">
				Priority
				<select
					value={t.priority}
					disabled={update.isPending}
					onChange={(e) => update.mutate({ priority: e.target.value as TicketPriority })}
					className={SELECT}
				>
					{TICKET_PRIORITIES.map((p) => (
						<option key={p} value={p}>
							{PRIORITY_LABEL[p]}
						</option>
					))}
				</select>
			</label>
			<div className="text-sm">
				<p className="font-medium text-ink">Assigned to</p>
				<p className="mt-1 text-grey-900">{t.assignedToName ?? "Nobody yet"}</p>
				<div className="mt-2 flex gap-2">
					{me && t.assignedTo !== me.id && (
						<Button variant="outline" size="sm" disabled={update.isPending} onClick={() => update.mutate({ assignedTo: me.id })}>
							Assign to me
						</Button>
					)}
					{t.assignedTo && (
						<Button variant="outline" size="sm" disabled={update.isPending} onClick={() => update.mutate({ assignedTo: null })}>
							Unassign
						</Button>
					)}
				</div>
			</div>
		</aside>
	);
}
