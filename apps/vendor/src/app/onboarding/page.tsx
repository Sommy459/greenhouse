import type { Metadata } from "next";
import { SellerSetupWizard } from "@/features/shop/components/SellerSetupWizard";

export const metadata: Metadata = { title: "Set up your shop" };

/**
 * V1: a signed-in vendor with no shop yet (ShopGate sends them here), e.g. one who created the account at /sign-up and
 * left before the shop details. Only the shop step is left.
 */
export default function Page() {
	return <SellerSetupWizard start="details" />;
}
