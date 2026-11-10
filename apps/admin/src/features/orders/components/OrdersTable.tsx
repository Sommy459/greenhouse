"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronsUpDown, ChevronUp, EllipsisVertical, Package } from "lucide-react";
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
import { Checkbox } from "@repo/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/dropdown-menu";
import { Skeleton } from "@repo/ui/skeleton";
import { useDeleteOrder } from "@/features/orders/hooks";
import { PAYMENT_LABEL, STATUS_LABEL, STATUS_TONE } from "@/features/orders/options";
import type { AdminOrder, OrderSort } from "@/features/orders/types";
import { naira } from "@/lib/format";

interface Props {
	orders: AdminOrder[];
	loading: boolean;
	rows: number;
	selected: Set<string>;
	onSelectedChange: (selected: Set<string>) => void;
	sort: OrderSort;
	onSortChange: (sort: OrderSort) => void;
	/** Opens Order Details; `tracking` scrolls it to Order Tracking. */
	onOpen: (orderId: string, tracking: boolean) => void;
}

const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-5 text-base whitespace-nowrap text-ink";

/** Figma order list: tick boxes, order number, first product (+ others), customer, date, total, payment, status, ⋮. */
export function OrdersTable({ orders, loading, rows, selected, onSelectedChange, sort, onSortChange, onOpen }: Props) {
	const [deleting, setDeleting] = useState<AdminOrder | null>(null);
	const deleteOrder = useDeleteOrder();
	const pageIds = orders.map((o) => o.id);
	const ticked = pageIds.filter((id) => selected.has(id)).length;

	const toggleAll = () => {
		const next = new Set(selected);
		if (ticked === pageIds.length) pageIds.forEach((id) => next.delete(id));
		else pageIds.forEach((id) => next.add(id));
		onSelectedChange(next);
	};
	const toggle = (id: string) => {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		onSelectedChange(next);
	};
	// Product sort cycles: none → A–Z → Z–A → none.
	const nextSort: Record<OrderSort, OrderSort> = { newest: "product_asc", product_asc: "product_desc", product_desc: "newest" };
	const SortIcon = sort === "product_asc" ? ChevronUp : sort === "product_desc" ? ChevronDown : ChevronsUpDown;

	return (
		<>
			<div className="overflow-x-auto rounded-t-lg border border-grey-600 bg-white">
				<table className="w-full min-w-[1080px]">
					<thead className="border-b border-grey-600 bg-grey-500">
						<tr>
							<th scope="col" className="w-14 py-4 pl-8">
								<Checkbox
									aria-label="Select all orders on this page"
									disabled={loading || pageIds.length === 0}
									checked={pageIds.length > 0 && ticked === pageIds.length ? true : ticked > 0 ? "indeterminate" : false}
									onCheckedChange={toggleAll}
									className="size-5"
								/>
							</th>
							<th scope="col" className={TH}>
								Order ID
							</th>
							<th
								scope="col"
								className={TH}
								aria-sort={sort === "product_asc" ? "ascending" : sort === "product_desc" ? "descending" : "none"}
							>
								<button
									type="button"
									onClick={() => onSortChange(nextSort[sort])}
									className="inline-flex items-center gap-1.5 rounded hover:text-primary-500"
								>
									Product
									<SortIcon className="size-4" aria-hidden />
								</button>
							</th>
							<th scope="col" className={TH}>
								Customer Name
							</th>
							<th scope="col" className={TH}>
								Date
							</th>
							<th scope="col" className={TH}>
								Price
							</th>
							<th scope="col" className={TH}>
								Payment Method
							</th>
							<th scope="col" className={TH}>
								Status
							</th>
							<th scope="col" className={clsx(TH, "pr-4")}>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-grey-600">
						{loading
							? Array.from({ length: rows }, (_, i) => (
									<tr key={i}>
										<td colSpan={9} className="px-8 py-4">
											<Skeleton className="h-12 w-full" />
										</td>
									</tr>
								))
							: orders.map((order, i) => (
									<tr
										key={order.id}
										data-selected={selected.has(order.id)}
										className="animate-rise transition-colors hover:bg-grey-500 data-[selected=true]:bg-primary-50"
										style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
									>
										<td className="py-5 pl-8">
											<Checkbox
												aria-label={`Select order ${order.number}`}
												checked={selected.has(order.id)}
												onCheckedChange={() => toggle(order.id)}
												className="size-5"
											/>
										</td>
										<td className={clsx(TD, "font-semibold")}>
											<button
												type="button"
												onClick={() => onOpen(order.id, false)}
												className="hover:text-primary-500 hover:underline"
											>
												{order.number}
											</button>
										</td>
										<td className="px-3 py-3">
											<div className="flex items-center gap-3">
												<span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-grey-500">
													{order.first_item.image_url ? (
														<Image src={order.first_item.image_url} alt="" fill sizes="48px" className="object-cover" />
													) : (
														<Package className="size-5 text-grey-700" aria-hidden />
													)}
												</span>
												<div className="min-w-0 text-base leading-tight text-ink">
													<p className="max-w-[200px] truncate">{order.first_item.name}</p>
													{order.other_items > 0 && (
														<p className="mt-0.5 text-grey-900">
															+{order.other_items} other product{order.other_items === 1 ? "" : "s"}
														</p>
													)}
												</div>
											</div>
										</td>
										<td className={TD}>{order.customer.name}</td>
										<td className={TD}>
											<time dateTime={order.created_at}>{date(order.created_at)}</time>
										</td>
										<td className={TD}>{naira(order.total, 2)}</td>
										<td className={TD}>{PAYMENT_LABEL[order.payment_method]}</td>
										<td className={TD}>
											<span className={clsx("rounded-full px-2.5 py-1 text-sm font-medium", STATUS_TONE[order.status])}>
												{STATUS_LABEL[order.status]}
											</span>
										</td>
										<td className="py-3 pr-4 pl-3">
											<RowActions order={order} onOpen={onOpen} onDelete={() => setDeleting(order)} />
										</td>
									</tr>
								))}
					</tbody>
				</table>
			</div>

			<AlertDialog open={!!deleting} onOpenChange={(open) => !open && !deleteOrder.isPending && setDeleting(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete order {deleting?.number}?</AlertDialogTitle>
						<AlertDialogDescription>
							It will be removed from the order list for good. To stop a delivery or refund the customer, cancel or return the
							order instead.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteOrder.isPending}>Keep order</AlertDialogCancel>
						<AlertDialogAction
							disabled={deleteOrder.isPending}
							className="bg-error-500 hover:bg-error-700"
							onClick={(e) => {
								// Stay open until the API answers.
								e.preventDefault();
								if (deleting) deleteOrder.mutate(deleting, { onSuccess: () => setDeleting(null) });
							}}
						>
							{deleteOrder.isPending ? "Deleting…" : "Delete order"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

/** Figma ⋮ menu: View, Delete, Track Order. */
function RowActions({ order, onOpen, onDelete }: { order: AdminOrder; onOpen: Props["onOpen"]; onDelete: () => void }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label={`Actions for order ${order.number}`}
					className="grid size-12 place-items-center rounded-md border border-grey-600 bg-white text-ink transition-colors hover:border-primary-500 data-[state=open]:border-primary-500"
				>
					<EllipsisVertical className="size-5" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44 rounded-xl p-2 shadow-lg">
				<DropdownMenuItem onSelect={() => onOpen(order.id, false)} className="px-3 py-2.5 text-base">
					View
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={onDelete} className="px-3 py-2.5 text-base">
					Delete
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => onOpen(order.id, true)} className="px-3 py-2.5 text-base">
					Track Order
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
