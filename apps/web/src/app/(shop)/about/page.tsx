import type { Metadata } from "next";
import { AboutSections } from "@/features/about/components/AboutSections";
import { Testimonials } from "@/features/about/components/Testimonials";
import { Newsletter } from "@/features/home/components/Newsletter";

export const metadata: Metadata = {
	title: "About Us",
	description:
		"Fysi connects eco-conscious shoppers with certified sustainable vendors across Nigeria. Our mission, our vendors and how we certify products.",
};

/** Figma About Us (C12): About, Mission, Vendors, Eco-Certification, Why Fysi?, testimonials, newsletter. */
export default function Page() {
	return (
		<>
			<div className="shop-container pt-6 pb-4 lg:pt-12">
				<AboutSections />
				<div className="mt-14 lg:mt-[70px]">
					<Testimonials />
				</div>
			</div>
			<Newsletter />
		</>
	);
}
