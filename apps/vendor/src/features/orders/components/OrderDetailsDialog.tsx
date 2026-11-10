"use client";

import clsx from "clsx";
import { useState } from "react";
import { CircleAlert, ShieldCheck, Truck, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { useCancelOrder, useMyOrder, useUpdateOrderStatus } from "@/features/orders/hooks";
import { day, ESCROW_LABEL, NEXT_STATUS, percent, STATUS_LABEL, STATUS_TONE } from "@/features/orders/options";
import type { VendorOrder } from "@/features/orders/types";
import { errorMessage } from "@/lib/api/client";
import { price } from "@/lib/format";

/**
 * Figma "Order Details" (PRD V8): the items, the payout breakdown (subtotal, Fysi's commission, what reaches the
 * wallet), escrow, the delivery address, any reported problem, and the next status. Before shipping, the vendor can
 * cancel with a reason (POST /vendor/orders/:id/cancel); the customer is refunded.
 */
export function OrderDetailsDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
	const { data: order, isPending, isError, error, refetch } = useMyOrder(id);

	return (
		<Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="block max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white px-5 py-6 sm:max-w-[720px] sm:px-9 sm:py-8"
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<DialogTitle className="text-2xl font-medium text-ink">Order {order?.orderNumber ?? ""}</DialogTitle>
						<DialogDescription className="mt-1 text-sm text-grey-900">
							{order?.paidAt ? `Paid ${day(order.paidAt)}` : "Loading…"}
						</DialogDescription>
					</div>
					<DialogClose aria-label="Close" className="rounded-md p-1 text-ink hover:bg-grey-500">
						<X className="size-6" />
					</DialogClose>
				</div>

				{isError ? (
					<div className="py-12 text-center text-sm text-grey-900">
						<p>{errorMessage(error, "Couldn't load this order.")}</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending || !order ? (
					<div className="mt-6 space-y-3" aria-busy>
						{Array.from({ length: 5 }, (_, i) => (
							<Skeleton key={i} className="h-8 w-full" />
						))}
					</div>
				) : (
					<Details order={order} />
				)}
			</DialogContent>
		</Dialog>
	);
}

function Details({ order }: { order: VendorOrder }) {
	const a = order.deliveryAddress;
	return (
		<div className="mt-6 space-y-6 text-sm text-ink">
			<div className="flex flex-wrap items-center gap-2">
				<span className={clsx("rounded-full px-3 py-1 text-xs font-medium", STATUS_TONE[order.status])}>
					{STATUS_LABEL[order.status]}
				</span>
				<span className="text-grey-900">{ESCROW_LABEL[order.escrowStatus]}</span>
			</div>

			{order.problemReason && (
				<p role="alert" className="flex gap-2 rounded-lg border border-error-500 bg-error-50 p-3">
					<CircleAlert className="size-5 shrink-0 text-error-500" aria-hidden />
					<span>
						<strong className="font-semibold">The customer reported a problem:</strong> {order.problemReason}
						<span className="mt-1 block text-grey-900">Your payout is on hold while Fysi looks into it.</span>
					</span>
				</p>
			)}

			<section aria-label="Items">
				<ul className="divide-y divide-grey-600 rounded-lg border border-grey-600">
					{order.lines.map((l) => (
						<li key={l.productId} className="flex justify-between gap-4 px-4 py-3">
							<span className="min-w-0">
								{l.title} <span className="text-grey-800">× {l.quantity}</span>
							</span>
							<span className="shrink-0">{price(l.lineTotal)}</span>
						</li>
					))}
				</ul>
				<dl className="mt-3 space-y-1.5 [&>div]:flex [&>div]:justify-between">
					<div>
						<dt>Subtotal</dt>
						<dd>{price(order.subtotal)}</dd>
					</div>
					<div>
						<dt>Fysi commission ({percent(order.commissionBps)})</dt>
						<dd>{order.commission.cents === 0 ? "Waived" : `−${price(order.commission)}`}</dd>
					</div>
					<div className="border-t border-grey-600 pt-2 text-base font-semibold">
						<dt>Your payout</dt>
						<dd>{price(order.payout)}</dd>
					</div>
				</dl>
				<p className="mt-2 flex gap-2 text-xs text-grey-900">
					<ShieldCheck className="size-4 shrink-0 text-primary-500" aria-hidden />
					{order.escrowStatus === "held"
						? order.autoReleaseAt
							? `Held in escrow: released when the customer confirms delivery, or automatically on ${day(order.autoReleaseAt)}.`
							: "Held in escrow until the customer confirms delivery (or 7 days after you ship)."
						: ESCROW_LABEL[order.escrowStatus]}
				</p>
			</section>

			<section aria-label="Delivery">
				<h3 className="text-base font-semibold">Deliver to</h3>
				<p className="mt-1 text-grey-900">
					{a.recipientName} · {a.phone}
					<br />
					{a.line1}
					{a.line2 && `, ${a.line2}`}, {a.city}, {a.state}
					{a.notes && <span className="mt-1 block italic">“{a.notes}”</span>}
				</p>
				{order.trackingNumber && (
					<p className="mt-2 flex items-center gap-2">
						<Truck className="size-4 text-primary-500" aria-hidden />
						{order.carrier ?? "Courier"} · <span className="font-mono">{order.trackingNumber}</span>
						{order.shippedAt && <span className="text-grey-800">· shipped {day(order.shippedAt)}</span>}
					</p>
				)}
			</section>

			{order.status === "cancelled" && order.cancelReason && (
				<p className="rounded-lg border border-grey-600 bg-grey-500 p-3">
					<strong className="font-semibold">Cancelled:</strong> {order.cancelReason}
				</p>
			)}

			<NextStep order={order} />
			{order.canCancel && <CancelOrder id={order.id} />}
		</div>
	);
}

function NextStep({ order }: { order: VendorOrder }) {
	const next = NEXT_STATUS[order.status];
	const update = useUpdateOrderStatus(order.id);
	const [carrier, setCarrier] = useState("");
	const [tracking, setTracking] = useState("");
	const [problem, setProblem] = useState<string | null>(null);

	if (!next) return null;

	return (
		<form
			noValidate
			className="rounded-lg border border-primary-500 bg-primary-50 p-4"
			onSubmit={(e) => {
				e.preventDefault();
				if (next === "shipped" && (!carrier.trim() || !tracking.trim()))
					return setProblem("Enter the courier and tracking number");
				setProblem(null);
				update.mutate(
					next === "shipped" ? { status: next, carrier: carrier.trim(), trackingNumber: tracking.trim() } : { status: next },
				);
			}}
		>
			<h3 className="text-base font-semibold">
				{next === "processing" ? "Start processing" : next === "shipped" ? "Mark as shipped" : "Mark as delivered"}
			</h3>
			<p className="mt-1 text-xs text-grey-900">
				{next === "processing"
					? "Let the customer know you're packing it."
					: next === "shipped"
						? "The customer is emailed the tracking number, and the 7-day escrow timer starts."
						: "When the courier has delivered it. You're paid when the customer confirms, or when the timer ends."}
			</p>
			{next === "shipped" && (
				<div className="mt-3 grid gap-3 sm:grid-cols-2">
					<Input
						value={carrier}
						onChange={(e) => setCarrier(e.target.value)}
						placeholder="Courier, e.g. GIG Logistics"
						aria-label="Courier"
						className="h-11 bg-white"
					/>
					<Input
						value={tracking}
						onChange={(e) => setTracking(e.target.value)}
						placeholder="Tracking number"
						aria-label="Tracking number"
						className="h-11 bg-white"
					/>
				</div>
			)}
			{problem && <p className="mt-2 text-sm text-error-500">{problem}</p>}
			<Button type="submit" isLoading={update.isPending} className="mt-3 h-11">
				{next === "processing" ? "Start processing" : next === "shipped" ? "Mark as shipped" : "Mark as delivered"}
			</Button>
		</form>
	);
}

function CancelOrder({ id }: { id: string }) {
	const cancel = useCancelOrder(id);
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState("");
	const [problem, setProblem] = useState<string | null>(null);

	if (!open) {
		return (
			<button type="button" onClick={() => setOpen(true)} className="text-sm font-medium text-error-500 hover:underline">
				Cancel this order
			</button>
		);
	}
	return (
		<form
			noValidate
			className="rounded-lg border border-error-500 bg-error-50 p-4"
			onSubmit={(e) => {
				e.preventDefault();
				if (reason.trim().length < 3) return setProblem("Tell the customer why");
				setProblem(null);
				cancel.mutate(reason.trim());
			}}
		>
			<h3 className="text-base font-semibold">Cancel this order</h3>
			<p className="mt-1 text-xs text-grey-900">
				The customer sees your reason and is refunded in full. This can&apos;t be undone.
			</p>
			<textarea
				value={reason}
				onChange={(e) => setReason(e.target.value)}
				rows={3}
				maxLength={500}
				placeholder="e.g. Out of stock"
				aria-label="Reason"
				className="mt-3 w-full rounded-lg border border-grey-600 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
			/>
			{problem && <p className="mt-1 text-sm text-error-500">{problem}</p>}
			<div className="mt-3 flex gap-3">
				<Button type="submit" variant="destructive" isLoading={cancel.isPending} className="h-11">
					Cancel order
				</Button>
				<Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11">
					Keep it
				</Button>
			</div>
		</form>
	);
}
