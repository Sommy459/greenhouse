import type { Metadata } from "next";
import { TeamView } from "@/features/users/components/TeamView";

export const metadata: Metadata = { title: "Admin team" };

export default function Page() {
	return <TeamView />;
}
