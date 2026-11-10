import type { Metadata } from "next";
import { PagePlaceholder } from "@repo/ui/page-placeholder";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
	return (
		<PagePlaceholder title="Forgot password" requirements={["C1"]} description="Request a password reset email." />
	);
}
