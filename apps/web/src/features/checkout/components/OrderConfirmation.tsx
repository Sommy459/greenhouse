"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@repo/ui/button";
import { FysiLogo } from "@repo/ui/fysi-logo";
import { RecentlyViewedRow } from "@/features/catalog/components/RecentlyViewedRow";
import { useOrder } from "@/features/checkout/hooks";
import { usdc } from "@/lib/format";
import { accountRoutes, shopRoutes } from "@/lib/routes";
import { shortHash } from "@/lib/stellar";

/**
 * Figma "Thank you!" page (C7): the order is paid. Big logo, thanks, the order number and the payment's Stellar
 * transaction(s) with explorer links (PRD payments rule), then the products this shopper viewed recently. The
 * confirmation email is the API's job.
 */
export function OrderConfirmation({ orderId }: { orderId: string }) {
	const { data: order } = useOrder(orderId);

	return (
		<div className="shop-container pt-10 pb-6 lg:pt-9">
			<div className="flex flex-col items-center text-center">
				<span className="animate-pop text-primary-500">
					<FysiLogo size="xl" />
				</span>
				<h1
					className="animate-rise mt-8 text-[32px] leading-tight font-semibold text-ink lg:mt-3 lg:text-[34px]"
					style={{ "--i": 2 } as React.CSSProperties}
				>
					Thank you!
				</h1>
				<p className="animate-rise mt-1 text-[15px] text-ink lg:text-base" style={{ "--i": 3 } as React.CSSProperties}>
					{order?.status === "paid" ? "Your payment is in and your order is with the seller" : "Your order is being processed"}
				</p>
				{order && (
					<div className="animate-rise mt-2 space-y-1 text-xs text-grey-800" style={{ "--i": 4 } as React.CSSProperties}>
						<p>
							Order number <span className="font-medium text-ink">{order.number}</span>: we&apos;ve emailed you the details.
						</p>
						{order.transactions.map((t) => (
							<p key={t.txHash}>
								Paid {usdc(t.amount)} ·{" "}
								<a
									href={t.explorerUrl}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-1 font-mono text-primary-500 hover:underline"
								>
									{shortHash(t.txHash)} <ExternalLink className="size-3" aria-hidden />
									<span className="sr-only">(opens Stellar Expert)</span>
								</a>
							</p>
						))}
					</div>
				)}
				<div className="mt-16 flex flex-wrap justify-center gap-3 lg:mt-5">
					<Button asChild className="h-14 rounded-lg px-7 text-lg font-semibold lg:h-[60px] lg:px-8">
						<Link href={shopRoutes.SEARCH()}>Go back to catalogue</Link>
					</Button>
					<Button asChild variant="outline" className="h-14 rounded-lg px-7 text-lg font-semibold lg:h-[60px] lg:px-8">
						<Link href={accountRoutes.ORDER(orderId)}>Track this order</Link>
					</Button>
				</div>
			</div>

			<div className="mt-10 lg:mt-7">
				<RecentlyViewedRow />
			</div>
		</div>
	);
}
