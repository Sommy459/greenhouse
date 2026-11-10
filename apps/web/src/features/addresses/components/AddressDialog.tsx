"use client";

import { useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { useSaveAddress } from "@/features/addresses/hooks";
import type { SavedAddress } from "@/features/addresses/types";
import { CheckoutSchema, normalisePhone } from "@/features/checkout/schema";
import { NIGERIAN_STATES } from "@/features/orders/types";

const AddressSchema = CheckoutSchema.extend({ label: z.string().trim().max(40, "Too long"), isDefault: z.boolean() });
type AddressValues = z.infer<typeof AddressSchema>;

const FIELD =
	"h-[50px] rounded-md border-grey-600 bg-white px-3.5 text-sm shadow-none placeholder:text-grey-800 focus-visible:border-primary-300 focus-visible:ring-primary-300/40 md:text-sm";
const LABEL = "text-[13px] font-normal text-ink";

/** Add or edit a saved address (the same fields as checkout's delivery information, plus a label and "default"). */
export function AddressDialog({
	open,
	onOpenChange,
	address,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	address?: SavedAddress;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-md bg-white p-6 sm:max-w-[620px] sm:p-8">
				<DialogTitle className="text-xl font-medium text-ink">{address ? "Edit address" : "Add an address"}</DialogTitle>
				<DialogDescription className="text-sm text-grey-900">Where your orders are delivered.</DialogDescription>
				{open && <AddressForm address={address} onSaved={() => onOpenChange(false)} />}
			</DialogContent>
		</Dialog>
	);
}

function AddressForm({ address, onSaved }: { address?: SavedAddress; onSaved: () => void }) {
	const save = useSaveAddress();
	const form = useForm<AddressValues>({
		resolver: zodResolver(AddressSchema),
		defaultValues: {
			recipientName: address?.recipientName ?? "",
			phone: address?.phone ?? "",
			line1: address?.line1 ?? "",
			line2: address?.line2 ?? "",
			city: address?.city ?? "",
			state: address?.state,
			notes: address?.notes ?? "",
			label: address?.label ?? "",
			isDefault: address?.isDefault ?? false,
		},
	});
	const { control } = form;

	return (
		<Form {...form}>
			<form
				noValidate
				onSubmit={form.handleSubmit((v) =>
					save.mutate(
						{
							id: address?.id,
							recipientName: v.recipientName,
							phone: normalisePhone(v.phone),
							line1: v.line1,
							line2: v.line2 || null,
							city: v.city,
							state: v.state,
							notes: v.notes || null,
							label: v.label || null,
							isDefault: v.isDefault,
						},
						{ onSuccess: onSaved },
					),
				)}
				className="mt-2 grid gap-4 sm:grid-cols-2"
			>
				<Field control={control} name="label" label="Label (optional)" placeholder="e.g. Home, Office" />
				<Field control={control} name="recipientName" label="Full name" autoComplete="name" />
				<Field control={control} name="phone" label="Mobile number" type="tel" autoComplete="tel" />
				<Field
					control={control}
					name="line1"
					label="Address"
					placeholder="House number and street"
					autoComplete="address-line1"
					className="sm:col-span-2"
				/>
				<Field
					control={control}
					name="line2"
					label="Apartment, landmark (optional)"
					autoComplete="address-line2"
					className="sm:col-span-2"
				/>
				<Field control={control} name="city" label="City/Town" autoComplete="address-level2" />
				<FormField
					control={control}
					name="state"
					render={({ field }) => (
						<FormItem className="gap-1.5">
							<FormLabel className={LABEL}>State</FormLabel>
							<FormControl>
								<select {...field} value={field.value ?? ""} className={cn(FIELD, "w-full border px-3 outline-none")}>
									<option value="" disabled>
										Choose a state
									</option>
									{NIGERIAN_STATES.map((s) => (
										<option key={s} value={s}>
											{s}
										</option>
									))}
								</select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Field control={control} name="notes" label="Delivery notes (optional)" className="sm:col-span-2" />
				<FormField
					control={control}
					name="isDefault"
					render={({ field }) => (
						<FormItem className="flex items-center gap-2 sm:col-span-2">
							<FormControl>
								<Checkbox checked={field.value} onCheckedChange={(on) => field.onChange(on === true)} />
							</FormControl>
							<FormLabel className="text-sm font-normal text-ink">Use as my default address</FormLabel>
						</FormItem>
					)}
				/>
				<Button type="submit" isLoading={save.isPending} className="mt-2 h-12 rounded-md sm:col-span-2">
					Save address
				</Button>
			</form>
		</Form>
	);
}

type TextName = Exclude<keyof AddressValues, "state" | "isDefault">;

function Field({
	control,
	name,
	label,
	className,
	...input
}: { control: Control<AddressValues>; name: TextName; label: string; className?: string } & Omit<
	React.ComponentProps<typeof Input>,
	"name" | "className"
>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={cn("gap-1.5", className)}>
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
