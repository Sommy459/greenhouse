import type { Metadata } from "next";
import { ProductForm } from "@/features/products/components/ProductForm";

export const metadata: Metadata = { title: "Add product" };

export default function Page() {
	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<h1 className="animate-rise text-2xl font-medium text-ink lg:text-[28px]">Add Product</h1>
			<ProductForm />
		</div>
	);
}
