import type { Metadata } from "next";
import { CheckoutView } from "@/features/checkout/components/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

/** Figma order summary (C5, C6, C15). The layout requires a signed-in customer. */
export default function Page() {
	return <CheckoutView />;
}
