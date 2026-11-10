"use client";

import { useSyncExternalStore } from "react";
import { ScrollArrows, ScrollRow, useScrollRow } from "@/components/ScrollRow";
import { ProductCard, ProductCardSkeleton } from "@/features/catalog/components/ProductCard";
import { useProducts } from "@/features/catalog/hooks";
import { useRecentlyViewed } from "@/features/catalog/recently-viewed";

const subscribe = (onChange: () => void) => useRecentlyViewed.persist.onFinishHydration(onChange);
const hydrated = () => useRecentlyViewed.persist.hasHydrated();

/** Four across on desktop; two on mobile, scrolling with the arrows (Figma). */
const CARD_WIDTH = "w-[calc((100%-12px)/2)] lg:w-[calc((100%-60px)/4)]";

/**
 * Figma "Recently Viewed" (thank-you and 404 pages): the products this shopper opened recently; if there are none yet,
 * the newest products under "New on Fysi" instead.
 */
export function RecentlyViewedRow() {
	const ready = useSyncExternalStore(subscribe, hydrated, () => false);
	const viewed = useRecentlyViewed((s) => s.products);
	const hasViewed = ready && viewed.length > 0;
	const newest = useProducts({ limit: 8 });
	const { ref, prev, next } = useScrollRow();

	const loading = !ready || (!hasViewed && newest.isPending);
	const products = hasViewed ? viewed : (newest.data?.items ?? []);
	if (!loading && products.length === 0) return null;

	const title = hasViewed || loading ? "Recently Viewed" : "New on Fysi";

	return (
		<section aria-labelledby="recent-title" className="animate-reveal">
			<div className="mb-3 flex items-center justify-between gap-4 lg:mb-4">
				<h2 id="recent-title" className="text-base font-medium text-ink lg:text-[28px] lg:font-semibold">
					{title}
				</h2>
				{/* Desktop shows four at once; the arrows only matter when there are more. */}
				<ScrollArrows onPrev={prev} onNext={next} className={products.length <= 4 ? "lg:hidden" : ""} />
			</div>
			<ScrollRow rowRef={ref} label={title}>
				{loading
					? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} className={CARD_WIDTH} />)
					: products.map((product) => (
							<ProductCard key={product.id} product={product} className={CARD_WIDTH} sizes="(min-width: 1024px) 23vw, 48vw" />
						))}
			</ScrollRow>
		</section>
	);
}
