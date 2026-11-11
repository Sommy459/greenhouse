import clsx from "clsx";
import Link from "next/link";
import { Skeleton } from "@repo/ui/skeleton";
import { displayStatus, orderDate, STATUS_LABEL, STATUS_TONE } from "@/features/orders/options";
import type { Order } from "@/features/orders/types";
import { price } from "@/lib/format";
import { accountRoutes } from "@/lib/routes";

export function OrderStatusBadge({ order }: { order: Order }) {
	const status = displayStatus(order);
	return (
		<span className={clsx("rounded-full px-3 py-0.5 text-sm font-medium whitespace-nowrap md:text-base", STATUS_TONE[status])}>
			{STATUS_LABEL[status]}
		</span>
	);
}

/** Figma orders table (Order History and My Account's Recent Orders History): Order ID, Date, Price, Status, View Details. */
export function OrdersTable({ orders, isPending, rows = 5 }: { orders: Order[]; isPending: boolean; rows?: number }) {
	return (
		<div className="relative overflow-x-auto">
			<table className="w-full min-w-[720px]">
				<thead className="border-b border-grey-600 bg-grey-500">
					<tr>
						{["Order ID", "Date", "Price", "Status", "Actions"].map((h, i) => (
							<th
								key={h}
								scope="col"
								className={clsx("py-5 text-left text-sm font-medium text-ink", i === 0 ? "pr-3 pl-8" : "px-3")}
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-grey-600">
					{isPending
						? Array.from({ length: rows }, (_, i) => (
								<tr key={i}>
									<td colSpan={5} className="px-8 py-4">
										<Skeleton className="h-12 w-full" />
									</td>
								</tr>
							))
						: orders.map((o, i) => (
								<tr
									key={o.id}
									className="animate-rise transition-colors hover:bg-grey-500"
									style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
								>
									<td className="py-7 pr-3 pl-8 text-base font-semibold whitespace-nowrap text-ink">{o.number}</td>
									<td className="px-3 py-7 text-base whitespace-nowrap text-ink">{orderDate(o.createdAt)}</td>
									<td className="px-3 py-7 text-base whitespace-nowrap text-ink">{price(o.total)}</td>
									<td className="px-3 py-7">
										<OrderStatusBadge order={o} />
									</td>
									<td className="px-3 py-7">
										<Link
											href={accountRoutes.ORDER(o.id)}
											className="text-base whitespace-nowrap text-ink hover:text-primary-500 hover:underline"
											aria-label={`View details of order ${o.number}`}
										>
											View Details
										</Link>
									</td>
								</tr>
							))}
				</tbody>
			</table>
		</div>
	);
}
