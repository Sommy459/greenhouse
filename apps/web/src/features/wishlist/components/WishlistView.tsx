"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Leaf, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { useCartDrawer } from "@/features/cart/drawer";
import { useCart } from "@/features/cart/store";
import { RecentlyViewedRow } from "@/features/catalog/components/RecentlyViewedRow";
import type { Product } from "@/features/catalog/types";
import { useToggleWishlist, useWishlist } from "@/features/wishlist/hooks";
import { price } from "@/lib/format";
import { accountRoutes, shopRoutes } from "@/lib/routes";

/**
 * Figma "Wishlist" (C10): saved products with Add to Cart and Remove, then Recently Viewed. Full width on wide screens
 * (no account menu); phones get a back link to My Account.
 */
export function WishlistView() {
	const { data, isPending, isError, refetch } = useWishlist();

	return (
		<div className="shop-container py-6 lg:py-12">
			<Link href={accountRoutes.DASHBOARD} className="inline-flex items-center gap-3 text-lg text-ink lg:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				<h1>Wishlist</h1>
			</Link>
			<h1 className="animate-rise hidden text-[32px] font-medium text-ink lg:block">Wishlist</h1>

			<div className="mt-6 lg:mt-8">
				{isError ? (
					<div className="rounded-lg bg-white py-16 text-center text-sm text-grey-900">
						<p>We couldn&apos;t load your wishlist.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<div className="space-y-5" aria-busy>
						{Array.from({ length: 3 }, (_, i) => (
							<Skeleton key={i} className="h-[160px] w-full rounded-lg" />
						))}
					</div>
				) : data.length === 0 ? (
					<div className="rounded-lg bg-white py-16 text-center text-base text-grey-900">
						<p>Your wishlist is empty. Tap the heart on any product to save it here.</p>
						<Button asChild className="mt-5 h-11 rounded-md px-6">
							<Link href={shopRoutes.HOME}>Browse products</Link>
						</Button>
					</div>
				) : (
					<ul className="space-y-5 lg:space-y-6">
						{data.map((product, i) => (
							<WishlistRow key={product.id} product={product} index={i} />
						))}
					</ul>
				)}
			</div>

			<div className="mt-12 lg:mt-14">
				<RecentlyViewedRow />
			</div>
		</div>
	);
}

function WishlistRow({ product, index }: { product: Product; index: number }) {
	const add = useCart((s) => s.add);
	const openCart = useCartDrawer((s) => s.setOpen);
	const toggle = useToggleWishlist();
	const soldOut = !product.inStock;

	const remove = (
		<button
			type="button"
			onClick={() => toggle.mutate({ product, saved: true })}
			disabled={toggle.isPending}
			className="inline-flex items-center gap-3 text-lg font-medium text-primary-500 hover:underline disabled:opacity-60"
		>
			<Trash2 className="size-6" aria-hidden />
			Remove
			<span className="sr-only">{product.title} from your wishlist</span>
		</button>
	);
	const addToCart = (
		<Button
			type="button"
			disabled={soldOut}
			onClick={() => {
				add(product);
				openCart(true);
			}}
			className="h-12 gap-2.5 rounded-lg px-4 text-lg"
		>
			<ShoppingCart className="size-6" aria-hidden />
			{soldOut ? "Sold out" : "Add to Cart"}
			{!soldOut && <span className="sr-only">: {product.title}</span>}
		</Button>
	);

	return (
		<li
			className="animate-rise rounded-lg bg-white px-3 pt-3 lg:flex lg:gap-6 lg:border lg:border-grey-600 lg:bg-transparent lg:px-6 lg:py-3"
			style={{ "--i": Math.min(index, 6) } as React.CSSProperties}
		>
			<div className="flex gap-4 border-b border-grey-600 pb-4 lg:contents">
				<Link
					href={shopRoutes.PRODUCT(product.slug)}
					className="relative h-[110px] w-[150px] shrink-0 overflow-hidden rounded-lg border border-grey-600 bg-grey-600 lg:h-[124px] lg:w-[146px]"
				>
					{product.imageUrl ? (
						<Image src={product.imageUrl} alt="" fill unoptimized sizes="150px" className="object-cover" />
					) : (
						<Leaf className="absolute inset-0 m-auto size-8 text-grey-700" aria-hidden />
					)}
					<span className="sr-only">{product.title}</span>
				</Link>
				<div className="flex min-w-0 flex-1 flex-col justify-between py-1 lg:py-2">
					<Link href={shopRoutes.PRODUCT(product.slug)} className="text-lg text-ink hover:text-primary-500 hover:underline">
						{product.title}
					</Link>
					<p className="text-xl font-medium text-ink">
						{price(product.price)}
						{product.originalPrice && <s className="ml-2 text-base font-normal text-grey-800">{price(product.originalPrice)}</s>}
					</p>
				</div>
			</div>
			{/* Phones: Remove and Add to Cart under a line; wide screens: Add to Cart above Remove on the right. */}
			<div className="flex items-center justify-between py-3 lg:flex-col lg:items-end lg:py-0">
				<span className="lg:order-2">{remove}</span>
				<span className="lg:order-1">{addToCart}</span>
			</div>
		</li>
	);
}
