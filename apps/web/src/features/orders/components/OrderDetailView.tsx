"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ExternalLink, PackageCheck } from "lucide-react";
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
import { StatusHistory } from "@/features/orders/components/StatusHistory";
import { useBuyAgain, useConfirmDelivery, useOrder } from "@/features/orders/hooks";
import type { ClosedStatus, CustomerOrder, StellarPaymentMethod } from "@/features/orders/types";
import { errorMessage } from "@/lib/api/client";
import { naira, usdc } from "@/lib/format";
import { accountRoutes, shopRoutes, supportRoutes } from "@/lib/routes";
import { explorerTxUrl, shortHash } from "@/lib/stellar";

const PAYMENT_LABEL: Record<StellarPaymentMethod, string> = {
	fysi_wallet: "Fysi wallet (USDC)",
	external_wallet: "External Stellar wallet (USDC)",
	qr_code: "Scanned QR code (USDC)",
	payment_link: "Payment link (USDC)",
};
const CLOSED_LABEL: Record<ClosedStatus, string> = {
	cancelled: "Cancelled",
	delivery_failed: "Delivery failed",
	returned: "Returned",
};
const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const CARD = "rounded-md bg-white px-4 py-5 md:border md:border-grey-600 md:px-7 md:py-7";
const CARD_TITLE = "border-b border-grey-800 pb-5 text-lg text-ink md:text-xl";
const TERM = "text-sm font-medium text-ink md:text-lg md:font-normal";
const VALUE = "mt-1.5 text-sm text-grey-900 md:text-base";

function TxLink({ hash, network }: { hash: string; network: "testnet" | "public" }) {
	return (
		<a
			href={explorerTxUrl(hash, network)}
			target="_blank"
			rel="noreferrer"
			className="inline-flex items-center gap-1 font-mono text-primary-500 hover:underline"
		>
			{shortHash(hash)} <ExternalLink className="size-3.5" aria-hidden />
			<span className="sr-only">(opens Stellar Expert)</span>
		</a>
	);
}

