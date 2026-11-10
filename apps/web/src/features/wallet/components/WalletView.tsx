"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { CopyField } from "@/components/CopyField";
import { QrCode } from "@/components/QrCode";
import { PIN } from "@/features/checkout/schema";
import { useChangePin, useCreateWallet, useWallet } from "@/features/wallet/hooks";
import type { Wallet } from "@/features/wallet/types";
import { errorMessage } from "@/lib/api/client";
import { price, usdc } from "@/lib/format";
import { accountRoutes } from "@/lib/routes";
import { shortHash } from "@/lib/stellar";

const CARD = "rounded-md bg-white p-5 md:border md:border-grey-600 md:p-7";
const day = (iso: string) =>
	new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * The Fysi wallet (C9): a custodial Stellar wallet Fysi keeps the keys for. Create it with a PIN, add USDC to its address
 * (QR or copy), pay for orders with the PIN, see activity with explorer links, change the PIN.
 */
export function WalletView() {
	const { data: wallet, isPending, isError, error, refetch } = useWallet();

	return (
		<div className="pb-6 lg:pb-16">
			<Link href={accountRoutes.DASHBOARD} className="inline-flex items-center gap-3 text-lg text-ink lg:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				<span>Wallet</span>
			</Link>
			<h1 className="animate-rise mt-6 text-2xl text-ink lg:mt-0 lg:text-[28px]">Fysi Wallet</h1>

			<div className="mt-6 space-y-6">
				{isError ? (
					<div className={clsx(CARD, "text-center text-sm text-grey-900")}>
						<p>{errorMessage(error, "We couldn't load your wallet.")}</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<Skeleton className="h-64 w-full rounded-md" />
				) : wallet ? (
					<WalletDetails wallet={wallet} />
				) : (
					<CreateWallet />
				)}
			</div>
		</div>
	);
}

function PinInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
	return (
		<div>
			<label htmlFor={id} className="text-sm font-medium text-ink">
				{label}
			</label>
			<Input
				id={id}
				type="password"
				inputMode="numeric"
				autoComplete="off"
				maxLength={6}
				value={value}
				onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
				className="mt-1.5 h-12 max-w-48 text-lg tracking-[0.4em]"
			/>
		</div>
	);
}

function CreateWallet() {
	const create = useCreateWallet();
	const [pin, setPin] = useState("");
	const [again, setAgain] = useState("");
	const [problem, setProblem] = useState<string | null>(null);

	return (
		<form
			noValidate
			className={clsx(CARD, "animate-rise")}
			onSubmit={(e) => {
				e.preventDefault();
				if (!PIN.test(pin)) return setProblem("Choose a PIN of 4 to 6 digits.");
				if (pin !== again) return setProblem("The PINs don't match.");
				setProblem(null);
				create.mutate(pin);
			}}
		>
			<h2 className="text-lg font-medium text-ink">Create your Fysi wallet</h2>
			<p className="mt-1 max-w-xl text-sm text-grey-900">
				Hold USDC with Fysi and pay for orders in one tap. You choose a PIN to approve payments; Fysi keeps the wallet&apos;s keys
				safe, so there&apos;s nothing to back up.
			</p>
			<div className="mt-5 flex flex-wrap gap-5">
				<PinInput id="new-pin" label="Choose a PIN (4–6 digits)" value={pin} onChange={setPin} />
				<PinInput id="new-pin-again" label="Enter it again" value={again} onChange={setAgain} />
			</div>
			{problem && (
				<p role="alert" className="mt-3 text-sm text-error-500">
					{problem}
				</p>
			)}
			<Button type="submit" isLoading={create.isPending} className="mt-5 h-11 px-6">
				Create wallet
			</Button>
		</form>
	);
}

