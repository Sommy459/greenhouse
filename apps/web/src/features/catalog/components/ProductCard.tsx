import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Leaf } from "lucide-react";
import { BADGE_LABEL, type Product } from "@/features/catalog/types";
import { price } from "@/lib/format";
import { shopRoutes } from "@/lib/routes";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";

/**
 * Figma product card: portrait photo, then name and price. The badge ("Certified" or "Fysi Reviewed", from admin
 * decisions only) sits on the photo; sold-out products say so. Width comes from the caller (`className`).
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
	return (
		<article className={`relative shrink-0 snap-start ${className}`}>
			<Link href={shopRoutes.PRODUCT(product.slug)} className="group block">
				<div className={`hover-lift relative overflow-hidden rounded-md bg-grey-600 ${imageClassName}`}>
					{product.imageUrl ? (
						// Photos come from the API's file host; `unoptimized` until it is added to next.config images.remotePatterns.
						<Image
							src={product.imageUrl}
							alt={product.title}
							fill
							unoptimized
							sizes={sizes}
							className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
						/>
					) : (
						<Leaf className="absolute inset-0 m-auto size-10 text-grey-700" aria-hidden />
					)}
					{product.badge && (
						<span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-primary-500 shadow-sm">
							<BadgeCheck className="size-3" aria-hidden />
							{BADGE_LABEL[product.badge]}
						</span>
					)}
					{!product.inStock && (
						<span className="absolute right-2.5 bottom-2.5 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-medium text-white">
							Sold out
						</span>
					)}
				</div>
				<p className="mt-2 line-clamp-1 text-xs text-ink">{product.title}</p>
				<p className="flex items-baseline gap-1.5 text-xs font-semibold text-ink">
					{price(product.price)}
					{product.originalPrice && <s className="font-normal text-grey-800">{price(product.originalPrice)}</s>}
					{product.discountPercent ? <span className="font-medium text-error-500">−{product.discountPercent}%</span> : null}
				</p>
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
