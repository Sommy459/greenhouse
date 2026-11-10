import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Messages" };

export default function Page() {
	return (
		<div className="custom-container">
			<PagePlaceholder title="Messages" requirements={["V9"]} description="Customer messages and support." />
		</div>
	);
}
