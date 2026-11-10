"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@repo/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/dropdown-menu";
import { Skeleton } from "@repo/ui/skeleton";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { StatusFilter } from "@/components/StatusFilter";
import { useCancelPromotion, usePromotions } from "@/features/promotions/hooks";
import {
	DISCOUNT_TYPES,
	PROMOTION_STATUSES,
	type DiscountType,
	type Promotion,
	type PromotionStatus,
} from "@/features/promotions/types";
import { period, STATUS_LABEL, STATUS_TONE } from "@/features/promotions/options";
import { count, naira } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 8;
const TYPE_LABEL: Record<DiscountType, string> = { percent: "Percentage off", fixed: "Amount off" };
const TH = "px-3 py-5 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-6 text-base whitespace-nowrap text-ink";
const OUTLINE =
	"grid size-12 place-items-center rounded-lg border border-grey-600 bg-white text-ink transition-colors hover:border-primary-500 hover:text-primary-500";

/** Figma "August 19 – 25, 2024" (or across months / years when it has to). */
function range(start: string, end: string) {
	const a = new Date(start);
	const b = new Date(end);
	const m = (d: Date) => d.toLocaleString("en-US", { month: "long" });
	if (a.getFullYear() !== b.getFullYear())
		return `${m(a)} ${a.getDate()}, ${a.getFullYear()} – ${m(b)} ${b.getDate()}, ${b.getFullYear()}`;
	if (a.getMonth() !== b.getMonth()) return `${m(a)} ${a.getDate()} – ${m(b)} ${b.getDate()}, ${b.getFullYear()}`;
	return `${m(a)} ${a.getDate()} – ${b.getDate()}, ${b.getFullYear()}`;
}
const criteria = (p: Promotion) =>
	`${p.discount.type === "percent" ? `${p.discount.value}% off` : `${naira(p.discount.value)} off`}${
		p.discount.min_order ? ` · orders over ${naira(p.discount.min_order)}` : ""
	}`;

/**
 * Figma Vendor Hub "Promotion Management": tabs by status, search by name, a discount-type filter, the table and pages.
 * The design's "Discount Criteria" showed a date; here it's the rule. Outside the PRD's MVP.
 */
