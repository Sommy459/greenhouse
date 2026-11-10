"use client";

import clsx from "clsx";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ExternalLink, Wallet } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { CopyField } from "@/components/CopyField";
import { ListHeader } from "@/components/ListHeader";
import { useCancelWithdrawal, useConfirmWithdrawal, useStartWithdrawal, useVendorWallet } from "@/features/wallet/hooks";
import type { VendorWallet, WalletEntry } from "@/features/wallet/types";
import { errorMessage } from "@/lib/api/client";
import { price, usdc } from "@/lib/format";
import { shortHash } from "@/lib/stellar";

const CARD = "rounded-xl border border-grey-600 bg-white p-5 lg:p-6";
const STELLAR_ADDRESS = /^G[A-Z2-7]{55}$/;
const when = (iso: string) =>
	new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const STATUS_LABEL: Record<WalletEntry["status"], string> = {
	awaiting_confirmation: "Waiting for your code",
	queued: "Queued",
	submitted: "Sending",
	confirmed: "Done",
	failed: "Failed",
};

/**
 * The shop's wallet (PRD V5, V6; it replaces Figma "Account Statements"): available USDC, what's still in escrow, today's
 * withdrawal limit, payouts and withdrawals with explorer links, and Withdraw to the vendor's own Stellar address
 * (confirmed with the password and an emailed code). Fysi holds the keys; there's no seed phrase.
 */
export function WalletView() {
	const { data: wallet, isPending, isError, error, refetch } = useVendorWallet();

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Wallet" crumb="Wallet" />
			<div className="mt-8 space-y-6">
				{isError ? (
					<div className={clsx(CARD, "text-center text-sm text-grey-900")}>
						<p>{errorMessage(error, "Couldn't load your wallet.")}</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<Skeleton className="h-40 w-full rounded-xl" />
				) : (
					<Details wallet={wallet} />
				)}
			</div>
		</div>
	);
}

function Details({ wallet }: { wallet: VendorWallet }) {
	const awaiting = wallet.history.find((h) => h.kind === "withdrawal" && h.status === "awaiting_confirmation");
	return (
		<>
			<ul className="grid gap-4 sm:grid-cols-3">
				{[
					["Available", price(wallet.available), "Yours to withdraw"],
					["In escrow", price(wallet.pending), "Released when customers confirm delivery, or 7 days after shipping"],
					["Withdrawable today", price(wallet.withdrawableToday), "What's left of today's limit"],
				].map(([label, value, hint]) => (
					<li key={label} className={CARD}>
						<p className="text-sm text-grey-900">{label}</p>
						<p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
						<p className="mt-1 text-xs text-grey-800">{hint}</p>
					</li>
				))}
			</ul>

			{wallet.status === "none" ? (
				<p className={clsx(CARD, "text-sm text-grey-900")}>Your wallet is created when your shop is approved.</p>
			) : (
				<>
					{wallet.address && (
						<section className={CARD} aria-label="Wallet address">
							<p className="flex items-center gap-2 text-base font-semibold text-ink">
								<Wallet className="size-5 text-primary-500" aria-hidden /> Your Fysi wallet
							</p>
							{wallet.status === "pending" && <p className="mt-1 text-sm text-warning-700">Being opened on Stellar…</p>}
							<CopyField label="Address (Stellar)" value={wallet.address} className="mt-3" />
						</section>
					)}
					{awaiting ? <ConfirmWithdrawal entry={awaiting} /> : <StartWithdrawal max={wallet.withdrawableToday.cents} />}
				</>
			)}

			<section className={CARD} aria-labelledby="history-title">
				<h2 id="history-title" className="text-lg font-semibold text-ink">
					Payouts and withdrawals
				</h2>
				{wallet.history.length === 0 ? (
					<p className="mt-3 text-sm text-grey-900">Nothing yet. Payouts arrive here when escrow releases an order.</p>
				) : (
					<ul className="mt-3 divide-y divide-grey-600">
						{wallet.history.map((h) => (
							<li key={h.id} className="flex items-center gap-4 py-3">
								<span
									className={clsx(
										"grid size-9 shrink-0 place-items-center rounded-full",
										h.kind === "payout" ? "bg-success-50 text-success-700" : "bg-grey-500 text-ink",
									)}
								>
									{h.kind === "payout" ? (
										<ArrowDownLeft className="size-4" aria-hidden />
									) : (
										<ArrowUpRight className="size-4" aria-hidden />
									)}
								</span>
								<div className="min-w-0 flex-1">
									<p className="text-sm text-ink">
										{h.kind === "payout"
											? `Payout${h.orderNumber ? ` · order ${h.orderNumber}` : ""}`
											: `Withdrawal to ${h.destination ? shortHash(h.destination) : "your address"}`}
									</p>
									<p className="text-xs text-grey-800">
										{when(h.createdAt)} · {STATUS_LABEL[h.status]}
										{h.error && <span className="text-error-500"> · {h.error}</span>}
										{h.txHash && h.explorerUrl && (
											<>
												{" · "}
												<a
													href={h.explorerUrl}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center gap-1 font-mono text-primary-500 hover:underline"
												>
													{shortHash(h.txHash)} <ExternalLink className="size-3" aria-hidden />
													<span className="sr-only">(opens Stellar Expert)</span>
												</a>
											</>
										)}
									</p>
								</div>
								<p className={clsx("shrink-0 text-sm font-medium", h.kind === "payout" ? "text-success-700" : "text-ink")}>
									{h.kind === "payout" ? "+" : "−"}
									{usdc(h.amount)}
								</p>
							</li>
						))}
					</ul>
				)}
			</section>
		</>
	);
}

