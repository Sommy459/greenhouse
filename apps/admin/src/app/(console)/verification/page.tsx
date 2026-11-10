import { redirect } from "next/navigation";
import { consoleRoutes } from "@/lib/routes";

/** The verification queue now lives in Vendors (filter: Pending); certificates are checked on each vendor's page. */
export default function Page() {
	redirect(consoleRoutes.VENDOR_QUEUE);
}
