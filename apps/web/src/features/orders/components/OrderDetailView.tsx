"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ExternalLink, PackageCheck, Store, Truck } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
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
import { StatusHistory, type Step } from "@/features/orders/components/StatusHistory";
import { OrderStatusBadge } from "@/features/orders/components/OrdersTable";
import { useConfirmDelivery, useOrder, useReportProblem } from "@/features/orders/hooks";
import type { Order, VendorOrder } from "@/features/orders/types";
import { errorMessage } from "@/lib/api/client";
import { price, usdc } from "@/lib/format";
import { accountRoutes, checkoutRoutes, shopRoutes } from "@/lib/routes";
import { shortHash } from "@/lib/stellar";

const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
const CARD = "rounded-md bg-white px-4 py-5 md:border md:border-grey-600 md:px-7 md:py-7";
const CARD_TITLE = "border-b border-grey-800 pb-5 text-lg text-ink md:text-xl";
const TERM = "text-sm font-medium text-ink md:text-lg md:font-normal";
const VALUE = "mt-1.5 text-sm text-grey-900 md:text-base";
const RANK = ["awaiting_payment", "paid", "processing", "shipped", "delivered"];

/**
 * Figma "Order Detail" (C7, C8): the order's number and date, delivery and payment details (USDC paid, with each Stellar
 * transaction), then one part per shop: its items, status history, courier and tracking, Confirm delivery (releases
 * that shop's payout) and Report a problem (up to 7 days after delivery). Unpaid orders link back to the payment step.
 */
