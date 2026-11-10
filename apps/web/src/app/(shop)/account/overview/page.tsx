import type { Metadata } from "next";
import { AccountOverview } from "@/features/account/components/AccountOverview";

export const metadata: Metadata = { title: "My Account" };

/** Figma phone "Account": My Account's cards on their own page, reached from the phone menu. */
export default function Page() {
	return <AccountOverview />;
}
