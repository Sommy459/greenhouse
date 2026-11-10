import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Analytics" };

export default function Page() {
	return (
		<div className="custom-container">
			<PagePlaceholder title="Analytics" requirements={["V8"]} description="Sales analytics and reports." />
		</div>
	);
}
