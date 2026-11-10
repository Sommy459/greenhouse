import type { Metadata } from "next";
import { StoreFooter } from "@/components/layouts/StoreFooter";
import { StoreHeader } from "@/components/layouts/StoreHeader";
import { RequireAuth } from "@/features/auth/RequireAuth";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

/** Figma order summary: the store header and footer around it; signed-in customers only (sign in before checkout). */
export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<StoreHeader />
			<main className="animate-page min-h-[60dvh] min-w-0">
				<RequireAuth>{children}</RequireAuth>
			</main>
			<StoreFooter />
		</>
	);
}
