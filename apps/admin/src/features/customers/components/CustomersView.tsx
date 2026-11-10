"use client";

import clsx from "clsx";
import { useState } from "react";
import { Share } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { StatusFilter } from "@/components/StatusFilter";
import { CustomersTable } from "@/features/customers/components/CustomersTable";
import { useAdminCustomers, useExportCustomers } from "@/features/customers/hooks";
import { CUSTOMER_STATUSES, type CustomerStatus, type CustomerTab } from "@/features/customers/types";
import { count } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 8;
const TABS: { value: CustomerTab; label: string }[] = [
	{ value: "all", label: "All Customers" },
	{ value: "new", label: "New Customers" },
];
const STATUS_LABEL: Record<CustomerStatus, string> = { active: "Active", blocked: "Blocked" };

/** Figma admin "Customers" (A2): All / New tabs, search, status filter, the customer table and pages; Export is a CSV. */
export function CustomersView() {
	const { get, list, page, set } = useUrlParams();
	const tab: CustomerTab = get("tab") === "new" ? "new" : "all";
	const search = get("search");
	const statuses = list("status", CUSTOMER_STATUSES);
	const [selected, setSelected] = useState<Set<string>>(new Set());

	const filters = { tab: tab === "all" ? undefined : tab, search: search || undefined, status: statuses.join(",") || undefined };
	const { data, isPending, isError, isFetching, refetch } = useAdminCustomers({ ...filters, page, limit: PAGE_SIZE });
	// The "All Customers" count: everyone, whatever the tab, search or filter.
	const everyone = useAdminCustomers({ page: 1, limit: 1 });
	const exportCustomers = useExportCustomers();
	const customers = data?.items ?? [];
	const filtered = !!(search || statuses.length);

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Customers" crumb="Customer List">
				<Button
					type="button"
					size="sm"
					isLoading={exportCustomers.isPending}
					onClick={() => exportCustomers.mutate(selected.size > 0 ? { ids: [...selected].join(",") } : filters)}
					className="h-12 rounded-lg px-5"
					title={selected.size > 0 ? "Export the ticked customers" : "Export every customer in this list"}
				>
					<Share className="size-5" aria-hidden />
					{selected.size > 0 ? `Export ${selected.size}` : "Export"}
				</Button>
			</ListHeader>

			<div
				className="animate-rise mt-8 flex flex-wrap items-end justify-between gap-4 lg:mt-14"
				style={{ "--i": 2 } as React.CSSProperties}
			>
				<div role="tablist" aria-label="Customers" className="flex border-b border-grey-600">
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
						placeholder="search customers"
						label="Search customers by name, e-mail or phone"
						className="sm:w-[300px] lg:w-[380px]"
					/>
					<StatusFilter
						id="customer-status"
						options={CUSTOMER_STATUSES}
						labels={STATUS_LABEL}
						value={statuses}
						onChange={(next) => set({ status: next.join(",") || undefined })}
					/>
				</div>
			</div>

			<div className={clsx("mt-8 transition-opacity lg:mt-12", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-lg border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load customers.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && customers.length === 0 ? (
					<div className="rounded-lg border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>
							{filtered ? "No customers match." : tab === "new" ? "No new customers in the last 30 days." : "No customers yet."}
						</p>
						{filtered && (
							<Button variant="outline" size="sm" onClick={() => set({ search: undefined, status: undefined })} className="mt-4">
								Clear search and filter
							</Button>
						)}
					</div>
				) : (
					<>
						<CustomersTable
							customers={customers}
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
