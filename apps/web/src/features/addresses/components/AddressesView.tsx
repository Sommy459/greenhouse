"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, MapPin, Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { AddressDialog } from "@/features/addresses/components/AddressDialog";
import { useAddresses, useDeleteAddress, useMakeDefaultAddress } from "@/features/addresses/hooks";
import type { SavedAddress } from "@/features/addresses/types";
import { accountRoutes } from "@/lib/routes";

/** One line of an address: "50 Togo Street, Flat 3, Lagos, Lagos". */
export const addressLine = (a: SavedAddress) => [a.line1, a.line2, a.city, a.state].filter(Boolean).join(", ");

/** Saved delivery addresses: add, edit, remove, choose the default (checkout starts with it). */
export function AddressesView() {
	const { data, isPending, isError, refetch } = useAddresses();
	const remove = useDeleteAddress();
	const makeDefault = useMakeDefaultAddress();
	const [editing, setEditing] = useState<SavedAddress | "new" | null>(null);

	return (
		<div className="pb-6 lg:pb-16">
			<Link href={accountRoutes.DASHBOARD} className="inline-flex items-center gap-3 text-lg text-ink lg:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				<span>Addresses</span>
			</Link>
			<div className="mt-6 flex flex-wrap items-center justify-between gap-3 lg:mt-0">
				<h1 className="text-2xl text-ink lg:text-[28px]">Addresses</h1>
				<Button onClick={() => setEditing("new")} className="gap-2">
					<Plus className="size-4" aria-hidden /> Add an address
				</Button>
			</div>

			<div className="mt-6">
				{isError ? (
					<div className="rounded-md bg-white py-16 text-center text-sm text-grey-900">
						<p>We couldn&apos;t load your addresses.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<Skeleton className="h-40 w-full rounded-md" />
				) : data.length === 0 ? (
					<p className="rounded-md bg-white py-16 text-center text-base text-grey-900">No saved addresses yet.</p>
				) : (
					<ul className="grid gap-4 md:grid-cols-2">
						{data.map((a) => (
							<li key={a.id} className="flex flex-col rounded-md border border-grey-600 bg-white p-5">
								<p className="flex items-center gap-2 text-base font-medium text-ink">
									<MapPin className="size-4 text-primary-500" aria-hidden />
									{a.label || a.recipientName}
									{a.isDefault && (
										<span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-500">Default</span>
									)}
								</p>
								<p className="mt-2 text-sm text-grey-900">
									{a.recipientName} · {a.phone}
									<br />
									{addressLine(a)}
								</p>
								<div className="mt-auto flex flex-wrap gap-3 pt-4 text-sm">
									<button type="button" onClick={() => setEditing(a)} className="font-medium text-primary-500 hover:underline">
										Edit
									</button>
									{!a.isDefault && (
										<button
											type="button"
											onClick={() => makeDefault.mutate(a.id)}
											disabled={makeDefault.isPending}
											className="text-ink hover:underline"
										>
											Make default
										</button>
									)}
									<button
										type="button"
										onClick={() => remove.mutate(a.id)}
										disabled={remove.isPending}
										className="text-error-500 hover:underline"
									>
										Remove
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>

			<AddressDialog
				open={!!editing}
				onOpenChange={(open) => !open && setEditing(null)}
				address={editing && editing !== "new" ? editing : undefined}
			/>
		</div>
	);
}
