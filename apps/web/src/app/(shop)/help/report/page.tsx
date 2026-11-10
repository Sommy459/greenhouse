import type { Metadata } from "next";
import { Newsletter } from "@/features/home/components/Newsletter";
import { ReportForm } from "@/features/support/components/ReportForm";

export const metadata: Metadata = {
	title: "Report a Product or Problem",
	description:
		"Tell us about a damaged item, a late delivery, a doubtful eco claim or any other problem. We reply within 24–48 hours.",
};

/** Figma Report a Product / Problem (C13). */
export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string | string[] }> }) {
	const { order } = await searchParams;
	return (
		<>
			<div className="bg-grey-500">
				<div className="shop-container pt-5 pb-10 lg:pt-12 lg:pb-6">
					<h1 className="sr-only">Report a Product or Problem</h1>
					<ReportForm orderNumber={typeof order === "string" ? order.slice(0, 40) : undefined} />
				</div>
			</div>
			<Newsletter />
		</>
	);
}
