import type { Metadata } from "next";
import { Suspense } from "react";
import { HelpView } from "@/features/support/components/HelpView";

export const metadata: Metadata = { title: "Help" };

export default function Page() {
	return (
		// HelpView reads the URL's search params.
		<Suspense>
			<HelpView />
		</Suspense>
	);
}
