import type { Metadata } from "next";
import { StatementsView } from "@/features/insights/components/StatementsView";

export const metadata: Metadata = { title: "Account Statements" };

export default function Page() {
	return <StatementsView />;
}
