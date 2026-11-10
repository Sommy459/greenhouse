"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { useSignUpDraft } from "@/features/auth/hooks";
import { CreateAccountSchema, type CreateAccountValues } from "@/features/auth/schema";
import { AUTH_FIELD as FIELD, AUTH_LABEL as LABEL } from "@/features/auth/styles";
import { authRoutes } from "@/lib/routes";

/** Figma "Create your account": the email from step 1 (read-only, with Edit), password and confirmation. */
export function CreateAccountForm() {
	const router = useRouter();
	const params = useSearchParams();
	const identifier = params.get("identifier") ?? "";
	const setDraft = useSignUpDraft((s) => s.set);
	const form = useForm<CreateAccountValues>({
		resolver: zodResolver(CreateAccountSchema),
		defaultValues: { password: "", confirm_password: "" },
	});

	// Arrived without an email: start again.
	useEffect(() => {
		if (!identifier) router.replace(authRoutes.SIGN_UP());
	}, [identifier, router]);

	return (
		<div>
			<h1 className="text-[32px] leading-tight font-medium text-ink lg:text-[28px]">Create your account</h1>
			<p className="mt-3 text-lg leading-snug text-ink lg:mt-2 lg:text-base">
				Lets get started by creating your account. To keep your account safe we need a strong password
			</p>

			<Form {...form}>
				<form
					noValidate
					onSubmit={form.handleSubmit(({ password }) => {
						setDraft({ email: identifier, password });
						router.push(authRoutes.PERSONAL_DETAILS(params.get("next")));
					})}
					className="mt-9 flex flex-col gap-6 lg:mt-7 lg:gap-5"
				>
					<div className="grid gap-2">
						<label htmlFor="identifier" className={LABEL}>
							Email or Phone number*
						</label>
						<div className="relative">
							<Input id="identifier" value={identifier} readOnly className={`${FIELD} pr-16 text-ink`} />
							<Link
								href={authRoutes.EDIT_IDENTIFIER(identifier, params.get("next"))}
								className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-primary-500 hover:underline"
							>
								Edit
							</Link>
						</div>
					</div>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem className="gap-2">
								<FormLabel className={LABEL}>Password*</FormLabel>
								<FormControl>
									<PasswordInput autoComplete="new-password" placeholder="Your Password" className={FIELD} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="confirm_password"
						render={({ field }) => (
							<FormItem className="gap-2">
								<FormLabel className={LABEL}>Confirm Password*</FormLabel>
								<FormControl>
									<PasswordInput autoComplete="new-password" placeholder="Your Password" className={FIELD} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="mt-4 h-[50px] rounded-lg text-lg font-semibold lg:mt-3 lg:text-base">
						Continue
					</Button>
				</form>
			</Form>
		</div>
	);
}
