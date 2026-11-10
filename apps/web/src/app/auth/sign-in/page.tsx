import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/features/auth/components/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

/** Figma "Welcome back": returning customers sign in with email and password. "Sign up" goes to the code flow. */
export default function Page() {
	return (
		// SignInForm and the sign-in hook read ?next= (useSearchParams), which needs a Suspense boundary.
		<Suspense>
			<SignInForm />
		</Suspense>
	);
}
