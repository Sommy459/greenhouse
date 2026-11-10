import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/PasswordResetForms";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
	return (
		// ResetPasswordForm reads ?email= (useSearchParams), which needs a Suspense boundary.
		<Suspense>
			<ResetPasswordForm />
		</Suspense>
	);
}
