import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { SignInForm } from "@/features/auth/components/SignInForm";
import { authRoutes } from "@/lib/routes";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
	return (
		<AuthCard
			title="Seller centre"
			subtitle={
				<>
					New to selling on Fysi?{" "}
					<Link href={authRoutes.SIGN_UP} className="font-bold text-primary-600">
						Create a seller account
					</Link>
				</>
			}
		>
			<SignInForm />
		</AuthCard>
	);
}
