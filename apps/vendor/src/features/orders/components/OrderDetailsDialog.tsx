"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect } from "react";
import { Copy, ExternalLink, Package, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { Skeleton } from "@repo/ui/skeleton";
import type { OpenSection } from "@/features/orders/components/OrdersTable";
import { UpdateStatusPanel } from "@/features/orders/components/UpdateStatusPanel";
import { useMyOrder } from "@/features/orders/hooks";
import {
	NEXT_STATUSES,
	ORDER_STATUS_LABEL,
	ORDER_STATUS_TONE,
	PAYMENT_LABEL,
	SHIPPING_METHOD_LABEL,
} from "@/features/orders/options";
import type { OrderDetail, TrackingStep } from "@/features/orders/types";
import { errorMessage } from "@/lib/api/client";
import { naira } from "@/lib/format";
import { explorerTxUrl, shortHash } from "@/lib/stellar";
import { useToast } from "@/lib/use-toast";

interface Props {
	orderId: string | null;
	/** Open scrolled to Order Tracking, or to Update status. */
	section: OpenSection;
	onClose: () => void;
}

const PAYOUT_LABEL = {
	held: "Held in escrow",
	released: "Released to your wallet",
	refunded: "Refunded to the customer",
} as const;

const longDay = (iso: string) => {
	const d = new Date(iso);
	return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })}, ${d.getFullYear()}`;
};
const clock = (iso: string) =>
	new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase();

/**
 * Figma Vendor Hub "Order Details": who it goes to, Order Tracking (and Update status), the items and totals, and
 * payment, with the Stellar transaction, Fysi's commission and your payout (PRD). Over the order list.
 */
export function OrderDetailsDialog({ orderId, section, onClose }: Props) {
	const { data: order, isPending, isError, error, refetch } = useMyOrder(orderId);
	const ready = !!order;

	useEffect(() => {
		// Scrolling the dialog is a DOM effect, not state: it runs once the order is on screen.
		if (!ready || section === "details") return;
		document.getElementById(section === "update" ? "order-update" : "order-tracking")?.scrollIntoView({ block: "start" });
	}, [ready, section]);

	return (
		<Dialog open={!!orderId} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="block max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white px-5 py-6 sm:max-w-[990px] sm:px-10 sm:py-10 lg:px-14 lg:pb-12"
			>
				<div className="flex items-center justify-between">
					<DialogTitle className="text-2xl font-medium text-ink lg:text-[28px]">Order Details</DialogTitle>
					<DialogClose aria-label="Close" className="rounded-md p-1 text-ink hover:bg-grey-500">
						<X className="size-6" />
					</DialogClose>
				</div>
				<DialogDescription className="sr-only">Recipient, tracking, items, totals and payment for this order.</DialogDescription>

				{isError ? (
					<div className="py-16 text-center text-sm text-grey-900">
						<p>{errorMessage(error, "Couldn't load this order.")}</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending || !order ? (
					<DetailsSkeleton />
				) : (
					<Details order={order} />
				)}
			</DialogContent>
		</Dialog>
	);
}

function Details({ order }: { order: OrderDetail }) {
	const r = order.recipient;
	return (
		<div className="animate-rise mt-8 grid gap-10 lg:mt-14 lg:grid-cols-2 lg:gap-[75px]">
			<div className="min-w-0">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-lg font-semibold text-ink">Order ID: {order.number}</p>
						<p className="mt-1 text-base text-grey-900">
							Date ordered: <time dateTime={order.created_at}>{longDay(order.created_at)}</time>
						</p>
						<span
							className={clsx("mt-2 inline-block rounded-full px-3 py-0.5 text-sm font-medium", ORDER_STATUS_TONE[order.status])}
						>
							{ORDER_STATUS_LABEL[order.status]}
						</span>
					</div>
					<p className="text-lg font-semibold text-ink">{naira(order.total)}</p>
				</div>

				<dl className="mt-10 space-y-5 lg:mt-12">
					<CopyRow label="Recipient name" value={r.name} />
					<CopyRow label="Phone number" value={r.phone_number} />
					<CopyRow label="E-mail Address" value={r.email} />
					<CopyRow label="Shipping address" value={r.address} />
					{order.shipment && (
						<CopyRow label={`Tracking number (${order.shipment.courier})`} value={order.shipment.tracking_number} />
					)}
				</dl>
				{order.cancel_reason && (
					<p className="mt-5 rounded-md bg-error-50 px-4 py-3 text-sm text-error-700">
						<span className="font-medium">Cancelled:</span> {order.cancel_reason}
					</p>
				)}

				<section id="order-tracking" aria-labelledby="order-tracking-title" className="mt-10 scroll-mt-4">
					<h3 id="order-tracking-title" className="text-lg font-semibold text-ink">
						Order Tracking
					</h3>
					<Tracking steps={order.tracking} placed={order.created_at} />
				</section>

				{NEXT_STATUSES[order.status].length > 0 && (
					<section id="order-update" aria-labelledby="order-update-title" className="mt-10 scroll-mt-4">
						<h3 id="order-update-title" className="text-lg font-semibold text-ink">
							Update status
						</h3>
						{/* Keyed on the status so a saved change starts the next step fresh. */}
						<UpdateStatusPanel key={order.status} order={order} />
					</section>
				)}
			</div>

			<div className="min-w-0">
				<section aria-labelledby="order-items-title">
					<h3 id="order-items-title" className="text-lg font-semibold text-ink">
						Order List ({order.items.length} item{order.items.length === 1 ? "" : "s"})
					</h3>
					<ul className="mt-4 space-y-4">
						{order.items.map((item) => (
							<li key={item.id} className="flex gap-4">
								<span className="relative grid size-[72px] shrink-0 place-items-center overflow-hidden rounded-md bg-grey-500">
									{item.image_url ? (
										<Image src={item.image_url} alt="" fill sizes="72px" className="object-cover" />
									) : (
										<Package className="size-6 text-grey-700" aria-hidden />
									)}
								</span>
								<div className="min-w-0 flex-1">
									<p className="text-base text-ink">{item.name}</p>
									<p className="mt-1 text-xs font-medium text-success-500">
										{item.quantity} Pcs{item.quantity > 1 ? ` × ${naira(item.price)}` : ""}
									</p>
								</div>
								<p className="text-base font-semibold text-ink">{naira(item.price * item.quantity)}</p>
							</li>
						))}
					</ul>

					<dl className="mt-8 space-y-3 text-base text-ink [&>div]:flex [&>div]:justify-between [&>div]:gap-4">
						<div>
							<dt>Subtotal</dt>
							<dd>{naira(order.subtotal)}</dd>
						</div>
						<div>
							<dt>VAT ({order.vat_rate}%)</dt>
							<dd>{naira(order.vat)}</dd>
						</div>
						<div>
							<dt>Shipping Rate</dt>
							<dd>{order.shipping === 0 ? "Free" : naira(order.shipping, 2)}</dd>
						</div>
						<div className="pt-1 text-lg font-semibold">
							<dt>Grand Total</dt>
							<dd>{naira(order.total, 2)}</dd>
						</div>
					</dl>
				</section>

				<section aria-labelledby="order-payment-title" className="mt-10">
					<h3 id="order-payment-title" className="text-lg font-semibold text-ink">
						Payment
					</h3>
					<dl className="mt-4 space-y-3 text-base text-ink [&>div]:flex [&>div]:justify-between [&>div]:gap-4">
						<div>
							<dt>Payment Method</dt>
							<dd>{PAYMENT_LABEL[order.payment_method]}</dd>
						</div>
						<div>
							<dt>Shipping Method</dt>
							<dd>{SHIPPING_METHOD_LABEL[order.shipping_method]}</dd>
						</div>
						<div>
							<dt>Transaction</dt>
							<dd>
								<a
									href={explorerTxUrl(order.payment.tx_hash, order.payment.network)}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-1 font-mono text-sm text-primary-500 hover:underline"
									title={`View on Stellar Expert (${order.payment.network})`}
								>
									{shortHash(order.payment.tx_hash)}
									<ExternalLink className="size-4" aria-hidden />
									<span className="sr-only">(opens Stellar Expert)</span>
								</a>
							</dd>
						</div>
					</dl>
				</section>

				<section aria-labelledby="order-payout-title" className="mt-10">
					<h3 id="order-payout-title" className="text-lg font-semibold text-ink">
						Your Payout
					</h3>
					<dl className="mt-4 space-y-3 text-base text-ink [&>div]:flex [&>div]:justify-between [&>div]:gap-4">
						<div>
							<dt>Order total</dt>
							<dd>{naira(order.total, 2)}</dd>
						</div>
						<div>
							<dt>Fysi commission ({order.commission_rate}%)</dt>
							<dd>{order.commission === 0 ? "Waived" : `−${naira(order.commission, 2)}`}</dd>
						</div>
						<div className="pt-1 text-lg font-semibold">
							<dt>You receive</dt>
							<dd>{naira(order.payout, 2)}</dd>
						</div>
						<div className="text-sm text-grey-900">
							<dt className="sr-only">Payout status</dt>
							<dd className="w-full text-right">{PAYOUT_LABEL[order.payout_status]}</dd>
						</div>
					</dl>
				</section>
			</div>
		</div>
	);
}

/** A label and value with a copy button (Figma). */
function CopyRow({ label, value }: { label: string; value: string }) {
	const toast = useToast();
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(`${label} copied`);
		} catch {
			toast.error("Couldn't copy. Select the text instead.");
		}
	};

	return (
		<div className="flex items-start justify-between gap-4">
			<div className="min-w-0">
				<dt className="text-sm text-grey-900">{label}</dt>
				<dd className="mt-0.5 text-base break-words text-ink">{value}</dd>
			</div>
			<button
				type="button"
				onClick={copy}
				aria-label={`Copy ${label.toLowerCase()}`}
				className="mt-1 shrink-0 rounded-md p-1.5 text-grey-800 transition-colors hover:bg-grey-500 hover:text-ink"
			>
				<Copy className="size-5" />
			</button>
		</div>
	);
}

/** Figma timeline: green dots and line for steps done (with the time), grey for what's to come ("From …"). */
function Tracking({ steps, placed }: { steps: TrackingStep[]; placed: string }) {
	const sameDay = (iso: string) => new Date(iso).toDateString() === new Date(placed).toDateString();
	const when = (iso: string) => (sameDay(iso) ? clock(iso) : `${longDay(iso)}, ${clock(iso)}`);

	return (
		<ol className="mt-5">
			{steps.map((step, i) => {
				const last = i === steps.length - 1;
				const nextDone = steps[i + 1]?.state === "done";
				return (
					<li key={`${step.label}-${i}`} className="relative flex gap-4 pb-7 last:pb-0">
						{!last && (
							<span
								aria-hidden
								className={clsx(
									"absolute top-5 left-[9px] h-[calc(100%-12px)] w-0.5",
									step.state === "done" && nextDone ? "bg-success-500" : "bg-grey-600",
								)}
							/>
						)}
						<span
							aria-hidden
							className={clsx(
								"relative mt-0.5 size-5 shrink-0 rounded-full",
								step.state === "done" ? "bg-success-500" : step.state === "stopped" ? "bg-error-500" : "bg-grey-700",
							)}
						/>
						<div>
							<p
								className={clsx(
									"text-base",
									step.state === "upcoming" ? "text-grey-900" : step.state === "stopped" ? "text-error-500" : "text-ink",
								)}
							>
								{step.label}
								<span className="sr-only">
									{step.state === "done" ? " (done)" : step.state === "stopped" ? " (stopped)" : " (to come)"}
								</span>
							</p>
							{step.at && (
								<p
									className={clsx(
										"mt-0.5 text-xs",
										step.state === "done"
											? "font-medium text-success-500"
											: step.state === "stopped"
												? "text-error-500"
												: "text-grey-900",
									)}
								>
									{step.state === "upcoming" ? `From ${when(step.at)}` : when(step.at)}
								</p>
							)}
						</div>
					</li>
				);
			})}
		</ol>
	);
}

function DetailsSkeleton() {
	return (
		<div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-[75px]" aria-busy aria-label="Loading order">
			<div className="space-y-5">
				<Skeleton className="h-12 w-full" />
				{Array.from({ length: 4 }, (_, i) => (
					<Skeleton key={i} className="h-10 w-full" />
				))}
				<Skeleton className="h-48 w-full" />
			</div>
			<div className="space-y-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-36 w-full" />
			</div>
		</div>
	);
}
