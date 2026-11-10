import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Legal notice" };

export default function Page() {
	return (
		<div className="shop-container">
			<PagePlaceholder title="Legal notice" requirements={["C13"]} description="Must be published before launch." />
		</div>
	);
}
