import { redirect } from "next/navigation";
import { accountRoutes } from "@/lib/routes";

/** The wishlist moved out of the account menu (Figma): /wishlist. */
export default function Page() {
	redirect(accountRoutes.WISHLIST);
}
