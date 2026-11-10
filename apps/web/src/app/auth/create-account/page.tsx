import type { Metadata } from "next";
import { Suspense } from "react";
import { CreateAccountForm } from "@/features/auth/components/CreateAccountForm";

export const metadata: Metadata = { title: "Create your account" };

/** Step 3 for new customers, after the code is verified (Figma). */
export default function Page() {
	return (
		// CreateAccountForm reads ?identifier= and ?next= (useSearchParams), which needs a Suspense boundary.
		<Suspense>
			<CreateAccountForm />
		</Suspense>
	);
}
