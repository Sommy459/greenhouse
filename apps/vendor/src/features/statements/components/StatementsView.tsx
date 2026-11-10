"use client";

import clsx from "clsx";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Pagination } from "@/components/Pagination";
import { StatementDialog } from "@/features/statements/components/StatementDialog";
import { useDownloadExport, useRequestExport, useStatementExports, useStatements } from "@/features/statements/hooks";
import { money, periodLabel, STATUS_LABEL, STATUS_TONE } from "@/features/statements/options";
import { STATEMENT_STATUSES, type Currency, type StatementStatus } from "@/features/statements/types";
import { count } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 5;
const CURRENCIES: { value: Currency; label: string }[] = [
	{ value: "usdc", label: "USDC" },
	{ value: "ngn", label: "NGN" },
];
const TH = "px-4 py-5 text-left text-sm font-medium whitespace-nowrap text-ink lg:px-9";
const TD = "px-4 py-6 text-base whitespace-nowrap text-ink lg:px-9";
const stamp = (iso: string) =>
	new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Figma Vendor Hub "Account Statements" (PRD V5): settlement periods by status, each payout in NGN or USDC, View Details;
 * Export Transactions builds a file in the background, listed under Transaction Exports.
 */
export function StatementsView() {
	const { get, page, set } = useUrlParams();
	const status = (STATEMENT_STATUSES as readonly string[]).includes(get("status"))
		? (get("status") as StatementStatus)
		: undefined;
	const currency: Currency = get("currency") === "usdc" ? "usdc" : "ngn";
	const exportsPage = Math.max(1, Number(get("exports")) || 1);

	const { data, isPending, isError, isFetching, refetch } = useStatements({ status, page, limit: PAGE_SIZE });
	const everything = useStatements({ page: 1, limit: 1 });
	const exports = useStatementExports(exportsPage);
	const requestExport = useRequestExport();
	const download = useDownloadExport();
	const [viewing, setViewing] = useState<string | null>(null);
	const statements = data?.items ?? [];

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<h1 className="animate-rise text-2xl font-medium text-ink lg:text-[28px]">Account Statements</h1>
				<Button
					type="button"
					isLoading={requestExport.isPending}
					onClick={() => requestExport.mutate(currency)}
					className="animate-rise h-12 rounded-lg px-5"
					style={{ "--i": 1 } as React.CSSProperties}
				>
					Export Transactions
				</Button>
			</div>

			<div
				className="animate-rise mt-8 flex flex-wrap items-end justify-between gap-4 lg:mt-12"
				style={{ "--i": 2 } as React.CSSProperties}
			>
				<div role="tablist" aria-label="Statement status" className="flex overflow-x-auto border-b border-grey-600">
					{([undefined, ...STATEMENT_STATUSES] as (StatementStatus | undefined)[]).map((s) => (
						<button
							key={s ?? "all"}
							type="button"
							role="tab"
							aria-selected={status === s}
							onClick={() => set({ status: s })}
							className={clsx(
								"-mb-px flex shrink-0 items-center gap-2 border-b-2 px-6 pb-4 text-base transition-colors",
								status === s ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
							)}
						>
							{s ? STATUS_LABEL[s] : "All"}
							{!s && everything.data && (
								<span className="rounded-full bg-primary-500 px-2 py-px text-xs font-medium text-white">
									{count(everything.data.meta.total)}
								</span>
							)}
						</button>
					))}
				</div>
				<fieldset className="flex gap-8 pb-3">
					<legend className="sr-only">Show amounts in</legend>
					{CURRENCIES.map((c) => (
						<label key={c.value} className="flex cursor-pointer items-center gap-3 text-lg text-ink">
							<input
								type="radio"
								name="currency"
								value={c.value}
								checked={currency === c.value}
								onChange={() => set({ currency: c.value === "ngn" ? undefined : c.value })}
								className="size-6 accent-primary-500"
							/>
							{c.label}
						</label>
					))}
				</fieldset>
			</div>

			<div className={clsx("mt-8 transition-opacity lg:mt-10", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load your statements.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && statements.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						{status
							? `No ${STATUS_LABEL[status].toLowerCase()} statements.`
							: "No statements yet. Your first one opens with your first sale."}
					</p>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[860px]">
								<thead className="border-b border-grey-600 bg-grey-500">
									<tr>
										{["Period", "Transaction ID", "Status", "Payout"].map((h) => (
											<th key={h} scope="col" className={TH}>
												{h}
											</th>
										))}
										<th scope="col" className={TH}>
											Action
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: PAGE_SIZE }, (_, i) => (
												<tr key={i}>
													<td colSpan={5} className="px-8 py-4">
														<Skeleton className="h-12 w-full" />
													</td>
												</tr>
											))
										: statements.map((s, i) => (
												<tr
													key={s.id}
													className="animate-rise transition-colors hover:bg-grey-500"
													style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
												>
													<td className={TD}>{periodLabel(s.period_start, s.period_end)}</td>
													<td className={TD}>{s.reference}</td>
													<td className={TD}>
														<span className={clsx("rounded-full px-4 py-1.5 text-base font-medium", STATUS_TONE[s.status])}>
															{STATUS_LABEL[s.status]}
														</span>
													</td>
													<td className={TD}>{money(s.payout, currency)}</td>
													<td className={TD}>
														<button
															type="button"
															onClick={() => setViewing(s.id)}
															className="text-base text-ink hover:text-primary-500 hover:underline"
															aria-label={`View details of ${periodLabel(s.period_start, s.period_end)}`}
														>
															View Details
														</button>
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

			<section
				aria-labelledby="transaction-exports"
				className="animate-rise mt-12 overflow-hidden rounded-xl border border-grey-600 bg-white"
				style={{ "--i": 3 } as React.CSSProperties}
			>
				<h2 id="transaction-exports" className="px-5 py-6 text-xl font-medium text-ink lg:px-9 lg:text-2xl">
					Transaction Exports
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[720px]">
						<thead className="bg-grey-500">
							<tr>
								{["Requested", "Created", "Status", "Download"].map((h) => (
									<th key={h} scope="col" className="px-5 py-5 text-left text-base font-medium text-ink lg:px-9">
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-grey-600">
							{exports.isPending ? (
								<tr>
									<td colSpan={4} className="px-8 py-4">
										<Skeleton className="h-10 w-full" />
									</td>
								</tr>
							) : !exports.data || exports.data.items.length === 0 ? (
								<tr>
									<td colSpan={4} className="py-14 text-center text-lg text-grey-800">
										No exports to display
									</td>
								</tr>
							) : (
								exports.data.items.map((e) => (
									<tr key={e.id}>
										<td className="px-5 py-5 text-base text-ink lg:px-9">{stamp(e.requested_at)}</td>
										<td className="px-5 py-5 text-base text-ink lg:px-9">{e.created_at ? stamp(e.created_at) : "—"}</td>
										<td className="px-5 py-5 lg:px-9">
											<span
												className={clsx(
													"rounded-full px-3 py-1 text-sm font-medium",
													e.status === "ready"
														? "bg-success-50 text-success-700"
														: e.status === "failed"
															? "bg-error-50 text-error-500"
															: "bg-grey-500 text-grey-900",
												)}
											>
												{e.status === "ready" ? "Ready" : e.status === "failed" ? "Failed" : "Preparing…"}
											</span>
										</td>
										<td className="px-5 py-5 lg:px-9">
											{e.status === "ready" ? (
												<button
													type="button"
													disabled={download.isPending}
													onClick={() => download.mutate(e.id)}
													className="inline-flex items-center gap-2 text-base font-medium text-primary-500 hover:underline disabled:opacity-60"
												>
													<Download className="size-4" aria-hidden /> CSV ({e.currency.toUpperCase()})
												</button>
											) : (
												<span className="text-grey-800">—</span>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				{exports.data && (
					<div className="border-t border-grey-600">
						<Pagination
							page={exports.data.meta.page}
							totalPages={exports.data.meta.total_pages}
							onChange={(n) => set({ exports: n > 1 ? String(n) : undefined })}
							goTo
						/>
					</div>
				)}
			</section>

			<StatementDialog id={viewing} currency={currency} onClose={() => setViewing(null)} />
		</div>
	);
}
