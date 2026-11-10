import type { Metadata } from "next";
import { VendorReviewsView } from "@/features/insights/components/VendorReviewsView";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
	return <VendorReviewsView />;
}
