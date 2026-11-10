"use client";

import { ScrollRow, useScrollRow } from "@/components/ScrollRow";
import { SectionHeader } from "@/components/SectionHeader";
import { ProductCard, ProductCardSkeleton } from "@/features/catalog/components/ProductCard";
import { useProducts } from "@/features/catalog/hooks";
import type { Collection } from "@/features/catalog/types";
import { shopRoutes } from "@/lib/routes";

/** Four across on desktop, about two on mobile; the rest scroll. */
const CARD_WIDTH = "w-[46%] md:w-[31%] lg:w-[calc((100%-60px)/4)]";

/** A home page product row: Products on demand, Hot deals, New In (C2). */
export function ProductSection({ title, collection }: { title: string; collection: Collection }) {
	const { ref, prev, next } = useScrollRow();
	const { data, isPending, isError } = useProducts({ collection, limit: 8 });
	const products = data?.items ?? [];

	return (
		<section className="shop-container animate-reveal mt-10 lg:mt-12">
			<SectionHeader title={title} seeAllHref={shopRoutes.COLLECTION(collection)} onPrev={prev} onNext={next} />
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
