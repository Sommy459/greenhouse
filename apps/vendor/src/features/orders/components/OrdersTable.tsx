"use client";

import clsx from "clsx";
import Image from "next/image";
import { ChevronDown, ChevronsUpDown, ChevronUp, EllipsisVertical, Package } from "lucide-react";
import { Checkbox } from "@repo/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/dropdown-menu";
import { Skeleton } from "@repo/ui/skeleton";
import { NEXT_STATUSES, ORDER_STATUS_LABEL, ORDER_STATUS_TONE, PAYMENT_LABEL } from "@/features/orders/options";
import type { OrderSort, VendorOrder } from "@/features/orders/types";
import { count, naira } from "@/lib/format";

/** Which part of Order Details to open on. */
export type OpenSection = "details" | "tracking" | "update";

interface Props {
	orders: VendorOrder[];
	loading: boolean;
	rows: number;
	selected: Set<string>;
	onSelectedChange: (selected: Set<string>) => void;
	sort: OrderSort;
	onSortChange: (sort: OrderSort) => void;
	onOpen: (orderId: string, section: OpenSection) => void;
}

const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const TH = "px-3 py-5 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-6 text-base whitespace-nowrap text-ink";

/** Figma Vendor Hub order list: tick, order ID, first product (+ others), items, date, price, payment, status, ⋮. */
export function OrdersTable({ orders, loading, rows, selected, onSelectedChange, sort, onSortChange, onOpen }: Props) {
	const ids = orders.map((o) => o.id);
	const ticked = ids.filter((id) => selected.has(id)).length;
	const toggleAll = () => {
		const next = new Set(selected);
		if (ticked === ids.length) ids.forEach((id) => next.delete(id));
		else ids.forEach((id) => next.add(id));
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
		<div className="overflow-x-auto">
			<table className="w-full min-w-[1120px]">
				<thead className="border-b border-grey-600 bg-grey-500">
					<tr>
						<th scope="col" className="w-14 py-5 pl-8">
							<Checkbox
								aria-label="Select all orders on this page"
								disabled={loading || ids.length === 0}
								checked={ids.length > 0 && ticked === ids.length ? true : ticked > 0 ? "indeterminate" : false}
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
								className="inline-flex items-center gap-1.5 hover:text-primary-500"
							>
								Product
								<SortIcon className={clsx("size-5", sort === "newest" ? "text-grey-900" : "text-primary-500")} aria-hidden />
							</button>
						</th>
						{["Item Quantity", "Date", "Price", "Payment Method", "Status"].map((h) => (
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
					{loading
						? Array.from({ length: rows }, (_, i) => (
								<tr key={i}>
									<td colSpan={9} className="px-8 py-4">
										<Skeleton className="h-14 w-full" />
									</td>
								</tr>
							))
						: orders.map((o, i) => (
								<tr
									key={o.id}
									data-selected={selected.has(o.id)}
									className="animate-rise transition-colors hover:bg-grey-500 data-[selected=true]:bg-primary-50"
									style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
								>
									<td className="py-6 pl-8">
										<Checkbox
											aria-label={`Select order ${o.number}`}
											checked={selected.has(o.id)}
											onCheckedChange={() => toggle(o.id)}
											className="size-5"
										/>
									</td>
									<td className={clsx(TD, "font-semibold")}>
										<button
											type="button"
											onClick={() => onOpen(o.id, "details")}
											className="hover:text-primary-500 hover:underline"
										>
											{o.number}
										</button>
									</td>
									<td className="px-3 py-4">
										<div className="flex items-center gap-3">
											<span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-grey-500">
												{o.first_item.image_url ? (
													<Image src={o.first_item.image_url} alt="" fill sizes="56px" className="object-cover" />
												) : (
													<Package className="size-5 text-grey-700" aria-hidden />
												)}
											</span>
											<div className="min-w-0 text-base leading-tight text-ink">
												<p className="max-w-[200px] truncate">{o.first_item.name}</p>
												{o.other_items > 0 && (
													<p className="mt-0.5 text-grey-900">
														+ {o.other_items} other product{o.other_items === 1 ? "" : "s"}
													</p>
												)}
											</div>
										</div>
									</td>
									<td className={TD}>
										{count(o.items_count)} Item{o.items_count === 1 ? "" : "s"}
									</td>
									<td className={TD}>
										<time dateTime={o.created_at}>{date(o.created_at)}</time>
									</td>
									<td className={TD}>{naira(o.total, 2)}</td>
									<td className={TD}>{PAYMENT_LABEL[o.payment_method]}</td>
									<td className={TD}>
										<span className={clsx("rounded-full px-3 py-1 text-base font-medium", ORDER_STATUS_TONE[o.status])}>
											{ORDER_STATUS_LABEL[o.status]}
										</span>
									</td>
									<td className="py-3 pr-6 pl-3">
										<RowActions order={o} onOpen={onOpen} />
									</td>
								</tr>
							))}
				</tbody>
			</table>
		</div>
	);
}

/** Figma ⋮ menu: View, Track Order, and Update status while the order can still move on. No delete: orders are paid. */
function RowActions({ order, onOpen }: { order: VendorOrder; onOpen: Props["onOpen"] }) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label={`Actions for order ${order.number}`}
					className="grid size-12 place-items-center rounded-md border border-grey-600 bg-white text-ink transition-colors hover:border-primary-500 data-[state=open]:border-primary-500"
				>
					<EllipsisVertical className="size-5" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-lg">
				<DropdownMenuItem onSelect={() => onOpen(order.id, "details")} className="px-3 py-2.5 text-base">
					View
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => onOpen(order.id, "tracking")} className="px-3 py-2.5 text-base">
					Track Order
				</DropdownMenuItem>
				{NEXT_STATUSES[order.status].length > 0 && (
					<DropdownMenuItem onSelect={() => onOpen(order.id, "update")} className="px-3 py-2.5 text-base">
						Update status
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
