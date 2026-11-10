import type { Metadata } from "next";
import { CampaignView } from "@/features/newsletter/components/CampaignEditor";

export const metadata: Metadata = { title: "Campaign" };

export default async function Page({ params }: { params: Promise<{ campaignId: string }> }) {
	const { campaignId } = await params;
	return <CampaignView id={decodeURIComponent(campaignId)} />;
}
