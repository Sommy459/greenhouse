import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function Page() {
	return (
		<div className="shop-container">
			<PagePlaceholder title="Terms and conditions" requirements={["C13"]} description="Must be published before launch." />
		</div>
	);
}
