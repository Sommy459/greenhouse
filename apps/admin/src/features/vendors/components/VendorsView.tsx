"use client";

import clsx from "clsx";
import { useState } from "react";
import { Share } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { StatusFilter } from "@/components/StatusFilter";
import { VendorsTable } from "@/features/vendors/components/VendorsTable";
import { useAdminVendors, useExportVendors } from "@/features/vendors/hooks";
import { VENDOR_STATUS_LABEL } from "@/features/vendors/options";
import { VENDOR_STATUSES, type VendorTab } from "@/features/vendors/types";
import { count } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 8;
const TABS: { value: VendorTab; label: string }[] = [
	{ value: "all", label: "All Vendors" },
	{ value: "new", label: "New Vendors" },
];

/**
 * Figma admin "Vendors" (A1, A6): All / New tabs, search, status filter, the vendor table and pages; Export is a CSV.
 * Filtering on "Pending" gives the verification queue.
 */
export function VendorsView() {
	const { get, list, page, set } = useUrlParams();
	const tab: VendorTab = get("tab") === "new" ? "new" : "all";
	const search = get("search");
	const statuses = list("status", VENDOR_STATUSES);
	const [selected, setSelected] = useState<Set<string>>(new Set());

	const filters = { tab: tab === "all" ? undefined : tab, search: search || undefined, status: statuses.join(",") || undefined };
	const { data, isPending, isError, isFetching, refetch } = useAdminVendors({ ...filters, page, limit: PAGE_SIZE });
	// The "All Vendors" count: every vendor, whatever the tab, search or filter.
	const everyone = useAdminVendors({ page: 1, limit: 1 });
	const exportVendors = useExportVendors();
	const vendors = data?.items ?? [];
	const filtered = !!(search || statuses.length);

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Vendors" crumb="Vendors List">
				<Button
					type="button"
					size="sm"
					isLoading={exportVendors.isPending}
					onClick={() => exportVendors.mutate(selected.size > 0 ? { ids: [...selected].join(",") } : filters)}
					className="h-12 rounded-lg px-5"
					title={selected.size > 0 ? "Export the ticked vendors" : "Export every vendor in this list"}
				>
					<Share className="size-5" aria-hidden />
					{selected.size > 0 ? `Export ${selected.size}` : "Export"}
				</Button>
			</ListHeader>

			<div
				className="animate-rise mt-8 flex flex-wrap items-end justify-between gap-4 lg:mt-14"
				style={{ "--i": 2 } as React.CSSProperties}
			>
				<div role="tablist" aria-label="Vendors" className="flex border-b border-grey-600">
					{TABS.map((t) => (
						<button
							key={t.value}
							type="button"
							role="tab"
							aria-selected={tab === t.value}
							onClick={() => set({ tab: t.value === "all" ? undefined : t.value })}
							className={clsx(
								"-mb-px flex items-center gap-2 border-b-2 px-5 pb-3 text-base transition-colors lg:px-6",
								tab === t.value ? "border-primary-500 text-primary-500" : "border-transparent text-ink hover:text-primary-500",
							)}
						>
							{t.label}
							{t.value === "all" && everyone.data && (
								<span className="rounded-full bg-primary-500 px-2 py-px text-xs font-medium text-white">
									{count(everyone.data.meta.total)}
								</span>
							)}
						</button>
					))}
				</div>

				<div className="flex w-full gap-3 sm:w-auto lg:gap-6">
					<SearchBox
						value={search}
						onChange={(value) => set({ search: value || undefined })}
						placeholder="search vendors"
						label="Search vendors by shop, name or e-mail"
						className="sm:w-[300px] lg:w-[380px]"
					/>
					<StatusFilter
						id="vendor-status"
						options={VENDOR_STATUSES}
						labels={VENDOR_STATUS_LABEL}
						value={statuses}
						onChange={(next) => set({ status: next.join(",") || undefined })}
					/>
				</div>
			</div>

			<div className={clsx("mt-8 transition-opacity lg:mt-12", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-lg border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load vendors.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && vendors.length === 0 ? (
					<div className="rounded-lg border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>{filtered ? "No vendors match." : tab === "new" ? "No new vendors in the last 30 days." : "No vendors yet."}</p>
						{filtered && (
							<Button variant="outline" size="sm" onClick={() => set({ search: undefined, status: undefined })} className="mt-4">
								Clear search and filter
							</Button>
						)}
					</div>
				) : (
					<>
						<VendorsTable
							vendors={vendors}
							loading={isPending}
							rows={PAGE_SIZE}
							selected={selected}
							onSelectedChange={setSelected}
						/>
						{data && (
							<div className="rounded-b-lg border border-t-0 border-grey-600">
								<Pagination
									page={data.meta.page}
									totalPages={data.meta.total_pages}
									onChange={(n) => set({ page: n > 1 ? String(n) : undefined })}
								/>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
