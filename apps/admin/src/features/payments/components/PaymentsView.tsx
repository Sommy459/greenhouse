"use client";

import clsx from "clsx";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { ExportButton } from "@/components/ExportButton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { usePayments, useRefundPayment, useRetryTransfer, useTransfers } from "@/features/payments/hooks";
import type { IncomingPayment, PaymentStatus, Transfer, TransferKind } from "@/features/payments/types";
import { usdc } from "@/lib/format";
import { shortHash } from "@/lib/stellar";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 15;
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-3 text-sm text-ink";
const when = (iso: string) =>
	new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const PAYMENT_TONE: Record<PaymentStatus, string> = {
	matched: "bg-success-50 text-success-700",
	overpaid: "bg-warning-50 text-warning-700",
	unmatched: "bg-error-50 text-error-500",
	refunded: "bg-grey-500 text-grey-900",
};
const TRANSFER_TONE: Record<Transfer["status"], string> = {
	queued: "bg-grey-500 text-grey-900",
	submitted: "bg-info-50 text-info-500",
	confirmed: "bg-success-50 text-success-700",
	failed: "bg-error-50 text-error-500",
};

function TxLink({ hash, url }: { hash: string | null; url: string | null }) {
	if (!hash || !url) return <span className="text-grey-800">—</span>;
	return (
		<a
			href={url}
			target="_blank"
			rel="noreferrer"
			className="inline-flex items-center gap-1 font-mono text-primary-500 hover:underline"
		>
			{shortHash(hash)} <ExternalLink className="size-3" aria-hidden />
			<span className="sr-only">(opens Stellar Expert)</span>
		</a>
	);
}

/**
 * Transaction monitor (PRD A4): every payment into the settlement account, matched to an order by memo or flagged
 * (overpaid, unmatched) for a manual refund; and every transfer out (payouts, refunds, withdrawals), retrying failures.
 */
export function PaymentsView() {
	const { get, set } = useUrlParams();
	const tab = get("tab") === "transfers" ? "transfers" : "payments";
	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Payments" crumb="Payments">
				<div className="flex flex-wrap gap-3">
					<ExportButton kind="payments" />
				</div>
			</ListHeader>
			<div role="tablist" aria-label="Money" className="mt-8 flex border-b border-grey-600">
				{(
					[
						["payments", "Incoming payments"],
						["transfers", "Transfers out"],
					] as const
				).map(([value, label]) => (
					<button
						key={value}
						type="button"
						role="tab"
						aria-selected={tab === value}
						onClick={() => set({ tab: value === "payments" ? undefined : value })}
						className={clsx(
							"-mb-px border-b-2 px-5 pb-3 text-base transition-colors",
							tab === value ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
						)}
					>
						{label}
					</button>
				))}
			</div>
			{tab === "payments" ? <Incoming /> : <Transfers />}
		</div>
	);
}

