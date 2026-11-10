"use client";

import clsx from "clsx";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ExportButton } from "@/components/ExportButton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import {
	AUDIENCE_LABEL,
	CAMPAIGN_STATUS_LABEL,
	CAMPAIGN_STATUS_TONE,
	CAMPAIGN_STATUSES,
	useCampaigns,
	useSubscribers,
	type CampaignStatus,
} from "@/features/newsletter/hooks";
import { count } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 15;
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-4 text-sm text-ink";
const day = (s: string) => new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Newsletter: who's subscribed (from the storefront footer), and email campaigns to them or to accounts. */
export function NewsletterView() {
	const { get, set } = useUrlParams();
	const tab = get("tab") === "campaigns" ? "campaigns" : "subscribers";
	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Newsletter" crumb="Newsletter">
				{tab === "subscribers" ? (
					<ExportButton kind="newsletter" />
				) : (
					<Button asChild className="h-12 gap-2 rounded-lg px-5">
						<Link href={consoleRoutes.NEW_CAMPAIGN}>
							<Plus className="size-5" aria-hidden /> New campaign
						</Link>
					</Button>
				)}
			</ListHeader>
			<div role="tablist" aria-label="Newsletter" className="mt-8 flex border-b border-grey-600">
				{(["subscribers", "campaigns"] as const).map((t) => (
					<button
						key={t}
						type="button"
						role="tab"
						aria-selected={tab === t}
						onClick={() => set({ tab: t === "subscribers" ? undefined : t })}
						className={clsx(
							"-mb-px border-b-2 px-5 pb-3 text-base capitalize transition-colors",
							tab === t ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
						)}
					>
						{t}
					</button>
				))}
			</div>
			{tab === "subscribers" ? <Subscribers /> : <Campaigns />}
		</div>
	);
}

function Failed({ what, retry }: { what: string; retry: () => void }) {
	return (
		<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
			<p>Couldn&apos;t load {what}.</p>
			<Button variant="outline" size="sm" onClick={retry} className="mt-4">
				Try again
			</Button>
		</div>
	);
}

function Subscribers() {
	const { get, page, set } = useUrlParams();
	const status = (["subscribed", "unsubscribed"] as const).find((s) => s === get("status"));
	const q = get("search");
	const { data, isPending, isError, isFetching, refetch } = useSubscribers({ status, q: q || undefined, page, limit: PAGE_SIZE });
	const rows = data?.items ?? [];

	return (
		<>
			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchBox
					value={q}
					onChange={(v) => set({ search: v || undefined })}
					placeholder="search by email"
					label="Search subscribers"
					className="w-full sm:w-[380px]"
				/>
				<select
					value={status ?? ""}
					onChange={(e) => set({ status: e.target.value || undefined })}
					aria-label="Status"
					className="h-11 rounded-lg border border-grey-600 bg-white px-3 text-sm"
				>
					<option value="">Everyone</option>
					<option value="subscribed">Subscribed</option>
					<option value="unsubscribed">Unsubscribed</option>
				</select>
				{data && <span className="text-sm text-grey-900">{count(data.meta.total)} in total</span>}
			</div>
			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<Failed what="subscribers" retry={() => refetch()} />
				) : !isPending && rows.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						No subscribers here.
					</p>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[720px]">
								<thead className="bg-grey-500">
									<tr>
										{["Email", "Status", "Signed up from", "Has an account", "Subscribed"].map((h, i) => (
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
													<td colSpan={5} className="px-5 py-3">
														<Skeleton className="h-6 w-full" />
													</td>
												</tr>
											))
										: rows.map((s) => (
												<tr key={s.id}>
													<td className={clsx(TD, "pl-5")}>{s.email}</td>
													<td className={TD}>
														<span
															className={clsx(
																"rounded-full px-3 py-1 text-xs font-medium",
																s.status === "subscribed" ? "bg-success-50 text-success-700" : "bg-grey-500 text-grey-900",
															)}
														>
															{s.status === "subscribed"
																? "Subscribed"
																: `Unsubscribed${s.unsubscribedAt ? ` ${day(s.unsubscribedAt)}` : ""}`}
														</span>
													</td>
													<td className={TD}>{s.source ?? "—"}</td>
													<td className={TD}>{s.hasAccount ? "Yes" : "No"}</td>
													<td className={clsx(TD, "whitespace-nowrap")}>{day(s.subscribedAt)}</td>
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
		</>
	);
}

function Campaigns() {
	const { get, page, set } = useUrlParams();
	const status = CAMPAIGN_STATUSES.find((s) => s === get("status")) as CampaignStatus | undefined;
	const { data, isPending, isError, isFetching, refetch } = useCampaigns({ status, page, limit: PAGE_SIZE });
	const rows = data?.items ?? [];

	return (
		<>
			<div className="mt-6">
				<select
					value={status ?? ""}
					onChange={(e) => set({ status: e.target.value || undefined })}
					aria-label="Status"
					className="h-11 rounded-lg border border-grey-600 bg-white px-3 text-sm"
				>
					<option value="">Every campaign</option>
					{CAMPAIGN_STATUSES.map((s) => (
						<option key={s} value={s}>
							{CAMPAIGN_STATUS_LABEL[s]}
						</option>
					))}
				</select>
			</div>
			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<Failed what="campaigns" retry={() => refetch()} />
				) : !isPending && rows.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">No campaigns yet.</p>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[820px]">
								<thead className="bg-grey-500">
									<tr>
										{["Campaign", "Audience", "Status", "Sent", "Failed", "When"].map((h, i) => (
											<th key={h} scope="col" className={clsx(TH, i === 0 && "pl-5")}>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: 4 }, (_, i) => (
												<tr key={i}>
													<td colSpan={6} className="px-5 py-3">
														<Skeleton className="h-6 w-full" />
													</td>
												</tr>
											))
										: rows.map((c) => (
												<tr key={c.id} className="hover:bg-grey-500">
													<td className={clsx(TD, "max-w-80 pl-5")}>
														<Link href={consoleRoutes.CAMPAIGN(c.id)} className="block hover:text-primary-500">
															<span className="block truncate font-medium">{c.name}</span>
															<span className="block truncate text-xs text-grey-800">{c.subject}</span>
														</Link>
													</td>
													<td className={TD}>{AUDIENCE_LABEL[c.audience]}</td>
													<td className={TD}>
														<span className={clsx("rounded-full px-3 py-1 text-xs font-medium", CAMPAIGN_STATUS_TONE[c.status])}>
															{CAMPAIGN_STATUS_LABEL[c.status]}
														</span>
													</td>
													<td className={TD}>
														{c.status === "draft" ? "—" : `${count(c.sentCount)} of ${count(c.recipientCount)}`}
													</td>
													<td className={TD}>{c.failedCount ? count(c.failedCount) : "—"}</td>
													<td className={clsx(TD, "whitespace-nowrap")}>
														{c.sentAt
															? day(c.sentAt)
															: c.scheduledAt
																? `For ${day(c.scheduledAt)}`
																: `Edited ${day(c.updatedAt)}`}
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
		</>
	);
}
