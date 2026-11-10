"use client";

import clsx from "clsx";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ExportButton } from "@/components/ExportButton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { useAdminVendors } from "@/features/vendors/hooks";
import { day, VENDOR_STATUS_LABEL, VENDOR_STATUS_TONE, waited } from "@/features/vendors/options";
import { VENDOR_STATUSES, type VendorStatus } from "@/features/vendors/types";
import { count } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 10;
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-4 text-sm text-ink";

/** PRD A1–A2: the verification queue (Pending, how long each has waited) and every vendor by status, with search. */
export function VendorsView() {
	const { get, page, set } = useUrlParams();
	const status = (VENDOR_STATUSES as readonly string[]).includes(get("status")) ? (get("status") as VendorStatus) : undefined;
	const q = get("search");
	const { data, isPending, isError, isFetching, refetch } = useAdminVendors({
		status,
		q: q || undefined,
		page,
		limit: PAGE_SIZE,
	});
	const queue = useAdminVendors({ status: "pending", page: 1, limit: 1 });
	const vendors = data?.items ?? [];

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Vendors" crumb="Vendors">
				<div className="flex flex-wrap gap-3">
					<ExportButton kind="vendors" />
				</div>
			</ListHeader>

			<div className="mt-8 flex flex-wrap items-end justify-between gap-4">
				<div
					role="tablist"
					aria-label="Vendor status"
					className="hide-scroll flex max-w-full overflow-x-auto border-b border-grey-600"
				>
					{([undefined, ...VENDOR_STATUSES] as (VendorStatus | undefined)[]).map((s) => (
						<button
							key={s ?? "all"}
							type="button"
							role="tab"
							aria-selected={status === s}
							onClick={() => set({ status: s })}
							className={clsx(
								"-mb-px flex shrink-0 items-center gap-2 border-b-2 px-5 pb-3 text-base transition-colors",
								status === s ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
							)}
						>
							{s ? VENDOR_STATUS_LABEL[s] : "All"}
							{s === "pending" && !!queue.data?.meta.total && (
								<span className="rounded-full bg-warning-700 px-2 py-px text-xs font-medium text-white">
									{count(queue.data.meta.total)}
								</span>
							)}
						</button>
					))}
				</div>
				<SearchBox
					value={q}
					onChange={(v) => set({ search: v || undefined })}
					placeholder="Shop, owner or email"
					label="Search vendors"
					className="w-full sm:w-80"
				/>
			</div>

			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load vendors.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && vendors.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						{status === "pending" ? "The queue is empty. Nicely done." : "No vendors here."}
					</p>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[900px]">
								<thead className="border-b border-grey-600 bg-grey-500">
									<tr>
										{["Shop", "Owner", "Category", "Location", "Status", "Submitted", ""].map((h, i) => (
											<th key={h || i} scope="col" className={clsx(TH, i === 0 && "pl-6")}>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: 5 }, (_, i) => (
												<tr key={i}>
													<td colSpan={7} className="px-6 py-3">
														<Skeleton className="h-10 w-full" />
													</td>
												</tr>
											))
										: vendors.map((v) => (
												<tr key={v.id} className="hover:bg-grey-500">
													<td className={clsx(TD, "pl-6 font-semibold")}>{v.businessName ?? "—"}</td>
													<td className={TD}>
														{v.ownerName}
														<span className="block text-xs text-grey-800">{v.email}</span>
													</td>
													<td className={TD}>{v.categoryName ?? "—"}</td>
													<td className={TD}>{[v.city, v.state].filter(Boolean).join(", ") || "—"}</td>
													<td className={TD}>
														<span
															className={clsx(
																"rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
																VENDOR_STATUS_TONE[v.status],
															)}
														>
															{VENDOR_STATUS_LABEL[v.status]}
														</span>
														{v.submissionCount > 1 && <span className="ml-2 text-xs text-grey-800">#{v.submissionCount}</span>}
													</td>
													<td className={clsx(TD, "whitespace-nowrap")}>
														{v.submittedAt ? day(v.submittedAt) : "—"}
														{v.status === "pending" && v.waitingHours != null && (
															<span
																className={clsx(
																	"block text-xs",
																	v.waitingHours > 48 ? "font-medium text-error-500" : "text-grey-800",
																)}
															>
																waiting {waited(v.waitingHours)}
															</span>
														)}
													</td>
													<td className="py-4 pr-6 pl-3 text-right">
														<Link
															href={consoleRoutes.VENDOR(v.id)}
															className="text-sm font-medium text-primary-500 hover:underline"
														>
															{v.status === "pending" ? "Review" : "View"}
														</Link>
													</td>
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
