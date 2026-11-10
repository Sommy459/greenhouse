import type { Metadata } from "next";
import { CampaignEditor } from "@/features/newsletter/components/CampaignEditor";

export const metadata: Metadata = { title: "New campaign" };

export default function Page() {
	return <CampaignEditor />;
}
