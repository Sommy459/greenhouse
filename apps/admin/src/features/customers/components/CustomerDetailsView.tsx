"use client";

import clsx from "clsx";
import { BadgeCheck, Share, ShoppingCart, Wallet } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { BlacklistSwitch, CustomerProfile } from "@/features/customers/components/CustomerProfile";
import { CustomerOrderHistory } from "@/features/customers/components/CustomerOrderHistory";
import { useAdminCustomer } from "@/features/customers/hooks";
import { ChangeBadge } from "@/features/dashboard/components/StatCards";
import { useExportOrders } from "@/features/orders/hooks";
import { errorMessage } from "@/lib/api/client";
import { count, naira } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

/** Figma admin "Customers Details" (A2): blacklist switch, profile card, three totals and the order history. */
export function CustomerDetailsView({ customerId }: { customerId: string }) {
	const { data: customer, isPending, isError, error, refetch } = useAdminCustomer(customerId);
	const exportOrders = useExportOrders();
	const name = customer ? `${customer.first_name} ${customer.last_name}` : "";

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader
				title="Customers Details"
				crumb={name || "…"}
				parents={[{ label: "Customer List", href: consoleRoutes.CUSTOMERS }]}
			>
				<Button
					type="button"
					size="sm"
					disabled={!customer}
					isLoading={exportOrders.isPending}
					onClick={() => exportOrders.mutate({ customer: customerId })}
					className="h-12 rounded-lg px-5"
					title="Export this customer's orders"
				>
					<Share className="size-5" aria-hidden />
					Export
				</Button>
			</ListHeader>

			{isError ? (
				<div className="mt-10 rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
					<p>{errorMessage(error, "Couldn't load this customer.")}</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : isPending ? (
				<div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,580fr)_minmax(0,1160fr)]" aria-busy aria-label="Loading customer">
					<Skeleton className="h-[640px] rounded-xl" />
					<div className="space-y-8">
						<div className="grid gap-4 sm:grid-cols-3">
							{[0, 1, 2].map((i) => (
								<Skeleton key={i} className="h-[150px] rounded-xl" />
							))}
						</div>
						<Skeleton className="h-[480px] rounded-xl" />
					</div>
				</div>
			) : (
				<div className="mt-4 grid gap-8 xl:grid-cols-[minmax(0,580fr)_minmax(0,1160fr)]">
					<div className="animate-rise space-y-6">
						<BlacklistSwitch customer={customer} />
						<CustomerProfile customer={customer} />
					</div>
					<div className="min-w-0 space-y-8 xl:pt-0">
						<ul className="grid gap-4 sm:grid-cols-3 lg:gap-6">
							{[
								{
									label: "Total Balance",
									value: naira(customer.balance, 2),
									change: customer.changes.balance,
									icon: Wallet,
									tone: "bg-error-50 text-error-500",
								},
								{
									label: "Total Orders",
									value: count(customer.orders_count),
									change: customer.changes.orders,
									icon: ShoppingCart,
									tone: "bg-info-50 text-info-500",
								},
								{
									label: "Rewards Point",
									value: count(customer.rewards_points),
									change: customer.changes.rewards_points,
									icon: BadgeCheck,
									tone: "bg-grey-500 text-grey-900",
								},
							].map(({ label, value, change, icon: Icon, tone }, i) => (
								<li key={label} className="animate-rise" style={{ "--i": i + 1 } as React.CSSProperties}>
									<div className="hover-lift h-full rounded-xl border border-grey-600 bg-white p-5 lg:p-6">
										<span className={clsx("grid size-12 place-items-center rounded-full", tone)}>
											<Icon className="size-6" aria-hidden />
										</span>
										<p className="mt-6 text-base text-grey-900 lg:text-lg">{label}</p>
										<p className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-medium text-ink lg:text-[28px]">
											{value}
											<ChangeBadge change={change} />
										</p>
									</div>
								</li>
							))}
						</ul>
						<div className="animate-rise" style={{ "--i": 4 } as React.CSSProperties}>
							<CustomerOrderHistory customerId={customer.id} ordersCount={customer.orders_count} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
