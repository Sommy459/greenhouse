"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListingPagination } from "@/features/catalog/components/ListingPagination";
import { useOrders } from "@/features/orders/hooks";
import { OrderStatusBadge, OrdersTable } from "@/features/orders/components/OrdersTable";
import { orderDate } from "@/features/orders/options";
import { ORDER_STATUSES, type CustomerOrderStatus } from "@/features/orders/types";
import { accountRoutes, shopRoutes } from "@/lib/routes";

const PAGE_SIZE = 10;

/** A tab is a set of statuses (`?status=a,b`); "All" (no param) keeps orders still in progress in view. */
type Tab = { label: string; statuses: CustomerOrderStatus[] };
const ALL: Tab = { label: "All", statuses: [] };
/** Figma desktop tabs. */
const DESKTOP_TABS: Tab[] = [
	ALL,
	{ label: "Delivered", statuses: ["delivered"] },
	{ label: "Cancelled", statuses: ["cancelled"] },
	{ label: "Delivery Failed", statuses: ["delivery_failed"] },
	{ label: "Returned", statuses: ["returned"] },
];
/** Figma phone tabs pair them up. */
const PHONE_TABS: Tab[] = [
	ALL,
	{ label: "Delivered/Delivery Failed", statuses: ["delivered", "delivery_failed"] },
	{ label: "Cancelled/Returned", statuses: ["cancelled", "returned"] },
];

function Tabs({
	tabs,
	current,
	onSelect,
	className,
}: {
	tabs: Tab[];
	current: CustomerOrderStatus[];
	onSelect: (t: Tab) => void;
	className: string;
}) {
	// The tab whose statuses cover the chosen ones (a phone tab stays lit for a desktop choice and the other way round).
	const active = (t: Tab) =>
		t.statuses.length === 0 ? current.length === 0 : current.length > 0 && current.every((s) => t.statuses.includes(s));
	return (
		<div
			role="tablist"
			aria-label="Order status"
			className={clsx("hide-scroll overflow-x-auto border-b border-grey-600", className)}
		>
			{tabs.map((t) => (
				<button
					key={t.label}
					type="button"
					role="tab"
					aria-selected={active(t)}
					onClick={() => onSelect(t)}
					className={clsx(
						"-mb-px shrink-0 border-b-2 px-1 pb-4 text-base whitespace-nowrap transition-colors sm:px-5",
						active(t) ? "border-primary-500 text-primary-500" : "border-transparent text-ink hover:text-primary-500",
					)}
				>
					{t.label}
				</button>
			))}
		</div>
	);
}

/**
 * Figma "Orders" (desktop table) and "Order History" (phone cards), PRD C8: the customer's orders by status, each opening
 * its Order Detail. An "All" tab is added so orders still in progress have a place.
 */
export function OrdersView() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();
	const statuses = (params.get("status") ?? "")
		.split(",")
		.filter((s): s is CustomerOrderStatus => (ORDER_STATUSES as readonly string[]).includes(s));
	const page = Math.max(1, Number(params.get("page")) || 1);

	const go = (next: { status?: string; page?: number }) => {
		const q = new URLSearchParams();
		if (next.status) q.set("status", next.status);
		if (next.page && next.page > 1) q.set("page", String(next.page));
		router.replace(q.size ? `${pathname}?${q}` : pathname, { scroll: false });
	};
	const select = (t: Tab) => go({ status: t.statuses.join(",") || undefined });

	const { data, isPending, isError, isFetching, refetch } = useOrders({
		status: statuses.join(",") || undefined,
		page,
		limit: PAGE_SIZE,
	});
	const orders = data?.items ?? [];

	return (
		<div className="pb-6 lg:pb-16">
			<Link href={accountRoutes.DASHBOARD} className="inline-flex items-center gap-3 text-lg text-ink md:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				<h1>Order History</h1>
			</Link>
			<h1 className="animate-rise hidden text-2xl text-ink md:block lg:text-[28px]">Orders</h1>

			<Tabs tabs={PHONE_TABS} current={statuses} onSelect={select} className="mt-8 flex justify-between md:hidden" />
			<Tabs tabs={DESKTOP_TABS} current={statuses} onSelect={select} className="mt-8 hidden w-fit max-w-full md:flex" />

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
						<p>{statuses.length ? "No orders here." : "You haven't ordered anything yet."}</p>
						{!statuses.length && (
							<Button asChild className="mt-5 h-11 rounded-md px-6">
								<Link href={shopRoutes.HOME}>Start shopping</Link>
							</Button>
						)}
					</div>
				) : (
					<>
						{/* Phones: cards. */}
						<ul className="space-y-4 md:hidden">
							{isPending
								? Array.from({ length: 4 }, (_, i) => (
										<li key={i}>
											<Skeleton className="h-[140px] w-full rounded-md" />
										</li>
									))
								: orders.map((o, i) => (
										<li key={o.id} className="animate-rise" style={{ "--i": Math.min(i, 6) } as React.CSSProperties}>
											<Link
												href={accountRoutes.ORDER(o.id)}
												className="flex gap-5 rounded-md bg-white p-3 transition-colors hover:bg-primary-50"
											>
												<span className="relative size-[110px] shrink-0 overflow-hidden rounded-md bg-grey-600">
													{o.first_item.image_url && (
														<Image src={o.first_item.image_url} alt="" fill sizes="110px" className="object-cover" />
													)}
												</span>
												<span className="min-w-0 space-y-1 pt-1">
													<span className="block truncate text-base text-grey-900">
														{o.first_item.name}
														{o.items_count > 1 && ` + ${o.items_count - 1} more`}
													</span>
													<span className="block text-base font-semibold text-ink">Order ID: {o.number}</span>
													<OrderStatusBadge status={o.status} />
													<span className="block text-sm text-grey-900">{orderDate(o.created_at)}</span>
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
								<ListingPagination
									page={data.meta.page}
									totalPages={data.meta.total_pages}
									onChange={(n) => go({ status: statuses.join(",") || undefined, page: n })}
								/>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
