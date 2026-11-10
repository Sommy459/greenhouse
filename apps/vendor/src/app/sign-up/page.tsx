import type { Metadata } from "next";
import { OnboardingShell } from "@/components/OnboardingShell";
import { SellerSetupWizard } from "@/features/shop/components/SellerSetupWizard";

export const metadata: Metadata = { title: "Set up your shop" };

/** V1, V11: free seller sign-up (Figma "Set up your shop"). The shop is approved by an admin afterwards. */
export default function Page() {
	return (
		<OnboardingShell>
			<SellerSetupWizard />
		</OnboardingShell>
	);
}
