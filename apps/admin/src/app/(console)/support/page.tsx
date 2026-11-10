import type { Metadata } from "next";
import { Suspense } from "react";
import { TicketsView } from "@/features/support/components/TicketsView";

export const metadata: Metadata = { title: "Support" };

export default function Page() {
	return (
		<Suspense>
			<TicketsView />
		</Suspense>
	);
}
