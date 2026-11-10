import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Certification" };

export default function Page() {
	return (
		<div className="custom-container">
			<PagePlaceholder
				title="Certification"
				requirements={["V3"]}
				description="Submit sustainability certifications; see what an admin has verified. Verified ones put the eco badge on listings."
			/>
		</div>
	);
}
