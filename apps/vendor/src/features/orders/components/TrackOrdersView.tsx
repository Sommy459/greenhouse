"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Package, Search } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Pagination } from "@/components/Pagination";
import { PackageStatus } from "@/features/orders/components/PackageStatus";
import { useMyOrders, useTrackOrder } from "@/features/orders/hooks";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/features/orders/options";
import type { OrderStatus, VendorOrder } from "@/features/orders/types";
import { errorMessage } from "@/lib/api/client";
import { consoleRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

type Tab = "tracking" | "active" | "shipping";
const TABS: { value: Tab; label: string }[] = [
	{ value: "tracking", label: "Tracking" },
	{ value: "active", label: "Active" },
	{ value: "shipping", label: "My Shipping" },
];
/** Active: still on its way to the customer. My Shipping: everything you've handed to a courier. */
const LIST_STATUSES: Record<Exclude<Tab, "tracking">, OrderStatus[]> = {
	active: ["paid", "processing", "shipped", "delivery_failed"],
	shipping: ["shipped", "delivered", "delivery_failed", "returned"],
};
const PAGE_SIZE = 6;

/** Figma Vendor Hub "Track Orders": Tracking (look up a package), Active and My Shipping. Tab and lookup live in the URL. */
export function TrackOrdersView() {
	const { get, set } = useUrlParams();
	const tab: Tab = get("tab") === "active" || get("tab") === "shipping" ? (get("tab") as Tab) : "tracking";
	const track = (id: string) => set({ tab: undefined, id, page: undefined });

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<h1 className="animate-rise text-2xl font-medium text-ink lg:text-[28px]">Track Orders</h1>

			<div
				role="tablist"
				aria-label="Track Orders"
				className="animate-rise mt-8 flex w-fit max-w-full overflow-x-auto border-b border-grey-600 lg:mt-12"
				style={{ "--i": 1 } as React.CSSProperties}
			>
				{TABS.map((t) => (
					<button
						key={t.value}
						type="button"
						role="tab"
						aria-selected={tab === t.value}
						onClick={() => set({ tab: t.value === "tracking" ? undefined : t.value, page: undefined })}
						className={clsx(
							"-mb-px shrink-0 border-b-2 px-6 pb-4 text-base whitespace-nowrap transition-colors",
							tab === t.value ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
						)}
					>
						{t.label}
					</button>
				))}
			</div>

			<div className="animate-rise mt-10 lg:mt-14" style={{ "--i": 2 } as React.CSSProperties}>
				{tab === "tracking" ? (
					<TrackingPanel query={get("id")} onSearch={track} />
				) : (
					<ShipmentList statuses={LIST_STATUSES[tab]} tab={tab} onTrack={track} />
				)}
			</div>
		</div>
	);
}

