import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Payment" };

export default function Page() {
	return <PagePlaceholder title="Payment" requirements={["C7"]} description="Saved payment details." />;
}
