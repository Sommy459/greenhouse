import type { Metadata } from "next";
import { AnalyticsView } from "@/features/insights/components/AnalyticsView";

export const metadata: Metadata = { title: "Analytics" };

export default function Page() {
	return <AnalyticsView />;
}
