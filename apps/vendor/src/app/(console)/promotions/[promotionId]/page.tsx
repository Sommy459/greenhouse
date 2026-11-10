import type { Metadata } from "next";
import { EditPromotionView } from "@/features/promotions/components/PromotionForm";

export const metadata: Metadata = { title: "Promotion" };

export default async function Page({ params }: { params: Promise<{ promotionId: string }> }) {
	const { promotionId } = await params;
	return <EditPromotionView id={decodeURIComponent(promotionId)} />;
}
