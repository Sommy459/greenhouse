import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Product" };

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
	const { productId } = await params;
	return (
		<div className="custom-container">
			<PagePlaceholder title={`Product: ${productId}`} requirements={["A2", "A3"]} description="Product details, its shop, eco badge and sales." />
		</div>
	);
}
