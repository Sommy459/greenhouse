import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyCodeForm } from "@/features/auth/components/VerifyCodeForm";

export const metadata: Metadata = { title: "Verify" };

/** Step 2 of log in / sign up: the one-time code (Figma). */
export default function Page() {
	return (
		// VerifyCodeForm reads ?identifier= and ?next= (useSearchParams), which needs a Suspense boundary.
		<Suspense>
			<VerifyCodeForm />
		</Suspense>
	);
}
