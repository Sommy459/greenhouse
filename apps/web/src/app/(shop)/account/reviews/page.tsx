import type { Metadata } from "next";
import { ReviewsView } from "@/features/reviews/components/ReviewsView";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
	return <ReviewsView />;
}
