import type { Metadata } from "next";
import { AuthCard } from "@/components/AuthCard";
import { SignInForm } from "@/features/auth/components/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
	return (
		<AuthCard title="Admin console" subtitle="Sign in with an administrator account.">
			<SignInForm />
		</AuthCard>
	);
}
