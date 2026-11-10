"use client";

import { useState } from "react";
import { EmailStep } from "@/features/shop/components/setup/EmailStep";
import { PersonalInfoStep } from "@/features/shop/components/setup/PersonalInfoStep";
import { VerifyStep } from "@/features/shop/components/setup/VerifyStep";

type Step = "email" | "personal" | "verify";

/**
 * Figma "Set up your shop" = seller sign-up (V1), in the Fysi API's order: e-mail → personal information and shop name
 * (creates the account; the API emails a code) → the code (signs in). Two-factor setup and the business profile follow
 * (/two-factor, /onboarding). Answers are kept when going back a step.
 */
export function SellerSetupWizard() {
	const [step, setStep] = useState<Step>("email");
	const [email, setEmail] = useState<string | undefined>();

	return (
		<div>
			{step === "personal" ? (
				<div className="text-center text-ink">
					<h1 className="text-lg font-semibold lg:text-base">Personal Information</h1>
					<p className="mt-4 text-lg leading-snug lg:mt-3 lg:text-base">Your name, shop name, phone number and a password</p>
				</div>
			) : (
				<h1 className="text-center text-lg leading-snug font-normal text-ink lg:text-base">
					Set up your shop by completing the following details
				</h1>
			)}

			{/* Keyed on the step, so each new step slides in from the right. */}
			<div key={step} className="animate-slide mx-auto max-w-[450px]">
				{step === "email" && (
					<EmailStep
						defaultValue={email}
						onBack={() => history.back()}
						onNext={(values) => {
							setEmail(values.email);
							setStep("personal");
						}}
					/>
				)}
				{step === "personal" && email && (
					<PersonalInfoStep email={email} onBack={() => setStep("email")} onRegistered={() => setStep("verify")} />
				)}
				{step === "verify" && email && <VerifyStep email={email} onEdit={() => setStep("email")} />}
			</div>
		</div>
	);
}
