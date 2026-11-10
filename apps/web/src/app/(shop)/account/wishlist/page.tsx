import { redirect } from "next/navigation";
import { accountRoutes } from "@/lib/routes";

/** The wishlist lives outside the account menu (Figma): /wishlist. */
export default function Page() {
	redirect(accountRoutes.WISHLIST);
}