function TrackingPanel({ query, onSearch }: { query: string; onSearch: (id: string) => void }) {
	const { data: order, isFetching, isError, error, refetch } = useTrackOrder(query);
	// Whether the shop has shipped anything at all, for the "No Shipping yet" state.
	const shipped = useMyOrders({ status: LIST_STATUSES.shipping.join(","), page: 1, limit: 1 });
	const nothingShipped = shipped.data?.meta.total === 0;

	return (
		<>
			<div className="flex flex-col items-center text-center">
				<MapPin className="size-24 text-primary-500 lg:size-28" strokeWidth={2.4} aria-hidden />
				<h2 className="mt-4 text-3xl font-medium text-ink lg:text-[40px]">Tracking</h2>
				<form
					role="search"
					// Keyed on the URL value so Back / a new lookup refills the box.
					key={query}
					onSubmit={(e) => {
						e.preventDefault();
						const id = String(new FormData(e.currentTarget).get("id") ?? "").trim();
						if (id) onSearch(id);
					}}
					className="mt-10 w-full max-w-[800px]"
				>
					<label className="flex h-[70px] items-center gap-4 rounded-lg border border-grey-600 bg-white px-6 focus-within:border-primary-500 focus-within:ring-[3px] focus-within:ring-primary-300/30">
						<Search className="size-6 shrink-0 text-grey-900" aria-hidden />
						<span className="sr-only">Tracking number or order ID</span>
						<input
							name="id"
							type="search"
							defaultValue={query}
							placeholder="Enter Tracking ID"
							autoComplete="off"
							className="h-full min-w-0 flex-1 bg-transparent text-lg text-ink outline-none placeholder:text-grey-800"
						/>
					</label>
					<p className="mt-2 text-left text-sm text-grey-900">
						A courier tracking number, or an order ID like FY3020123495. Press Enter.
					</p>
				</form>
			</div>

			<div className="mt-14 lg:mt-20" aria-live="polite">
				{query && isFetching ? (
					<div className="space-y-6">
						<Skeleton className="h-7 w-48" />
						{Array.from({ length: 5 }, (_, i) => (
							<Skeleton key={i} className="h-12 w-72" />
						))}
					</div>
				) : query && isError ? (
					<div className="text-center text-sm text-grey-900">
						<p>{errorMessage(error, "Couldn't look that up.")}</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : query && order ? (
					<section aria-labelledby="package-status">
						<div className="flex flex-wrap items-baseline justify-between gap-3">
							<h3 id="package-status" className="text-xl font-medium text-ink lg:text-2xl">
								Package Status
							</h3>
							<p className="text-base text-grey-900">
								Order{" "}
								<Link href={consoleRoutes.ORDER(order.id)} className="font-semibold text-primary-500 hover:underline">
									{order.number}
								</Link>
								{order.shipment && ` · ${order.shipment.courier} ${order.shipment.tracking_number}`}
							</p>
						</div>
						<PackageStatus order={order} />
					</section>
				) : (
					(query || nothingShipped) && (
						<div className="text-center">
							<p className="text-4xl font-medium text-ink lg:text-5xl">Oops</p>
							<p className="mt-2 text-xl text-ink lg:text-2xl">{query ? "No shipment with that ID" : "No Shipping yet"}</p>
						</div>
					)
				)}
			</div>
		</>
	);
}

/** Active / My Shipping: the shop's orders in those states; Track opens the package's status. */
function ShipmentList({
	statuses,
	tab,
	onTrack,
}: {
	statuses: OrderStatus[];
	tab: "active" | "shipping";
	onTrack: (id: string) => void;
}) {
	const { page, set } = useUrlParams();
	const { data, isPending, isError, refetch } = useMyOrders({ status: statuses.join(","), page, limit: PAGE_SIZE });
	const orders = data?.items ?? [];

	if (isError)
		return (
			<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
				<p>Couldn&apos;t load your shipments.</p>
				<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
					Try again
				</Button>
			</div>
		);
	if (!isPending && orders.length === 0)
		return (
			<div className="py-10 text-center">
				<p className="text-4xl font-medium text-ink lg:text-5xl">Oops</p>
				<p className="mt-2 text-xl text-ink lg:text-2xl">
					{tab === "active" ? "Nothing on its way right now" : "No Shipping yet"}
				</p>
			</div>
		);

	return (
		<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
			<ul className="divide-y divide-grey-600">
				{isPending
					? Array.from({ length: PAGE_SIZE }, (_, i) => (
							<li key={i} className="px-6 py-4">
								<Skeleton className="h-12 w-full" />
							</li>
						))
					: orders.map((o) => <ShipmentRow key={o.id} order={o} onTrack={onTrack} />)}
			</ul>
			{data && data.meta.total_pages > 1 && (
				<div className="border-t border-grey-600">
					<Pagination
						page={data.meta.page}
						totalPages={data.meta.total_pages}
						onChange={(n) => set({ page: n > 1 ? String(n) : undefined })}
					/>
				</div>
			)}
		</div>
	);
}

function ShipmentRow({ order, onTrack }: { order: VendorOrder; onTrack: (id: string) => void }) {
	return (
		<li className="flex flex-wrap items-center gap-4 px-5 py-4 lg:px-8">
			<span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-grey-500">
				{order.first_item.image_url ? (
					<Image src={order.first_item.image_url} alt="" fill sizes="48px" className="object-cover" />
				) : (
					<Package className="size-5 text-grey-700" aria-hidden />
				)}
			</span>
			<div className="min-w-0 flex-1">
				<p className="text-base font-semibold text-ink">{order.number}</p>
				<p className="truncate text-sm text-grey-900">
					{order.first_item.name}
					{order.other_items > 0 && ` + ${order.other_items} other`}
				</p>
			</div>
			<p className="min-w-[180px] text-sm text-grey-900">
				{order.shipment ? (
					<>
						<span className="block text-ink">{order.shipment.courier}</span>
						{order.shipment.tracking_number}
					</>
				) : (
					"Not shipped yet"
				)}
			</p>
			<span className={clsx("rounded-full px-3 py-1 text-sm font-medium", ORDER_STATUS_TONE[order.status])}>
				{ORDER_STATUS_LABEL[order.status]}
			</span>
			<Button
				type="button"
				size="sm"
				variant="outline"
				onClick={() => onTrack(order.shipment?.tracking_number ?? order.number)}
				aria-label={`Track order ${order.number}`}
			>
				Track
			</Button>
		</li>
	);
}
