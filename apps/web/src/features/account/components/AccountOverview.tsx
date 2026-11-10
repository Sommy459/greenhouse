"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, LogOut, Pencil, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Avatar } from "@/features/account/components/Avatar";
import { AddressDialog } from "@/features/addresses/components/AddressDialog";
import { addressLine } from "@/features/addresses/components/AddressesView";
import { useAddresses } from "@/features/addresses/hooks";
import { useSignOut } from "@/features/auth/hooks";
import { useSession } from "@/features/auth/session";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { useOrders } from "@/features/orders/hooks";
import { useWallet } from "@/features/wallet/hooks";
import { usdc } from "@/lib/format";
import { accountRoutes } from "@/lib/routes";

const CARD = "rounded-md bg-white";

/**
 * Figma "My Account" (wide screens, and phone "Account" stacked with a back link and Log Out): the profile card, the
 * Billing Address (the default saved address; the pencil edits it), the Fysi wallet, and the five latest orders.
 */
export function AccountOverview() {
	const user = useSession((s) => s.user);
	const wallet = useWallet();
	const addresses = useAddresses();
	const main = addresses.data?.[0];
	const [editing, setEditing] = useState(false);
	const orders = useOrders(1, 5);
	const signOut = useSignOut();

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
					<p className="mt-5 text-lg font-medium text-ink">{user?.name || user?.email}</p>
					<p className="text-sm text-grey-900">{user?.email}</p>
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
							disabled={addresses.isPending}
							aria-label={main ? "Edit billing address" : "Add an address"}
							className="rounded-md p-1.5 text-ink hover:bg-grey-500 hover:text-primary-500 disabled:opacity-50"
						>
							<Pencil className="size-6" aria-hidden />
						</button>
					</div>
					{addresses.isPending ? (
						<div className="mt-5 space-y-2">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-5 w-72" />
						</div>
					) : main ? (
						<div className="mt-5 space-y-2 text-base">
							<p className="text-lg text-ink">{main.recipientName}</p>
							<p className="text-grey-900">{addressLine(main)}, Nigeria</p>
							<p className="text-ink">{user?.email}</p>
							<p className="text-ink">{main.phone}</p>
							<Link
								href={accountRoutes.ADDRESSES}
								className="inline-block pt-1 text-sm font-medium text-primary-500 hover:underline"
							>
								Manage addresses{addresses.data && addresses.data.length > 1 ? ` (${addresses.data.length})` : ""}
							</Link>
						</div>
					) : (
						<div className="mt-5 text-base text-grey-900">
							<p>No address saved yet. Save one and checkout fills it in.</p>
							<Button type="button" variant="outline" onClick={() => setEditing(true)} className="mt-4 rounded-md">
								Add address
							</Button>
						</div>
					)}
				</section>
			</div>

			<div className="mt-6 lg:mt-9">
				<section
					aria-labelledby="wallet-card"
					className={`${CARD} animate-rise px-6 py-8 lg:px-8`}
					style={{ "--i": 2 } as React.CSSProperties}
				>
					<h2 id="wallet-card" className="flex items-center gap-2 border-b border-grey-800 pb-5 text-lg text-ink uppercase">
						<WalletIcon className="size-5" aria-hidden />
						Fysi Wallet
					</h2>
					{wallet.isPending ? (
						<div className="mt-5 space-y-2">
							<Skeleton className="h-8 w-40" />
							<Skeleton className="h-5 w-64" />
						</div>
					) : wallet.data ? (
						<div className="mt-5">
							<p className="text-sm text-grey-900">Balance</p>
							<p className="text-2xl font-semibold text-ink">{usdc(wallet.data.balance)}</p>
							<p className="mt-1 text-sm text-grey-900">Pay for orders in one tap with your PIN.</p>
							<Button asChild variant="outline" className="mt-4 rounded-md">
								<Link href={accountRoutes.WALLET}>Open wallet</Link>
							</Button>
						</div>
					) : (
						<div className="mt-5 text-base text-grey-900">
							<p>Hold USDC with Fysi and pay for orders in one tap. You set a PIN; Fysi keeps the keys safe.</p>
							<Button asChild className="mt-4 rounded-md">
								<Link href={accountRoutes.WALLET}>Create my wallet</Link>
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

			<AddressDialog open={editing} onOpenChange={setEditing} address={main} />

			{/* Phones: the menu with Log Out isn't beside the page. */}
			<button
				type="button"
				onClick={signOut}
				className="mx-auto mt-10 flex items-center gap-3 rounded-md px-4 py-2 text-base text-ink hover:bg-error-50 hover:text-error-500 lg:hidden"
			>
				<LogOut className="size-6" aria-hidden />
				Log Out
			</button>
		</div>
	);
}
