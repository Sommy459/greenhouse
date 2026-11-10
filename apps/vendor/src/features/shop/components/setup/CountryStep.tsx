"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { cn } from "@repo/ui/lib/utils";
import { NativeSelect } from "@/features/shop/components/setup/NativeSelect";
import { COUNTRIES } from "@/features/shop/countries";
import { CountrySchema, type CountryValues } from "@/features/shop/schema";
import { SETUP_LABEL, SETUP_SUBMIT } from "@/features/shop/styles";
import { authRoutes } from "@/lib/routes";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));

/** Figma step 1: the country the seller is based in. */
export function CountryStep({ defaultValue = "", onNext }: { defaultValue?: string; onNext: (values: CountryValues) => void }) {
	const form = useForm<CountryValues>({ resolver: zodResolver(CountrySchema), defaultValues: { country: defaultValue } });

	return (
		<Form {...form}>
			<form noValidate onSubmit={form.handleSubmit(onNext)} className="mt-20 flex flex-col lg:mt-24">
				<FormField
					control={form.control}
					name="country"
					render={({ field }) => (
						<FormItem className="gap-2">
							<FormLabel className={SETUP_LABEL}>Country</FormLabel>
							<FormControl>
								<NativeSelect placeholder="select your country" options={COUNTRY_OPTIONS} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className={cn(SETUP_SUBMIT, "mt-[70px]")}>
					Next
				</Button>
				{/* Not in the design: returning sellers need a way to their account. */}
				<p className="mt-6 text-center text-sm text-grey-900">
					Already have a seller account?{" "}
					<Link href={authRoutes.SIGN_IN} className="font-medium text-primary-500 hover:underline">
						Sign in
					</Link>
				</p>
			</form>
		</Form>
	);
}
