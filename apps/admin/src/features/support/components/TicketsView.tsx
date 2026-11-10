"use client";

import clsx from "clsx";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ExportButton } from "@/components/ExportButton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { useTickets } from "@/features/support/hooks";
import {
	CATEGORY_LABEL,
	PRIORITY_LABEL,
	PRIORITY_TONE,
	STATUS_LABEL,
	STATUS_TONE,
	TICKET_CATEGORIES,
	TICKET_PRIORITIES,
	TICKET_STATUSES,
	type TicketCategory,
	type TicketPriority,
	type TicketStatus,
} from "@/features/support/types";
import { consoleRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 15;
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-4 text-sm text-ink";
const SELECT = "h-11 rounded-lg border border-grey-600 bg-white px-3 text-sm";
const when = (s: string) =>
	new Date(s).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Help desk (GET /admin/tickets): by status, category and priority, or search by number, subject or email. */
export function TicketsView() {
	const { get, page, set } = useUrlParams();
	const pickFrom = <T extends string>(list: readonly T[], key: string) => list.find((v) => v === get(key));
	const status = pickFrom<TicketStatus>(TICKET_STATUSES, "status");
	const category = pickFrom<TicketCategory>(TICKET_CATEGORIES, "category");
	const priority = pickFrom<TicketPriority>(TICKET_PRIORITIES, "priority");
	const q = get("search");
	const { data, isPending, isError, isFetching, refetch } = useTickets({
		status,
		category,
		priority,
		q: q || undefined,
		page,
		limit: PAGE_SIZE,
	});
	const tickets = data?.items ?? [];

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Support" crumb="Support">
				<ExportButton kind="tickets" />
			</ListHeader>

			<div
				role="tablist"
				aria-label="Ticket status"
				className="hide-scroll mt-8 flex w-fit max-w-full overflow-x-auto border-b border-grey-600"
			>
				{([undefined, ...TICKET_STATUSES] as (TicketStatus | undefined)[]).map((s) => (
					<button
						key={s ?? "all"}
						type="button"
						role="tab"
						aria-selected={status === s}
						onClick={() => set({ status: s })}
						className={clsx(
							"-mb-px shrink-0 border-b-2 px-6 pb-4 text-base transition-colors",
							status === s ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
						)}
					>
						{s ? STATUS_LABEL[s] : "All"}
					</button>
				))}
			</div>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchBox
					value={q}
					onChange={(v) => set({ search: v || undefined })}
					placeholder="search by number, subject or email"
					label="Search tickets"
					className="w-full sm:w-[380px]"
				/>
				<select
					value={category ?? ""}
					onChange={(e) => set({ category: e.target.value || undefined })}
					aria-label="Category"
					className={SELECT}
				>
					<option value="">All topics</option>
					{TICKET_CATEGORIES.map((c) => (
						<option key={c} value={c}>
							{CATEGORY_LABEL[c]}
						</option>
					))}
				</select>
				<select
					value={priority ?? ""}
					onChange={(e) => set({ priority: e.target.value || undefined })}
					aria-label="Priority"
					className={SELECT}
				>
					<option value="">Any priority</option>
					{TICKET_PRIORITIES.map((p) => (
						<option key={p} value={p}>
							{PRIORITY_LABEL[p]}
						</option>
					))}
				</select>
			</div>

			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load tickets.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && tickets.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">No tickets here.</p>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[900px]">
								<thead className="bg-grey-500">
									<tr>
										{["Ticket", "From", "Topic", "Priority", "Status", "Assigned", "Last message"].map((h, i) => (
											<th key={h} scope="col" className={clsx(TH, i === 0 && "pl-5")}>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: 5 }, (_, i) => (
												<tr key={i}>
													<td colSpan={7} className="px-5 py-3">
														<Skeleton className="h-8 w-full" />
													</td>
												</tr>
											))
										: tickets.map((t) => (
												<tr key={t.id} className="hover:bg-grey-500">
													<td className={clsx(TD, "max-w-80 pl-5")}>
														<Link href={consoleRoutes.TICKET(t.id)} className="block hover:text-primary-500">
															<span className="font-mono text-xs text-grey-800">{t.number}</span>
															<span className="block truncate font-medium">{t.subject}</span>
														</Link>
													</td>
													<td className={TD}>
														{t.name}
														<span className="block text-xs text-grey-800">{t.email}</span>
													</td>
													<td className={TD}>{CATEGORY_LABEL[t.category]}</td>
													<td className={clsx(TD, PRIORITY_TONE[t.priority])}>{PRIORITY_LABEL[t.priority]}</td>
													<td className={TD}>
														<span
															className={clsx(
																"rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
																STATUS_TONE[t.status],
															)}
														>
															{STATUS_LABEL[t.status]}
														</span>
													</td>
													<td className={TD}>{t.assignedToName ?? "—"}</td>
													<td className={clsx(TD, "whitespace-nowrap")}>
														{when(t.lastMessageAt)}
														<span className="block text-xs text-grey-800">
															{t.messageCount} message{t.messageCount === 1 ? "" : "s"}
														</span>
													</td>
												</tr>
											))}
								</tbody>
							</table>
						</div>
						{data && data.meta.total_pages > 1 && (
							<div className="border-t border-grey-600">
								<Pagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={(p) => set({ page: String(p) })} />
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
