import type { Metadata } from "next";
import { AnnouncementsView } from "@/features/announcements/components/AnnouncementsView";

export const metadata: Metadata = { title: "Announcements" };

export default function Page() {
	return <AnnouncementsView />;
}
