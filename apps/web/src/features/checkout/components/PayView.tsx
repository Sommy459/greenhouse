"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";
import { Clock, ExternalLink, Link2, QrCode as QrIcon, Share2, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { CopyField } from "@/components/CopyField";
import { QrCode } from "@/components/QrCode";
import { PIN } from "@/features/checkout/schema";
import { useCancelOrder, useOrder, usePayWithExternalWallet, usePayWithWallet } from "@/features/checkout/hooks";
import type { Order } from "@/features/orders/types";
import { useWallet } from "@/features/wallet/hooks";
import { errorMessage } from "@/lib/api/client";
import { price, usdc } from "@/lib/format";
import { accountRoutes, checkoutRoutes, shopRoutes } from "@/lib/routes";
import { minutesSeconds, useNow } from "@/lib/use-now";

type Method = "wallet" | "external" | "qr" | "link";

const METHODS: { value: Method; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
	{ value: "wallet", label: "Fysi wallet", icon: WalletIcon },
	{ value: "external", label: "Stellar wallet", icon: ExternalLink },
	{ value: "qr", label: "Scan QR code", icon: QrIcon },
	{ value: "link", label: "Payment link", icon: Link2 },
];

const CARD = "rounded-lg border border-grey-600 bg-white p-5 lg:p-7";

/**
 * Pay for a placed order (C6), in USDC on Stellar: from the Fysi wallet (PIN), a Stellar wallet (Freighter signs the
 * transaction the API built), a SEP-7 QR code, or a shareable payment link. Every method pays the Fysi settlement account
 * with the order number as memo; the page checks back every 3 seconds and moves on once the API sees the payment.
 */
export function PayView({ orderId }: { orderId: string }) {
	const router = useRouter();
	const { data: order, isPending, isError, error, refetch } = useOrder(orderId);

	// Paid: on to the thank-you page (navigation, not state).
	useEffect(() => {
		if (order?.status === "paid") router.replace(checkoutRoutes.CONFIRMATION(order.id));
	}, [order?.status, order?.id, router]);

	if (isPending) return <div className="shop-container h-[60dvh] animate-pulse py-10" aria-busy />;
	if (isError || !order) {
		return (
			<div className="shop-container py-20 text-center text-sm text-grey-900">
				<p>{errorMessage(error, "We couldn't load this order.")}</p>
				<Button variant="outline" onClick={() => refetch()} className="mt-4">
					Try again
				</Button>
			</div>
		);
	}
	if (order.status !== "awaiting_payment") return <Closed order={order} />;
	return <AwaitingPayment order={order} />;
}

function Closed({ order }: { order: Order }) {
	return (
		<div className="shop-container py-20 text-center">
			<h1 className="text-xl font-semibold text-ink">
				{order.status === "paid"
					? "Payment received"
					: order.status === "expired"
						? "This payment window closed"
						: "Order cancelled"}
			</h1>
			<p className="mx-auto mt-2 max-w-md text-sm text-grey-900">
				{order.status === "paid"
					? "Taking you to your order…"
					: order.status === "expired"
						? "Payment wasn't completed within 15 minutes, so the items went back on sale. Any USDC that arrived is refunded."
						: "This order was cancelled before it was paid."}
			</p>
			<div className="mt-6 flex justify-center gap-3">
				<Button asChild variant="outline">
					<Link href={accountRoutes.ORDER(order.id)}>View order</Link>
				</Button>
				<Button asChild>
					<Link href={shopRoutes.HOME}>Continue shopping</Link>
				</Button>
			</div>
		</div>
	);
}

function AwaitingPayment({ order }: { order: Order }) {
	const [method, setMethod] = useState<Method>("wallet");
	const now = useNow();
	const left = new Date(order.payment.expiresAt).getTime() - now;
	const cancel = useCancelOrder(order.id);
	const partlyPaid = Number(order.paid) > 0;

	return (
		<div className="shop-container grid items-start gap-8 pt-6 pb-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:pt-10">
			<div className="min-w-0 space-y-6">
				<div className="animate-rise">
					<h1 className="text-2xl font-semibold text-ink lg:text-[28px]">Pay for order {order.number}</h1>
					<p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-grey-900">
						<span>
							Amount due: <strong className="text-base font-semibold text-ink">{usdc(order.payment.amountDue)}</strong>
						</span>
						<span className={cn("inline-flex items-center gap-1.5", left < 120_000 && "font-medium text-error-500")}>
							<Clock className="size-4" aria-hidden />
							{left > 0 ? `${minutesSeconds(left)} left to pay` : "Time's up: checking…"}
						</span>
					</p>
					{partlyPaid && (
						<p role="status" className="mt-3 rounded-md bg-warning-50 px-3 py-2 text-sm text-warning-700">
							We received {usdc(order.paid)} so far. Pay the rest ({usdc(order.payment.amountDue)}) to complete the order.
						</p>
					)}
				</div>

				<div role="tablist" aria-label="How to pay" className="animate-rise grid grid-cols-2 gap-2 sm:grid-cols-4">
					{METHODS.map(({ value, label, icon: Icon }) => (
						<button
							key={value}
							type="button"
							role="tab"
							aria-selected={method === value}
							onClick={() => setMethod(value)}
							className={cn(
								"flex flex-col items-center gap-2 rounded-lg border px-3 py-4 text-sm transition-colors",
								method === value
									? "border-primary-500 bg-primary-50 font-medium text-primary-500"
									: "border-grey-600 bg-white text-ink hover:border-primary-300",
							)}
						>
							<Icon className="size-5" aria-hidden />
							{label}
						</button>
					))}
				</div>

				<div role="tabpanel" className="animate-rise">
					{method === "wallet" && <FysiWalletPay order={order} />}
					{method === "external" && <ExternalWalletPay order={order} />}
					{method === "qr" && <QrPay order={order} />}
					{method === "link" && <LinkPay order={order} />}
				</div>
			</div>

			<aside className={cn(CARD, "animate-rise lg:sticky lg:top-6")} aria-label="Order summary">
				<h2 className="text-lg font-semibold text-ink">Order summary</h2>
				<ul className="mt-4 space-y-4">
					{order.vendorOrders.map((vo) => (
						<li key={vo.id}>
							<p className="text-xs text-grey-800">From {vo.vendorName}</p>
							<ul className="mt-1 space-y-1 text-sm text-ink">
								{vo.lines.map((l) => (
									<li key={l.productId} className="flex justify-between gap-3">
										<span className="min-w-0">
											{l.title} <span className="text-grey-800">× {l.quantity}</span>
										</span>
										<span className="shrink-0">{price(l.lineTotal)}</span>
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
				<p className="mt-5 flex justify-between border-t border-grey-600 pt-4 text-base font-semibold text-ink">
					<span>Total</span>
					<span>{price(order.total)}</span>
				</p>
				<Button
					type="button"
					variant="outline"
					onClick={() => cancel.mutate()}
					isLoading={cancel.isPending}
					disabled={partlyPaid}
					className="mt-5 w-full"
				>
					Cancel order
				</Button>
				{partlyPaid && (
					<p className="mt-2 text-xs text-grey-800">Part of this order is paid, so it can&apos;t be cancelled here.</p>
				)}
			</aside>
		</div>
	);
}

function FysiWalletPay({ order }: { order: Order }) {
	const { data: wallet, isPending } = useWallet();
	const pay = usePayWithWallet(order.id);
	const [pin, setPin] = useState("");
	const [error, setError] = useState<string | null>(null);

	if (isPending) return <div className={cn(CARD, "h-48 animate-pulse")} />;
	if (!wallet) {
		return (
			<div className={CARD}>
				<p className="text-base font-medium text-ink">You don&apos;t have a Fysi wallet yet</p>
				<p className="mt-1 text-sm text-grey-900">
					Create one with a PIN, add USDC, then pay in one tap. Or choose another way to pay above.
				</p>
				<Button asChild className="mt-4">
					<Link href={accountRoutes.WALLET}>Create my wallet</Link>
				</Button>
			</div>
		);
	}
	const short = Number(wallet.balance) < Number(order.payment.amountDue);

	return (
		<form
			noValidate
			className={CARD}
			onSubmit={(e) => {
				e.preventDefault();
				if (!PIN.test(pin)) return setError("Enter your 4 to 6 digit PIN");
				setError(null);
				pay.mutate(pin, { onSettled: () => setPin("") });
			}}
		>
			<p className="text-sm text-grey-900">
				Balance: <strong className="font-semibold text-ink">{usdc(wallet.balance)}</strong>
			</p>
			{short ? (
				<p className="mt-3 rounded-md bg-warning-50 px-3 py-2 text-sm text-warning-700">
					Not enough in your wallet for this order.{" "}
					<Link href={accountRoutes.WALLET} className="font-medium underline">
						Add USDC
					</Link>{" "}
					or choose another way to pay.
				</p>
			) : (
				<>
					<label htmlFor="wallet-pin" className="mt-4 block text-sm font-medium text-ink">
						Wallet PIN
					</label>
					<Input
						id="wallet-pin"
						type="password"
						inputMode="numeric"
						autoComplete="off"
						maxLength={6}
						value={pin}
						onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
						aria-invalid={!!error}
						aria-describedby={error ? "wallet-pin-error" : undefined}
						className="mt-1.5 h-12 max-w-48 text-lg tracking-[0.4em]"
					/>
					{error && (
						<p id="wallet-pin-error" className="mt-1.5 text-sm text-error-500">
							{error}
						</p>
					)}
					<Button type="submit" isLoading={pay.isPending} className="mt-4 h-12 w-full sm:w-auto sm:px-8">
						Pay {usdc(order.payment.amountDue)}
					</Button>
				</>
			)}
		</form>
	);
}

function ExternalWalletPay({ order }: { order: Order }) {
	const pay = usePayWithExternalWallet(order.id);
	const [address, setAddress] = useState<string | null>(null);
	const [problem, setProblem] = useState<string | null>(null);
	const [connecting, setConnecting] = useState(false);

	const connect = async () => {
		setConnecting(true);
		setProblem(null);
		try {
			const connected = await isConnected();
			if (!connected.isConnected) {
				setProblem("missing");
				return;
			}
			const access = await requestAccess();
			if (access.error || !access.address) setProblem(access.error?.message ?? "Freighter didn't share an address.");
			else setAddress(access.address);
		} finally {
			setConnecting(false);
		}
	};

	const sign = async (xdr: string, networkPassphrase: string) => {
		const result = await signTransaction(xdr, { networkPassphrase, address: address ?? undefined });
		if (result.error) throw new Error(result.error.message || "The wallet didn't sign the payment.");
		return result.signedTxXdr;
	};

	return (
		<div className={CARD}>
			<p className="text-sm text-grey-900">
				Pay from your own Stellar wallet with <strong className="font-semibold text-ink">Freighter</strong>. Fysi prepares the
				payment; you check and sign it in the wallet.
			</p>
			{!address ? (
				<Button type="button" onClick={connect} isLoading={connecting} className="mt-4">
					Connect Freighter
				</Button>
			) : (
				<>
					<CopyField label="Paying from" value={address} className="mt-4" />
					<Button
						type="button"
						isLoading={pay.isPending}
						onClick={() => pay.mutate({ sourceAddress: address, sign })}
						className="mt-4 h-12 w-full sm:w-auto sm:px-8"
					>
						Sign and pay {usdc(order.payment.amountDue)}
					</Button>
				</>
			)}
			{problem === "missing" ? (
				<p className="mt-3 text-sm text-grey-900">
					Freighter isn&apos;t installed in this browser.{" "}
					<a href="https://www.freighter.app" target="_blank" rel="noreferrer" className="font-medium text-primary-500 underline">
						Get Freighter
					</a>
					, or use the QR code with any other Stellar wallet.
				</p>
			) : (
				problem && <p className="mt-3 text-sm text-error-500">{problem}</p>
			)}
		</div>
	);
}

function QrPay({ order }: { order: Order }) {
	const p = order.payment;
	return (
		<div className={cn(CARD, "grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]")}>
			<QrCode
				value={p.sep7Uri}
				label={`QR code to pay ${p.amountDue} USDC for order ${order.number}`}
				className="mx-auto w-full max-w-[220px]"
			/>
			<div className="min-w-0 space-y-3">
				<p className="text-sm text-grey-900">
					Scan with any Stellar wallet (LOBSTR, xBull, Freighter mobile…). It fills in everything. Paying by hand? Send exactly
					this amount <strong className="font-semibold text-ink">with the memo</strong>, or we can&apos;t match it.
				</p>
				<CopyField label="Amount" value={`${p.amountDue} ${p.assetCode}`} />
				<CopyField label="Send to" value={p.destination} />
				<CopyField label="Memo (required)" value={p.memo} />
				<p className="text-xs text-grey-800">Network: Stellar {p.network}</p>
			</div>
		</div>
	);
}

function LinkPay({ order }: { order: Order }) {
	const link = order.payment.payLink;
	const share = () => {
		if (typeof navigator.share === "function")
			navigator.share({ title: `Pay for Fysi order ${order.number}`, url: link }).catch(() => undefined);
		else navigator.clipboard.writeText(link).catch(() => undefined);
	};
	return (
		<div className={CARD}>
			<p className="text-sm text-grey-900">
				Send this link to whoever is paying. It opens a page with the QR code and payment details for this order, and works until
				the time runs out.
			</p>
			<CopyField label="Payment link" value={link} mono={false} className="mt-4" />
			<Button type="button" variant="outline" className="mt-3 gap-2" onClick={share}>
				<Share2 className="size-4" aria-hidden /> Share link
			</Button>
		</div>
	);
}
