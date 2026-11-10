import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Inventory" };

export default function Page() {
	return (
		<div className="custom-container">
			<PagePlaceholder title="Inventory" requirements={["V4"]} description="Real-time stock tracking and low-stock alerts." />
		</div>
	);
}
