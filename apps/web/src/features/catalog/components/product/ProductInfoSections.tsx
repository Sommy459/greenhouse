"use client";

import { useId, useState } from "react";
import { BadgeCheck, ChevronDown } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import type { ProductDetail } from "@/features/catalog/types";

/** Figma product page: "Eco Certification" and "Delivery Information", each a row that opens below. */
export function ProductInfoSections({ product }: { product: ProductDetail }) {
	return (
		<div>
			<Section title="Eco Certification">
				<EcoCertification product={product} />
			</Section>
			<Section title="Delivery Information">
				{/* Placeholder copy until delivery terms and couriers are decided (PRD open question). */}
				<ul className="list-disc space-y-1 pl-4">
					<li>
						Shipped by {product.vendor.businessName}
						{product.vendor.city ? ` from ${product.vendor.city}${product.vendor.state ? `, ${product.vendor.state}` : ""}` : ""}.
					</li>
					<li>The vendor adds the courier and tracking number when it ships; you&apos;ll get an email.</li>
					<li>Your payment is held safely until you confirm delivery, or for 7 days after shipping.</li>
				</ul>
			</Section>
		</div>
	);
}

/** Trust is the product: the badge and certifications come from admin decisions only, shown the same everywhere. */
function EcoCertification({ product }: { product: ProductDetail }) {
	if (!product.badge) return <p>This product hasn&apos;t been certified or reviewed by Fysi yet.</p>;
	return (
		<div className="space-y-3">
			<p className="flex items-center gap-2 font-medium text-primary-500">
				<BadgeCheck className="size-5" aria-hidden />
				{product.badge === "certified"
					? "Certified: a recognised eco label, checked by Fysi"
					: "Fysi Reviewed: evidence checked by the Fysi team"}
			</p>
			{product.certifications.length > 0 && (
				<ul className="list-disc space-y-1 pl-4">
					{product.certifications.map((c) => (
						<li key={c.id}>{c.name}</li>
					))}
				</ul>
			)}
		</div>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const id = useId();

	return (
		<section className="border-b border-grey-600">
			<button
				type="button"
				aria-expanded={open}
				aria-controls={id}
				onClick={() => setOpen((o) => !o)}
				className="flex w-full items-center justify-between py-6 text-left text-[15px] text-ink outline-none hover:text-primary-500 focus-visible:text-primary-500 lg:py-[26px]"
			>
				{title}
				<ChevronDown className={cn("size-5 transition-transform", open && "rotate-180")} strokeWidth={1.5} aria-hidden />
			</button>
			{open && (
				<div id={id} className="animate-rise -mt-2 pb-6 text-[13px] leading-relaxed text-grey-900">
					{children}
				</div>
			)}
		</section>
	);
}
