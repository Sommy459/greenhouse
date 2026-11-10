import type { Metadata } from "next";
import { NotificationsView } from "@/features/settings/components/NotificationsView";

export const metadata: Metadata = { title: "Notification" };

export default function Page() {
	return <NotificationsView />;
}
