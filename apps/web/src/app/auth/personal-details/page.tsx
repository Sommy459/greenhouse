import type { Metadata } from "next";
import { Suspense } from "react";
import { PersonalDetailsForm } from "@/features/auth/components/PersonalDetailsForm";

export const metadata: Metadata = { title: "Personal details" };

/** The last sign-up step (Figma): name and phone, then the account is created and a code is emailed. */
export default function Page() {
	return (
		// PersonalDetailsForm reads ?next= (useSearchParams), which needs a Suspense boundary.
		<Suspense>
			<PersonalDetailsForm />
		</Suspense>
	);
}
