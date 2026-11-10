import type { Metadata } from "next";
import { AccountNav } from "@/components/layouts/AccountNav";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { Newsletter } from "@/features/home/components/Newsletter";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** My Account (C1): signed-in customers only. Figma: the menu on the left, the page, then the newsletter. */
export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<RequireAuth>
				<div className="bg-grey-500">
					<div className="shop-container flex flex-col gap-6 py-6 lg:flex-row lg:gap-14 lg:py-10">
						<aside className="hidden lg:block lg:w-[285px] lg:shrink-0">
							<AccountNav />
						</aside>
						<div className="min-w-0 flex-1">{children}</div>
					</div>
				</div>
			</RequireAuth>
			<Newsletter />
		</>
	);
}
