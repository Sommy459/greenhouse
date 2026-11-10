"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { useSignIn } from "@/features/auth/hooks";
import { SignInSchema, type SignInValues } from "@/features/auth/schema";
import { AUTH_FIELD, AUTH_LABEL, AUTH_SUBMIT } from "@/features/auth/styles";
import { authRoutes } from "@/lib/routes";

/** Figma "Welcome back": email and password, forgot password, and a link to sign up (C1). */
export function SignInForm() {
	const signIn = useSignIn();
	const next = useSearchParams().get("next");
	const form = useForm<SignInValues>({
		resolver: zodResolver(SignInSchema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit = ({ email, password }: SignInValues) => signIn.mutate({ email: email.trim().toLowerCase(), password });

	return (
		<div>
			<h1 className="text-[32px] leading-tight font-medium text-ink lg:text-[28px]">Welcome back</h1>
			<p className="mt-3 text-lg leading-snug text-ink lg:mt-2 lg:text-base">Welcome back! Please enter your details.</p>

			<Form {...form}>
				<form noValidate onSubmit={form.handleSubmit(onSubmit)} className="mt-9 flex flex-col lg:mt-7">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem className="gap-2">
								<FormLabel className={AUTH_LABEL}>Email*</FormLabel>
								<FormControl>
									<Input type="email" autoComplete="email" placeholder="enter your e-mail" className={AUTH_FIELD} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem className="mt-6 gap-2 lg:mt-7">
								<FormLabel className={AUTH_LABEL}>Password*</FormLabel>
								<FormControl>
									<PasswordInput autoComplete="current-password" placeholder="Your Password" className={AUTH_FIELD} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="mt-2.5 flex items-center justify-end gap-4 lg:mt-2">
						<Link href={authRoutes.FORGOT_PASSWORD} className="text-sm text-primary-500 hover:underline lg:text-xs">
							Forgot password
						</Link>
					</div>

					<Button type="submit" isLoading={signIn.isPending} className={`${AUTH_SUBMIT} mt-12 lg:mt-14 lg:h-[54px]`}>
						Sign in
					</Button>
				</form>
			</Form>

			<p className="mt-10 text-center text-lg text-ink lg:mt-10 lg:text-base">
				Don&apos;t have an account?{" "}
				<Link href={authRoutes.SIGN_UP(next)} className="font-medium text-primary-500 hover:underline">
					Sign up
				</Link>
			</p>
		</div>
	);
}
