import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditView } from "@/features/audit/components/AuditView";

export const metadata: Metadata = { title: "Audit log" };

export default function Page() {
	return (
		// AuditView reads the URL's search params.
		<Suspense>
			<AuditView />
		</Suspense>
	);
}
