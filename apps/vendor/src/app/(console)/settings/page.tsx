import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
	return (
		<div className="custom-container">
			<PagePlaceholder
				title="Settings"
				requirements={["V1", "V5", "V11"]}
				description="Shop profile, payout account, commission and fees."
			/>
		</div>
	);
}
