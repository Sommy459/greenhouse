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
					<li>Lagos: 1–3 working days. Elsewhere in Nigeria: 3–7 working days.</li>
					<li>
						Shipped by {product.vendor?.shop_name ?? "the vendor"}
						{product.vendor ? ` from ${product.vendor.city}, ${product.vendor.state}` : ""}.
					</li>
					<li>Packed without single-use plastic. Delivery cost is shown at checkout.</li>
				</ul>
			</Section>
		</div>
	);
}

/**
 * Trust is the product: the badge and score come from admin-verified data only, and look the same wherever they appear.
 */
function EcoCertification({ product }: { product: ProductDetail }) {
	const verified = product.certifications.filter((c) => c.status === "verified");

	if (!product.eco_verified) {
		return <p>This product hasn&apos;t been eco-verified by Fysi yet.</p>;
	}
	return (
		<div className="space-y-3">
			<p className="flex items-center gap-2 font-medium text-primary-500">
				<BadgeCheck className="size-5" aria-hidden />
				Eco-verified by Fysi
			</p>
			{product.sustainability_score !== null && (
				<p>
					Sustainability score: <strong className="font-semibold text-ink">{product.sustainability_score}/100</strong>
				</p>
			)}
			{verified.length > 0 && (
				<ul className="space-y-1">
					{verified.map((c) => (
						<li key={c.id}>
							{c.name} <span className="text-grey-800">· {c.issuer}</span>
						</li>
					))}
				</ul>
			)}
			{product.materials.length > 0 && <p>Materials: {product.materials.join(", ")}</p>}
			{product.sourcing && <p>{product.sourcing}</p>}
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
