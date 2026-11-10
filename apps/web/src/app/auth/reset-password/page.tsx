import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
	return (
		<PagePlaceholder title="Reset password" requirements={["C1"]} description="Set a new password from the reset link." />
	);
}
