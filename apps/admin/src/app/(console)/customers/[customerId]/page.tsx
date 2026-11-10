import type { Metadata } from "next";
import { CustomerDetailsView } from "@/features/customers/components/CustomerDetailsView";

export const metadata: Metadata = { title: "Customer details" };

export default async function Page({ params }: { params: Promise<{ customerId: string }> }) {
	const { customerId } = await params;
	return <CustomerDetailsView customerId={decodeURIComponent(customerId)} />;
}
