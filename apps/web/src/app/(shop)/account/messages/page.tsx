import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Messages" };

export default function Page() {
	return <PagePlaceholder title="Messages" requirements={["C1", "V9"]} description="Conversations with vendors." />;
}
