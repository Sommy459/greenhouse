import type { Metadata } from "next";
import { VendorDetailsView } from "@/features/vendors/components/VendorDetailsView";

export const metadata: Metadata = { title: "Vendor details" };

export default async function Page({ params }: { params: Promise<{ vendorId: string }> }) {
	const { vendorId } = await params;
	return <VendorDetailsView vendorId={decodeURIComponent(vendorId)} />;
}