function Incoming() {
	const { get, page, set } = useUrlParams();
	const status = (["matched", "overpaid", "unmatched", "refunded"] as const).find((s) => s === get("status"));
	const needsRefund = get("refund") === "1";
	const q = get("search");
	const { data, isPending, isError, isFetching, refetch } = usePayments({
		status,
		needsRefund: needsRefund || undefined,
		q: q || undefined,
		page,
		limit: PAGE_SIZE,
	});
	const [refunding, setRefunding] = useState<IncomingPayment | null>(null);
	const rows = data?.items ?? [];

	return (
		<>
			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchBox
					value={q}
					onChange={(v) => set({ search: v || undefined })}
					placeholder="Order, memo, payer or tx"
					label="Search payments"
					className="w-full sm:w-72"
				/>
				<select
					value={status ?? ""}
					onChange={(e) => set({ status: e.target.value || undefined })}
					aria-label="Status"
					className="h-11 rounded-lg border border-grey-600 bg-white px-3 text-sm text-ink"
				>
					<option value="">All</option>
					<option value="matched">Matched</option>
					<option value="overpaid">Overpaid</option>
					<option value="unmatched">Unmatched</option>
					<option value="refunded">Refunded</option>
				</select>
				<label className="flex items-center gap-2 text-sm text-ink">
					<Checkbox checked={needsRefund} onCheckedChange={(on) => set({ refund: on ? "1" : undefined })} />
					Needs a refund
				</label>
			</div>
			<Table
				isPending={isPending}
				isError={isError}
				refetch={refetch}
				fetching={isFetching}
				empty={rows.length === 0}
				heads={["Received", "Order", "Payer", "Amount", "Memo", "Status", "Transaction", ""]}
				pages={data?.meta}
				onPage={(n) => set({ page: n > 1 ? String(n) : undefined })}
			>
				{rows.map((p) => (
					<tr key={p.id} className="hover:bg-grey-500">
						<td className={clsx(TD, "pl-6 whitespace-nowrap")}>{when(p.at)}</td>
						<td className={clsx(TD, "font-medium")}>{p.orderNumber ?? "—"}</td>
						<td className={clsx(TD, "font-mono")}>{shortHash(p.payer)}</td>
						<td className={clsx(TD, "whitespace-nowrap")}>
							{p.amount} {p.assetCode}
						</td>
						<td className={clsx(TD, "font-mono")}>{p.memo ?? "—"}</td>
						<td className={TD}>
							<span className={clsx("rounded-full px-3 py-1 text-xs font-medium capitalize", PAYMENT_TONE[p.status])}>
								{p.status}
							</span>
							{p.note && <span className="mt-1 block max-w-48 text-xs text-grey-800">{p.note}</span>}
						</td>
						<td className={TD}>
							<TxLink hash={p.txHash} url={p.explorerUrl} />
						</td>
						<td className="py-3 pr-6 pl-3 text-right">
							{Number(p.refundable) > 0 && p.status !== "refunded" && (
								<Button size="sm" variant="outline" onClick={() => setRefunding(p)}>
									Refund {usdc(p.refundable)}
								</Button>
							)}
						</td>
					</tr>
				))}
			</Table>
			<RefundDialog key={refunding?.id ?? "none"} payment={refunding} onClose={() => setRefunding(null)} />
		</>
	);
}

