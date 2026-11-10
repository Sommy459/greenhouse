"use client";

import Link from "next/link";
import { CircleCheck, Clock } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { CopyField } from "@/components/CopyField";
import { QrCode } from "@/components/QrCode";
import { usePayLink } from "@/features/checkout/hooks";
import { errorMessage } from "@/lib/api/client";
import { price, usdc } from "@/lib/format";
import { shopRoutes } from "@/lib/routes";
import { minutesSeconds, useNow } from "@/lib/use-now";

/**
 * The payment link's page (C6): anyone with the link can pay the order (a friend, a family member). The QR code and
 * the exact amount, address and memo; it checks back every 3 seconds and says when the payment is in.
 */
export function PayLinkView({ token }: { token: string }) {
	const { data, isPending, isError, error } = usePayLink(token);
	const now = useNow();

	if (isPending) return <div className="shop-container h-[60dvh] animate-pulse py-10" aria-busy />;
	if (isError || !data) {
		return (
			<div className="shop-container py-20 text-center text-sm text-grey-900">
				<p>{errorMessage(error, "This payment link doesn't work. Ask for a new one.")}</p>
			</div>
		);
	}

	const p = data.payment;
	const left = new Date(p.expiresAt).getTime() - now;

	return (
		<div className="shop-container py-8 lg:py-12">
			<div className="mx-auto max-w-2xl rounded-lg border border-grey-600 bg-white p-5 lg:p-8">
				<h1 className="text-2xl font-semibold text-ink">Pay for Fysi order {data.number}</h1>
				<p className="mt-1 text-sm text-grey-900">
					{data.items.join(", ")} · Total {price(data.total)}
				</p>

				{data.status === "paid" ? (
					<p
						role="status"
						className="mt-6 flex items-center gap-2 rounded-md bg-success-50 px-4 py-3 text-base font-medium text-success-700"
					>
						<CircleCheck className="size-5" aria-hidden /> Paid. Thank you!
					</p>
				) : data.status !== "awaiting_payment" ? (
					<p className="mt-6 rounded-md bg-grey-500 px-4 py-3 text-sm text-grey-900">
						{data.status === "expired"
							? "The time to pay this order ran out, so it was released. Any USDC that arrived is refunded."
							: "This order was cancelled."}
					</p>
				) : (
					<>
						<p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-grey-900">
							<span>
								Amount due: <strong className="text-base font-semibold text-ink">{usdc(p.amountDue)}</strong>
							</span>
							<span className={cn("inline-flex items-center gap-1.5", left < 120_000 && "font-medium text-error-500")}>
								<Clock className="size-4" aria-hidden />
								{left > 0 ? `${minutesSeconds(left)} left to pay` : "Time's up: checking…"}
							</span>
						</p>
						<div className="mt-6 grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
							<QrCode value={p.sep7Uri} label={`QR code to pay ${p.amountDue} USDC`} className="mx-auto w-full max-w-[220px]" />
							<div className="min-w-0 space-y-3">
								<p className="text-sm text-grey-900">
									Scan with any Stellar wallet. Paying by hand? Send exactly this amount{" "}
									<strong className="font-semibold text-ink">with the memo</strong>.
								</p>
								<CopyField label="Amount" value={`${p.amountDue} ${p.assetCode}`} />
								<CopyField label="Send to" value={p.destination} />
								<CopyField label="Memo (required)" value={p.memo} />
								<p className="text-xs text-grey-800">Network: Stellar {p.network}</p>
							</div>
						</div>
					</>
				)}
				<Button asChild variant="outline" className="mt-6">
					<Link href={shopRoutes.HOME}>Visit Fysi</Link>
				</Button>
			</div>
		</div>
	);
}
