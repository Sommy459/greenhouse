"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Package } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListingPagination } from "@/features/catalog/components/ListingPagination";
import { OrderStatusBadge, OrdersTable } from "@/features/orders/components/OrdersTable";
import { useOrders } from "@/features/orders/hooks";
import { orderDate, orderTitle } from "@/features/orders/options";
import { accountRoutes, shopRoutes } from "@/lib/routes";

const PAGE_SIZE = 10;

/**
 * Figma "Orders" (desktop table) and "Order History" (phone cards), PRD C8: the customer's orders, newest first, each
 * opening its Order Detail. The API lists orders without a status filter, so the Figma status tabs aren't here.
 */
export function OrdersView() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();
	const page = Math.max(1, Number(params.get("page")) || 1);
	const { data, isPending, isError, isFetching, refetch } = useOrders(page, PAGE_SIZE);
	const orders = data?.items ?? [];

	const goTo = (n: number) => router.replace(n > 1 ? `${pathname}?page=${n}` : pathname, { scroll: false });

	return (
		<div className="pb-6 lg:pb-16">
			<Link href={accountRoutes.DASHBOARD} className="inline-flex items-center gap-3 text-lg text-ink md:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				<h1>Order History</h1>
			</Link>
			<h1 className="animate-rise hidden text-2xl text-ink md:block lg:text-[28px]">Orders</h1>

			<div className={clsx("mt-8 transition-opacity md:mt-10", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-md bg-white py-16 text-center text-sm text-grey-900">
						<p>We couldn&apos;t load your orders.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && orders.length === 0 ? (
					<div className="rounded-md bg-white py-16 text-center text-base text-grey-900">
						<p>You haven&apos;t ordered anything yet.</p>
						<Button asChild className="mt-5 h-11 rounded-md px-6">
							<Link href={shopRoutes.HOME}>Start shopping</Link>
						</Button>
					</div>
				) : (
					<>
						{/* Phones: cards. */}
						<ul className="space-y-4 md:hidden">
							{isPending
								? Array.from({ length: 4 }, (_, i) => (
										<li key={i}>
											<Skeleton className="h-[120px] w-full rounded-md" />
										</li>
									))
								: orders.map((o, i) => (
										<li key={o.id} className="animate-rise" style={{ "--i": Math.min(i, 6) } as React.CSSProperties}>
											<Link
												href={accountRoutes.ORDER(o.id)}
												className="flex gap-5 rounded-md bg-white p-3 transition-colors hover:bg-primary-50"
											>
												<span className="grid size-[90px] shrink-0 place-items-center rounded-md bg-primary-50 text-primary-500">
													<Package className="size-8" aria-hidden />
												</span>
												<span className="min-w-0 space-y-1 pt-1">
													<span className="block truncate text-base text-grey-900">{orderTitle(o)}</span>
													<span className="block text-base font-semibold text-ink">Order ID: {o.number}</span>
													<OrderStatusBadge order={o} />
													<span className="block text-sm text-grey-900">{orderDate(o.createdAt)}</span>
												</span>
											</Link>
										</li>
									))}
						</ul>

						{/* Wider screens: Figma's table. */}
						<div className="hidden overflow-hidden rounded-md border border-grey-600 bg-white md:block">
							<OrdersTable orders={orders} isPending={isPending} />
						</div>

						{data && data.meta.total_pages > 1 && (
							<div className="mt-8">
								<ListingPagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={goTo} />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
