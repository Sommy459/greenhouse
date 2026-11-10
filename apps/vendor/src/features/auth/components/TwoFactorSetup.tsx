"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { CopyField } from "@/components/CopyField";
import { QrCode } from "@/components/QrCode";
import { useEnableTwoFactor, useSignOut, useStartTwoFactor } from "@/features/auth/hooks";

/**
 * Turn on two-factor sign-in (required for vendors, PRD): scan the QR code with an authenticator app (Google
 * Authenticator, Authy, 1Password…), then enter the code it shows. Every sign-in afterwards asks for a code.
 */
export function TwoFactorSetup() {
	const start = useStartTwoFactor();
	const enable = useEnableTwoFactor();
	const signOut = useSignOut();
	const [code, setCode] = useState("");
	const [problem, setProblem] = useState<string | null>(null);
	const setup = start.data;

	return (
		<div>
			<p className="flex gap-3 text-sm text-grey-900">
				<ShieldCheck className="size-6 shrink-0 text-primary-500" aria-hidden />
				Your shop handles payouts, so Fysi asks every seller to protect their account with an authenticator app. You&apos;ll enter
				a 6-digit code from it each time you sign in.
			</p>

			{!setup ? (
				<Button type="button" onClick={() => start.mutate()} isLoading={start.isPending} className="mt-6 w-full">
					Set up my authenticator app
				</Button>
			) : (
				<form
					noValidate
					className="mt-6 space-y-5"
					onSubmit={(e) => {
						e.preventDefault();
						if (!/^\d{6}$/.test(code)) return setProblem("Enter the 6-digit code from your app");
						setProblem(null);
						enable.mutate(code);
					}}
				>
					<ol className="list-decimal space-y-2 pl-5 text-sm text-ink">
						<li>Open your authenticator app and add an account.</li>
						<li>Scan this QR code, or type the key below.</li>
						<li>Enter the 6-digit code the app shows.</li>
					</ol>
					<QrCode value={setup.otpauthUrl} label="QR code for your authenticator app" className="mx-auto w-full max-w-[200px]" />
					<CopyField label="Setup key" value={setup.secret} />
					<div className="grid gap-2">
						<label htmlFor="enable-code" className="text-sm font-medium text-ink">
							Code from the app
						</label>
						<Input
							id="enable-code"
							inputMode="numeric"
							autoComplete="one-time-code"
							maxLength={6}
							value={code}
							onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
							aria-invalid={!!problem}
							className="h-12 text-lg tracking-[0.4em]"
						/>
						{problem && <p className="text-sm text-error-500">{problem}</p>}
					</div>
					<Button type="submit" isLoading={enable.isPending} className="w-full">
						Turn on two-factor sign-in
					</Button>
				</form>
			)}
			<button
				type="button"
				onClick={signOut}
				className="mt-5 w-full text-center text-sm font-medium text-grey-900 hover:text-ink"
			>
				Log out
			</button>
		</div>
	);
}
