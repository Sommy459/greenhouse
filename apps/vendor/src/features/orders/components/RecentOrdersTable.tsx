"use client";

import clsx from "clsx";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { Checkbox } from "@repo/ui/checkbox";
import { Skeleton } from "@repo/ui/skeleton";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, PAYMENT_LABEL } from "@/features/orders/options";
import type { VendorOrder } from "@/features/orders/types";
import { count, naira } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

interface Props {
	orders: VendorOrder[];
	loading: boolean;
	rows: number;
	selected: Set<string>;
	onSelectedChange: (selected: Set<string>) => void;
}

const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-6 text-base whitespace-nowrap text-ink";
const ICON = "grid size-9 place-items-center rounded-md text-grey-900 transition-colors hover:bg-grey-500 hover:text-primary-500";

/**
 * Figma Vendor Hub order rows: tick, order ID, items, date, price, payment method, status, view / update.
 * The design's delete is left out: a vendor can't delete a paid order (they cancel it from the order page).
 */
export function RecentOrdersTable({ orders, loading, rows, selected, onSelectedChange }: Props) {
	const ids = orders.map((o) => o.id);
	const ticked = ids.filter((id) => selected.has(id)).length;
	const toggle = (id: string) => {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		onSelectedChange(next);
	};
	const toggleAll = () => {
		const next = new Set(selected);
		if (ticked === ids.length) ids.forEach((id) => next.delete(id));
		else ids.forEach((id) => next.add(id));
		onSelectedChange(next);
	};

	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[980px]">
				<thead className="border-y border-grey-600 bg-grey-500">
					<tr>
						<th scope="col" className="w-14 py-4 pl-8">
							<Checkbox
								aria-label="Select all orders shown"
								disabled={loading || ids.length === 0}
								checked={ids.length > 0 && ticked === ids.length ? true : ticked > 0 ? "indeterminate" : false}
								onCheckedChange={toggleAll}
								className="size-5"
							/>
						</th>
						{["Order ID", "Item Quantity", "Date", "Price", "Payment Method", "Status"].map((h) => (
							<th key={h} scope="col" className={TH}>
								{h}
							</th>
						))}
						<th scope="col" className={clsx(TH, "pr-6 text-center")}>
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-grey-600">
					{loading
						? Array.from({ length: rows }, (_, i) => (
								<tr key={i}>
									<td colSpan={8} className="px-8 py-4">
										<Skeleton className="h-12 w-full" />
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
										<Link href={consoleRoutes.ORDER(o.id)} className="hover:text-primary-500 hover:underline">
											{o.number}
										</Link>
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
										<div className="flex items-center justify-center gap-1">
											<Link href={consoleRoutes.ORDER(o.id)} aria-label={`View order ${o.number}`} title="View" className={ICON}>
												<Eye className="size-5" />
											</Link>
											{o.status !== "delivered" && o.status !== "cancelled" && (
												<Link
													href={consoleRoutes.ORDER_UPDATE(o.id)}
													aria-label={`Update order ${o.number}`}
													title="Update status"
													className={ICON}
												>
													<Pencil className="size-5" />
												</Link>
											)}
										</div>
									</td>
								</tr>
							))}
				</tbody>
			</table>
		</div>
	);
}