export function OrderDetailView({ id }: { id: string }) {
	const { data: order, isPending, isError, error, refetch } = useOrder(id);

	return (
		<div className="pb-6 lg:pb-16">
			<Link
				href={accountRoutes.ORDERS}
				className="animate-rise inline-flex items-center gap-3 text-lg text-ink hover:text-primary-500 lg:text-2xl"
			>
				<ChevronLeft className="size-6 lg:hidden" aria-hidden />
				<ArrowLeft className="hidden size-6 lg:block" aria-hidden />
				<h1>
					Order Detail<span className="lg:hidden">s</span>
				</h1>
			</Link>

			{isError ? (
				<div className="mt-10 rounded-md bg-white py-16 text-center text-sm text-grey-900">
					<p>{errorMessage(error, "We couldn't load this order.")}</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : isPending ? (
				<div className="mt-8 space-y-4" aria-busy>
					<Skeleton className="h-20 w-60" />
					<Skeleton className="h-40 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			) : (
				<Detail order={order} />
			)}
		</div>
	);
}

function Detail({ order }: { order: Order }) {
	const items = order.vendorOrders.reduce((n, v) => n + v.lines.reduce((m, l) => m + l.quantity, 0), 0);
	const a = order.deliveryAddress;

	return (
		<>
			<div className="animate-rise mt-8 flex flex-wrap items-start justify-between gap-4 lg:mt-9">
				<div className="text-base text-grey-900">
					<p className="font-semibold text-ink">Order ID: {order.number}</p>
					<p className="mt-2">
						{items} item{items === 1 ? "" : "s"}
						{order.vendorOrders.length > 1 && ` from ${order.vendorOrders.length} shops`}
					</p>
					<p className="mt-2">{longDate(order.createdAt)}</p>
				</div>
				<OrderStatusBadge order={order} />
			</div>

			{order.status === "awaiting_payment" && (
				<div className="animate-rise mt-6 flex flex-col gap-3 rounded-md border border-warning-700/30 bg-warning-50 p-5 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-base text-ink">
						This order isn&apos;t paid yet: {usdc(order.payment.amountDue)} due before{" "}
						{new Date(order.payment.expiresAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.
					</p>
					<Button asChild className="h-11 shrink-0 rounded-md px-5">
						<Link href={checkoutRoutes.PAY(order.id)}>Pay now</Link>
					</Button>
				</div>
			)}

			<div className="mt-8 grid gap-2 md:mt-9 md:grid-cols-2 md:gap-9">
				<section aria-labelledby="delivery-details" className={CARD}>
					<h2 id="delivery-details" className={CARD_TITLE}>
						Delivery Details
					</h2>
					<dl className="mt-5 space-y-6">
						<div>
							<dt className={TERM}>Deliver to</dt>
							<dd className={VALUE}>
								{a.recipientName} · {a.phone}
							</dd>
						</div>
						<div>
							<dt className={TERM}>Delivery Address</dt>
							<dd className={VALUE}>
								{a.line1}
								{a.line2 && <>, {a.line2}</>}
								<br />
								{a.city}, {a.state}
								{a.notes && <span className="mt-1 block text-sm italic">“{a.notes}”</span>}
							</dd>
						</div>
					</dl>
				</section>

				<section aria-labelledby="payment-details" className={CARD}>
					<h2 id="payment-details" className={CARD_TITLE}>
						Payment Details
					</h2>
					<dl className="mt-5 space-y-6">
						<div>
							<dt className={TERM}>Payment Method</dt>
							<dd className={VALUE}>USDC on Stellar (1 USDC = $1)</dd>
						</div>
						<div>
							<dt className={TERM}>Payment Details</dt>
							<dd className={`${VALUE} space-y-1.5`}>
								<p className="text-base font-medium text-ink md:text-lg">Total: {price(order.total)}</p>
								<p>Paid: {usdc(order.paid)}</p>
								{order.transactions.map((t) => (
									<p key={t.txHash}>
										{usdc(t.amount)} ·{" "}
										<a
											href={t.explorerUrl}
											target="_blank"
											rel="noreferrer"
											className="inline-flex items-center gap-1 font-mono text-primary-500 hover:underline"
										>
											{shortHash(t.txHash)} <ExternalLink className="size-3.5" aria-hidden />
											<span className="sr-only">(opens Stellar Expert)</span>
										</a>
									</p>
								))}
							</dd>
						</div>
					</dl>
				</section>
			</div>

			<div className="mt-10 space-y-10">
				{order.vendorOrders.map((vo) => (
					<VendorPart key={vo.id} order={order} part={vo} />
				))}
			</div>
		</>
	);
}

function VendorPart({ order, part }: { order: Order; part: VendorOrder }) {
	const confirm = useConfirmDelivery(order.id);
	const report = useReportProblem(order.id);
	const [confirming, setConfirming] = useState(false);
	const [reporting, setReporting] = useState(false);
	const [reason, setReason] = useState("");
	const reached = (status: string) => RANK.indexOf(part.status) >= RANK.indexOf(status);
	const steps: Step[] = [
		{ label: "Paid", reached: reached("paid"), at: order.paidAt },
		{ label: "Processing", reached: reached("processing"), at: null },
		{ label: "On the way", reached: reached("shipped"), at: part.shippedAt },
		{ label: "Delivered", reached: reached("delivered"), at: part.deliveredAt },
	];

	return (
		<section
			aria-label={`From ${part.vendorName}`}
			className="rounded-md bg-white px-4 py-5 md:border md:border-grey-600 md:px-7 md:py-7"
		>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2 className="flex items-center gap-2 text-lg text-ink">
					<Store className="size-5 text-primary-500" aria-hidden />
					{part.vendorSlug ? (
						<Link href={shopRoutes.STORE(part.vendorSlug)} className="hover:text-primary-500 hover:underline">
							{part.vendorName}
						</Link>
					) : (
						part.vendorName
					)}
				</h2>
				<span className="text-base font-medium text-ink">{price(part.subtotal)}</span>
			</div>

			<ul className="mt-4 divide-y divide-grey-600 border-y border-grey-600">
				{part.lines.map((l) => (
					<li key={l.productId} className="flex justify-between gap-4 py-3 text-sm text-ink md:text-base">
						<span className="min-w-0">
							{l.title} <span className="text-grey-800">× {l.quantity}</span>
						</span>
						<span className="shrink-0">{price(l.lineTotal)}</span>
					</li>
				))}
			</ul>

			{part.status === "cancelled" ? (
				<p className="mt-5 rounded-md border border-error-500 bg-error-50 p-4 text-sm text-ink">
					This part of the order was cancelled and refunded to you.
				</p>
			) : (
				order.status === "paid" && <StatusHistory steps={steps} />
			)}

			{part.trackingNumber && (
				<p className="mt-6 flex items-center gap-2 text-sm text-grey-900 md:text-base">
					<Truck className="size-5 text-primary-500" aria-hidden />
					{part.carrier ?? "Courier"} · Tracking number{" "}
					<span className="font-mono font-medium text-ink">{part.trackingNumber}</span>
				</p>
			)}

			{part.problemReason && (
				<p className="mt-5 rounded-md border border-error-500 bg-error-50 p-4 text-sm text-ink">
					<span className="font-medium">You reported a problem:</span> {part.problemReason}
					<span className="mt-1 block text-grey-900">
						Fysi is looking into it; the seller isn&apos;t paid until it&apos;s resolved.
					</span>
				</p>
			)}
			{part.confirmedAt && (
				<p className="mt-5 text-sm text-success-700">You confirmed delivery on {longDate(part.confirmedAt)}. Thank you!</p>
			)}

			{(part.canConfirmDelivery || part.canReportProblem) && (
				<div className="mt-6 flex flex-col gap-3 rounded-md border border-primary-500 bg-primary-50 p-5 sm:flex-row sm:items-center sm:justify-between">
					<p className="flex gap-3 text-sm text-ink md:text-base">
						<PackageCheck className="mt-0.5 size-5 shrink-0 text-primary-500" aria-hidden />
						<span>
							{part.canConfirmDelivery
								? "Got this parcel? Confirm it arrived so the seller gets paid. If you don't, it's confirmed automatically 7 days after shipping."
								: "Something wrong with this parcel? You can report it for 7 days after delivery."}
						</span>
					</p>
					<div className="flex shrink-0 gap-2">
						{part.canReportProblem && (
							<Button
								type="button"
								variant="outline"
								onClick={() => setReporting(true)}
								className="h-11 rounded-md bg-white px-4"
							>
								Report a problem
							</Button>
						)}
						{part.canConfirmDelivery && (
							<Button type="button" onClick={() => setConfirming(true)} className="h-11 rounded-md px-5">
								Confirm delivery
							</Button>
						)}
					</div>
				</div>
			)}

			<AlertDialog open={confirming} onOpenChange={(open) => !confirm.isPending && setConfirming(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm {part.vendorName}&apos;s parcel arrived?</AlertDialogTitle>
						<AlertDialogDescription>
							This releases the payment held in escrow to the seller, and can&apos;t be undone. You can still report a problem for
							7 days.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={confirm.isPending}>Not yet</AlertDialogCancel>
						<AlertDialogAction
							disabled={confirm.isPending}
							onClick={(e) => {
								e.preventDefault();
								confirm.mutate(part.id, { onSuccess: () => setConfirming(false) });
							}}
						>
							{confirm.isPending ? "Confirming…" : "Yes, it arrived"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={reporting} onOpenChange={(open) => !report.isPending && setReporting(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Report a problem with {part.vendorName}&apos;s parcel</AlertDialogTitle>
						<AlertDialogDescription>
							Tell us what went wrong (damaged, missing items, not as described…). Fysi holds the seller&apos;s payment while we
							look into it and replies by email.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<label htmlFor={`problem-${part.id}`} className="sr-only">
						What went wrong
					</label>
					<Textarea
						id={`problem-${part.id}`}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						maxLength={1000}
						rows={4}
						placeholder="e.g. The bottle arrived cracked"
					/>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={report.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={report.isPending || reason.trim().length < 10}
							onClick={(e) => {
								e.preventDefault();
								report.mutate(
									{ vendorOrderId: part.id, reason: reason.trim() },
									{
										onSuccess: () => {
											setReporting(false);
											setReason("");
										},
									},
								);
							}}
						>
							{report.isPending ? "Sending…" : "Send report"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}
