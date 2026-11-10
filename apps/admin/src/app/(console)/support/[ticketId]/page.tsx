import type { Metadata } from "next";
import { TicketView } from "@/features/support/components/TicketView";

export const metadata: Metadata = { title: "Ticket" };

export default async function Page({ params }: { params: Promise<{ ticketId: string }> }) {
	const { ticketId } = await params;
	return <TicketView id={decodeURIComponent(ticketId)} />;
}
