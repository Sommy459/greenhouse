"use client";

import Link from "next/link";
import { Button } from "@repo/ui/button";
import { AuthCard } from "@/components/AuthCard";
import { useSignOut } from "@/features/auth/hooks";
import { useProfile } from "@/features/shop/hooks";
import type { VendorStatus } from "@/features/shop/types";
import { consoleRoutes, setupRoutes } from "@/lib/routes";
import { STORE_URL } from "@/lib/site";

const COPY: Record<VendorStatus, { title: string; body: string }> = {
	draft: { title: "Finish verifying your shop", body: "Add your business details and documents, then submit." },
	pending: {
		title: "Your shop is being reviewed",
		body: "Fysi is checking your details and documents. We'll email you the decision; you can start selling as soon as it's approved.",
	},
	rejected: { title: "Your shop wasn't approved", body: "See why, fix it and submit again." },
	suspended: { title: "Your shop is suspended", body: "Your products are hidden from customers. Contact Fysi to resolve it." },
	approved: { title: "Your shop is approved", body: "You're ready to sell." },
};

/** PRD V3 ("Pending verification" on the dashboard) and suspensions: unapproved vendors wait here. */
export default function Page() {
	const { data: profile } = useProfile();
	const signOut = useSignOut();
	const status = profile?.status ?? "pending";
	const copy = COPY[status];

	return (
		<AuthCard title={copy.title} subtitle={profile?.businessName}>
			<p className="text-grey-900">{copy.body}</p>
			{status === "suspended" && profile?.decisionReason && (
				<p className="mt-3 rounded-md bg-error-50 p-3 text-sm text-ink">Reason: {profile.decisionReason}</p>
			)}
			<div className="mt-8 flex flex-col gap-3">
				{status === "approved" ? (
					<Button asChild>
						<Link href={consoleRoutes.OVERVIEW}>Go to the Vendor Hub</Link>
					</Button>
				) : status === "draft" || status === "rejected" ? (
					<Button asChild>
						<Link href={setupRoutes.ONBOARDING}>{status === "rejected" ? "Fix and resubmit" : "Continue"}</Link>
					</Button>
				) : (
					<Button asChild variant="outline">
						<a href={`${STORE_URL}/contact`}>Contact Fysi</a>
					</Button>
				)}
				<button type="button" onClick={signOut} className="text-sm font-medium text-grey-900 hover:text-ink">
					Log out
				</button>
			</div>
		</AuthCard>
	);
}
