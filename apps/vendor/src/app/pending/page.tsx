"use client";

import Link from "next/link";
import { Button } from "@repo/ui/button";
import { AuthCard } from "@/components/AuthCard";
import { useSignOut } from "@/features/auth/hooks";
import { useMyShop } from "@/features/shop/hooks";
import type { ShopStatus } from "@/features/shop/types";
import { consoleRoutes } from "@/lib/routes";
import { STORE_URL } from "@/lib/site";

const COPY: Record<ShopStatus, { title: string; body: string }> = {
	pending: {
		title: "Your shop is being reviewed",
		body: "An admin is checking your shop. You can start selling as soon as it is approved.",
	},
	rejected: { title: "Your shop wasn't approved", body: "Contact us to find out why and what to change." },
	suspended: { title: "Your shop is suspended", body: "Your listings are hidden from customers. Contact us to resolve it." },
	approved: { title: "Your shop is approved", body: "You're ready to sell." },
};

/** V1 / user flow: unapproved vendors wait here and can contact an admin. */
export default function Page() {
	const { data: shop } = useMyShop();
	const signOut = useSignOut();
	const copy = COPY[shop?.status ?? "pending"];

	return (
		<AuthCard title={copy.title} subtitle={shop?.shop_name}>
			<p className="text-grey-900">{copy.body}</p>
			<div className="mt-8 flex flex-col gap-3">
				{shop?.status === "approved" ? (
					<Button asChild>
						<Link href={consoleRoutes.OVERVIEW}>Go to the seller centre</Link>
					</Button>
				) : (
					<Button asChild variant="outline">
						<a href={`${STORE_URL}/contact`}>Contact admin</a>
					</Button>
				)}
				<button type="button" onClick={signOut} className="text-sm font-medium text-grey-900 hover:text-ink">
					Log out
				</button>
			</div>
		</AuthCard>
	);
}
