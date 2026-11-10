"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { useRequestEmailCode } from "@/features/auth/hooks";
import { EmailSchema, type EmailValues } from "@/features/auth/schema";
import { BackLink } from "@/features/shop/components/setup/BackLink";
import { SETUP_FIELD, SETUP_LABEL, SETUP_SUBMIT } from "@/features/shop/styles";

/** Figma step 2: the account e-mail. Next sends a verification code, then opens step 3. */
export function EmailStep({
	defaultValue = "",
	onBack,
	onNext,
}: {
	defaultValue?: string;
	onBack: () => void;
	onNext: (values: EmailValues) => void;
}) {
	const form = useForm<EmailValues>({ resolver: zodResolver(EmailSchema), defaultValues: { email: defaultValue } });
	const requestCode = useRequestEmailCode();

	const onSubmit = ({ email }: EmailValues) => {
		const normalised = email.trim().toLowerCase();
		requestCode.mutate(normalised, { onSuccess: () => onNext({ email: normalised }) });
	};

	return (
		<Form {...form}>
			{/* mt is step 1's minus the Back link, so the field sits where the design puts it. */}
			<form noValidate onSubmit={form.handleSubmit(onSubmit)} className="mt-11 flex flex-col lg:mt-[60px]">
				<BackLink onClick={onBack} />
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="gap-2">
							<FormLabel className={SETUP_LABEL}>E-mail Address</FormLabel>
							<FormControl>
								<Input
									type="email"
									autoComplete="email"
									placeholder="enter your e-mail address"
									className={SETUP_FIELD}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" isLoading={requestCode.isPending} className={cn(SETUP_SUBMIT, "mt-[70px]")}>
					Next
				</Button>
			</form>
		</Form>
	);
}
