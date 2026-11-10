import type { DeliveryAddress } from "@/features/orders/types";

/** GET /addresses: the customer's saved delivery addresses. */
export interface SavedAddress extends DeliveryAddress {
	id: string;
	/** e.g. "Home", "Office". */
	label: string | null;
	isDefault: boolean;
	createdAt: string;
	updatedAt: string;
}

export type AddressBody = DeliveryAddress & { label?: string | null; isDefault?: boolean };
