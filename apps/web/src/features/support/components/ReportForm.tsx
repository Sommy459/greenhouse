"use client";

import { useState, useSyncExternalStore } from "react";
import { useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { FeedbackSentDialog } from "@/components/FeedbackSent";
import { useSession } from "@/features/auth/session";
import { useSubmitReport } from "@/features/support/hooks";
import { ISSUE_TYPES, RESOLUTIONS, ReportSchema, type ReportValues } from "@/features/support/report";

const FIELD =
	"h-[55px] w-full rounded-md border border-grey-600 bg-white px-4 text-sm text-ink shadow-none outline-none placeholder:text-grey-800 focus-visible:border-primary-300 focus-visible:ring-[3px] focus-visible:ring-primary-300/40 md:text-sm lg:text-[15px]";
const LABEL = "text-[15px] font-normal text-ink";

/**
 * Figma Report a Product / Problem (C13). Signed-in customers get their name and email filled in. Sending shows the
 * "Thank you! Your feedback has been sent" pop-up, and the form clears for another report. `orderNumber` comes from
 * "Report a problem" on an order.
 */
export function ReportForm({ orderNumber = "" }: { orderNumber?: string }) {
	// The session is read from the browser: wait for it so the name and email can be filled in without a mismatch.
	const ready = useSyncExternalStore(subscribe, hydrated, () => false);
	if (!ready) return <div className="h-[760px] animate-pulse rounded-md bg-grey-600 lg:mx-auto lg:max-w-[1011px]" aria-hidden />;
	return <ReportFormFields orderNumber={orderNumber} />;
}

const subscribe = (onChange: () => void) => useSession.persist.onFinishHydration(onChange);
const hydrated = () => useSession.persist.hasHydrated();

function ReportFormFields({ orderNumber }: { orderNumber: string }) {
	const user = useSession((s) => s.user);
	const [sent, setSent] = useState(false);
	const defaults: ReportValues = {
		name: user?.name ?? "",
		email: user?.email ?? "",
		issue_type: "",
		order_number: orderNumber,
		product_name: "",
		description: "",
		preferred_resolution: "",
		comments: "",
	};
	const form = useForm<ReportValues>({ resolver: zodResolver(ReportSchema), defaultValues: defaults });
	const submit = useSubmitReport({
		onSent: () => {
			setSent(true);
			form.reset({ ...defaults, name: form.getValues("name"), email: form.getValues("email") });
		},
	});

	return (
		<>
			<Form {...form}>
				<form
					noValidate
					onSubmit={form.handleSubmit((values) => !submit.isPending && submit.mutate(values))}
					className="animate-rise flex flex-col gap-4 lg:mx-auto lg:max-w-[1011px] lg:rounded-md lg:border lg:border-primary-500 lg:bg-white lg:px-9 lg:pt-6 lg:pb-6"
				>
					<TextField control={form.control} name="name" label="Name" placeholder="Enter your name" autoComplete="name" />
					<TextField
						control={form.control}
						name="email"
						label="Email Address"
						placeholder="Enter your email address"
						autoComplete="email"
						type="email"
					/>
					<SelectField
						control={form.control}
						name="issue_type"
						label="Issue Type"
						placeholder="Choose an issue type"
						options={ISSUE_TYPES}
					/>
					<TextField
						control={form.control}
						name="order_number"
						label="Order Number"
						placeholder="Please enter the order number related to the issue"
					/>
					<TextField
						control={form.control}
						name="product_name"
						label="Product Name"
						placeholder="Please specify the product name if applicable"
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem className="gap-2">
								<FormLabel className={LABEL}>Description of the Issue</FormLabel>
								<FormControl>
									<textarea
										{...field}
										rows={2}
										placeholder="Please describe the issue in detail"
										className={cn(FIELD, "h-auto min-h-[55px] resize-y py-4")}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<SelectField
						control={form.control}
						name="preferred_resolution"
						label="Preferred Resolution"
						placeholder="Choose a preferred resolution"
						options={RESOLUTIONS}
						menuClassName="min-w-[180px]"
						itemClassName="pl-10"
					/>
					<TextField
						control={form.control}
						name="comments"
						label="Additional Comments"
						placeholder="Any additional information you would like to provide"
					/>

					{/* Mobile reads "What Happens Next?" before Submit (Figma); desktop shows it below the card. */}
					<div className="mt-4 lg:hidden">
						<WhatHappensNext />
					</div>

					<Button
						type="submit"
						isLoading={submit.isPending}
						className="mt-2 h-[55px] w-full rounded-lg text-lg font-semibold lg:mt-3 lg:text-base"
					>
						Submit
					</Button>
				</form>
			</Form>

			<div className="mt-9 hidden lg:block">
				<WhatHappensNext />
			</div>

			<FeedbackSentDialog open={sent} onOpenChange={setSent} />
		</>
	);
}

export function WhatHappensNext() {
	return (
		<section aria-labelledby="next-title" className="animate-reveal">
			<h2 id="next-title" className="text-[26px] font-semibold text-ink lg:text-[30px]">
				What Happens Next?
			</h2>
			<p className="mt-1 text-[15px] leading-snug text-ink lg:text-[19px]">
				Once you submit your report, our support team will review the details and get back to you within 24-48 hours. We&apos;ll
				work closely with you to resolve the issue as quickly as possible.
			</p>
		</section>
	);
}

type TextName = Exclude<keyof ReportValues, "issue_type" | "preferred_resolution" | "description">;

function TextField({
	control,
	name,
	label,
	...input
}: { control: Control<ReportValues>; name: TextName; label: string } & Omit<React.ComponentProps<typeof Input>, "name">) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className="gap-2">
					<FormLabel className={LABEL}>{label}</FormLabel>
					<FormControl>
						<Input {...input} {...field} className={FIELD} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

/**
 * The design's dropdown (Figma issue type dropdown): a field with a chevron that opens a light card of options. Built on
 * the UI kit's Select, so it works with the keyboard and screen readers.
 */
function SelectField({
	control,
	name,
	label,
	placeholder,
	options,
	menuClassName,
	itemClassName,
}: {
	control: Control<ReportValues>;
	name: "issue_type" | "preferred_resolution";
	label: string;
	placeholder: string;
	options: readonly { value: string; label: string }[];
	/** Each Figma dropdown has its own card width and text inset. */
	menuClassName?: string;
	itemClassName?: string;
}) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className="gap-2">
					<FormLabel className={LABEL}>{label}</FormLabel>
					<Select value={field.value} onValueChange={field.onChange} name={field.name}>
						<FormControl>
							<SelectTrigger
								onBlur={field.onBlur}
								ref={field.ref}
								className={cn(
									FIELD,
									"cursor-pointer justify-between data-placeholder:text-grey-800 data-[size=default]:h-[55px] [&>svg]:size-6 [&>svg]:text-ink [&>svg]:opacity-100",
								)}
							>
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>
						</FormControl>
						<SelectContent
							align="start"
							sideOffset={6}
							className={cn("min-w-[217px] rounded-[7px] border-grey-600 bg-grey-500 p-0 shadow-lg", menuClassName)}
						>
							{options.map((o) => (
								<SelectItem
									key={o.value}
									value={o.value}
									className={cn(
										"cursor-pointer rounded-md px-4 py-2.5 text-[15px] text-ink focus:bg-grey-600 focus:text-ink",
										itemClassName,
									)}
								>
									{o.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
