"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { useSignUp } from "@/features/auth/hooks";
import { DIAL_CODES, fullPhoneNumber, PersonalInfoSchema, type PersonalInfoValues } from "@/features/auth/schema";
import { BackLink } from "@/features/shop/components/setup/BackLink";
import { SETUP_FIELD, SETUP_SUBMIT } from "@/features/shop/styles";

interface Props {
	email: string;
	country: string;
	verificationToken: string;
	onBack: () => void;
	onSignedUp: () => void;
}

/** Figma step 4 "Personal Information": phone number and password. Next creates the seller account. */
export function PersonalInfoStep({ email, country, verificationToken, onBack, onSignedUp }: Props) {
	const signUp = useSignUp({ onSignedUp });
	const form = useForm<PersonalInfoValues>({
		resolver: zodResolver(PersonalInfoSchema),
		defaultValues: { dial_code: "+234", phone: "", password: "", confirm_password: "" },
	});
	const dialCode = useWatch({ control: form.control, name: "dial_code" });

	const onSubmit = ({ dial_code, phone, password }: PersonalInfoValues) =>
		signUp.mutate({
			email,
			password,
			phone_number: fullPhoneNumber(dial_code, phone),
			country,
			verification_token: verificationToken,
			role: "vendor",
		});

	return (
		<Form {...form}>
			<form noValidate onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col lg:mt-2">
				<BackLink onClick={onBack} />

				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem className="gap-2">
							<FormLabel className="sr-only">Phone number</FormLabel>
							<div className="flex gap-2.5 lg:gap-2">
								<DialCodeSelect
									value={dialCode}
									onChange={(code) => form.setValue("dial_code", code, { shouldValidate: form.formState.isSubmitted })}
								/>
								<FormControl>
									<Input
										type="tel"
										inputMode="tel"
										autoComplete="tel-national"
										placeholder="Phone Number"
										className={cn(SETUP_FIELD, "flex-1")}
										{...field}
									/>
								</FormControl>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem className="mt-5 gap-2">
							<FormLabel className="sr-only">Password</FormLabel>
							<FormControl>
								<PasswordInput autoComplete="new-password" placeholder="Your Password" className={SETUP_FIELD} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirm_password"
					render={({ field }) => (
						<FormItem className="mt-5 gap-2">
							<FormLabel className="sr-only">Confirm password</FormLabel>
							<FormControl>
								<PasswordInput
									autoComplete="new-password"
									placeholder="Confirm Your Password"
									className={SETUP_FIELD}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<p className="mt-6 text-[13px] leading-snug text-ink lg:text-xs">
					Password should contain at least 8 characters containing a capital letter, a lower letter, a number and a special
					character
				</p>

				<Button type="submit" isLoading={signUp.isPending} className={cn(SETUP_SUBMIT, "mt-[110px] lg:mt-10")}>
					Next
				</Button>
			</form>
		</Form>
	);
}

/** The "+234 ▾" box. A native select, so phones get their own picker. */
function DialCodeSelect({ value, onChange }: { value: string; onChange: (code: string) => void }) {
	return (
		<div className="relative w-[74px] shrink-0">
			<select
				aria-label="Country code"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-14 w-full cursor-pointer appearance-none rounded-md border border-grey-700 bg-white pr-6 pl-2.5 text-base text-ink outline-none focus-visible:border-primary-300 focus-visible:ring-[3px] focus-visible:ring-primary-300/40 lg:h-[54px] lg:pl-2 lg:text-sm"
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
