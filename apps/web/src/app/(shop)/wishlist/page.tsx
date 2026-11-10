import type { Metadata } from "next";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { Newsletter } from "@/features/home/components/Newsletter";
import { WishlistView } from "@/features/wishlist/components/WishlistView";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false, follow: false } };

/** Figma "Wishlist" (C10): signed-in customers; full width, outside the account menu. */
export default function Page() {
	return (
		<>
			<div className="bg-grey-500">
				<RequireAuth>
					<WishlistView />
				</RequireAuth>
			</div>
			<Newsletter />
		</>
	);
}
