"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { useForgotPassword, useResendCode, useResetPassword } from "@/features/auth/hooks";
import { CODE_LENGTH, CreateAccountSchema } from "@/features/auth/schema";
import { AUTH_FIELD, AUTH_LABEL, AUTH_SUBMIT } from "@/features/auth/styles";
import { authRoutes } from "@/lib/routes";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "Forgot password": the account email; the API emails a reset code. */
export function ForgotPasswordForm() {
	const forgot = useForgotPassword();
	const [email, setEmail] = useState("");
	const [problem, setProblem] = useState<string | null>(null);

	return (
		<div>
			<h1 className="text-[32px] leading-tight font-medium text-ink lg:text-[28px]">Forgot your password?</h1>
			<p className="mt-3 text-lg leading-snug text-ink lg:mt-2 lg:text-base">
				Enter your account email and we&apos;ll send you a code to choose a new password.
			</p>
			<form
				noValidate
				className="mt-9 flex flex-col gap-2 lg:mt-7"
				onSubmit={(e) => {
					e.preventDefault();
					const value = email.trim().toLowerCase();
					if (!EMAIL.test(value)) return setProblem("Enter a valid email");
					setProblem(null);
					forgot.mutate(value);
				}}
			>
				<label htmlFor="forgot-email" className={AUTH_LABEL}>
					Email*
				</label>
				<Input
					id="forgot-email"
					type="email"
					autoComplete="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					aria-invalid={!!problem}
					className={AUTH_FIELD}
				/>
				{problem && <p className="text-sm text-error-500">{problem}</p>}
				<Button type="submit" isLoading={forgot.isPending} className={`${AUTH_SUBMIT} mt-8`}>
					Send code
				</Button>
			</form>
			<p className="mt-6 text-center text-base text-ink lg:text-sm">
				Remembered it?{" "}
				<Link href={authRoutes.SIGN_IN()} className="text-primary-500 hover:underline">
					Sign in
				</Link>
			</p>
		</div>
	);
}

/** "Reset password": the emailed code and a new password (the sign-up rules). */
export function ResetPasswordForm() {
	const email = useSearchParams().get("email") ?? "";
	const reset = useResetPassword();
	const resend = useResendCode();
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [again, setAgain] = useState("");
	const [problem, setProblem] = useState<string | null>(null);

	if (!email) {
		return (
			<div>
				<h1 className="text-[28px] font-medium text-ink">Reset password</h1>
				<p className="mt-3 text-base text-ink">Start from &ldquo;Forgot password&rdquo; so we know which account to reset.</p>
				<Button asChild className={`${AUTH_SUBMIT} mt-8 w-full`}>
					<Link href={authRoutes.FORGOT_PASSWORD}>Forgot password</Link>
				</Button>
			</div>
		);
	}

	return (
		<div>
			<h1 className="text-[32px] leading-tight font-medium text-ink lg:text-[28px]">Choose a new password</h1>
			<p className="mt-3 text-lg leading-snug text-ink lg:mt-2 lg:text-base">
				We sent a {CODE_LENGTH}-digit code to <span className="break-all">{email}</span>.
			</p>
			<form
				noValidate
				className="mt-9 flex flex-col gap-2 lg:mt-7"
				onSubmit={(e) => {
					e.preventDefault();
					if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(otp)) return setProblem(`Enter the ${CODE_LENGTH}-digit code`);
					const check = CreateAccountSchema.safeParse({ password, confirm_password: again });
					if (!check.success) return setProblem(check.error.issues[0]?.message ?? "Check your new password");
					setProblem(null);
					reset.mutate({ email, otp, newPassword: password });
				}}
			>
				<label htmlFor="reset-code" className={AUTH_LABEL}>
					Code*
				</label>
				<Input
					id="reset-code"
					inputMode="numeric"
					autoComplete="one-time-code"
					maxLength={CODE_LENGTH}
					value={otp}
					onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
					className={`${AUTH_FIELD} tracking-[0.3em]`}
				/>
				<label htmlFor="reset-password" className={`${AUTH_LABEL} mt-4`}>
					New password*
				</label>
				<PasswordInput
					id="reset-password"
					autoComplete="new-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className={AUTH_FIELD}
				/>
				<label htmlFor="reset-again" className={`${AUTH_LABEL} mt-4`}>
					Confirm new password*
				</label>
				<PasswordInput
					id="reset-again"
					autoComplete="new-password"
					value={again}
					onChange={(e) => setAgain(e.target.value)}
					className={AUTH_FIELD}
				/>
				<p className="text-sm text-grey-800">At least 8 characters, with an uppercase letter, a lowercase letter and a number.</p>
				{problem && (
					<p role="alert" className="text-sm text-error-500">
						{problem}
					</p>
				)}
				<Button type="submit" isLoading={reset.isPending} className={`${AUTH_SUBMIT} mt-8`}>
					Change password
				</Button>
			</form>
			<button
				type="button"
				onClick={() => resend.mutate(email)}
				disabled={resend.isPending}
				className="mt-5 w-full text-center text-base text-primary-500 hover:underline disabled:opacity-60 lg:text-sm"
			>
				Didn&apos;t get it? Send a new code
			</button>
		</div>
	);
}
