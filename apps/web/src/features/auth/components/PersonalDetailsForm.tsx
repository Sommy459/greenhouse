"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { useRegister, useSignUpDraft } from "@/features/auth/hooks";
import {
	DIAL_CODES,
	PersonalDetailsSchema,
	fullPhoneNumber,
	splitPhoneNumber,
	type PersonalDetailsValues,
} from "@/features/auth/schema";
import { AUTH_FIELD, AUTH_LABEL, AUTH_SUBMIT } from "@/features/auth/styles";
import { authRoutes } from "@/lib/routes";

/**
 * Figma "Personal Details", the last sign-up step: name and phone, then the account is created with the email and
 * password from the earlier steps and the API emails a 6-digit code.
 */
export function PersonalDetailsForm() {
	const router = useRouter();
	const next = useSearchParams().get("next");
	const draft = useSignUpDraft();
	const register = useRegister();
	const form = useForm<PersonalDetailsValues>({
		resolver: zodResolver(PersonalDetailsSchema),
		defaultValues: { first_name: "", last_name: "", ...splitPhoneNumber(undefined) },
	});

	const dialCode = useWatch({ control: form.control, name: "dial_code" });

	// The email and password live in memory only: after a reload, sign-up starts again.
	useEffect(() => {
		if (!draft.email || !draft.password) router.replace(authRoutes.SIGN_UP(next));
	}, [draft.email, draft.password, router, next]);

	const onSubmit = ({ first_name, last_name, dial_code, phone }: PersonalDetailsValues) =>
		register.mutate({ name: `${first_name.trim()} ${last_name.trim()}`, phone: fullPhoneNumber(dial_code, phone) });

	return (
		<div>
			<h1 className="text-[32px] leading-tight font-medium text-ink lg:text-[28px]">Personal Details</h1>
			<p className="mt-5 text-lg leading-snug text-ink lg:mt-4 lg:text-base">
				We&apos;d love to get to know you better! Please fill in a few details.
			</p>

			<Form {...form}>
				<form noValidate onSubmit={form.handleSubmit(onSubmit)} className="mt-9 flex flex-col gap-6 lg:mt-7 lg:gap-5">
					<FormField
						control={form.control}
						name="first_name"
						render={({ field }) => (
							<FormItem className="gap-2">
								<FormLabel className={AUTH_LABEL}>First Name*</FormLabel>
								<FormControl>
									<Input autoComplete="given-name" placeholder="Enter your first name" className={AUTH_FIELD} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="last_name"
						render={({ field }) => (
							<FormItem className="gap-2">
								<FormLabel className={AUTH_LABEL}>Last Name*</FormLabel>
								<FormControl>
									<Input autoComplete="family-name" placeholder="Enter your last name" className={AUTH_FIELD} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="phone"
						render={({ field }) => (
							<FormItem className="gap-2 lg:mt-1">
								<FormLabel className={AUTH_LABEL}>Phone Number*</FormLabel>
								<div className="flex gap-2.5 lg:gap-1.5">
									<DialCodeSelect
										value={dialCode}
										onChange={(code) => form.setValue("dial_code", code, { shouldValidate: form.formState.isSubmitted })}
									/>
									<FormControl>
										<Input
											type="tel"
											inputMode="tel"
											autoComplete="tel-national"
											placeholder="81765779793"
											className={`${AUTH_FIELD} flex-1`}
											{...field}
										/>
									</FormControl>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" isLoading={register.isPending} className={`${AUTH_SUBMIT} mt-4 lg:mt-3`}>
						Continue
					</Button>
				</form>
			</Form>
		</div>
	);
}

/** The "+234 ▾" box. A native select, so phones get their own picker. */
function DialCodeSelect({ value, onChange }: { value: string; onChange: (code: string) => void }) {
	return (
		<div className="relative w-[74px] shrink-0 lg:w-[72px]">
			<select
				aria-label="Country code"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-14 w-full cursor-pointer appearance-none rounded-md border border-grey-700 bg-white pr-6 pl-2.5 text-base text-ink outline-none focus-visible:border-primary-300 focus-visible:ring-[3px] focus-visible:ring-primary-300/40 lg:h-[55px] lg:pl-2 lg:text-sm"
			>
				{DIAL_CODES.map(({ code, country }) => (
					<option key={code} value={code}>
						{code} {country}
					</option>
				))}
			</select>
			{/* The design's solid caret. */}
			<svg
				viewBox="0 0 10 6"
				className="pointer-events-none absolute top-1/2 right-2 h-1.5 w-2.5 -translate-y-1/2 fill-ink"
				aria-hidden
			>
				<path d="M0 0h10L5 6z" />
			</svg>
		</div>
	);
}
