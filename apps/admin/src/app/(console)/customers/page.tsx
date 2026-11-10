import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersView } from "@/features/users/components/UsersView";

export const metadata: Metadata = { title: "Users" };

export default function Page() {
	return (
		// UsersView reads the URL's search params.
		<Suspense>
			<UsersView />
		</Suspense>
	);
}
