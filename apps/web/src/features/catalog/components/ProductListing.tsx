"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { ListingPagination } from "@/features/catalog/components/ListingPagination";
import { ListingToolbar } from "@/features/catalog/components/ListingToolbar";
import { ProductCard, ProductCardSkeleton } from "@/features/catalog/components/ProductCard";
import { useProducts } from "@/features/catalog/hooks";
import { PAGE_SIZE, useListingParams } from "@/features/catalog/listing-params";
import type { ProductQuery } from "@/features/catalog/types";
import { shopRoutes } from "@/lib/routes";

/**
 * The Figma category grids (Accessories, Clothing) mix portrait cards with wide tiles: on each page of 25, the 7th, 8th
 * and 21st span two columns (on mobile, the whole row). That fills 7 complete rows of 4 on desktop. Same heights either
 * way, so rows line up.
 */
const WIDE_SLOTS = new Set([6, 7, 20]);
const isWide = (index: number) => WIDE_SLOTS.has(index % PAGE_SIZE);
const CARD = { image: "aspect-[4/5] lg:aspect-[131/171]", sizes: "(min-width: 1024px) 22vw, 48vw" };
const WIDE = { image: "aspect-[8.3/5] lg:aspect-[273/171]", sizes: "(min-width: 1024px) 45vw, 96vw" };

interface Props {
	title: string;
	/** Which products: a category, a collection (sort or certified), a search (`q`, empty: every product) or a store. */
	query: Pick<ProductQuery, "category" | "certified" | "sort" | "q" | "vendor">;
}

/**
 * Figma category page (C2, C3): breadcrumb (desktop) or big title (mobile), Filter and Sort by, the product grid, and
 * pagination. Sort, filters and page come from the URL (useListingParams); the page's own query is the base.
 */
export function ProductListing({ title, query }: Props) {
	const listing = useListingParams({ defaultSort: query.sort ?? (query.q ? "relevance" : "newest") });
	const { sort, page, setPage, clearFilters } = listing;
	const ownCategory = query.category;

	const { data, isPending, isError, refetch } = useProducts({
		q: query.q || undefined,
		vendor: query.vendor,
		category: ownCategory ?? listing.category,
		certified: query.certified || listing.certified || undefined,
		inStock: listing.inStock || undefined,
		minPriceCents: listing.minPrice != null ? listing.minPrice * 100 : undefined,
		maxPriceCents: listing.maxPrice != null ? listing.maxPrice * 100 : undefined,
		sort,
		page,
		limit: PAGE_SIZE,
	});
	const products = data?.items ?? [];
	const totalPages = data?.meta.total_pages ?? 1;
	const activeFilters = listing.filterCount;

	return (
		<div className="shop-container pt-4 pb-4 lg:pt-8">
			<nav aria-label="Breadcrumb" className="animate-rise hidden text-xs lg:block">
				<ol className="flex items-center gap-1 text-grey-800">
					<li>
						<Link href={shopRoutes.HOME} className="hover:text-primary-500">
							Home
						</Link>
					</li>
					<li aria-hidden>
						<ChevronRight className="size-3.5" />
					</li>
					<li aria-current="page" className="font-medium text-ink">
						{title}
					</li>
				</ol>
			</nav>
			<h1 className="animate-rise text-[28px] font-semibold text-ink lg:sr-only">{title}</h1>

			<div className="animate-rise mt-3 lg:mt-10" style={{ "--i": 1 } as React.CSSProperties}>
				<ListingToolbar
					category={ownCategory ? null : listing.category}
					show={[...(query.certified || listing.certified ? ["certified"] : []), ...(listing.inStock ? ["in_stock"] : [])]}
					minPrice={listing.minPrice}
					maxPrice={listing.maxPrice}
					filterCount={activeFilters}
					onCategoryChange={listing.setCategory}
					onShowChange={listing.setShow}
					onPriceChange={listing.setPrice}
					sort={sort}
					onSortChange={listing.setSort}
				/>
			</div>

			<div className="mt-5 lg:mt-[38px]">
				{isError ? (
					<div className="py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load products right now.</p>
						<Button variant="outline" onClick={() => refetch()} className="mt-4 h-9 border-grey-700 text-sm">
							Try again
						</Button>
					</div>
				) : !isPending && products.length === 0 ? (
					<div className="py-16 text-center text-sm text-grey-900">
						<p>
							{activeFilters > 0
								? "No products match these filters."
								: "q" in query && query.q
									? `Nothing matches “${query.q}”. Try another word, or browse the categories.`
									: "No products here yet."}
						</p>
						{activeFilters > 0 && (
							<Button variant="outline" onClick={clearFilters} className="mt-4 h-9 border-grey-700 text-sm">
								Clear filters
							</Button>
						)}
					</div>
				) : (
					<ul className="grid grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
						{isPending
							? Array.from({ length: 8 }, (_, i) => (
									<li key={i}>
										<ProductCardSkeleton />
									</li>
								))
							: products.map((product, i) => {
									const wide = isWide(i);
									return (
										// --i staggers the cards of a row as they reveal (left to right).
										<li
											key={product.id}
											className={cn("animate-reveal", wide && "col-span-2")}
											style={{ "--i": i % 4 } as React.CSSProperties}
										>
											<ProductCard
												product={product}
												className="w-full"
												imageClassName={wide ? WIDE.image : CARD.image}
												sizes={wide ? WIDE.sizes : CARD.sizes}
											/>
										</li>
									);
								})}
					</ul>
				)}
			</div>

			{!isError && totalPages > 1 && (
				<div className="mt-12 lg:mt-20">
					<ListingPagination page={Math.min(page, totalPages)} totalPages={totalPages} onChange={setPage} />
				</div>
			)}
		</div>
	);
}
