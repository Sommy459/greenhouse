"use client";

import { ScrollRow, useScrollRow } from "@/components/ScrollRow";
import { SectionHeader } from "@/components/SectionHeader";
import { ProductCard, ProductCardSkeleton } from "@/features/catalog/components/ProductCard";
import { useProducts } from "@/features/catalog/hooks";

/** Four across on desktop; on mobile one card with the next peeking in (Figma). */
const CARD_WIDTH = "w-[85%] md:w-[40%] lg:w-[calc((100%-60px)/4)]";

/** Figma "You may also like": more from the same category, scrolling with the arrows. Hidden when there are none. */
export function RelatedProducts({ productId, category }: { productId: string; category: string | undefined }) {
	const { ref, prev, next } = useScrollRow();
	const { data, isPending } = useProducts({ category, limit: 9 });
	const products = (data?.items ?? []).filter((p) => p.id !== productId).slice(0, 8);

	if (!isPending && products.length === 0) return null;

	return (
		<section className="animate-reveal">
			<SectionHeader title="You may also like" onPrev={prev} onNext={next} />
			<ScrollRow rowRef={ref} label="You may also like">
				{isPending
					? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} className={CARD_WIDTH} />)
					: products.map((product) => (
							<ProductCard key={product.id} product={product} className={CARD_WIDTH} sizes="(min-width: 1024px) 22vw, 85vw" />
						))}
			</ScrollRow>
		</section>
	);
}
