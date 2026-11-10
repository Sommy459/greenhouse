import type { Metadata } from "next";
import { Suspense } from "react";
import { CampaignView } from "@/features/campaigns/components/CampaignView";

export const metadata: Metadata = { title: "Campaign" };

export default function Page() {
	return (
		// CampaignView reads the URL's search params.
		<Suspense>
			<CampaignView />
		</Suspense>
	);
}
