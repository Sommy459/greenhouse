import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductListing } from "@/features/catalog/components/ProductListing";
import { Newsletter } from "@/features/home/components/Newsletter";

type SearchParams = Promise<{ q?: string | string[] }>;
const termOf = (q: string | string[] | undefined) => (typeof q === "string" ? q.trim().slice(0, 100) : "");

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
	const q = termOf((await searchParams).q);
	return { title: q ? `Search: ${q}` : "All products", robots: q ? { index: false, follow: true } : undefined };
}

/**
 * Search (C2): the header search box sends `?q=`; "Shop Now" and "Browse products" open it empty, which lists every
 * product. Same grid, Filter and Sort by as the category pages.
 */
export default async function Page({ searchParams }: { searchParams: SearchParams }) {
	const q = termOf((await searchParams).q);
	return (
		<>
			{/* ProductListing reads sort, filters and page from the URL (useSearchParams), which needs a Suspense boundary. */}
			<Suspense>
				<ProductListing key={q} title={q ? `Results for \u201c${q}\u201d` : "All products"} query={{ q }} />
			</Suspense>
			<Newsletter />
		</>
	);
}
