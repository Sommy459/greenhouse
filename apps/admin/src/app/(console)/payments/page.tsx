import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentsView } from "@/features/payments/components/PaymentsView";

export const metadata: Metadata = { title: "Payments" };

export default function Page() {
	return (
		// PaymentsView reads the URL's search params.
		<Suspense>
			<PaymentsView />
		</Suspense>
	);
}
