"use client";

import { useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { useSaveAddress } from "@/features/account/hooks";
import { AddressSchema, type AddressValues } from "@/features/checkout/schema";

const FIELD =
	"h-[50px] rounded-md border-grey-600 bg-white px-3.5 text-sm shadow-none placeholder:text-grey-800 focus-visible:border-primary-300 focus-visible:ring-primary-300/40 md:text-sm";

function Field({
	control,
	name,
	label,
	className,
	...input
}: {
	control: Control<AddressValues>;
	name: keyof AddressValues;
	label: string;
	className?: string;
} & Omit<React.ComponentProps<typeof Input>, "name" | "className">) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={cn("gap-1.5", className)}>
					<FormLabel className="text-[13px] font-normal text-ink">{label}</FormLabel>
					<FormControl>
						<Input {...input} {...field} className={FIELD} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

/** The pencil on "Billing Address": edit the saved address (the same fields as checkout's delivery information). */
export function AddressDialog({
	open,
	onOpenChange,
	initial,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initial: AddressValues;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-md bg-white p-6 sm:max-w-[620px] sm:p-8">
				<DialogTitle className="text-xl font-medium text-ink">Billing address</DialogTitle>
				<DialogDescription className="text-sm text-grey-900">Where your orders are delivered.</DialogDescription>
				{/* Keyed form: it starts from the saved address every time the dialog opens. */}
				{open && <AddressForm initial={initial} onSaved={() => onOpenChange(false)} />}
			</DialogContent>
		</Dialog>
	);
}

function AddressForm({ initial, onSaved }: { initial: AddressValues; onSaved: () => void }) {
	const form = useForm<AddressValues>({ resolver: zodResolver(AddressSchema), defaultValues: initial });
	const save = useSaveAddress({ onSaved });
	const { control } = form;

	return (
		<Form {...form}>
			<form noValidate onSubmit={form.handleSubmit((values) => save.mutate(values))} className="mt-2 grid gap-4 sm:grid-cols-2">
				<Field control={control} name="first_name" label="First Name" autoComplete="given-name" />
				<Field control={control} name="last_name" label="Last Name" autoComplete="family-name" />
				<Field
					control={control}
					name="address"
					label="Address"
					placeholder="House number and street"
					autoComplete="street-address"
					className="sm:col-span-2"
				/>
				<Field control={control} name="city" label="City/Town" autoComplete="address-level2" />
				<Field
					control={control}
					name="zip_code"
					label="Zip Code"
					placeholder="Optional"
					autoComplete="postal-code"
					inputMode="numeric"
				/>
				<Field control={control} name="phone_number" label="Phone Number" type="tel" autoComplete="tel" />
				<Field control={control} name="email" label="Email Address" type="email" autoComplete="email" />
				<Button type="submit" isLoading={save.isPending} className="mt-2 h-12 rounded-md sm:col-span-2">
					Save address
				</Button>
			</form>
		</Form>
	);
}
