import type { Metadata } from "next";
import { PayView } from "@/features/checkout/components/PayView";

export const metadata: Metadata = { title: "Pay" };

/** Pay for a placed order in USDC (C6). */
export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
	const { orderId } = await params;
	return <PayView orderId={decodeURIComponent(orderId)} />;
}
