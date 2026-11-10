"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@repo/ui/input-otp";
import { useRequestCode, useVerifyCode } from "@/features/auth/hooks";
import { CODE_LENGTH, isEmailIdentifier } from "@/features/auth/schema";
import { authRoutes } from "@/lib/routes";

const RESEND_AFTER = 60;
const DIGITS_ONLY = "^\\d+$";

/** Figma "Verify your email address": four code boxes, Submit, and a 60-second wait before a new code can be sent. */
export function VerifyCodeForm() {
	const router = useRouter();
	const identifier = useSearchParams().get("identifier") ?? "";
	const verify = useVerifyCode();
	const resend = useRequestCode({ navigate: false });
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [secondsLeft, setSecondsLeft] = useState(RESEND_AFTER);

	// Arrived without an email or phone (e.g. a bookmarked link): start again.
	useEffect(() => {
		if (!identifier) router.replace(authRoutes.SIGN_UP());
	}, [identifier, router]);

	useEffect(() => {
		if (secondsLeft <= 0) return;
		const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
		return () => clearTimeout(timer);
	}, [secondsLeft]);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (code.length < CODE_LENGTH) {
			setError(`Enter the ${CODE_LENGTH}-digit code`);
			return;
		}
		setError(null);
		verify.mutate({ identifier, code });
	};

	const onResend = () => resend.mutate(identifier, { onSuccess: () => setSecondsLeft(RESEND_AFTER) });

	const target = isEmailIdentifier(identifier) ? "email address" : "phone number";

	return (
		<div>
			<h1 className="text-center text-[32px] leading-tight font-medium text-ink lg:text-left lg:text-[28px]">
				Verify your {target}
			</h1>
			<p className="mt-3 text-center text-lg leading-snug text-ink lg:mt-2 lg:text-left lg:text-base">
				We have sent a verification code to <span className="break-all">{identifier}</span>
			</p>

			<form noValidate onSubmit={onSubmit} className="mt-14 lg:mt-7">
				<InputOTP
					maxLength={CODE_LENGTH}
					pattern={DIGITS_ONLY}
					inputMode="numeric"
					autoComplete="one-time-code"
					value={code}
					onChange={(value) => {
						setCode(value);
						if (error) setError(null);
					}}
					aria-label="Verification code"
					aria-invalid={!!error}
					containerClassName="w-full"
				>
					<InputOTPGroup className="w-full gap-3 lg:w-auto lg:gap-2.5">
						{Array.from({ length: CODE_LENGTH }, (_, i) => (
							<InputOTPSlot
								key={i}
								index={i}
								aria-invalid={!!error}
								className="aspect-square h-auto w-auto max-w-[80px] flex-1 rounded-lg border border-grey-800 bg-white text-2xl font-medium shadow-none first:rounded-lg first:border-l last:rounded-lg data-[active=true]:border-primary-400 data-[active=true]:ring-primary-300/40 lg:size-[76px] lg:flex-none"
							/>
						))}
					</InputOTPGroup>
				</InputOTP>
				{error && <p className="mt-2 text-sm text-error-500">{error}</p>}

				<Button
					type="submit"
					isLoading={verify.isPending}
					className="mt-11 h-[50px] rounded-lg text-lg font-semibold lg:mt-6 lg:text-base"
				>
					Submit
				</Button>
			</form>

			<p className="mt-7 text-center text-lg leading-snug text-ink lg:mt-5 lg:text-base" aria-live="polite">
				Didn&apos;t receive the verification code? It might take a moment. You can request a{" "}
				{secondsLeft > 0 ? (
					<>
						<span className="text-primary-500">new code</span> in <span className="text-primary-500">{secondsLeft} seconds</span>
					</>
				) : (
					<button
						type="button"
						onClick={onResend}
						disabled={resend.isPending}
						className="font-medium text-primary-500 underline underline-offset-2 disabled:opacity-60"
					>
						new code
					</button>
				)}
			</p>
		</div>
	);
}
