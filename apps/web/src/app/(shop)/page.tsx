import { CategoryShowcase } from "@/features/home/components/CategoryShowcase";
import { Hero } from "@/features/home/components/Hero";
import { Newsletter } from "@/features/home/components/Newsletter";
import { ProductSection } from "@/features/home/components/ProductSection";
import { SustainabilityHighlight } from "@/features/home/components/SustainabilityHighlight";
import { ValueProps } from "@/features/home/components/ValueProps";

/** The landing page (C2), as in the Figma Hi-Fi desktop and mobile frames. */
export default function Page() {
	return (
		<div className="pb-0">
			<Hero />
			<ValueProps />
			<CategoryShowcase />
			<ProductSection title="Products on demand" collection="on-demand" />
			<ProductSection title="Hot deals" collection="hot-deals" />
			<SustainabilityHighlight />
			<ProductSection title="New In" collection="new-in" />
			<Newsletter />
		</div>
	);
}
