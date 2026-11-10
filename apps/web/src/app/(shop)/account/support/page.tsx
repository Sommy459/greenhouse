import type { Metadata } from "next";
import { TicketsView } from "@/features/support/components/TicketsView";

export const metadata: Metadata = { title: "My requests" };

export default function Page() {
	return <TicketsView />;
}
