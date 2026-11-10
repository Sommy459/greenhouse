import { redirect } from "next/navigation";
import { accountRoutes } from "@/lib/routes";

/** "Profile" (footer, older links) is the Settings page now. */
export default function Page() {
	redirect(accountRoutes.SETTINGS);
}
