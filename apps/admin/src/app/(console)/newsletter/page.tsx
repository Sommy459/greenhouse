import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsletterView } from "@/features/newsletter/components/NewsletterView";

export const metadata: Metadata = { title: "Newsletter" };

export default function Page() {
	return (
		<Suspense>
			<NewsletterView />
		</Suspense>
	);
}
