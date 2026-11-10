import { redirect } from "next/navigation";
import { consoleRoutes } from "@/lib/routes";

/** Order Details is a dialog over the order list (Figma); old links to /orders/:id open it there. */
export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
	const { orderId } = await params;
	redirect(consoleRoutes.ORDER(decodeURIComponent(orderId)));
}
