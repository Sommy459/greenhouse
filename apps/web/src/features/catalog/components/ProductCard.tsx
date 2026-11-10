import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import type { Product } from "@/features/catalog/types";
import { shopRoutes } from "@/lib/routes";
import { formatPrice } from "@/lib/site";

/**
 * Figma product card: portrait photo with the wishlist heart, then name and naira price. Width comes from the caller
 * (`className`), so rows and grids decide how many fit. `imageClassName` sets the photo's shape (default 7:10 portrait).
 */
export function ProductCard({
	product,
	className = "",
	imageClassName = "aspect-[7/10]",
	sizes = "(min-width: 1024px) 25vw, 50vw",
}: {
	product: Product;
	className?: string;
	imageClassName?: string;
	sizes?: string;
}) {
	const image = product.images[0];

	return (
		<article className={`relative shrink-0 snap-start ${className}`}>
			<Link href={shopRoutes.PRODUCT(product.slug)} className="group block">
				<div className={`hover-lift relative overflow-hidden rounded-md bg-grey-600 ${imageClassName}`}>
					{image ? (
						// Product photos come from the API's image host; `unoptimized` until it is added to next.config images.remotePatterns.
						<Image
							src={image}
							alt={product.name}
							fill
							unoptimized
							sizes={sizes}
							className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
						/>
					) : (
						<Leaf className="absolute inset-0 m-auto size-10 text-grey-700" aria-hidden />
					)}
				</div>
				<p className="mt-2 line-clamp-1 text-xs text-ink">{product.name}</p>
				<p className="text-xs font-semibold text-ink">{formatPrice(product.price)}</p>
			</Link>
			<WishlistButton product={product} className="absolute top-3 right-3" />
		</article>
	);
}

export function ProductCardSkeleton({ className = "" }: { className?: string }) {
	return (
		<div className={`shrink-0 ${className}`} aria-hidden>
			<div className="aspect-[7/10] animate-pulse rounded-md bg-grey-600" />
			<div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-grey-600" />
			<div className="mt-1.5 h-3 w-1/3 animate-pulse rounded bg-grey-600" />
		</div>
	);
}
