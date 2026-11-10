"use client";

import clsx from "clsx";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

/** A row of GET /audit-logs (append-only). */
interface AuditEntry {
	id: number;
	at: string;
	actorId: string | null;
	action: string;
	resourceType: string | null;
	resourceId: string | null;
	requestId: string | null;
	traceId: string | null;
	ip: string | null;
	metadata: unknown;
	before: unknown;
	after: unknown;
}

const PAGE_SIZE = 25;
const when = (iso: string) =>
	new Date(iso).toLocaleString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
const hasData = (v: unknown) => v != null && !(typeof v === "object" && Object.keys(v as object).length === 0);

/**
 * The audit log (PRD A3): every admin action and sensitive change (logins, profile changes, orders, payments,
 * withdrawals, admin actions), newest first, filtered by category, resource and dates. Entries can't be edited.
 */
export function AuditView() {
	const { get, page, set } = useUrlParams();
	const params = {
		category: get("category") || undefined,
		resourceType: get("type") || undefined,
		resourceId: get("id") || undefined,
		from: get("from") || undefined,
		to: get("to") || undefined,
		page,
		limit: PAGE_SIZE,
	};
	const { data, isPending, isError, isFetching, refetch } = useQuery({
		queryKey: ["admin", "audit", params],
		queryFn: () => getPage<AuditEntry>(backendRoutes.AUDIT_LOGS, params),
		placeholderData: keepPreviousData,
	});
	const rows = data?.items ?? [];
	const FIELD = "h-10 rounded-lg border border-grey-600 bg-white px-3 text-sm text-ink";

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Audit log" crumb="Audit log" />
			<form
				className="mt-8 flex flex-wrap items-end gap-3"
				onSubmit={(e) => {
					e.preventDefault();
					const f = new FormData(e.currentTarget);
					const v = (k: string) => String(f.get(k) ?? "").trim() || undefined;
					set({ category: v("category"), type: v("type"), id: v("id"), from: v("from"), to: v("to") });
				}}
			>
				<label className="grid gap-1 text-xs text-grey-900">
					Category
					<Input name="category" defaultValue={params.category} placeholder="e.g. auth, payments" className={FIELD} />
				</label>
				<label className="grid gap-1 text-xs text-grey-900">
					Resource type
					<Input name="type" defaultValue={params.resourceType} placeholder="e.g. vendor, order" className={FIELD} />
				</label>
				<label className="grid gap-1 text-xs text-grey-900">
					Resource ID
					<Input name="id" defaultValue={params.resourceId} className={FIELD} />
				</label>
				<label className="grid gap-1 text-xs text-grey-900">
					From
					<Input name="from" type="date" defaultValue={params.from} className={FIELD} />
				</label>
				<label className="grid gap-1 text-xs text-grey-900">
					To
					<Input name="to" type="date" defaultValue={params.to} className={FIELD} />
				</label>
				<Button type="submit" className="h-10">
					Filter
				</Button>
			</form>

			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load the audit log.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<Skeleton className="h-96 rounded-xl" />
				) : rows.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">No entries match.</p>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<ul className="divide-y divide-grey-600">
							{rows.map((r) => (
								<li key={r.id} className="px-6 py-3 text-sm">
									<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
										<span className="font-mono text-xs text-grey-800">{when(r.at)}</span>
										<span className="font-medium text-ink">{r.action}</span>
										{r.resourceType && (
											<span className="text-grey-900">
												{r.resourceType}
												{r.resourceId && <span className="font-mono text-xs"> {r.resourceId}</span>}
											</span>
										)}
										<span className="text-xs text-grey-800">
											{r.actorId ? `by ${r.actorId}` : "system"}
											{r.ip && ` · ${r.ip}`}
										</span>
									</div>
									{(hasData(r.metadata) || hasData(r.before) || hasData(r.after)) && (
										<details className="mt-1">
											<summary className="cursor-pointer text-xs text-primary-500">Details</summary>
											<pre className="mt-2 max-h-64 overflow-auto rounded-md bg-grey-500 p-3 text-xs text-ink">
												{JSON.stringify(
													{ metadata: r.metadata, before: r.before, after: r.after, requestId: r.requestId },
													null,
													2,
												)}
											</pre>
										</details>
									)}
								</li>
							))}
						</ul>
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
