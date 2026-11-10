import type { Metadata } from "next";
import { CartContents } from "@/features/cart/components/CartContents";

export const metadata: Metadata = { title: "Cart" };

/** C5: the cart as a page (links, Back, no-JS). The header icon opens the same contents as an overlay. */
export default function Page() {
	return (
		<div className="shop-container py-8 lg:py-12">
			<CartContents className="mx-auto max-w-[590px]" />
		</div>
	);
}
