import type { Metadata } from "next";
import { PromotionForm } from "@/features/promotions/components/PromotionForm";

export const metadata: Metadata = { title: "New promotion" };

export default function Page() {
	return <PromotionForm />;
}
