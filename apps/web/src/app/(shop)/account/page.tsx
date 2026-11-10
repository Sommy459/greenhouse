import type { Metadata } from "next";
import { AccountMenu } from "@/features/account/components/AccountMenu";
import { AccountOverview } from "@/features/account/components/AccountOverview";

export const metadata: Metadata = { title: "My Account" };

/** Figma "My Account": the overview beside the menu on wide screens; on phones, the menu itself ("Welcome, John"). */
export default function Page() {
	return (
		<>
			<div className="lg:hidden">
				<AccountMenu />
			</div>
			<div className="hidden lg:block">
				<AccountOverview />
			</div>
		</>
	);
}
