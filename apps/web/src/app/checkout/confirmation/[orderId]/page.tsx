import type { Metadata } from "next";
import { OrderConfirmation } from "@/features/checkout/components/OrderConfirmation";
import { Newsletter } from "@/features/home/components/Newsletter";

export const metadata: Metadata = { title: "Thank you" };

/** Figma "Thank you!" page, after an order is placed (C5, C8). */
export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
	const { orderId } = await params;
	return (
		<>
			<OrderConfirmation orderId={decodeURIComponent(orderId)} />
			<Newsletter />
		</>
	);
}
