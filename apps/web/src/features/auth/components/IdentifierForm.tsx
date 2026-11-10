"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { useSignUpDraft } from "@/features/auth/hooks";
import { IdentifierSchema, normaliseIdentifier, type IdentifierValues } from "@/features/auth/schema";
import { authRoutes, supportRoutes } from "@/lib/routes";
import { SITE_NAME } from "@/lib/site";

/**
 * Figma "Welcome to Fysi": step 1 of sign up, the email. Then a password, name and phone; the API emails a code at the
 * end. (No Google sign-in: the API has none.)
 */
export function IdentifierForm() {
	const router = useRouter();
	const next = useSearchParams().get("next");
	const setDraft = useSignUpDraft((s) => s.set);
	// "Edit" on Create your account comes back here with the email or phone filled in.
	const prefill = useSearchParams().get("identifier") ?? "";
	const form = useForm<IdentifierValues>({ resolver: zodResolver(IdentifierSchema), defaultValues: { identifier: prefill } });

	const onSubmit = ({ identifier }: IdentifierValues) => {
		const email = normaliseIdentifier(identifier);
		setDraft({ email });
		router.push(authRoutes.CREATE_ACCOUNT(email, next));
	};

	return (
		<div className="flex flex-col">
			<Form {...form}>
				<form noValidate onSubmit={form.handleSubmit(onSubmit)} className="order-1 flex flex-col">
					<FormField
						control={form.control}
						name="identifier"
						render={({ field }) => (
							<FormItem className="gap-2">
								<FormLabel className="text-base font-medium text-ink lg:text-sm">Email*</FormLabel>
								<FormControl>
									<Input
										type="text"
										inputMode="email"
										autoComplete="username"
										placeholder="enter your e-mail"
										className="h-14 rounded-md border-grey-700 bg-white px-4 text-base shadow-none placeholder:text-grey-800 focus-visible:border-primary-300 focus-visible:ring-primary-300/40 md:text-base lg:h-[54px] lg:text-sm"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="mt-7 h-[50px] rounded-lg text-lg font-semibold lg:mt-9 lg:h-[50px] lg:text-base">
						Continue
					</Button>
				</form>
			</Form>

			<p className="order-2 mt-7 text-center text-lg leading-snug text-ink lg:order-2 lg:mt-5 lg:text-base">
				By continuing you agree to {SITE_NAME}’s
				<br />
				<Link href={supportRoutes.TERMS} className="text-primary-500 underline underline-offset-2">
					Terms and Conditions
				</Link>
			</p>
		</div>
	);
}
