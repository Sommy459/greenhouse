"use client";

import { create } from "zustand";

/** Whether the cart overlay (Figma "cart open overlay") is open. Not persisted: it starts closed on every visit. */
interface CartDrawer {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export const useCartDrawer = create<CartDrawer>()((set) => ({
	open: false,
	setOpen: (open) => set({ open }),
}));
