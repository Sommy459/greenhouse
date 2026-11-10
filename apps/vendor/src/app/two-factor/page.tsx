import type { Metadata } from "next";
import { AuthCard } from "@/components/AuthCard";
import { RequireVendor } from "@/features/auth/RequireVendor";
import { TwoFactorSetup } from "@/features/auth/components/TwoFactorSetup";

export const metadata: Metadata = { title: "Two-factor sign-in" };

/** Required for vendors before anything else works (the API answers 403 until it's on). */
export default function Page() {
	return (
		<RequireVendor>
			<AuthCard title="Turn on two-factor sign-in">
				<TwoFactorSetup />
			</AuthCard>
		</RequireVendor>
	);
}
