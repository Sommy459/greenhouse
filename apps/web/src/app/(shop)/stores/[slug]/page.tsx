import type { Metadata } from "next";
import { Suspense } from "react";
import { StoreView } from "@/features/catalog/components/StoreView";
import type { Store } from "@/features/catalog/types";
import { getPublic, snippet } from "@/lib/api/server";
import { backendRoutes, shopRoutes } from "@/lib/routes";

/** The tab title and the link preview: the shop's name, description and logo (from the API). */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const slug = decodeURIComponent((await params).slug);
	const store = await getPublic<Store>(backendRoutes.STORE(slug));
	if (!store) return { title: "Store" };

	const place = [store.city, store.state].filter(Boolean).join(", ");
	const description =
		snippet(store.description) || `Eco-verified products from ${store.businessName}${place ? ` in ${place}` : ""}, on Fysi.`;
	const url = shopRoutes.STORE(store.slug);
	return {
		title: store.businessName,
		description,
		alternates: { canonical: url },
		openGraph: {
			type: "website",
			url,
			title: store.businessName,
			description,
			...(store.logoUrl ? { images: [{ url: store.logoUrl, alt: `${store.businessName} logo` }] } : {}),
		},
		twitter: { card: store.logoUrl ? "summary" : "summary_large_image", title: store.businessName, description },
	};
}

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
