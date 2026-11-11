"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { EllipsisVertical, Plus } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/dropdown-menu";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { usePromotionAction, usePromotions } from "@/features/promotions/hooks";
import { ACTION_LABEL, actionsFor, dates, editable, STATE_LABEL, STATE_TONE } from "@/features/promotions/options";
import { PROMOTION_STATES, type Promotion, type PromotionState } from "@/features/promotions/types";
import { count, price } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 10;
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-4 text-sm whitespace-nowrap text-ink";

/**
 * Promotions (GET /vendor/promotions): a percentage off chosen products or the whole shop, between two dates. Tabs by
 * state; each row shows what it sold and the discount given. Pause, resume or end from the row menu.
 */
export function PromotionsView() {
	const { get, page, set } = useUrlParams();
	const state = (PROMOTION_STATES as readonly string[]).includes(get("state")) ? (get("state") as PromotionState) : undefined;
	const { data, isPending, isError, isFetching, refetch } = usePromotions({ state, page, limit: PAGE_SIZE });
	const action = usePromotionAction();
	const [ending, setEnding] = useState<Promotion | null>(null);
	const promotions = data?.items ?? [];

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Promotions" crumb="Promotions">
				<Button asChild className="h-12 rounded-lg px-5">
					<Link href={consoleRoutes.NEW_PROMOTION}>
						<Plus className="size-5" aria-hidden /> New promotion
					</Link>
				</Button>
			</ListHeader>

			<div
				role="tablist"
				aria-label="Promotion state"
				className="relative hide-scroll mt-8 flex w-fit max-w-full overflow-x-auto border-b border-grey-600"
			>
				{([undefined, ...PROMOTION_STATES] as (PromotionState | undefined)[]).map((s) => (
					<button
						key={s ?? "all"}
						type="button"
						role="tab"
						aria-selected={state === s}
						onClick={() => set({ state: s })}
						className={clsx(
							"-mb-px shrink-0 border-b-2 px-6 pb-4 text-base transition-colors",
							state === s ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
						)}
					>
						{s ? STATE_LABEL[s] : "All"}
					</button>
				))}
			</div>

			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load your promotions.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && promotions.length === 0 ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>{state ? `No ${STATE_LABEL[state].toLowerCase()} promotions.` : "No promotions yet."}</p>
						{!state && (
							<Button asChild className="mt-4 h-11 rounded-lg">
								<Link href={consoleRoutes.NEW_PROMOTION}>Create one</Link>
							</Button>
						)}
					</div>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="relative overflow-x-auto">
							<table className="w-full min-w-[900px]">
								<thead className="bg-grey-500">
									<tr>
										{["Promotion", "Discount", "Applies to", "Dates", "State", "Orders", "Revenue", "Discount given", ""].map(
											(h, i) => (
												<th key={i} scope="col" className={clsx(TH, i === 0 && "pl-5")}>
													{h}
												</th>
											),
										)}
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: 4 }, (_, i) => (
												<tr key={i}>
													<td colSpan={9} className="px-5 py-3">
														<Skeleton className="h-8 w-full" />
													</td>
												</tr>
											))
										: promotions.map((p) => {
												const actions = actionsFor(p.state);
												return (
													<tr key={p.id} className="hover:bg-grey-500">
														<td className={clsx(TD, "max-w-60 truncate pl-5 font-medium")}>
															<Link href={consoleRoutes.PROMOTION(p.id)} className="hover:text-primary-500 hover:underline">
																{p.name}
															</Link>
														</td>
														<td className={TD}>{p.discountPercent}% off</td>
														<td className={TD}>
															{p.appliesToAll
																? "Whole shop"
																: `${count(p.products.length)} product${p.products.length === 1 ? "" : "s"}`}
														</td>
														<td className={TD}>{dates(p)}</td>
														<td className={TD}>
															<span className={clsx("rounded-full px-3 py-1 text-xs font-medium", STATE_TONE[p.state])}>
																{STATE_LABEL[p.state]}
															</span>
														</td>
														<td className={TD}>{count(p.stats.orders)}</td>
														<td className={TD}>{price(p.stats.revenue)}</td>
														<td className={TD}>{price(p.stats.discountGiven)}</td>
														<td className={clsx(TD, "pr-5 text-right")}>
															<DropdownMenu>
																<DropdownMenuTrigger
																	aria-label={`Actions for ${p.name}`}
																	className="rounded-md p-1.5 hover:bg-grey-600"
																>
																	<EllipsisVertical className="size-5" aria-hidden />
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	<DropdownMenuItem asChild>
																		<Link href={consoleRoutes.PROMOTION(p.id)}>{editable(p.state) ? "View & edit" : "View"}</Link>
																	</DropdownMenuItem>
																	{actions.map((a) => (
																		<DropdownMenuItem
																			key={a}
																			disabled={action.isPending}
																			className={a === "end" ? "text-error-500" : undefined}
																			onSelect={() => (a === "end" ? setEnding(p) : action.mutate({ id: p.id, action: a }))}
																		>
																			{ACTION_LABEL[a]}
																		</DropdownMenuItem>
																	))}
																</DropdownMenuContent>
															</DropdownMenu>
														</td>
													</tr>
												);
											})}
								</tbody>
							</table>
						</div>
						{data && data.meta.total_pages > 1 && (
							<div className="border-t border-grey-600">
								<Pagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={(p) => set({ page: String(p) })} />
							</div>
						)}
					</div>
				)}
			</div>

			<EndPromotionDialog promotion={ending} onClose={() => setEnding(null)} />
		</div>
	);
}

export function EndPromotionDialog({ promotion, onClose }: { promotion: Promotion | null; onClose: () => void }) {
	const action = usePromotionAction();
	return (
		<AlertDialog open={!!promotion} onOpenChange={(open) => !open && onClose()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>End {promotion?.name}?</AlertDialogTitle>
					<AlertDialogDescription>
						Prices go back to normal straight away. An ended promotion can&apos;t be restarted.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Keep it</AlertDialogCancel>
					<AlertDialogAction
						disabled={action.isPending}
						onClick={(e) => {
							e.preventDefault();
							if (promotion) action.mutate({ id: promotion.id, action: "end" }, { onSuccess: onClose });
						}}
						className="bg-error-500 hover:bg-error-500/80"
					>
						End promotion
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