function WalletDetails({ wallet }: { wallet: Wallet }) {
	return (
		<>
			<section aria-label="Balance" className={clsx(CARD, "animate-rise grid gap-6 md:grid-cols-[minmax(0,1fr)_220px]")}>
				<div className="min-w-0">
					<p className="text-sm text-grey-900">Balance</p>
					<p className="text-3xl font-semibold text-ink">{usdc(wallet.balance)}</p>
					{wallet.status === "pending" && (
						<p className="mt-2 rounded-md bg-warning-50 px-3 py-2 text-sm text-warning-700">
							Your wallet is being opened on Stellar. You can add USDC in a moment.
						</p>
					)}
					{wallet.overCap && (
						<p className="mt-2 rounded-md bg-warning-50 px-3 py-2 text-sm text-warning-700">
							Your balance is over your limit ({price(wallet.balanceCap)}). Spend some before adding more.
						</p>
					)}
					<h2 className="mt-6 text-base font-medium text-ink">Add USDC</h2>
					<p className="mt-1 text-sm text-grey-900">
						Send USDC on Stellar to this address from any wallet or exchange, or scan the code. Limit {price(wallet.balanceCap)}{" "}
						(level {wallet.kycTier}).
					</p>
					<CopyField label="Your wallet address" value={wallet.address} className="mt-3" />
				</div>
				<QrCode value={wallet.depositUri} label="QR code with your wallet address" className="mx-auto w-full max-w-[220px]" />
			</section>

			<section
				aria-labelledby="activity-title"
				className={clsx(CARD, "animate-rise")}
				style={{ "--i": 1 } as React.CSSProperties}
			>
				<h2 id="activity-title" className="text-lg font-medium text-ink">
					Activity
				</h2>
				{wallet.activity.length === 0 ? (
					<p className="mt-3 text-sm text-grey-900">Nothing yet. Deposits and payments show up here.</p>
				) : (
					<ul className="mt-3 divide-y divide-grey-600">
						{wallet.activity.map((a) => (
							<li key={a.txHash} className="flex items-center gap-4 py-3">
								<span
									className={clsx(
										"grid size-9 shrink-0 place-items-center rounded-full",
										a.direction === "in" ? "bg-success-50 text-success-700" : "bg-grey-500 text-ink",
									)}
								>
									{a.direction === "in" ? (
										<ArrowDownLeft className="size-4" aria-hidden />
									) : (
										<ArrowUpRight className="size-4" aria-hidden />
									)}
								</span>
								<div className="min-w-0 flex-1">
									<p className="text-sm text-ink">
										{a.direction === "in" ? "Received" : "Paid"}
										{a.memo && <span className="text-grey-800"> · {a.memo}</span>}
									</p>
									<p className="text-xs text-grey-800">
										{day(a.at)} ·{" "}
										<a
											href={a.explorerUrl}
											target="_blank"
											rel="noreferrer"
											className="inline-flex items-center gap-1 font-mono text-primary-500 hover:underline"
										>
											{shortHash(a.txHash)} <ExternalLink className="size-3" aria-hidden />
											<span className="sr-only">(opens Stellar Expert)</span>
										</a>
									</p>
								</div>
								<p className={clsx("shrink-0 text-sm font-medium", a.direction === "in" ? "text-success-700" : "text-ink")}>
									{a.direction === "in" ? "+" : "−"}
									{a.amount} {a.assetCode}
								</p>
							</li>
						))}
					</ul>
				)}
			</section>

			<ChangePin />
		</>
	);
}

function ChangePin() {
	const [password, setPassword] = useState("");
	const [pin, setPin] = useState("");
	const [problem, setProblem] = useState<string | null>(null);
	const change = useChangePin({
		onChanged: () => {
			setPassword("");
			setPin("");
		},
	});

	return (
		<form
			noValidate
			className={clsx(CARD, "animate-rise")}
			style={{ "--i": 2 } as React.CSSProperties}
			onSubmit={(e) => {
				e.preventDefault();
				if (!password) return setProblem("Enter your account password.");
				if (!PIN.test(pin)) return setProblem("Choose a PIN of 4 to 6 digits.");
				setProblem(null);
				change.mutate({ password, newPin: pin });
			}}
		>
			<h2 className="text-lg font-medium text-ink">Change PIN</h2>
			<div className="mt-4 flex flex-wrap items-end gap-5">
				<div>
					<label htmlFor="pin-password" className="text-sm font-medium text-ink">
						Account password
					</label>
					<Input
						id="pin-password"
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="mt-1.5 h-12 w-64"
					/>
				</div>
				<PinInput id="change-pin" label="New PIN" value={pin} onChange={setPin} />
			</div>
			{problem && (
				<p role="alert" className="mt-3 text-sm text-error-500">
					{problem}
				</p>
			)}
			<Button type="submit" variant="outline" isLoading={change.isPending} className="mt-5 h-11 px-6">
				Change PIN
			</Button>
		</form>
	);
}