function StartWithdrawal({ max }: { max: number }) {
	const start = useStartWithdrawal();
	const [destination, setDestination] = useState("");
	const [dollars, setDollars] = useState("");
	const [problem, setProblem] = useState<string | null>(null);

	return (
		<form
			noValidate
			className={CARD}
			aria-labelledby="withdraw-title"
			onSubmit={(e) => {
				e.preventDefault();
				const cents = Math.round(Number(dollars) * 100);
				if (!STELLAR_ADDRESS.test(destination.trim()))
					return setProblem("Enter a Stellar address (it starts with G and has 56 characters).");
				if (!cents || cents <= 0) return setProblem("Enter an amount above $0.");
				if (cents > max) return setProblem(`You can withdraw up to ${price(max)} today.`);
				setProblem(null);
				start.mutate({ destination: destination.trim(), amountCents: cents });
			}}
		>
			<h2 id="withdraw-title" className="text-lg font-semibold text-ink">
				Withdraw
			</h2>
			<p className="mt-1 text-sm text-grey-900">
				Send USDC to your own Stellar wallet or exchange address (it must accept USDC). We&apos;ll email you a code to confirm.
				Bank cash-out comes later.
			</p>
			<div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end">
				<label className="grid gap-1.5">
					<span className="text-sm font-medium text-ink">To address</span>
					<Input
						value={destination}
						onChange={(e) => setDestination(e.target.value)}
						placeholder="G…"
						className="h-11 font-mono"
					/>
				</label>
				<label className="grid gap-1.5">
					<span className="text-sm font-medium text-ink">Amount (US$)</span>
					<Input
						inputMode="decimal"
						value={dollars}
						onChange={(e) => setDollars(e.target.value.replace(/[^\d.]/g, ""))}
						placeholder="0.00"
						className="h-11"
					/>
				</label>
				<Button type="submit" isLoading={start.isPending} disabled={max <= 0} className="h-11">
					Continue
				</Button>
			</div>
			{problem && (
				<p role="alert" className="mt-2 text-sm text-error-500">
					{problem}
				</p>
			)}
		</form>
	);
}

function ConfirmWithdrawal({ entry }: { entry: WalletEntry }) {
	const confirm = useConfirmWithdrawal();
	const cancel = useCancelWithdrawal();
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");

	return (
		<form
			noValidate
			className={clsx(CARD, "border-primary-500")}
			onSubmit={(e) => {
				e.preventDefault();
				if (password && /^\d{6}$/.test(code)) confirm.mutate({ id: entry.id, password, code });
			}}
		>
			<h2 className="text-lg font-semibold text-ink">Confirm your withdrawal</h2>
			<p className="mt-1 text-sm text-grey-900">
				{usdc(entry.amount)} to{" "}
				<span className="font-mono">{entry.destination ? shortHash(entry.destination) : "your address"}</span>. Enter your
				password and the 6-digit code we emailed you{entry.confirmBy ? ` before ${when(entry.confirmBy)}` : ""}.
			</p>
			<div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto] sm:items-end">
				<label className="grid gap-1.5">
					<span className="text-sm font-medium text-ink">Password</span>
					<Input
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="h-11"
					/>
				</label>
				<label className="grid gap-1.5">
					<span className="text-sm font-medium text-ink">Emailed code</span>
					<Input
						inputMode="numeric"
						maxLength={6}
						value={code}
						onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
						className="h-11 tracking-[0.3em]"
					/>
				</label>
				<Button type="submit" isLoading={confirm.isPending} disabled={!password || code.length !== 6} className="h-11">
					Send USDC
				</Button>
			</div>
			<button
				type="button"
				onClick={() => cancel.mutate(entry.id)}
				disabled={cancel.isPending}
				className="mt-3 text-sm text-error-500 hover:underline"
			>
				Cancel this withdrawal
			</button>
		</form>
	);
}
