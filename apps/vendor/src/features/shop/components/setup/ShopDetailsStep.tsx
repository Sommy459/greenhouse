"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { CertificateUpload } from "@/features/shop/components/setup/CertificateUpload";
import { ConfirmAccountTypeDialog } from "@/features/shop/components/setup/ConfirmAccountTypeDialog";
import { ShopReadyDialog } from "@/features/shop/components/setup/ShopReadyDialog";
import { NativeSelect } from "@/features/shop/components/setup/NativeSelect";
import { useOnboardShop } from "@/features/shop/hooks";
import { ACCOUNT_TYPES, REFERRAL_SOURCES, SHIPPING_ZONES } from "@/features/shop/options";
import { ShopDetailsSchema, type ShopDetailsInput, type ShopDetailsValues } from "@/features/shop/schema";
import { SETUP_FIELD, SETUP_LABEL, SETUP_SUBMIT } from "@/features/shop/styles";
import { consoleRoutes, legalLinks } from "@/lib/routes";

/**
 * Figma sign-up step 5 (the account exists by now): account type, shop name, shipping zone, how they heard about Fysi,
 * and the seller agreement. Business sellers also give a CAC ID and certificate. Submit asks to confirm the account
 * type (it can't be changed later); confirming creates the shop (pending approval) and shows "Your shop is ready!",
 * whose button opens the dashboard.
 */
export function ShopDetailsStep() {
	const router = useRouter();
	// Submit opens "Confirm your Account Type" with the checked answers; its Submit sends them. Then "Your shop is ready!".
	const [toConfirm, setToConfirm] = useState<ShopDetailsValues | null>(null);
	const [ready, setReady] = useState(false);
	const onboard = useOnboardShop({
		onCreated: () => {
			setToConfirm(null);
			setReady(true);
		},
	});
	const form = useForm<ShopDetailsInput, unknown, ShopDetailsValues>({
		resolver: zodResolver(ShopDetailsSchema),
		defaultValues: {
			account_type: undefined,
			shop_name: "",
			cac_id: "",
			shipping_zone: "",
			referral_source: "",
			cac_certificate: null,
			terms_accepted: false,
		},
	});
	// Business sellers also give their CAC registration (ID and certificate).
	const isBusiness = useWatch({ control: form.control, name: "account_type" }) === "business";

	return (
		<Form {...form}>
			<form noValidate onSubmit={form.handleSubmit(setToConfirm)} className="mt-6 flex flex-col lg:mt-[70px]">
				<FormField
					control={form.control}
					name="account_type"
					render={({ field }) => (
						<FormItem className="gap-0">
							<fieldset>
								<legend className="text-lg font-semibold text-ink lg:text-base">Account Type</legend>
								<div className="mt-5 grid grid-cols-2 lg:mt-6 lg:w-[382px]">
									{ACCOUNT_TYPES.map((type) => (
										<label key={type.value} className="flex w-fit cursor-pointer items-center gap-4 lg:gap-3">
											<input
												type="radio"
												name={field.name}
												value={type.value}
												checked={field.value === type.value}
												onChange={() => field.onChange(type.value)}
												onBlur={field.onBlur}
												className="peer sr-only"
											/>
											{/* Green ring and dot when chosen (Figma). */}
											<span
												aria-hidden
												className="grid size-5 place-items-center rounded-full border-[1.5px] border-grey-700 bg-white peer-checked:border-brand-light-green peer-focus-visible:ring-[3px] peer-focus-visible:ring-primary-300/40 peer-checked:[&>span]:block"
											>
												<span className="hidden size-2.5 rounded-full bg-brand-light-green" />
											</span>
											<span className="text-lg text-ink lg:text-base">{type.label}</span>
										</label>
									))}
								</div>
							</fieldset>
							<FormMessage className="mt-2" />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="shop_name"
					render={({ field }) => (
						<FormItem className="mt-8 gap-2">
							<FormLabel className={SETUP_LABEL}>Shop Name</FormLabel>
							<FormControl>
								<Input autoComplete="organization" placeholder="Enter your shop name" className={SETUP_FIELD} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{isBusiness && (
					<FormField
						control={form.control}
						name="cac_id"
						render={({ field }) => (
							<FormItem className="mt-6 gap-2">
								<FormLabel className={SETUP_LABEL}>CAC ID</FormLabel>
								<FormControl>
									<Input autoComplete="off" placeholder="Enter your CAC ID" className={SETUP_FIELD} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name="shipping_zone"
					render={({ field }) => (
						<FormItem className="mt-6 gap-2">
							<FormLabel className={SETUP_LABEL}>Shipping Zone</FormLabel>
							<FormControl>
								<NativeSelect placeholder="select your shipping zone" options={SHIPPING_ZONES} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="referral_source"
					render={({ field }) => (
						<FormItem className="mt-4 gap-2">
							<FormLabel className="sr-only">How did you hear about Fysi stores?</FormLabel>
							<FormControl>
								<NativeSelect placeholder="How did you hear about Fysi stores" options={REFERRAL_SOURCES} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{isBusiness && (
					<FormField
						control={form.control}
						name="cac_certificate"
						render={({ field, fieldState }) => (
							<FormItem className="mt-6 gap-2">
								<FormLabel className={SETUP_LABEL}>Upload CAC Certificate</FormLabel>
								<FormControl>
									<CertificateUpload
										value={field.value ?? null}
										onChange={field.onChange}
										onBlur={field.onBlur}
										invalid={!!fieldState.error}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name="terms_accepted"
					render={({ field }) => (
						<FormItem className="mt-5 gap-2">
							<div className="flex items-start gap-4 lg:gap-3">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={(checked) => field.onChange(checked === true)}
										className="mt-0.5 size-5 shrink-0 rounded-[3px] border-grey-700 bg-white shadow-none data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-500 [&_svg]:size-3.5"
									/>
								</FormControl>
								<FormLabel className="block text-lg leading-snug font-normal text-grey-900 lg:text-base">
									I hereby confirm that I have read and agreed to Fysi stores{" "}
									<Legal href={legalLinks.SELLER_CONTRACT}>sellers contracts</Legal>,{" "}
									<Legal href={legalLinks.SELLER_CODES}>codes</Legal>, <Legal href={legalLinks.SELLER_POLICIES}>policies</Legal>{" "}
									and guidelines, <Legal href={legalLinks.PRIVACY}>Privacy notice</Legal> and{" "}
									<Legal href={legalLinks.COOKIES}>cookies notice</Legal> referenced therein
								</FormLabel>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className={cn(SETUP_SUBMIT, "mt-11 lg:mt-[90px]")}>
					Submit
				</Button>
			</form>

			<ConfirmAccountTypeDialog
				open={toConfirm !== null}
				onOpenChange={(open) => !open && setToConfirm(null)}
				accountType={toConfirm?.account_type}
				isSubmitting={onboard.isPending}
				onConfirm={() => toConfirm && onboard.mutate(toConfirm)}
			/>
			<ShopReadyDialog open={ready} onContinue={() => router.replace(consoleRoutes.OVERVIEW)} />
		</Form>
	);
}

/** A legal link inside the agreement. Opens the storefront page in a new tab so the form keeps its answers. */
function Legal({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className="text-primary-500 hover:underline"
			onClick={(e) => e.stopPropagation()}
		>
			{children}
		</a>
	);
}
