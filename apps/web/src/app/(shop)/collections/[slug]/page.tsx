import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductListing } from "@/features/catalog/components/ProductListing";
import type { Collection } from "@/features/catalog/types";
import { Newsletter } from "@/features/home/components/Newsletter";
import { COLLECTION_LINKS } from "@/lib/navigation";
import { shopRoutes } from "@/lib/routes";

const collectionFor = (slug: string) => COLLECTION_LINKS.find((c) => c.href === shopRoutes.COLLECTION(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const collection = collectionFor((await params).slug);
	return collection ? { title: collection.label } : {};
}

/** New in, Products on demand, Hot deals, Sustainability highlights (C2): the category page layout, by collection. */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const collection = collectionFor(slug);
	if (!collection) notFound();

	return (
		<>
			{/* ProductListing reads sort, filters and page from the URL (useSearchParams), which needs a Suspense boundary. */}
			<Suspense>
				<ProductListing title={collection.label} query={{ collection: slug as Collection }} />
			</Suspense>
			<Newsletter />
		</>
	);
}
