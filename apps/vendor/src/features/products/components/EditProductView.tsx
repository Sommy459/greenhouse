"use client";

import { Button } from "@repo/ui/button";
import { ProductForm } from "@/features/products/components/ProductForm";
import { useMyProduct } from "@/features/products/hooks";
import { errorMessage } from "@/lib/api/client";

/** Edit a product (PRD V7): the add form, filled in. */
export function EditProductView({ id }: { id: string }) {
	const { data: product, isPending, isError, error, refetch } = useMyProduct(id);
	if (isPending) return <div className="m-8 h-96 animate-pulse rounded-xl bg-grey-600" aria-busy />;
	if (isError || !product) {
		return (
			<div className="px-8 py-16 text-center text-sm text-grey-900">
				<p>{errorMessage(error, "We couldn't load this product.")}</p>
				<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
					Try again
				</Button>
			</div>
		);
	}
	return <ProductForm key={product.updatedAt} product={product} />;
}
