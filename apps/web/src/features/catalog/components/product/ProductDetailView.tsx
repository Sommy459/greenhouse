"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Leaf, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ProductInfoSections } from "@/features/catalog/components/product/ProductInfoSections";
import { ProductReviews } from "@/features/catalog/components/product/ProductReviews";
import { RelatedProducts } from "@/features/catalog/components/product/RelatedProducts";
import { StarRating } from "@/features/catalog/components/product/StarRating";
import { useProduct } from "@/features/catalog/hooks";
import { useRecentlyViewed } from "@/features/catalog/recently-viewed";
import type { ProductDetail } from "@/features/catalog/types";
import { useCartDrawer } from "@/features/cart/drawer";
import { useCart } from "@/features/cart/store";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { shopRoutes } from "@/lib/routes";
import { formatPrice } from "@/lib/site";

/**
 * Figma product page (C4, C9, C10): breadcrumb, photo and details (category, name, rating, SKU, price, description,
 * attribute chips, quantity, Add to Cart, wishlist, Eco Certification and Delivery Information), then customer
 * feedback and "You may also like".
 */
export function ProductDetailView({ slug }: { slug: string }) {
	const { data: product, isPending, isError, refetch } = useProduct(slug);
	const recordView = useRecentlyViewed((s) => s.record);

	// Remember the product for "Recently Viewed" (an external store, so no React state is set here).
	useEffect(() => {
		if (product) recordView(product);
	}, [product, recordView]);

	if (isPending) return <ProductSkeleton />;
	if (isError || !product) {
		return (
			<div className="shop-container py-20 text-center text-sm text-grey-900">
				<p>We couldn&apos;t load this product. It may have been removed.</p>
				<div className="mt-5 flex justify-center gap-3">
					<Button variant="outline" onClick={() => refetch()} className="h-9 border-grey-700 text-sm">
						Try again
					</Button>
					<Button asChild className="h-9 text-sm">
						<Link href={shopRoutes.SEARCH()}>Browse products</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="shop-container pt-4 pb-4 lg:pt-6">
			<Breadcrumb product={product} />

			<div className="mt-4 grid gap-6 lg:mt-[62px] lg:grid-cols-[minmax(0,518px)_minmax(0,544px)] lg:gap-3">
				<div className="animate-rise">
					<ProductImage product={product} />
				</div>
				<div className="animate-rise" style={{ "--i": 1 } as React.CSSProperties}>
					<ProductSummary product={product} />
				</div>
			</div>

			<div className="mt-14 lg:mt-[62px]">
				<ProductReviews slug={product.slug} productName={product.name} />
			</div>

			<div className="mt-12 lg:mt-14">
				<RelatedProducts productId={product.id} category={product.category?.slug} />
			</div>
		</div>
	);
}

function Breadcrumb({ product }: { product: ProductDetail }) {
	return (
		<nav aria-label="Breadcrumb" className="text-[11px] lg:text-xs">
			<ol className="flex flex-wrap items-center gap-1 text-grey-800">
				<li>
					<Link href={shopRoutes.HOME} className="hover:text-primary-500">
						Home
					</Link>
				</li>
				<Crumb />
				<li>
					<Link href={shopRoutes.SEARCH()} className="hover:text-primary-500">
						Catalogue
					</Link>
				</li>
				{product.category && (
					<>
						<Crumb />
						<li>
							<Link href={shopRoutes.CATEGORY(product.category.slug)} className="hover:text-primary-500">
								{product.category.name}
							</Link>
						</li>
					</>
				)}
				<Crumb />
				<li aria-current="page" className="text-ink">
					“{product.name}”
				</li>
			</ol>
		</nav>
	);
}

const Crumb = () => (
	<li aria-hidden>
		<ChevronRight className="size-3" />
	</li>
);

/** The photo; on mobile the wishlist heart sits on it (Figma), on desktop it's beside Add to Cart. */
function ProductImage({ product }: { product: ProductDetail }) {
	const image = product.images[0];
	return (
		<div className="relative aspect-[518/478] overflow-hidden rounded-md bg-grey-600">
			{image ? (
				<Image
					src={image}
					alt={product.name}
					fill
					priority
					unoptimized
					sizes="(min-width: 1024px) 518px, 100vw"
					className="object-cover"
				/>
			) : (
				<Leaf className="absolute inset-0 m-auto size-12 text-grey-700" aria-hidden />
			)}
			<WishlistButton
				product={product}
				className="absolute top-3 right-3 size-11 bg-primary-200 hover:bg-primary-300 lg:hidden [&_svg]:size-5"
			/>
		</div>
	);
}

function ProductSummary({ product }: { product: ProductDetail }) {
	const add = useCart((s) => s.add);
	const openCart = useCartDrawer((s) => s.setOpen);
	const [quantity, setQuantity] = useState(1);
	const soldOut = product.stock <= 0;
	const max = Math.max(1, product.stock);

	// Adds, then opens the cart overlay so the shopper sees it (and can check out or keep shopping).
	const addToCart = () => {
		add(product, quantity);
		openCart(true);
	};

	return (
		<div className="min-w-0">
			<h1 className="text-[22px] leading-tight font-semibold text-ink lg:text-[28px]">
				{product.category && <span className="mr-2 font-normal text-grey-800">{product.category.name}</span>}“{product.name}”
			</h1>

			<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-grey-800">
				<StarRating rating={product.rating} className="size-4 lg:size-[17px]" />
				<span>
					{product.review_count} review{product.review_count === 1 ? "" : "s"}
				</span>
				<span>
					<span className="font-medium text-ink">SKU:</span> {product.sku}
				</span>
			</div>

			<p className="mt-3 flex items-baseline gap-2">
				<span className="text-lg font-semibold text-primary-500">{formatPrice(product.price)}</span>
				{product.compare_at_price !== null && product.compare_at_price > product.price && (
					<s className="text-sm text-grey-800">{formatPrice(product.compare_at_price)}</s>
				)}
			</p>

			<hr className="mt-3 border-grey-600" />

			<p className="mt-5 text-[13px] leading-relaxed text-ink">{product.description}</p>

			{product.tags.length > 0 && (
				<ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Product qualities">
					{product.tags.map((tag) => (
						<li key={tag} className="flex h-7 items-center rounded-md border border-primary-500 px-3 text-xs text-primary-500">
							{tag}
						</li>
					))}
				</ul>
			)}

			<hr className="mt-3 border-grey-600" />

			<div className="mt-4 flex items-center gap-3">
				<div className="flex h-[46px] w-[140px] shrink-0 items-center justify-between rounded-md border border-grey-600 bg-white px-2 text-ink">
					<button
						type="button"
						onClick={() => setQuantity((q) => Math.max(1, q - 1))}
						disabled={quantity <= 1}
						aria-label="Decrease quantity"
						className="grid size-8 place-items-center rounded hover:bg-grey-500 disabled:text-grey-700"
					>
						<Minus className="size-4" />
					</button>
					<span aria-live="polite" aria-label={`Quantity ${quantity}`} className="text-sm">
						{quantity}
					</span>
					<button
						type="button"
						onClick={() => setQuantity((q) => Math.min(max, q + 1))}
						disabled={soldOut || quantity >= max}
						aria-label="Increase quantity"
						className="grid size-8 place-items-center rounded hover:bg-grey-500 disabled:text-grey-700"
					>
						<Plus className="size-4" />
					</button>
				</div>

				<Button
					type="button"
					onClick={addToCart}
					disabled={soldOut}
					className="h-[46px] flex-1 gap-2 rounded-md text-[15px] font-medium"
				>
					<ShoppingCart className="size-5" aria-hidden />
					{soldOut ? "Sold out" : "Add to Cart"}
				</Button>

				<WishlistButton
					product={product}
					className="hidden size-[50px] shrink-0 bg-primary-200 hover:bg-primary-300 lg:grid [&_svg]:size-5"
				/>
			</div>

			<hr className="mt-4 border-grey-600" />

			<ProductInfoSections product={product} />
		</div>
	);
}

function ProductSkeleton() {
	return (
		<div className="shop-container pt-4 pb-16 lg:pt-6" aria-busy="true" aria-label="Loading product">
			<div className="h-3 w-56 animate-pulse rounded bg-grey-600" />
			<div className="mt-4 grid gap-6 lg:mt-[62px] lg:grid-cols-[minmax(0,518px)_minmax(0,544px)] lg:gap-3">
				<div className="aspect-[518/478] animate-pulse rounded-md bg-grey-600" />
				<div className="space-y-4">
					<div className="h-7 w-3/4 animate-pulse rounded bg-grey-600" />
					<div className="h-4 w-1/2 animate-pulse rounded bg-grey-600" />
					<div className="h-5 w-24 animate-pulse rounded bg-grey-600" />
					<div className="h-16 animate-pulse rounded bg-grey-600" />
					<div className="h-11 animate-pulse rounded bg-grey-600" />
				</div>
			</div>
		</div>
	);
}
