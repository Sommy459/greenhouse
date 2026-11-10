"use client";

import clsx from "clsx";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { Skeleton } from "@repo/ui/skeleton";
import { useStatement } from "@/features/statements/hooks";
import { amount, periodLabel, STATUS_LABEL, STATUS_TONE } from "@/features/statements/options";
import type { Currency } from "@/features/statements/types";
import { errorMessage } from "@/lib/api/client";
import { consoleRoutes } from "@/lib/routes";
import { explorerTxUrl, shortHash } from "@/lib/stellar";

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const ROW = "flex items-center justify-between gap-4 border-b border-grey-600 py-5";

/**
 * Figma "Details": the period and its reference, the opening balance, each sale, refund and commission line, then the
 * closing balance and what was paid out (with the payout transaction on Stellar Expert).
 */
export function StatementDialog({ id, currency, onClose }: { id: string | null; currency: Currency; onClose: () => void }) {
	const { data: s, isPending, isError, error, refetch } = useStatement(id);

	return (
		<Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="block max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white px-5 py-7 sm:max-w-[1000px] sm:px-14 sm:py-12 lg:px-[88px]"
			>
				<div className="flex items-start justify-between gap-4">
					<DialogTitle className="text-2xl font-medium text-ink lg:text-[28px]">Details</DialogTitle>
					<DialogClose aria-label="Close" className="rounded-md p-1 text-ink hover:bg-grey-500">
						<X className="size-6" />
					</DialogClose>
				</div>
				<DialogDescription className="sr-only">
					{s ? `Statement ${s.reference} for ${periodLabel(s.period_start, s.period_end)}` : "Loading the statement"}
				</DialogDescription>

				{isError ? (
					<div className="py-16 text-center text-sm text-grey-900">
						<p>{errorMessage(error, "Couldn't load this statement.")}</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending || !s ? (
					<div className="mt-10 space-y-4" aria-busy>
						<Skeleton className="h-9 w-72" />
						<Skeleton className="h-9 w-80" />
						{Array.from({ length: 5 }, (_, i) => (
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
				) : (
					<>
						<div className="mt-10 space-y-3 border-b border-grey-600 pb-7 text-2xl font-medium text-grey-900 lg:text-[28px]">
							<p>{periodLabel(s.period_start, s.period_end)}</p>
							<p className="flex flex-wrap items-center gap-4">
								<span className="break-all">{s.reference}</span>
								<span className={clsx("rounded-full px-3 py-1 text-sm font-medium", STATUS_TONE[s.status])}>
									{STATUS_LABEL[s.status]}
								</span>
							</p>
						</div>

						<dl className="text-base text-grey-900 lg:text-lg">
							<div className={ROW}>
								<dt>Opening Balance</dt>
								<dd className="tabular-nums">{amount(s.opening_balance, currency)}</dd>
							</div>
						</dl>

						<section aria-label="Transactions" className="min-h-40 py-2 lg:min-h-64">
							{s.entries.length === 0 ? (
								<p className="py-16 text-center text-base text-grey-800">No transactions in this period yet.</p>
							) : (
								<ul className="divide-y divide-grey-600">
									{s.entries.map((e) => (
										<li key={e.id} className="flex items-center justify-between gap-4 py-4">
											<div className="min-w-0">
												<p className="text-base text-ink">
													{e.order ? (
														<>
															{e.kind === "refund" ? "Refund" : "Sale"} · Order{" "}
															<Link
																href={consoleRoutes.ORDER(e.order.id)}
																className="font-medium hover:text-primary-500 hover:underline"
															>
																{e.order.number}
															</Link>
														</>
													) : (
														e.description
													)}
												</p>
												<p className="mt-0.5 text-sm text-grey-800">
													{day(e.at)}
													{e.kind === "sale" && e.order && !e.order.released && (
														<span className="ml-2 text-warning-700">in escrow</span>
													)}
												</p>
											</div>
											<p
												className={clsx(
													"shrink-0 text-base tabular-nums",
													e.amount[currency] < 0 ? "text-error-500" : "text-ink",
												)}
											>
												{e.amount[currency] > 0 && "+"}
												{amount(e.amount, currency)}
											</p>
										</li>
									))}
								</ul>
							)}
						</section>

						<dl className="border-t border-grey-600 text-base font-medium text-grey-900 uppercase lg:text-lg">
							<div className={ROW}>
								<dt>Closing Balance</dt>
								<dd className="tabular-nums">{amount(s.closing_balance, currency)}</dd>
							</div>
							<div className={ROW}>
								<dt>Payout</dt>
								<dd className="tabular-nums">{amount(s.payout, currency)}</dd>
							</div>
						</dl>

						<p className="mt-5 text-sm text-grey-900">
							{s.payout_tx ? (
								<>
									Paid to your wallet on {day(s.payout_tx.at)} ·{" "}
									<a
										href={explorerTxUrl(s.payout_tx.hash, s.payout_tx.network)}
										target="_blank"
										rel="noreferrer"
										className="inline-flex items-center gap-1 font-mono text-primary-500 hover:underline"
									>
										{shortHash(s.payout_tx.hash)} <ExternalLink className="size-3.5" aria-hidden />
										<span className="sr-only">(opens Stellar Expert)</span>
									</a>
								</>
							) : s.status === "open" ? (
								"This period is still running; more orders may be added. It's paid once it closes and deliveries are confirmed."
							) : (
								"Waiting for deliveries to be confirmed: escrow releases each order's money then, or 7 days after shipping."
							)}
						</p>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
