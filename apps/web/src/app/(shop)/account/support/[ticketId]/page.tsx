import type { Metadata } from "next";
import { TicketView } from "@/features/support/components/TicketsView";

export const metadata: Metadata = { title: "Request" };

export default async function Page({ params }: { params: Promise<{ ticketId: string }> }) {
	const { ticketId } = await params;
	return <TicketView id={decodeURIComponent(ticketId)} />;
}
