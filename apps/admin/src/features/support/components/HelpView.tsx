"use client";

import clsx from "clsx";
import { Share } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Pagination } from "@/components/Pagination";
import { StatusFilter } from "@/components/StatusFilter";
import { useExportTickets, useSupportTickets } from "@/features/support/hooks";
import { TICKET_STATUSES, type TicketStatus } from "@/features/support/types";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 8;
const STATUS_LABEL: Record<TicketStatus, string> = { open: "Open", in_progress: "In progress", resolved: "Resolved" };
const STATUS_TONE: Record<TicketStatus, string> = {
	open: "bg-warning-50 text-warning-700",
	in_progress: "bg-info-50 text-info-500",
	resolved: "bg-success-50 text-success-700",
};
const TH = "px-4 py-5 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-4 py-6 text-base text-ink";

/** Figma admin "Help": problem reports from customers (storefront Report a Problem), with a status filter and Export. */
export function HelpView() {
	const { list, page, set } = useUrlParams();
	const statuses = list("status", TICKET_STATUSES);
	const filters = { status: statuses.join(",") || undefined };
	const { data, isPending, isError, isFetching, refetch } = useSupportTickets({ ...filters, page, limit: PAGE_SIZE });
	const exportTickets = useExportTickets();
	const tickets = data?.items ?? [];

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<h1 className="animate-rise text-2xl font-medium text-ink lg:text-[28px]">Help</h1>
				<div className="animate-rise flex gap-3" style={{ "--i": 1 } as React.CSSProperties}>
					<StatusFilter
						id="ticket-status"
						options={TICKET_STATUSES}
						labels={STATUS_LABEL}
						value={statuses}
						onChange={(next) => set({ status: next.join(",") || undefined })}
					/>
					<Button
						type="button"
						size="sm"
						isLoading={exportTickets.isPending}
						onClick={() => exportTickets.mutate(filters)}
						className="h-12 rounded-lg px-5"
						title="Export these reports"
					>
						<Share className="size-5" aria-hidden />
						Export
					</Button>
				</div>
			</div>

			<div
				className={clsx("animate-rise mt-10 transition-opacity lg:mx-12 lg:mt-24", isFetching && !isPending && "opacity-60")}
				style={{ "--i": 2 } as React.CSSProperties}
			>
				{isError ? (
					<div className="rounded-lg bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load the reports.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && tickets.length === 0 ? (
					<div className="rounded-lg bg-white py-16 text-center text-sm text-grey-900">
						<p>{statuses.length ? "No reports match." : "No reports yet."}</p>
						{statuses.length > 0 && (
							<Button variant="outline" size="sm" onClick={() => set({ status: undefined })} className="mt-4">
								Clear filter
							</Button>
						)}
					</div>
				) : (
					<div className="overflow-hidden rounded-lg bg-white">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[860px]">
								<caption className="sr-only">Customer problem reports</caption>
								<thead className="border-b border-grey-600">
									<tr>
										<th scope="col" className={clsx(TH, "pl-6 lg:pl-10")}>
											Product Id
										</th>
										<th scope="col" className={TH}>
											Customer Id
										</th>
										<th scope="col" className={TH}>
											Subject
										</th>
										<th scope="col" className={TH}>
											Status
										</th>
										<th scope="col" className={clsx(TH, "pr-6")}>
											Item category
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: PAGE_SIZE }, (_, i) => (
												<tr key={i}>
													<td colSpan={5} className="px-6 py-4">
														<Skeleton className="h-12 w-full" />
													</td>
												</tr>
											))
										: tickets.map((t, i) => (
												<tr
													key={t.id}
													className="animate-rise transition-colors hover:bg-grey-500"
													style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
												>
													<td className={clsx(TD, "pl-6 font-medium whitespace-nowrap lg:pl-10")}>{t.product_code ?? "—"}</td>
													<td className={clsx(TD, "font-medium whitespace-nowrap")}>{t.customer_code}</td>
													<td className={clsx(TD, "max-w-[300px] font-medium")}>{t.subject}</td>
													<td className={clsx(TD, "whitespace-nowrap")}>
														<span className={clsx("rounded-full px-4 py-1.5 text-base font-medium", STATUS_TONE[t.status])}>
															{STATUS_LABEL[t.status]}
														</span>
													</td>
													<td className={clsx(TD, "pr-6 whitespace-nowrap text-grey-900")}>{t.category ?? "—"}</td>
												</tr>
											))}
								</tbody>
							</table>
						</div>
						{data && data.meta.total_pages > 1 && (
							<div className="border-t border-grey-600">
								<Pagination
									page={data.meta.page}
									totalPages={data.meta.total_pages}
									onChange={(n) => set({ page: n > 1 ? String(n) : undefined })}
								/>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
