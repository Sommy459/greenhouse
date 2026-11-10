import type { Metadata } from "next";
import { ProductDetailView } from "@/features/catalog/components/product/ProductDetailView";
import { Newsletter } from "@/features/home/components/Newsletter";

/** "bamboo-desk-lamp" → "Bamboo Desk Lamp" (the product itself loads in the browser from the API). */
const titleFromSlug = (slug: string) =>
	slug
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	return { title: titleFromSlug((await params).slug) };
}

/** Figma product page (C4, C9, C10). */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	return (
		<>
			<ProductDetailView slug={slug} />
			<Newsletter />
		</>
	);
}
