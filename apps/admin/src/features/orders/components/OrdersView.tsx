"use client";

import clsx from "clsx";
import { useState } from "react";
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
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { ExportButton } from "@/components/ExportButton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { useSettleVendorOrder, useVendorOrders } from "@/features/orders/hooks";
import { ESCROW_LABEL, ESCROW_STATUSES, ESCROW_TONE, type AdminVendorOrder, type EscrowStatus } from "@/features/orders/types";
import { price } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 12;
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-4 text-sm text-ink";
const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/**
 * Vendor orders and disputes: each shop's part of an order, by escrow state. A disputed order shows what the customer
 * reported; admins settle it by releasing the escrow to the vendor or refunding the customer (both need a reason).
 */
export function OrdersView() {
	const { get, page, set } = useUrlParams();
	const escrow = ESCROW_STATUSES.find((s) => s === get("escrow"));
	const { data, isPending, isError, isFetching, refetch } = useVendorOrders({ escrowStatus: escrow, page, limit: PAGE_SIZE });
	const [acting, setActing] = useState<{ order: AdminVendorOrder; action: "release" | "refund" } | null>(null);
	const orders = data?.items ?? [];

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Orders" crumb="Orders">
				<div className="flex flex-wrap gap-3">
					<ExportButton kind="orders" />
				</div>
			</ListHeader>

			<div
				role="tablist"
				aria-label="Escrow"
				className="hide-scroll mt-8 flex max-w-full overflow-x-auto border-b border-grey-600"
			>
				{([undefined, ...ESCROW_STATUSES] as (EscrowStatus | undefined)[]).map((s) => (
					<button
						key={s ?? "all"}
						type="button"
						role="tab"
						aria-selected={escrow === s}
						onClick={() => set({ escrow: s })}
						className={clsx(
							"-mb-px shrink-0 border-b-2 px-5 pb-3 text-base transition-colors",
							escrow === s ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
						)}
					>
						{s ? ESCROW_LABEL[s] : "All"}
					</button>
				))}
			</div>

			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load orders.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && orders.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						{escrow === "disputed" ? "No disputes. Nothing to settle." : "No orders here."}
					</p>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[1000px]">
								<thead className="border-b border-grey-600 bg-grey-500">
									<tr>
										{["Order", "Vendor", "Customer", "Subtotal", "Payout", "Fulfilment", "Escrow", "Updated", ""].map((h, i) => (
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
													<td colSpan={9} className="px-6 py-3">
														<Skeleton className="h-10 w-full" />
													</td>
												</tr>
											))
										: orders.map((o) => (
												<tr key={o.id} className="align-top hover:bg-grey-500">
													<td className={clsx(TD, "pl-6 font-semibold whitespace-nowrap")}>{o.orderNumber}</td>
													<td className={TD}>{o.vendorName ?? "—"}</td>
													<td className={TD}>{o.customerEmail}</td>
													<td className={clsx(TD, "whitespace-nowrap")}>{price(o.subtotal)}</td>
													<td className={clsx(TD, "whitespace-nowrap")}>{price(o.payout)}</td>
													<td className={clsx(TD, "capitalize")}>
														{o.status.replace(/_/g, " ")}
														{o.trackingNumber && (
															<span className="block font-mono text-xs text-grey-800">{o.trackingNumber}</span>
														)}
													</td>
													<td className={TD}>
														<span
															className={clsx(
																"rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
																ESCROW_TONE[o.escrowStatus],
															)}
														>
															{ESCROW_LABEL[o.escrowStatus]}
														</span>
														{o.problemReason && (
															<span className="mt-1 block max-w-56 text-xs text-error-500">“{o.problemReason}”</span>
														)}
													</td>
													<td className={clsx(TD, "whitespace-nowrap")}>{when(o.updatedAt)}</td>
													<td className="py-4 pr-6 pl-3">
														{(o.escrowStatus === "held" || o.escrowStatus === "disputed") && (
															<div className="flex justify-end gap-2">
																<Button size="sm" variant="outline" onClick={() => setActing({ order: o, action: "release" })}>
																	Release
																</Button>
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() => setActing({ order: o, action: "refund" })}
																	className="border-error-500 text-error-500 hover:bg-error-50"
																>
																	Refund
																</Button>
															</div>
														)}
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

			<SettleDialog
				key={acting ? `${acting.order.id}-${acting.action}` : "none"}
				acting={acting}
				onClose={() => setActing(null)}
			/>
		</div>
	);
}

function SettleDialog({
	acting,
	onClose,
}: {
	acting: { order: AdminVendorOrder; action: "release" | "refund" } | null;
	onClose: () => void;
}) {
	const settle = useSettleVendorOrder();
	const [reason, setReason] = useState("");
	const ok = reason.trim().length >= 10;
	const release = acting?.action === "release";
	return (
		<AlertDialog open={!!acting} onOpenChange={(open) => !open && !settle.isPending && onClose()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{release ? `Release ${acting?.order.orderNumber} to the vendor?` : `Cancel and refund ${acting?.order.orderNumber}?`}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{release
							? `${acting ? price(acting.order.payout) : ""} goes to ${acting?.order.vendorName ?? "the vendor"}'s wallet now.`
							: `${acting ? price(acting.order.subtotal) : ""} goes back to ${acting?.order.customerEmail}. The vendor isn't paid for it.`}{" "}
						This can&apos;t be undone and is recorded in the audit log.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<label htmlFor="settle-reason" className="text-sm font-medium text-ink">
					Reason
				</label>
				<Textarea
					id="settle-reason"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					rows={3}
					placeholder={
						release ? "e.g. Courier confirmed delivery; customer unreachable." : "e.g. Item arrived broken; photos confirmed."
					}
				/>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={settle.isPending}>Cancel</AlertDialogCancel>
					<Button
						disabled={!ok || !acting}
						isLoading={settle.isPending}
						className={release ? "" : "bg-error-500 hover:bg-error-700"}
						onClick={() => acting && settle.mutate({ ...acting, reason: reason.trim() }, { onSuccess: onClose })}
					>
						{release ? "Release payout" : "Refund customer"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