export function PromotionsView() {
	const router = useRouter();
	const { get, list, page, set } = useUrlParams();
	const status = (PROMOTION_STATUSES as readonly string[]).includes(get("status"))
		? (get("status") as PromotionStatus)
		: undefined;
	const search = get("search");
	const types = list("type", DISCOUNT_TYPES);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [cancelling, setCancelling] = useState<Promotion | null>(null);
	const cancel = useCancelPromotion();

	const { data, isPending, isError, isFetching, refetch } = usePromotions({
		status,
		search: search || undefined,
		type: types.join(",") || undefined,
		page,
		limit: PAGE_SIZE,
	});
	const everyone = usePromotions({ page: 1, limit: 1 });
	const promotions = data?.items ?? [];
	const ids = promotions.map((p) => p.id);
	const ticked = ids.filter((id) => selected.has(id)).length;
	const filtered = !!(search || types.length);

	const toggle = (id: string) => {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		setSelected(next);
	};

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<h1 className="animate-rise text-2xl font-medium text-ink lg:text-[28px]">Promotion Management</h1>
				<Button asChild className="animate-rise h-12 rounded-lg px-5" style={{ "--i": 1 } as React.CSSProperties}>
					<Link href={consoleRoutes.NEW_PROMOTION}>
						<Plus className="size-5" aria-hidden />
						Create new Promotion
					</Link>
				</Button>
			</div>

			<div
				role="tablist"
				aria-label="Promotion status"
				className="animate-rise hide-scroll mt-8 flex w-fit max-w-full overflow-x-auto border-b border-grey-600 lg:mt-12"
				style={{ "--i": 2 } as React.CSSProperties}
			>
				{([undefined, ...PROMOTION_STATUSES] as (PromotionStatus | undefined)[]).map((s) => (
					<button
						key={s ?? "all"}
						type="button"
						role="tab"
						aria-selected={status === s}
						onClick={() => set({ status: s })}
						className={clsx(
							"-mb-px flex shrink-0 items-center gap-2 border-b-2 px-6 pb-4 text-base transition-colors",
							status === s ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
						)}
					>
						{s ? STATUS_LABEL[s] : "All"}
						{!s && everyone.data && (
							<span className="rounded-full bg-primary-500 px-2 py-px text-xs font-medium text-white">
								{count(everyone.data.meta.total)}
							</span>
						)}
					</button>
				))}
			</div>

			<div
				className="animate-rise mt-8 flex flex-wrap items-center justify-between gap-3"
				style={{ "--i": 3 } as React.CSSProperties}
			>
				<SearchBox
					value={search}
					onChange={(value) => set({ search: value || undefined })}
					placeholder="search by promotion name"
					label="Search promotions by name"
					className="w-full sm:w-[420px] lg:w-[470px]"
				/>
				<StatusFilter
					id="promotion-type"
					options={DISCOUNT_TYPES}
					labels={TYPE_LABEL}
					value={types}
					onChange={(next) => set({ type: next.join(",") || undefined })}
					legend="Discount type"
					triggerClassName={clsx(OUTLINE, "w-auto gap-2 px-4")}
				/>
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
						<p>
							{filtered
								? "No promotions match."
								: status
									? `No ${STATUS_LABEL[status].toLowerCase()} promotions.`
									: "No promotions yet."}
						</p>
						{filtered && (
							<Button variant="outline" size="sm" onClick={() => set({ search: undefined, type: undefined })} className="mt-4">
								Clear search and filter
							</Button>
						)}
					</div>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[1040px]">
								<thead className="border-b border-grey-600 bg-grey-500">
									<tr>
										<th scope="col" className="w-14 py-5 pl-8">
											<Checkbox
												aria-label="Select all promotions on this page"
												disabled={isPending || ids.length === 0}
												checked={ids.length > 0 && ticked === ids.length ? true : ticked > 0 ? "indeterminate" : false}
												onCheckedChange={() => {
													const next = new Set(selected);
													if (ticked === ids.length) ids.forEach((id) => next.delete(id));
													else ids.forEach((id) => next.add(id));
													setSelected(next);
												}}
												className="size-5"
											/>
										</th>
										{["Promotion", "Registration Window", "Period", "Discount Criteria", "Status"].map((h) => (
											<th key={h} scope="col" className={TH}>
												{h}
											</th>
										))}
										<th scope="col" className={clsx(TH, "pr-6")}>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: PAGE_SIZE }, (_, i) => (
												<tr key={i}>
													<td colSpan={7} className="px-8 py-4">
														<Skeleton className="h-12 w-full" />
													</td>
												</tr>
											))
										: promotions.map((p, i) => (
												<tr
													key={p.id}
													data-selected={selected.has(p.id)}
													className="animate-rise transition-colors hover:bg-grey-500 data-[selected=true]:bg-primary-50"
													style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
												>
													<td className="py-6 pl-8">
														<Checkbox
															aria-label={`Select ${p.name}`}
															checked={selected.has(p.id)}
															onCheckedChange={() => toggle(p.id)}
															className="size-5"
														/>
													</td>
													<td className={clsx(TD, "font-semibold")}>
														{p.name}
														<span className="block text-sm font-normal text-grey-900">
															{count(p.products_count)} product{p.products_count === 1 ? "" : "s"}
														</span>
													</td>
													<td className={TD}>{range(p.registration_start, p.registration_end)}</td>
													<td className={TD}>{period(p.duration_days)}</td>
													<td className={TD}>{criteria(p)}</td>
													<td className={TD}>
														<span className={clsx("rounded-full px-4 py-1.5 text-base font-medium", STATUS_TONE[p.status])}>
															{STATUS_LABEL[p.status]}
														</span>
													</td>
													<td className="py-3 pr-6 pl-3">
														<DropdownMenu modal={false}>
															<DropdownMenuTrigger asChild>
																<button
																	type="button"
																	aria-label={`Actions for ${p.name}`}
																	className="grid size-12 place-items-center rounded-md border border-grey-600 bg-white text-ink transition-colors hover:border-primary-500 data-[state=open]:border-primary-500"
																>
																	<EllipsisVertical className="size-5" />
																</button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-lg">
																<DropdownMenuItem
																	onSelect={() => router.push(consoleRoutes.PROMOTION(p.id))}
																	className="px-3 py-2.5 text-base"
																>
																	Monitor
																</DropdownMenuItem>
																{p.status === "open" && (
																	<DropdownMenuItem
																		onSelect={() => router.push(consoleRoutes.EDIT_PROMOTION(p.id))}
																		className="px-3 py-2.5 text-base"
																	>
																		Edit
																	</DropdownMenuItem>
																)}
																{(p.status === "open" || p.status === "ongoing") && (
																	<DropdownMenuItem
																		onSelect={() => setCancelling(p)}
																		className="px-3 py-2.5 text-base text-error-500 focus:text-error-500"
																	>
																		Cancel promotion
																	</DropdownMenuItem>
																)}
															</DropdownMenuContent>
														</DropdownMenu>
													</td>
												</tr>
											))}
								</tbody>
							</table>
						</div>
						{data && (
							<div className="border-t border-grey-600">
								<Pagination
									page={data.meta.page}
									totalPages={data.meta.total_pages}
									onChange={(n) => set({ page: n > 1 ? String(n) : undefined })}
								/>
							</div>
						)}
					</div>
				)}
			</div>

			<AlertDialog open={!!cancelling} onOpenChange={(open) => !open && !cancel.isPending && setCancelling(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel {cancelling?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							{cancelling?.status === "ongoing"
								? "The discount stops now and its products go back to full price. Orders already paid keep their price."
								: "It won't start, and products enrolled in it stay at full price."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={cancel.isPending}>Keep it</AlertDialogCancel>
						<AlertDialogAction
							disabled={cancel.isPending}
							className="bg-error-500 hover:bg-error-700"
							onClick={(e) => {
								e.preventDefault();
								if (cancelling) cancel.mutate(cancelling, { onSuccess: () => setCancelling(null) });
							}}
						>
							{cancel.isPending ? "Cancelling…" : "Cancel promotion"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
