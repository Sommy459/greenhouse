import type { Metadata } from "next";
import { UserDetailView } from "@/features/users/components/UserDetailView";

export const metadata: Metadata = { title: "User" };

export default async function Page({ params }: { params: Promise<{ customerId: string }> }) {
	const { customerId } = await params;
	return <UserDetailView id={decodeURIComponent(customerId)} />;
}
