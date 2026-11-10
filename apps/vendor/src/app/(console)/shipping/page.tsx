import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Shipping" };

export default function Page() {
	return (
		<div className="custom-container">
			<PagePlaceholder title="Shipping" requirements={["V6"]} description="Local courier partners, delivery zones and rates." />
		</div>
	);
}
