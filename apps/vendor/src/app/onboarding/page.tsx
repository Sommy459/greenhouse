import type { Metadata } from "next";
import { OnboardingView } from "@/features/shop/components/OnboardingView";

export const metadata: Metadata = { title: "Verify your shop" };

/** PRD V2–V3: business details and documents, then submit for admin review (ShopGate sends draft and rejected shops here). */
export default function Page() {
	return <OnboardingView />;
}
