import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Help center" };

export default function Page() {
	return (
		<div className="shop-container">
			<PagePlaceholder title="Help center" requirements={["C13"]} description="Help topics: orders, delivery, returns, payments, accounts." />
		</div>
	);
}
