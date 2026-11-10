"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, LogOut, Pencil } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { AddressDialog } from "@/features/account/components/AddressDialog";
import { Avatar } from "@/features/account/components/Avatar";
import { useAddress } from "@/features/account/hooks";
import { useSignOut } from "@/features/auth/hooks";
import { useSession } from "@/features/auth/session";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { useOrders } from "@/features/orders/hooks";
import { accountRoutes } from "@/lib/routes";

const CARD = "rounded-md bg-white";

/** Figma "My Account" (wide screens, and phone "Account" stacked with a back link and Log Out): the profile card, the billing address with its pencil, and the five latest orders. */
export function AccountOverview() {
	const user = useSession((s) => s.user);
	const address = useAddress();
	const orders = useOrders({ page: 1, limit: 5 });
	const [editing, setEditing] = useState(false);
	const signOut = useSignOut();
	const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Your account";
	const saved = address.data;

	return (
		<div className="pb-6 lg:pb-16">
			{/* Phones: back to the menu (Figma "Account"). */}
			<Link href={accountRoutes.DASHBOARD} className="mb-8 inline-flex items-center gap-3 text-lg text-ink lg:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				Account
			</Link>
			<h1 className="sr-only">My Account</h1>
			<div className="grid gap-6 md:grid-cols-[2fr_3fr] lg:gap-9">
				<section
					aria-label="Profile"
					className={`${CARD} animate-rise flex flex-col items-center justify-center px-6 py-12 text-center`}
				>
					<Avatar user={user} className="size-24 text-3xl" />
					<p className="mt-5 text-lg font-medium text-ink">{name}</p>
					<Link href={accountRoutes.SETTINGS} className="mt-1 text-sm text-ink hover:text-primary-500 hover:underline">
						View Profile
					</Link>
				</section>

				<section
					aria-labelledby="billing-address"
					className={`${CARD} animate-rise px-6 py-8 lg:px-8`}
					style={{ "--i": 1 } as React.CSSProperties}
				>
					<div className="flex items-start justify-between gap-4">
						<h2 id="billing-address" className="flex-1 border-b border-grey-800 pb-5 text-lg text-ink uppercase">
							Billing Address
						</h2>
						<button
							type="button"
							onClick={() => setEditing(true)}
							disabled={address.isPending}
							aria-label="Edit billing address"
							className="rounded-md p-1.5 text-ink hover:bg-grey-500 hover:text-primary-500 disabled:opacity-50"
						>
							<Pencil className="size-6" aria-hidden />
						</button>
					</div>
					{address.isPending ? (
						<div className="mt-5 space-y-2">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-5 w-72" />
							<Skeleton className="h-5 w-56" />
						</div>
					) : saved ? (
						<div className="mt-5 space-y-2 text-base">
							<p className="text-lg text-ink">
								{saved.first_name} {saved.last_name}
							</p>
							<p className="text-grey-900">
								{saved.address}, {saved.city}
								{saved.zip_code ? ` ${saved.zip_code}` : ""}, Nigeria
							</p>
							<p className="text-ink">{saved.email}</p>
							<p className="text-ink">{saved.phone_number}</p>
						</div>
					) : (
						<div className="mt-5 text-base text-grey-900">
							<p>No address saved yet.</p>
							<Button type="button" variant="outline" onClick={() => setEditing(true)} className="mt-4 rounded-md">
								Add address
							</Button>
						</div>
					)}
				</section>
			</div>

			<section
				aria-labelledby="recent-orders"
				className="animate-rise mt-8 overflow-hidden rounded-md border border-grey-600 bg-white"
				style={{ "--i": 2 } as React.CSSProperties}
			>
				<div className="flex items-center justify-between gap-4 px-4 py-4">
					<h2 id="recent-orders" className="text-lg font-medium text-ink">
						Recent Orders History
					</h2>
					<Link href={accountRoutes.ORDERS} className="inline-flex items-center gap-1 text-lg text-ink hover:text-primary-500">
						See all <ChevronRight className="size-6" aria-hidden />
					</Link>
				</div>
				{orders.isError ? (
					<div className="border-t border-grey-600 py-12 text-center text-sm text-grey-900">
						<p>We couldn&apos;t load your orders.</p>
						<Button variant="outline" size="sm" onClick={() => orders.refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !orders.isPending && orders.data.items.length === 0 ? (
					<p className="border-t border-grey-600 py-12 text-center text-base text-grey-900">No orders yet.</p>
				) : (
					<div className="border-t border-grey-600">
						<OrdersTable orders={orders.data?.items ?? []} isPending={orders.isPending} />
					</div>
				)}
			</section>

			{/* Phones: the menu with Log Out isn't beside the page. */}
			<button
				type="button"
				onClick={signOut}
				className="mx-auto mt-10 flex items-center gap-3 rounded-md px-4 py-2 text-base text-ink hover:bg-error-50 hover:text-error-500 lg:hidden"
			>
				<LogOut className="size-6" aria-hidden />
				Log Out
			</button>

			<AddressDialog
				open={editing}
				onOpenChange={setEditing}
				initial={
					saved ?? {
						first_name: user?.first_name ?? "",
						last_name: user?.last_name ?? "",
						address: "",
						city: "",
						zip_code: "",
						phone_number: user?.phone_number ?? "",
						email: user?.email ?? "",
					}
				}
			/>
		</div>
	);
}
