import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Training" };

export default function Page() {
	return (
		<div className="custom-container">
			<PagePlaceholder
				title="Training"
				requirements={["V10"]}
				description="Vendor training sessions and listing best-practice guides."
			/>
		</div>
	);
}
