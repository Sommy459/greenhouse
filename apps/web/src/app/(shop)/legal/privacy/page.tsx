import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Page() {
	return (
		<div className="shop-container">
			<PagePlaceholder
				title="Privacy policy"
				requirements={["C13"]}
				description="Must be published before launch (Nigeria Data Protection Act)."
			/>
		</div>
	);
}
