"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { useRequestEmailCode, useVerifyEmail } from "@/features/auth/hooks";
import { VerifyCodeSchema, type VerifyCodeInput, type VerifyCodeValues } from "@/features/auth/schema";
import { SETUP_FIELD, SETUP_LABEL, SETUP_SECONDARY, SETUP_SUBMIT } from "@/features/shop/styles";
import { useToast } from "@/lib/use-toast";

/** Figma step 3: the address (read-only, "Edit" goes back), the code field, Verify and Resend Code. */
export function VerifyStep({
	email,
	onEdit,
	onVerified,
}: {
	email: string;
	onEdit: () => void;
	onVerified: (verification_token: string) => void;
}) {
	const toast = useToast();
	const verify = useVerifyEmail({ onVerified });
	const resend = useRequestEmailCode({ onSent: (message) => toast.success(message ?? `A new code is on its way to ${email}.`) });
	const form = useForm<VerifyCodeInput, unknown, VerifyCodeValues>({
		resolver: zodResolver(VerifyCodeSchema),
		defaultValues: { code: "" },
	});

	return (
		<Form {...form}>
			<form
				noValidate
				onSubmit={form.handleSubmit(({ code }) => verify.mutate({ email, code }))}
				className="mt-10 flex flex-col lg:mt-[60px]"
			>
				<div className="grid gap-2">
					<label htmlFor="signup-email" className={SETUP_LABEL}>
						E-mail address
					</label>
					<div className="relative">
						<Input id="signup-email" value={email} readOnly className={cn(SETUP_FIELD, "pr-16")} />
						<button
							type="button"
							onClick={onEdit}
							className="absolute top-1/2 right-4 -translate-y-1/2 text-base text-primary-500 hover:underline lg:text-sm"
						>
							Edit
						</button>
					</div>
				</div>

				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem className="mt-6 gap-2">
							<FormLabel className="sr-only">Verification code</FormLabel>
							<FormControl>
								<Input
									inputMode="numeric"
									autoComplete="one-time-code"
									placeholder="enter verification code"
									className={SETUP_FIELD}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" isLoading={verify.isPending} className={cn(SETUP_SUBMIT, "mt-48 lg:mt-20")}>
					Verify
				</Button>
				<Button
					type="button"
					variant="outline"
					isLoading={resend.isPending}
					onClick={() => resend.mutate(email)}
					className={cn(SETUP_SECONDARY, "mt-7")}
				>
					Resend Code
				</Button>
			</form>
		</Form>
	);
}