function RefundDialog({ payment, onClose }: { payment: IncomingPayment | null; onClose: () => void }) {
	const refund = useRefundPayment();
	const [reason, setReason] = useState("");
	const ok = reason.trim().length >= 10;
	return (
		<AlertDialog open={!!payment} onOpenChange={(open) => !open && !refund.isPending && onClose()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Refund {payment ? usdc(payment.refundable) : ""}?</AlertDialogTitle>
					<AlertDialogDescription>
						Sends it back to {payment ? shortHash(payment.payer) : "the payer"} on Stellar. Recorded in the audit log.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<Textarea
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					rows={3}
					aria-label="Reason"
					placeholder="e.g. Paid twice for FY-1042; returning the extra."
				/>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={refund.isPending}>Cancel</AlertDialogCancel>
					<Button
						disabled={!ok || !payment}
						isLoading={refund.isPending}
						onClick={() => payment && refund.mutate({ payment, reason: reason.trim() }, { onSuccess: onClose })}
					>
						Refund
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function Transfers() {
	const { get, page, set } = useUrlParams();
	const kind = (["payouts", "refunds", "withdrawals"] as const).find((k) => k === get("kind")) ?? "payouts";
	const status = (["queued", "submitted", "confirmed", "failed"] as const).find((s) => s === get("status"));
	const { data, isPending, isError, isFetching, refetch } = useTransfers(kind, { status, page, limit: PAGE_SIZE });
	const retry = useRetryTransfer(kind);
	const rows = data?.items ?? [];

	return (
		<>
			<div className="mt-6 flex flex-wrap items-center gap-3">
				<div className="flex rounded-lg border border-grey-600 bg-white p-0.5" role="tablist" aria-label="Kind">
					{(["payouts", "refunds", "withdrawals"] as TransferKind[]).map((k) => (
						<button
							key={k}
							type="button"
							role="tab"
							aria-selected={kind === k}
							onClick={() => set({ kind: k === "payouts" ? undefined : k })}
							className={clsx(
								"rounded-md px-3 py-1.5 text-sm capitalize",
								kind === k ? "bg-primary-500 text-white" : "text-ink hover:bg-grey-500",
							)}
						>
							{k}
						</button>
					))}
				</div>
				<select
					value={status ?? ""}
					onChange={(e) => set({ status: e.target.value || undefined })}
					aria-label="Status"
					className="h-10 rounded-lg border border-grey-600 bg-white px-3 text-sm text-ink"
				>
					<option value="">Any status</option>
					<option value="queued">Queued</option>
					<option value="submitted">Submitted</option>
					<option value="confirmed">Confirmed</option>
					<option value="failed">Failed</option>
				</select>
			</div>
			<Table
				isPending={isPending}
				isError={isError}
				refetch={refetch}
				fetching={isFetching}
				empty={rows.length === 0}
				heads={["Created", "To", "Amount", "Status", "Attempts", "Transaction", ""]}
				pages={data?.meta}
				onPage={(n) => set({ page: n > 1 ? String(n) : undefined })}
			>
				{rows.map((t) => (
					<tr key={t.id} className="hover:bg-grey-500">
						<td className={clsx(TD, "pl-6 whitespace-nowrap")}>{when(t.createdAt)}</td>
						<td className={clsx(TD, "font-mono")}>{shortHash(t.destination)}</td>
						<td className={clsx(TD, "whitespace-nowrap")}>{usdc(t.amount)}</td>
						<td className={TD}>
							<span className={clsx("rounded-full px-3 py-1 text-xs font-medium capitalize", TRANSFER_TONE[t.status])}>
								{t.status}
							</span>
							{t.lastError && <span className="mt-1 block max-w-56 text-xs text-error-500">{t.lastError}</span>}
						</td>
						<td className={TD}>{t.attempts}</td>
						<td className={TD}>
							<TxLink hash={t.txHash} url={t.explorerUrl} />
						</td>
						<td className="py-3 pr-6 pl-3 text-right">
							{t.status === "failed" && (
								<Button size="sm" variant="outline" disabled={retry.isPending} onClick={() => retry.mutate(t.id)}>
									Retry
								</Button>
							)}
						</td>
					</tr>
				))}
			</Table>
		</>
	);
}

function Table({
	heads,
	children,
	isPending,
	isError,
	fetching,
	empty,
	refetch,
	pages,
	onPage,
}: {
	heads: string[];
	children: React.ReactNode;
	isPending: boolean;
	isError: boolean;
	fetching: boolean;
	empty: boolean;
	refetch: () => void;
	pages?: { page: number; total_pages: number };
	onPage: (n: number) => void;
}) {
	if (isError) {
		return (
			<div className="mt-6 rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
				<p>Couldn&apos;t load this list.</p>
				<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
					Try again
				</Button>
			</div>
		);
	}
	if (!isPending && empty)
		return (
			<p className="mt-6 rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">Nothing here.</p>
		);
	return (
		<div
			className={clsx(
				"mt-6 overflow-hidden rounded-xl border border-grey-600 bg-white transition-opacity",
				fetching && !isPending && "opacity-60",
			)}
		>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[900px]">
					<thead className="border-b border-grey-600 bg-grey-500">
						<tr>
							{heads.map((h, i) => (
								<th key={h || i} scope="col" className={clsx(TH, i === 0 && "pl-6")}>
									{h}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-grey-600">
						{isPending
							? Array.from({ length: 6 }, (_, i) => (
									<tr key={i}>
										<td colSpan={heads.length} className="px-6 py-3">
											<Skeleton className="h-8 w-full" />
										</td>
									</tr>
								))
							: children}
					</tbody>
				</table>
			</div>
			{pages && pages.total_pages > 1 && (
				<div className="border-t border-grey-600">
					<Pagination page={pages.page} totalPages={pages.total_pages} onChange={onPage} />
				</div>
			)}
		</div>
	);
}