/**
 * Figma "Order Detail" (C7, C8): the order's products with Buy Again, delivery and payment details, and the status
 * history. Payment is USDC on Stellar (PRD), so it shows the USDC paid and the transaction. Once the parcel is on its way
 * the customer confirms delivery (releasing the seller's payout), then has 7 days to report a problem.
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

function Detail({ order }: { order: CustomerOrder }) {
	const buyAgain = useBuyAgain();
	const confirm = useConfirmDelivery();
	const [confirming, setConfirming] = useState(false);
	const products = order.items.length;

	return (
		<>
			<div className="animate-rise mt-8 text-base text-grey-900 lg:mt-9" style={{ "--i": 1 } as React.CSSProperties}>
				<p className="font-semibold text-ink">Order ID: {order.number}</p>
				<p className="mt-2">
					{products} Product{products === 1 ? "" : "s"}
				</p>
				<p className="mt-2">{longDate(order.created_at)}</p>
			</div>

			<ul className="mt-8 space-y-6 lg:mt-12" aria-label="Products in this order">
				{order.items.map((item, i) => (
					<li
						key={item.id}
						className="animate-rise flex flex-col gap-5 md:flex-row md:items-start md:justify-between"
						style={{ "--i": Math.min(i + 2, 6) } as React.CSSProperties}
					>
						<div className="flex gap-6 rounded-md bg-white p-3 md:bg-transparent md:p-0 lg:gap-8">
							<Link
								href={shopRoutes.PRODUCT(item.slug)}
								className="relative size-[100px] shrink-0 overflow-hidden rounded-md bg-grey-600 md:h-[154px] md:w-[167px]"
							>
								{item.image_url && <Image src={item.image_url} alt="" fill sizes="167px" className="object-cover" />}
								<span className="sr-only">{item.name}</span>
							</Link>
							<div className="min-w-0 space-y-1 text-base text-grey-900 md:space-y-2 md:pt-2">
								<p>
									<Link href={shopRoutes.PRODUCT(item.slug)} className="hover:text-primary-500 hover:underline">
										{item.name}
									</Link>
								</p>
								{item.vendor_name && <p className="text-sm">Sold by {item.vendor_name}</p>}
								<p>Qty: {item.quantity}</p>
								<p className="text-ink">{naira(item.price * item.quantity)}</p>
							</div>
						</div>
						<Button
							type="button"
							isLoading={buyAgain.isPending && buyAgain.variables?.id === item.id}
							disabled={buyAgain.isPending}
							onClick={() => buyAgain.mutate(item)}
							className="h-11 w-full rounded-md px-5 text-base md:w-auto md:shrink-0"
						>
							Buy Again
						</Button>
					</li>
				))}
			</ul>

			{order.status === "shipped" && (
				<div className="animate-rise mt-8 flex flex-col gap-4 rounded-md border border-primary-500 bg-primary-50 p-5 sm:flex-row sm:items-center sm:justify-between">
					<p className="flex gap-3 text-base text-ink">
						<PackageCheck className="mt-0.5 size-5 shrink-0 text-primary-500" aria-hidden />
						<span>
							Got your parcel? Confirm it arrived so we can pay the seller. If you don&apos;t, it&apos;s confirmed automatically 7
							days after shipping.
						</span>
					</p>
					<Button type="button" onClick={() => setConfirming(true)} className="h-11 shrink-0 rounded-md px-5">
						Confirm delivery
					</Button>
				</div>
			)}

			{order.status === "delivered" && order.report_until && (
				<p className="mt-8 rounded-md bg-white p-5 text-base text-grey-900">
					{order.can_report ? (
						<>
							Something wrong with this order?{" "}
							<Link href={supportRoutes.REPORT_ORDER(order.number)} className="font-medium text-primary-500 hover:underline">
								Report a problem
							</Link>{" "}
							by {shortDate(order.report_until)}.
						</>
					) : (
						<>
							The 7 days to report a problem ended on {shortDate(order.report_until)}. For anything else,{" "}
							<Link href={supportRoutes.CONTACT} className="font-medium text-primary-500 hover:underline">
								contact us
							</Link>
							.
						</>
					)}
				</p>
			)}

			<div className="mt-8 grid gap-2 md:mt-9 md:grid-cols-2 md:gap-9">
				<section aria-labelledby="delivery-details" className={CARD}>
					<h2 id="delivery-details" className={CARD_TITLE}>
						Delivery Details
					</h2>
					<dl className="mt-5 space-y-6">
						<div>
							<dt className={TERM}>Delivery Method</dt>
							<dd className={VALUE}>{order.delivery.method === "pickup" ? "Pickup station" : "Door delivery"}</dd>
						</div>
						<div>
							<dt className={TERM}>Delivery Address</dt>
							<dd className={VALUE}>
								{order.delivery.recipient} · {order.delivery.phone_number}
								<br />
								{order.delivery.address}
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
							<dd className={VALUE}>
								{order.payment ? (
									<>
										{PAYMENT_LABEL[order.payment.method]}
										<span className="mt-1 block">
											Paid {usdc(order.payment.amount_usdc)} ·{" "}
											<TxLink hash={order.payment.tx_hash} network={order.payment.network} />
										</span>
									</>
								) : (
									"Waiting for payment"
								)}
							</dd>
						</div>
						<div>
							<dt className={TERM}>Payment Details</dt>
							<dd className={`${VALUE} space-y-1.5`}>
								<p>Subtotal: {naira(order.subtotal)}</p>
								{order.discount > 0 && <p>Discount: −{naira(order.discount)}</p>}
								<p>Shipping Fee: {naira(order.shipping)}</p>
								<p className="text-base font-medium text-ink md:text-lg">Total: {naira(order.total)}</p>
							</dd>
						</div>
					</dl>
				</section>
			</div>

			<section aria-labelledby="status-history" className="mt-8 px-4 md:mt-10 md:px-0">
				<h2 id="status-history" className="text-lg text-ink md:text-base md:font-medium">
					Status History
				</h2>
				{/* A failed or returned order still shows how far it got; a cancelled one never left. */}
				{order.status !== "cancelled" && <StatusHistory timeline={order.timeline} />}
				{order.closed && (
					<div className="mt-8 rounded-md border border-error-500 bg-error-50 p-5 text-base text-ink">
						<p className="font-medium">
							{CLOSED_LABEL[order.closed.status]} on {shortDate(order.closed.at)}
						</p>
						<p className="mt-1 text-grey-900">{order.closed.reason}</p>
						{order.closed.refund_tx_hash && order.payment ? (
							<p className="mt-2 text-sm text-grey-900">
								Refunded {usdc(order.payment.amount_usdc)} to your wallet ·{" "}
								<TxLink hash={order.closed.refund_tx_hash} network={order.payment.network} />
							</p>
						) : (
							order.payment && <p className="mt-2 text-sm text-grey-900">Your refund is on its way to your wallet.</p>
						)}
					</div>
				)}
			</section>

			<AlertDialog open={confirming} onOpenChange={(open) => !confirm.isPending && setConfirming(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm your order arrived?</AlertDialogTitle>
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
								confirm.mutate(order.id, { onSuccess: () => setConfirming(false) });
							}}
						>
							{confirm.isPending ? "Confirming…" : "Yes, it arrived"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
