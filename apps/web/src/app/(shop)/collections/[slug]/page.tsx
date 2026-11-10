import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductListing } from "@/features/catalog/components/ProductListing";
import { COLLECTION_LINKS } from "@/lib/navigation";
import { shopRoutes } from "@/lib/routes";
import { Newsletter } from "@/features/home/components/Newsletter";

const collectionFor = (slug: string) => COLLECTION_LINKS.find((c) => c.href === shopRoutes.COLLECTION(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const collection = collectionFor((await params).slug);
	return collection ? { title: collection.label } : {};
}

/** New in and Certified products (C2): the category page layout, for a collection the API can list. */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const collection = collectionFor(slug);
	if (!collection) notFound();

	return (
		<>
			{/* ProductListing reads sort, filters and page from the URL (useSearchParams), which needs a Suspense boundary. */}
			<Suspense>
				<ProductListing title={collection.label} query={collection.query} />
			</Suspense>
			<Newsletter />
		</>
	);
}
