import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsView } from "@/features/products/components/ProductsView";

export const metadata: Metadata = { title: "Manage Products" };

export default function Page() {
	return (
		// ProductsView reads the URL's search params.
		<Suspense>
			<ProductsView />
		</Suspense>
	);
}
