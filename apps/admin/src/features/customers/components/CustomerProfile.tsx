"use client";

import clsx from "clsx";
import { useState } from "react";
import { Lock, Mail, MapPin, Phone, ShoppingCart } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { UserAvatar } from "@/components/UserAvatar";
import { useSetCustomerStatus } from "@/features/customers/hooks";
import type { CustomerDetail } from "@/features/customers/types";

const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Figma "Blacklist this customer": a switch. Turning it on asks first (they lose access); turning it off restores them. */
export function BlacklistSwitch({ customer }: { customer: CustomerDetail }) {
	const [confirming, setConfirming] = useState(false);
	const setStatus = useSetCustomerStatus(customer.id);
	const blocked = customer.status === "blocked";
	const name = `${customer.first_name} ${customer.last_name}`;

	return (
		<div className="flex items-center justify-between gap-4 px-0.5">
			<label htmlFor="blacklist" className="text-base text-grey-900 lg:text-lg">
				Blacklist this customer
			</label>
			<button
				id="blacklist"
				type="button"
				role="switch"
				aria-checked={blocked}
				disabled={setStatus.isPending}
				onClick={() => (blocked ? setStatus.mutate("active") : setConfirming(true))}
				className={clsx(
					"relative h-7 w-[52px] shrink-0 rounded-full transition-colors focus-visible:ring-[3px] focus-visible:ring-primary-300/50 focus-visible:outline-none disabled:opacity-60",
					blocked ? "bg-error-500" : "bg-grey-600",
				)}
			>
				<span
					className={clsx(
						"absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform duration-200 ease-spring",
						blocked && "translate-x-6",
					)}
				/>
			</button>

			<AlertDialog open={confirming} onOpenChange={(open) => !open && !setStatus.isPending && setConfirming(false)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Blacklist {name}?</AlertDialogTitle>
						<AlertDialogDescription>
							They won&apos;t be able to sign in or place orders until you switch this off again. Their orders and history are
							kept.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={setStatus.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={setStatus.isPending}
							className="bg-error-500 hover:bg-error-700"
							onClick={(e) => {
								e.preventDefault();
								setStatus.mutate("blocked", { onSuccess: () => setConfirming(false) });
							}}
						>
							{setStatus.isPending ? "Blacklisting…" : "Blacklist"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

/** Figma profile card: green banner, round photo, name with "Subscribed", @username, then the account facts. */
export function CustomerProfile({ customer }: { customer: CustomerDetail }) {
	const name = `${customer.first_name} ${customer.last_name}`;
	const facts = [
		{ icon: Lock, label: "User ID", value: customer.code },
		{ icon: Mail, label: "Billing Email", value: customer.email },
		{ icon: Phone, label: "Phone Number", value: customer.phone_number },
		{ icon: MapPin, label: "Delivery Address", value: customer.address ?? "Not given yet" },
		{
			icon: ShoppingCart,
			label: "Latest Transaction",
			value: customer.last_order_at ? longDate(customer.last_order_at) : "No orders yet",
		},
	];

	return (
		<section aria-label={`${name}'s profile`} className="rounded-xl border border-grey-600 bg-white p-2.5 pb-8">
			<div className="h-[150px] rounded-md bg-primary-500 lg:h-[190px]" />
			<div className="-mt-[85px] flex flex-col items-center px-4 text-center lg:-mt-[120px]">
				<UserAvatar name={name} className="size-[170px] ring-8 ring-white lg:size-[210px]" textClassName="text-5xl" />
				<div className="mt-3 flex flex-wrap items-center justify-center gap-2">
					<h2 className="text-xl font-medium text-ink lg:text-[22px]">{name}</h2>
					{customer.subscribed && (
						<span className="rounded-full bg-success-50 px-2.5 py-0.5 text-sm font-medium text-success-700">Subscribed</span>
					)}
					{customer.status === "blocked" && (
						<span className="rounded-full bg-error-50 px-2.5 py-0.5 text-sm font-medium text-error-500">Blacklisted</span>
					)}
				</div>
				<p className="mt-1 text-base text-grey-900">@{customer.username}</p>
			</div>

			<dl className="mx-4 mt-6 space-y-5 border-t border-grey-600 pt-6 lg:mx-6">
				{facts.map(({ icon: Icon, label, value }) => (
					<div key={label} className="flex items-start gap-4">
						<span className="grid size-12 shrink-0 place-items-center rounded-full bg-grey-500 text-grey-900">
							<Icon className="size-5" aria-hidden />
						</span>
						<div className="min-w-0">
							<dt className="text-base text-grey-900">{label}</dt>
							<dd className="mt-0.5 text-base break-words text-ink">{value}</dd>
						</div>
					</div>
				))}
			</dl>
		</section>
	);
}
