"use client";

import { X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@repo/ui/sheet";
import { CartContents } from "@/features/cart/components/CartContents";
import { useCartDrawer } from "@/features/cart/drawer";

/**
 * Figma "cart open overlay": the cart slides in from the right on desktop and fills the screen on mobile. Opened by the
 * header cart icon and by Add to Cart; closes on ×, Esc, a click outside, or when a link inside is followed.
 */
export function CartDrawer() {
	const open = useCartDrawer((s) => s.open);
	const setOpen = useCartDrawer((s) => s.setOpen);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			{/* The last-child rule hides the kit's small close button; the design has its own ×. */}
			<SheetContent
				side="right"
				className="w-full gap-0 overflow-y-auto border-0 bg-white px-3 pt-6 pb-10 sm:max-w-[590px] lg:px-10 lg:pt-10 [&>button:last-child]:hidden"
			>
				<SheetTitle className="sr-only">Your cart</SheetTitle>
				<SheetDescription className="sr-only">Items in your cart, the subtotal and checkout.</SheetDescription>
				<CartContents
					onNavigate={() => setOpen(false)}
					headerAction={
						<SheetClose aria-label="Close cart" className="grid size-9 place-items-center rounded-md text-ink hover:bg-grey-500">
							<X className="size-6" strokeWidth={1.75} />
						</SheetClose>
					}
				/>
			</SheetContent>
		</Sheet>
	);
}
