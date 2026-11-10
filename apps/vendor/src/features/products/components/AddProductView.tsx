"use client";

import { Plus, Share } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ListHeader } from "@/components/ListHeader";
import { PRODUCT_FORM_ID, ProductForm } from "@/features/products/components/ProductForm";
import { useExportProducts } from "@/features/products/hooks";
import { consoleRoutes } from "@/lib/routes";

/**
 * Figma Vendor Hub "Add Products": the breadcrumb, Export (your product list) and Add Product (submits this form), then
 * the form.
 */
export function AddProductView() {
	const exportProducts = useExportProducts();

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader
				title="Add Products"
				crumb="Add Products"
				parents={[{ label: "Manage Products", href: consoleRoutes.PRODUCTS }]}
				hideTitle
			>
				<div className="flex flex-wrap gap-3 lg:gap-5">
					<Button
						type="button"
						isLoading={exportProducts.isPending}
						onClick={() => exportProducts.mutate({})}
						className="h-12 rounded-lg px-5"
						title="Export your product list"
					>
						<Share className="size-5" aria-hidden />
						Export
					</Button>
					<Button type="submit" form={PRODUCT_FORM_ID} className="h-12 rounded-lg px-5">
						<Plus className="size-5" aria-hidden />
						Add Product
					</Button>
				</div>
			</ListHeader>
			<ProductForm />
		</div>
	);
}
