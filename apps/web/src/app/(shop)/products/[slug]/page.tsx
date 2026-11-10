import type { Metadata } from "next";
import { ProductDetailView } from "@/features/catalog/components/product/ProductDetailView";
import type { ProductDetail } from "@/features/catalog/types";
import { Newsletter } from "@/features/home/components/Newsletter";
import { getPublic, snippet } from "@/lib/api/server";
import { price } from "@/lib/format";
import { backendRoutes, shopRoutes } from "@/lib/routes";

/** "bamboo-desk-lamp" → "Bamboo Desk Lamp", when the API can't be reached. */
const titleFromSlug = (slug: string) =>
	slug
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");

/** The tab title and the link preview: the product's name, price, description and photos (from the API). */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const slug = decodeURIComponent((await params).slug);
	const product = await getPublic<ProductDetail>(backendRoutes.PRODUCT(slug));
	if (!product) return { title: titleFromSlug(slug) };

	const photos = [...product.images]
		.sort((a, b) => a.position - b.position)
		.flatMap((i) => (i.url ? [{ url: i.url, alt: product.title }] : []));
	const description =
		snippet(`${price(product.price)} · ${product.vendor.businessName}. ${product.description}`) ||
		`${product.title} from ${product.vendor.businessName}, on Fysi.`;
	const url = shopRoutes.PRODUCT(product.slug);

	return {
		title: product.title,
		description,
		alternates: { canonical: url },
		openGraph: { type: "website", url, title: product.title, description, ...(photos.length ? { images: photos } : {}) },
		twitter: { card: "summary_large_image", title: product.title, description, ...(photos.length ? { images: photos } : {}) },
	};
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
