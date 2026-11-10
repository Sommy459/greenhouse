import type { Metadata } from "next";
import { Suspense } from "react";
import { StoreView } from "@/features/catalog/components/StoreView";

export const metadata: Metadata = { title: "Store" };

/** A verified vendor's store page. */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	return (
		// The product grid reads sort, filters and page from the URL (useSearchParams), which needs a Suspense boundary.
		<Suspense>
			<StoreView slug={decodeURIComponent(slug)} />
		</Suspense>
	);
}
