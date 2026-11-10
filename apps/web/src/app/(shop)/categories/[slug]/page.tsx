import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductListing } from "@/features/catalog/components/ProductListing";
import { Newsletter } from "@/features/home/components/Newsletter";
import { CATEGORY_LINKS } from "@/lib/navigation";
import { shopRoutes } from "@/lib/routes";

const categoryFor = (slug: string) => CATEGORY_LINKS.find((c) => c.href === shopRoutes.CATEGORY(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const category = categoryFor((await params).slug);
	if (!category) return {};
	return {
		title: category.pageTitle ?? category.label,
		description: `Eco-friendly ${category.label.toLowerCase()} from verified Nigerian vendors.`,
	};
}

/** Figma category page (C2): the products in one category, filterable and sortable, then the newsletter. */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const category = categoryFor(slug);
	if (!category) notFound();

	return (
		<>
			{/* ProductListing reads sort, filters and page from the URL (useSearchParams), which needs a Suspense boundary. */}
			<Suspense>
				<ProductListing title={category.pageTitle ?? category.label} query={{ category: slug }} />
			</Suspense>
			<Newsletter />
		</>
	);
}
