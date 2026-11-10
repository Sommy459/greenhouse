"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { useSignIn, useSignInCode } from "@/features/auth/hooks";
import { SignInSchema, type SignInValues } from "@/features/auth/schema";

/**
 * Seller sign-in: email and password, then (two-factor sign-in is required for vendors) the 6-digit code from the
 * authenticator app.
 */
export function SignInForm() {
	const [mfaToken, setMfaToken] = useState<string | null>(null);
	const signIn = useSignIn({ onCodeNeeded: setMfaToken });
	const form = useForm<SignInValues>({ resolver: zodResolver(SignInSchema), defaultValues: { email: "", password: "" } });

	if (mfaToken) return <CodeStep mfaToken={mfaToken} onBack={() => setMfaToken(null)} />;

	return (
		<Form {...form}>
			<form noValidate onSubmit={form.handleSubmit((values) => signIn.mutate(values))} className="flex flex-col gap-5">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" autoComplete="email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input type="password" autoComplete="current-password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" isLoading={signIn.isPending}>
					Sign in
				</Button>
			</form>
		</Form>
	);
}

function CodeStep({ mfaToken, onBack }: { mfaToken: string; onBack: () => void }) {
	const verify = useSignInCode();
	const [code, setCode] = useState("");
	const [problem, setProblem] = useState<string | null>(null);

	return (
		<form
			noValidate
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				if (!/^\d{6}$/.test(code)) return setProblem("Enter the 6-digit code from your authenticator app");
				setProblem(null);
				verify.mutate({ mfaToken, code });
			}}
		>
			<p className="text-sm text-grey-900">Open your authenticator app and enter the 6-digit code for Fysi.</p>
			<div className="grid gap-2">
				<label htmlFor="mfa-code" className="text-sm font-medium text-ink">
					Code
				</label>
				<Input
					id="mfa-code"
					inputMode="numeric"
					autoComplete="one-time-code"
					maxLength={6}
					autoFocus
					value={code}
					onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
					aria-invalid={!!problem}
					className="h-12 text-lg tracking-[0.4em]"
				/>
				{problem && <p className="text-sm text-error-500">{problem}</p>}
			</div>
			<Button type="submit" isLoading={verify.isPending}>
				Verify and sign in
			</Button>
			<button type="button" onClick={onBack} className="text-sm font-medium text-grey-900 hover:text-ink">
				Use a different account
			</button>
		</form>
	);
}
