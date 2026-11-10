import type { Metadata } from "next";
import { PayLinkView } from "@/features/checkout/components/PayLinkView";

export const metadata: Metadata = { title: "Pay for an order", robots: { index: false, follow: false } };

/** The shareable payment link (C6): anyone with it can pay, no account needed. */
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
	const { token } = await params;
	return <PayLinkView token={decodeURIComponent(token)} />;
}
