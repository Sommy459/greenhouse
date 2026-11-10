import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Create Promotion" };

export default function Page() {
	return (
		<div className="custom-container">
			<PagePlaceholder
				title="Create new Promotion"
				requirements={["V7"]}
				description="Name, registration window, period, discount rule and products. Waiting for the Figma frame."
			/>
		</div>
	);
}
