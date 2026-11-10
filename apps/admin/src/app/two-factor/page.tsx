import type { Metadata } from "next";
import { AuthCard } from "@/components/AuthCard";
import { RequireAdmin } from "@/features/auth/RequireAdmin";
import { TwoFactorSetup } from "@/features/auth/components/TwoFactorSetup";

export const metadata: Metadata = { title: "Two-factor sign-in" };

/** Required for admins before anything else works (the API answers 403 until it's on). */
export default function Page() {
	return (
		<RequireAdmin>
			<AuthCard title="Turn on two-factor sign-in">
				<TwoFactorSetup />
			</AuthCard>
		</RequireAdmin>
	);
}
