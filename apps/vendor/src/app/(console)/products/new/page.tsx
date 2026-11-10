import type { Metadata } from "next";
import { AddProductView } from "@/features/products/components/AddProductView";

export const metadata: Metadata = { title: "Add Products" };

export default function Page() {
	return <AddProductView />;
}
