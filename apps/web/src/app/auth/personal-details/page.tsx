import type { Metadata } from "next";
import { Suspense } from "react";
import { PersonalDetailsForm } from "@/features/auth/components/PersonalDetailsForm";
import { RequireAuth } from "@/features/auth/RequireAuth";

export const metadata: Metadata = { title: "Personal details" };

/** Step 4 for new customers (Figma). The account exists by now, so this page needs a session. */
export default function Page() {
	return (
		<RequireAuth>
			{/* The save hook reads ?next= (useSearchParams), which needs a Suspense boundary. */}
			<Suspense>
				<PersonalDetailsForm />
			</Suspense>
		</RequireAuth>
	);
}
