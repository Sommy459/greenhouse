import { Suspense } from "react";
import { IdentifierForm } from "@/features/auth/components/IdentifierForm";
import { SITE_NAME } from "@/lib/site";

/** The Figma customer auth screen, shared by /auth/sign-in and /auth/sign-up. Centred on mobile, left-aligned on desktop. */
export function WelcomeScreen() {
	return (
		<div>
			<h1 className="text-center text-[30px] font-medium text-ink lg:text-left lg:text-[28px]">Welcome to {SITE_NAME}</h1>
			<p className="mt-4 text-center text-lg leading-snug text-ink lg:mt-3 lg:text-left lg:text-base">
				Type your e-mail or phone number to log in or create a {SITE_NAME} account
			</p>
			<div className="mt-7 lg:mt-6">
				{/* IdentifierForm reads ?next= (useSearchParams), which needs a Suspense boundary. */}
				<Suspense>
					<IdentifierForm />
				</Suspense>
			</div>
		</div>
	);
}
