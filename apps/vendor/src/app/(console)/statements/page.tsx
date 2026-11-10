import type { Metadata } from "next";
import { Suspense } from "react";
import { StatementsView } from "@/features/statements/components/StatementsView";

export const metadata: Metadata = { title: "Account Statements" };

export default function Page() {
	return (
		// StatementsView reads the URL's search params.
		<Suspense>
			<StatementsView />
		</Suspense>
	);
}
