import type { Metadata } from "next";
import { AddressesView } from "@/features/addresses/components/AddressesView";

export const metadata: Metadata = { title: "Addresses" };

export default function Page() {
	return <AddressesView />;
}
