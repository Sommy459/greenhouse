import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Edit product" };

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
	const { productId } = await params;
	return (
		<div className="custom-container">
			<PagePlaceholder
				title={`Edit product: ${productId}`}
				requirements={["V2", "V3", "V4"]}
				description="Edit a listing, its stock and the certification that covers it."
			/>
		</div>
	);
}
