"use client";

import Image from "next/image";
import { BadgeCheck, MapPin, Store } from "lucide-react";
import { ProductListing } from "@/features/catalog/components/ProductListing";
import { useStore } from "@/features/catalog/hooks";
import { BADGE_LABEL } from "@/features/catalog/types";
import { errorMessage } from "@/lib/api/client";

/**
 * A verified vendor's store page (C3: products show their vendor): logo, name, badge, location, description and
 * certifications, then the store's products with the usual filters.
 */
export function StoreView({ slug }: { slug: string }) {
	const { data: store, isPending, isError, error } = useStore(slug);

	if (isPending) return <div className="shop-container h-48 animate-pulse py-10" aria-busy />;
	if (isError || !store) {
		return (
			<p className="shop-container py-20 text-center text-sm text-grey-900">
				{errorMessage(error, "We couldn't find this store.")}
			</p>
		);
	}

	return (
		<>
			<section className="shop-container animate-rise pt-6 lg:pt-10" aria-label="About the store">
				<div className="flex flex-col gap-5 rounded-lg border border-grey-600 bg-white p-5 sm:flex-row sm:items-center lg:p-7">
					<span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-50 text-primary-500">
						{store.logoUrl ? (
							<Image src={store.logoUrl} alt="" fill unoptimized sizes="80px" className="object-cover" />
						) : (
							<Store className="size-8" aria-hidden />
						)}
					</span>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h2 className="text-2xl font-semibold text-ink">{store.businessName}</h2>
							{store.badge && (
								<span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-500">
									<BadgeCheck className="size-3.5" aria-hidden />
									{BADGE_LABEL[store.badge]}
								</span>
							)}
						</div>
						<p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-grey-900">
							{store.city && (
								<span className="inline-flex items-center gap-1">
									<MapPin className="size-3.5" aria-hidden />
									{store.city}
									{store.state ? `, ${store.state}` : ""}
								</span>
							)}
							<span>
								Verified since {new Date(store.verifiedSince).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
							</span>
							<span>
								{store.productCount} product{store.productCount === 1 ? "" : "s"}
							</span>
						</p>
						{store.description && <p className="mt-3 max-w-3xl text-sm whitespace-pre-line text-ink">{store.description}</p>}
						{store.certifications.length > 0 && (
							<p className="mt-2 text-xs text-grey-800">Certifications: {store.certifications.map((c) => c.name).join(", ")}</p>
						)}
					</div>
				</div>
			</section>
			<ProductListing title={store.businessName} query={{ vendor: store.slug }} />
		</>
	);
}
