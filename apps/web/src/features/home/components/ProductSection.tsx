"use client";

import { ScrollRow, useScrollRow } from "@/components/ScrollRow";
import { SectionHeader } from "@/components/SectionHeader";
import { ProductCard, ProductCardSkeleton } from "@/features/catalog/components/ProductCard";
import { useProducts } from "@/features/catalog/hooks";
import type { ProductQuery } from "@/features/catalog/types";

/** Four across on desktop, about two on mobile; the rest scroll. */
const CARD_WIDTH = "w-[46%] md:w-[31%] lg:w-[calc((100%-60px)/4)]";

/** A home page product row (C2): e.g. Certified products, New In. `query` picks them; See all opens the full list. */
export function ProductSection({ title, query, seeAllHref }: { title: string; query: ProductQuery; seeAllHref: string }) {
	const { ref, prev, next } = useScrollRow();
	const { data, isPending, isError } = useProducts({ ...query, limit: 8 });
	const products = data?.items ?? [];

	return (
		<section className="shop-container animate-reveal mt-10 lg:mt-12">
			<SectionHeader title={title} seeAllHref={seeAllHref} onPrev={prev} onNext={next} />
			{isError ? (
				<p className="py-10 text-sm text-grey-900">Couldn&apos;t load products right now.</p>
			) : !isPending && products.length === 0 ? (
				<p className="py-10 text-sm text-grey-900">No products here yet.</p>
			) : (
				<ScrollRow rowRef={ref} label={title}>
					{isPending
						? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} className={CARD_WIDTH} />)
						: products.map((product) => <ProductCard key={product.id} product={product} className={CARD_WIDTH} />)}
				</ScrollRow>
			)}
		</section>
	);
}
