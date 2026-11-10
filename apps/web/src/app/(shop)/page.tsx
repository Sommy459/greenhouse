import type { Metadata } from "next";
import { CategoryShowcase } from "@/features/home/components/CategoryShowcase";
import { Hero } from "@/features/home/components/Hero";
import { Newsletter } from "@/features/home/components/Newsletter";
import { ProductSection } from "@/features/home/components/ProductSection";
import { SustainabilityHighlight } from "@/features/home/components/SustainabilityHighlight";
import { ValueProps } from "@/features/home/components/ValueProps";
import { shopRoutes } from "@/lib/routes";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** The landing page (C2), as in the Figma Hi-Fi desktop and mobile frames. */
export default function Page() {
	return (
		<div className="pb-0">
			<Hero />
			<ValueProps />
			<CategoryShowcase />
			<ProductSection title="Certified products" query={{ certified: true }} seeAllHref={shopRoutes.COLLECTION("certified")} />
			<SustainabilityHighlight />
			<ProductSection title="New In" query={{ sort: "newest" }} seeAllHref={shopRoutes.COLLECTION("new-in")} />
			<Newsletter />
		</div>
	);
}
