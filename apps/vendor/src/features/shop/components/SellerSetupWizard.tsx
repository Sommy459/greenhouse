"use client";

import { useState } from "react";
import { CountryStep } from "@/features/shop/components/setup/CountryStep";
import { EmailStep } from "@/features/shop/components/setup/EmailStep";
import { PersonalInfoStep } from "@/features/shop/components/setup/PersonalInfoStep";
import { ShopDetailsStep } from "@/features/shop/components/setup/ShopDetailsStep";
import { VerifyStep } from "@/features/shop/components/setup/VerifyStep";

type Step = "country" | "email" | "verify" | "personal" | "details";

interface Draft {
	country?: string;
	email?: string;
	verificationToken?: string;
}

/**
 * Figma "Set up your shop" = seller sign-up (V1): country → e-mail → verify code → personal information (creates the
 * account) → shop details (creates the shop, pending approval).
 *
 * `start="details"` is for a signed-in vendor with no shop yet (/onboarding), e.g. one who left after creating the
 * account. Answers are kept when going back a step; nothing is sent until the code, the account and the shop.
 */
export function SellerSetupWizard({ start = "country" }: { start?: "country" | "details" }) {
	const [step, setStep] = useState<Step>(start);
	const [draft, setDraft] = useState<Draft>({});
	const update = (values: Partial<Draft>, next: Step) => {
		setDraft((d) => ({ ...d, ...values }));
		setStep(next);
	};

	return (
		<div>
			{step === "personal" ? (
				<div className="text-center text-ink">
					<h1 className="text-lg font-semibold lg:text-base">Personal Information</h1>
					<p className="mt-4 text-lg leading-snug lg:mt-3 lg:text-base">Set up your password and provide your phone number</p>
				</div>
			) : (
				<h1 className="text-center text-lg leading-snug font-normal text-ink lg:text-base">
					Set up your shop by completing the following details
				</h1>
			)}

			{/* Steps 1–4 are 450px wide in the design; the shop details step uses the full 660px column. Keyed on the step, so
			    each new step slides in from the right. */}
			<div key={step} className={step === "details" ? "animate-slide" : "animate-slide mx-auto max-w-[450px]"}>
				{step === "country" && (
					<CountryStep defaultValue={draft.country} onNext={({ country }) => update({ country }, "email")} />
				)}
				{step === "email" && (
					<EmailStep
						defaultValue={draft.email}
						onBack={() => setStep("country")}
						onNext={({ email }) => update({ email }, "verify")}
					/>
				)}
				{step === "verify" && draft.email && (
					<VerifyStep
						email={draft.email}
						onEdit={() => setStep("email")}
						onVerified={(verificationToken) => update({ verificationToken }, "personal")}
					/>
				)}
				{step === "personal" && draft.email && draft.country && draft.verificationToken && (
					<PersonalInfoStep
						email={draft.email}
						country={draft.country}
						verificationToken={draft.verificationToken}
						onBack={() => setStep("email")}
						onSignedUp={() => setStep("details")}
					/>
				)}
				{step === "details" && <ShopDetailsStep />}
			</div>
		</div>
	);
}
