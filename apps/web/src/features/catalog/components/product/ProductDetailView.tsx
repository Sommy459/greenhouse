"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronRight, Leaf, Minus, Plus, ShoppingCart, Store } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ProductInfoSections } from "@/features/catalog/components/product/ProductInfoSections";
import { ProductReviews } from "@/features/catalog/components/product/ProductReviews";
import { RelatedProducts } from "@/features/catalog/components/product/RelatedProducts";
import { StarRating } from "@/features/catalog/components/product/StarRating";
import { useProduct } from "@/features/catalog/hooks";
import { useRecentlyViewed } from "@/features/catalog/recently-viewed";
import { BADGE_LABEL, type ProductDetail } from "@/features/catalog/types";
import { useCartDrawer } from "@/features/cart/drawer";
import { useCart } from "@/features/cart/store";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { shopRoutes } from "@/lib/routes";
import { price } from "@/lib/format";

/**
 * Figma product page (C3, C4): breadcrumb, photos and details (category, name, badge, price in dollars paid in USDC,
 * the store, description, quantity, Add to Cart, Eco Certification and Delivery Information), then "You may also like".
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
				<ProductReviews slug={product.slug} productName={product.title} />
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
					“{product.title}”
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

/** The photos: the chosen one large, the others as thumbnails below (in the vendor's order). */
function ProductImage({ product }: { product: ProductDetail }) {
	const images = [...product.images].sort((a, b) => a.position - b.position).filter((i) => i.url);
	const [active, setActive] = useState(0);
	const current = images[active]?.url ?? product.imageUrl;
	return (
		<div>
			<div className="relative aspect-[518/478] overflow-hidden rounded-md bg-grey-600">
				{current ? (
					<Image
						src={current}
						alt={product.title}
						fill
						priority
						unoptimized
						sizes="(min-width: 1024px) 518px, 100vw"
						className="object-cover"
					/>
				) : (
					<Leaf className="absolute inset-0 m-auto size-12 text-grey-700" aria-hidden />
				)}
			</div>
			{images.length > 1 && (
				<ul className="mt-3 flex gap-2 overflow-x-auto" aria-label="Product photos">
					{images.map((img, i) => (
						<li key={img.id}>
							<button
								type="button"
								onClick={() => setActive(i)}
								aria-label={`Photo ${i + 1} of ${images.length}`}
								aria-pressed={i === active}
								className={`relative block size-16 overflow-hidden rounded-md border-2 ${i === active ? "border-primary-500" : "border-transparent"}`}
							>
								<Image src={img.url!} alt="" fill unoptimized sizes="64px" className="object-cover" />
							</button>
						</li>
					))}
				</ul>
			)}
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
				{product.category && <span className="mr-2 font-normal text-grey-800">{product.category.name}</span>}“{product.title}”
			</h1>

			<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-grey-800">
				{product.badge && (
					<span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 font-semibold text-primary-500">
						<BadgeCheck className="size-3.5" aria-hidden />
						{BADGE_LABEL[product.badge]}
					</span>
				)}
				{product.rating.count > 0 && (
					<a href="#reviews-title" className="inline-flex items-center gap-1.5 hover:text-primary-500">
						<StarRating rating={product.rating.average ?? 0} className="size-4" />
						{product.rating.count} review{product.rating.count === 1 ? "" : "s"}
					</a>
				)}
				<Link
					href={shopRoutes.STORE(product.vendor.slug)}
					className="inline-flex items-center gap-1 hover:text-primary-500 hover:underline"
				>
					<Store className="size-3.5" aria-hidden />
					Sold by <span className="font-medium text-ink">{product.vendor.businessName}</span>
				</Link>
			</div>

			<p className="mt-3 flex flex-wrap items-baseline gap-2">
				<span className="text-lg font-semibold text-primary-500">{price(product.price)}</span>
				{product.originalPrice && <s className="text-sm text-grey-800">{price(product.originalPrice)}</s>}
				{product.discountPercent ? (
					<span className="rounded-full bg-error-50 px-2 py-0.5 text-xs font-medium text-error-500">
						−{product.discountPercent}%
					</span>
				) : null}
				<span className="text-xs text-grey-800">paid in USDC on Stellar</span>
			</p>

			<hr className="mt-3 border-grey-600" />

			<p className="mt-5 text-[13px] leading-relaxed whitespace-pre-line text-ink">{product.description}</p>
			{!soldOut && product.stock <= 5 && <p className="mt-2 text-xs font-medium text-warning-700">Only {product.stock} left</p>}

			<hr className="mt-3 border-grey-600" />

			<div className="mt-4 flex items-center gap-2 sm:gap-3">
				<div className="flex h-[46px] w-[112px] shrink-0 sm:w-[140px] items-center justify-between rounded-md border border-grey-600 bg-white px-2 text-ink">
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
					className="h-[46px] min-w-0 flex-1 gap-2 rounded-md px-3 text-[15px] font-medium"
				>
					<ShoppingCart className="size-5" aria-hidden />
					{soldOut ? "Sold out" : "Add to Cart"}
				</Button>

				<WishlistButton
					product={product}
					className="size-[46px] shrink-0 sm:size-[50px] bg-primary-200 hover:bg-primary-300 [&_svg]:size-5"
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
