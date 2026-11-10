"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { useRequestCode } from "@/features/auth/hooks";
import { IdentifierSchema, normaliseIdentifier, type IdentifierValues } from "@/features/auth/schema";
import { supportRoutes } from "@/lib/routes";
import { SITE_NAME } from "@/lib/site";
import { useToast } from "@/lib/use-toast";

/**
 * Figma "Welcome to Fysi": one email-or-phone field that starts both log in and sign up (C1).
 * Mobile order: Continue, Google, terms. Desktop: Continue, terms, then Google further down.
 */
export function IdentifierForm() {
	const toast = useToast();
	const requestCode = useRequestCode();
	// "Edit" on Create your account comes back here with the email or phone filled in.
	const prefill = useSearchParams().get("identifier") ?? "";
	const form = useForm<IdentifierValues>({ resolver: zodResolver(IdentifierSchema), defaultValues: { identifier: prefill } });

	// Continue sends a one-time code, then opens the verify screen.
	const onSubmit = ({ identifier }: IdentifierValues) => requestCode.mutate(normaliseIdentifier(identifier));

	return (
		<div className="flex flex-col">
			<Form {...form}>
				<form noValidate onSubmit={form.handleSubmit(onSubmit)} className="order-1 flex flex-col">
					<FormField
						control={form.control}
						name="identifier"
						render={({ field }) => (
							<FormItem className="gap-2">
								<FormLabel className="text-base font-medium text-ink lg:text-sm">Email or Phone number*</FormLabel>
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
					<Button
						type="submit"
						isLoading={requestCode.isPending}
						className="mt-7 h-[50px] rounded-lg text-lg font-semibold lg:mt-9 lg:h-[50px] lg:text-base"
					>
						Continue
					</Button>
				</form>
			</Form>

			<Button
				type="button"
				variant="outline"
				onClick={() => toast.info("Google sign-in isn't connected yet.")}
				className="order-2 mt-5 h-11 gap-3 rounded-lg border-grey-600 bg-white text-lg font-medium text-ink/80 hover:bg-grey-500 lg:order-3 lg:mt-24 lg:text-base"
			>
				<FcGoogle className="size-6" aria-hidden />
				Sign up with Google
			</Button>

			<p className="order-3 mt-7 text-center text-lg leading-snug text-ink lg:order-2 lg:mt-5 lg:text-base">
				By continuing you agree to {SITE_NAME}’s
				<br />
				<Link href={supportRoutes.TERMS} className="text-primary-500 underline underline-offset-2">
					Terms and Conditions
				</Link>
			</p>
		</div>
	);
}
