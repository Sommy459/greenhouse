import type { Metadata } from "next";
import { OrderDetailView } from "@/features/orders/components/OrderDetailView";

export const metadata: Metadata = { title: "Order Detail" };

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
	const { orderId } = await params;
	return <OrderDetailView id={decodeURIComponent(orderId)} />;
}
