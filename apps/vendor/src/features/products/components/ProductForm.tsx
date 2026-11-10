"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm, type FieldError } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { SuccessDialog } from "@/components/SuccessDialog";
import { ImageUpload } from "@/features/products/components/ImageUpload";
import { useCategories, useCreateProduct, useMyCertifications } from "@/features/products/hooks";
import { COLOURS, WARRANTY_DURATIONS, WARRANTY_TYPES } from "@/features/products/options";
import { emptyProduct, emptyVariant, PRODUCT_IMAGE_SLOTS, productSchema, type ProductValues } from "@/features/products/schema";
import { errorMessage } from "@/lib/api/client";
import { consoleRoutes } from "@/lib/routes";

const INPUT =
	"h-[55px] w-full rounded-md border bg-white px-4 text-base text-ink outline-none placeholder:text-grey-800 focus:border-primary-500 focus:ring-[3px] focus:ring-primary-300/30 disabled:bg-grey-500 lg:text-sm";
const border = (error?: FieldError) => (error ? "border-error-500" : "border-grey-600");

/** The form's id, so the page header's "Add Product" button can submit it. */
export const PRODUCT_FORM_ID = "add-product";

/** Figma Vendor Hub "Add Products": information, six photos, variants, specification and pricing, then Submit. */
export function ProductForm() {
	const router = useRouter();
	const [done, setDone] = useState(false);
	const categories = useCategories();
	const create = useCreateProduct();
	const certificates = useMyCertifications();
	const certificateOptions = [
		{ value: "none", label: "None" },
		...(certificates.data ?? []).map((c) => ({
			value: c.id,
			label: `${c.name} · ${c.status === "verified" ? "Verified" : "Awaiting review"}`,
		})),
	];
	const form = useForm<ProductValues>({ resolver: zodResolver(productSchema), defaultValues: emptyProduct });
	const { errors } = form.formState;
	const variants = useFieldArray({ control: form.control, name: "variants" });
	const register = form.register;

	// The header's "Add Product" also submits this form: ignore a second press while one is sending.
	const onSubmit = form.handleSubmit((values) =>
		create.isPending
			? undefined
			: create.mutate(values, {
					onSuccess: () => {
						form.reset(emptyProduct);
						setDone(true);
					},
				}),
	);

	return (
		<>
			<form id={PRODUCT_FORM_ID} noValidate onSubmit={onSubmit} className="mt-6 space-y-6 lg:mt-10">
				<Section title="Product Information" index={0}>
					<div className="grid gap-x-12 gap-y-4 lg:grid-cols-2">
						<div className="space-y-4">
							<Field id="name" label="Name" error={errors.name}>
								<input
									id="name"
									placeholder="Name of the Product"
									className={clsx(INPUT, border(errors.name))}
									{...aria("name", errors.name)}
									{...register("name")}
								/>
							</Field>
							<Field id="brand" label="Brand" error={errors.brand}>
								<input
									id="brand"
									placeholder="enter Brand Name"
									className={clsx(INPUT, border(errors.brand))}
									{...aria("brand", errors.brand)}
									{...register("brand")}
								/>
							</Field>
							<Field id="description" label="Product Description" error={errors.description}>
								<textarea
									id="description"
									rows={6}
									placeholder="Enter a description..."
									className={clsx(INPUT, "h-auto resize-y py-3", border(errors.description))}
									{...aria("description", errors.description)}
									{...register("description")}
								/>
							</Field>
						</div>
						<div className="space-y-4">
							<Field
								id="category"
								label="Category"
								error={
									errors.category ??
									(categories.isError ? { type: "load", message: "Couldn't load categories. Reload the page." } : undefined)
								}
							>
								<Controller
									control={form.control}
									name="category"
									render={({ field }) => (
										<SelectBox
											id="category"
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											ref={field.ref}
											error={errors.category}
											disabled={!categories.data}
											placeholder={categories.isPending ? "Loading categories…" : "Select Category"}
											options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
										/>
									)}
								/>
							</Field>
							<Field id="colour" label="Colour" error={errors.colour}>
								<Controller
									control={form.control}
									name="colour"
									render={({ field }) => (
										<SelectBox
											id="colour"
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											ref={field.ref}
											placeholder="Select colour"
											options={COLOURS.map((c) => ({
												value: c.value,
												label: (
													<span className="flex items-center gap-2">
														<span aria-hidden className={clsx("size-3.5 rounded-full", c.swatch)} />
														{c.label}
													</span>
												),
											}))}
										/>
									)}
								/>
							</Field>
							<Field id="weight" label="Weight (Kg)" error={errors.weight}>
								<input
									id="weight"
									inputMode="decimal"
									placeholder="enter weight"
									className={clsx(INPUT, border(errors.weight))}
									{...aria("weight", errors.weight)}
									{...register("weight")}
								/>
							</Field>
						</div>
					</div>
				</Section>

				<Section title="Upload Product Images" index={1} hint="The first photo is the main one customers see.">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-5">
						{Array.from({ length: PRODUCT_IMAGE_SLOTS }, (_, i) => (
							<Controller
								key={i}
								control={form.control}
								name={`images.${i}`}
								render={({ field }) => (
									<ImageUpload
										id={`image-${i}`}
										dashed
										label={`product image ${i + 1}`}
										value={field.value ?? null}
										onChange={(file) => {
											field.onChange(file);
											form.clearErrors("images");
										}}
										onReject={(message) => form.setError("images", { message: `Image ${i + 1}: ${message}` })}
										invalid={!!errors.images}
										describedBy={errors.images ? "images-error" : undefined}
									/>
								)}
							/>
						))}
					</div>
					<ErrorText id="images-error" error={errors.images?.root ?? (errors.images as FieldError | undefined)} />
				</Section>

				<Section title="Variants" index={2}>
					<ul className="space-y-4">
						{variants.fields.map((row, i) => {
							const e = errors.variants?.[i];
							return (
								<li key={row.id} className="flex items-start gap-3">
									<div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
										<Field id={`variation-${i}`} label="Variation" error={e?.variation}>
											<input
												id={`variation-${i}`}
												placeholder="variation"
												className={clsx(INPUT, border(e?.variation))}
												{...aria(`variation-${i}`, e?.variation)}
												{...register(`variants.${i}.variation`)}
											/>
										</Field>
										<Field id={`sku-${i}`} label="Seller SKU" error={e?.sku}>
											<input
												id={`sku-${i}`}
												placeholder="enter product SKU"
												className={clsx(INPUT, border(e?.sku))}
												{...aria(`sku-${i}`, e?.sku)}
												{...register(`variants.${i}.sku`)}
											/>
										</Field>
										<Field id={`barcode-${i}`} label="Barcode" error={e?.barcode}>
											<input
												id={`barcode-${i}`}
												inputMode="numeric"
												placeholder="enter bar code"
												className={clsx(INPUT, border(e?.barcode))}
												{...aria(`barcode-${i}`, e?.barcode)}
												{...register(`variants.${i}.barcode`)}
											/>
										</Field>
										<Field id={`quantity-${i}`} label="Quantity" error={e?.quantity}>
											<input
												id={`quantity-${i}`}
												inputMode="numeric"
												placeholder="enter product quantity"
												className={clsx(INPUT, border(e?.quantity))}
												{...aria(`quantity-${i}`, e?.quantity)}
												{...register(`variants.${i}.quantity`)}
											/>
										</Field>
									</div>
									{variants.fields.length > 1 && (
										<button
											type="button"
											onClick={() => variants.remove(i)}
											aria-label={`Remove variation ${i + 1}`}
											className="mt-7 grid size-[55px] shrink-0 place-items-center rounded-md border border-grey-600 text-grey-900 transition-colors hover:border-error-500 hover:text-error-500"
										>
											<Trash2 className="size-5" />
										</button>
									)}
								</li>
							);
						})}
					</ul>
					<button
						type="button"
						onClick={() => variants.append(emptyVariant)}
						disabled={variants.fields.length >= 20}
						className="mt-6 inline-flex h-[55px] items-center gap-2 rounded-md bg-primary-500 px-5 text-base font-medium text-white transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lg active:scale-95 disabled:bg-primary-300 motion-reduce:hover:translate-y-0"
					>
						<Plus className="size-5" aria-hidden /> Add Variation
					</button>
				</Section>

				<Section title="Product Specification" index={3}>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<Field
							id="certifications"
							label="Certifications"
							error={errors.certifications}
							hint="Only a certificate Fysi has verified puts the eco badge on this product."
						>
							<Controller
								control={form.control}
								name="certifications"
								render={({ field }) => (
									<SelectBox
										id="certifications"
										value={field.value || "none"}
										onChange={(v) => field.onChange(v === "none" ? "" : v)}
										onBlur={field.onBlur}
										ref={field.ref}
										placeholder={certificates.isPending ? "Loading certificates…" : "certifications"}
										options={certificateOptions}
									/>
								)}
							/>
						</Field>
						<Field id="model" label="Model" error={errors.model}>
							<input
								id="model"
								placeholder="Model ID"
								className={clsx(INPUT, border(errors.model))}
								{...aria("model", errors.model)}
								{...register("model")}
							/>
						</Field>
						<Field id="material" label="Material Family" error={errors.material}>
							<input
								id="material"
								placeholder="material family of product"
								className={clsx(INPUT, border(errors.material))}
								{...aria("material", errors.material)}
								{...register("material")}
							/>
						</Field>
						<Field id="size" label="Size(L× W × H cm)" error={errors.size}>
							<input
								id="size"
								placeholder="enter size"
								className={clsx(INPUT, border(errors.size))}
								{...aria("size", errors.size)}
								{...register("size")}
							/>
						</Field>
						<Field id="warranty_duration" label="Warranty Duration" error={errors.warranty_duration}>
							<Controller
								control={form.control}
								name="warranty_duration"
								render={({ field }) => (
									<SelectBox
										id="warranty_duration"
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										ref={field.ref}
										placeholder="Select warranty year"
										options={WARRANTY_DURATIONS}
									/>
								)}
							/>
						</Field>
						<Field id="warranty_type" label="Warranty Type" error={errors.warranty_type}>
							<Controller
								control={form.control}
								name="warranty_type"
								render={({ field }) => (
									<SelectBox
										id="warranty_type"
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										ref={field.ref}
										placeholder="type of warranty service"
										options={WARRANTY_TYPES}
									/>
								)}
							/>
						</Field>
						<Field id="product_line" label="Product Line" error={errors.product_line}>
							<input
								id="product_line"
								placeholder="Product Line/Range/Sub-brand"
								className={clsx(INPUT, border(errors.product_line))}
								{...aria("product_line", errors.product_line)}
								{...register("product_line")}
							/>
						</Field>
						<Field id="notes" label="Note/Comments" error={errors.notes}>
							<input
								id="notes"
								placeholder="enter notes or comments"
								className={clsx(INPUT, border(errors.notes))}
								{...aria("notes", errors.notes)}
								{...register("notes")}
							/>
						</Field>
					</div>
				</Section>

				<Section title="Pricing" index={4}>
					<div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
						<Field id="base_price" label="Base Price" error={errors.base_price}>
							<NairaInput id="base_price" placeholder="enter base price" error={errors.base_price} {...register("base_price")} />
						</Field>
						<Field id="sale_price" label="Sale Price" error={errors.sale_price}>
							<NairaInput id="sale_price" placeholder="enter sales price" error={errors.sale_price} {...register("sale_price")} />
						</Field>
						<Field id="sale_start" label="Sales Start Date" error={errors.sale_start}>
							<input
								id="sale_start"
								type="date"
								className={clsx(INPUT, border(errors.sale_start))}
								{...aria("sale_start", errors.sale_start)}
								{...register("sale_start")}
							/>
						</Field>
						<Field id="sale_end" label="Sales End Date ( If Any)" error={errors.sale_end}>
							<input
								id="sale_end"
								type="date"
								className={clsx(INPUT, border(errors.sale_end))}
								{...aria("sale_end", errors.sale_end)}
								{...register("sale_end")}
							/>
						</Field>
					</div>
				</Section>

				{create.isError && (
					<p role="alert" className="rounded-md bg-error-50 px-4 py-3 text-sm text-error-700">
						{errorMessage(create.error)}
					</p>
				)}
				{Object.keys(errors).length > 0 && (
					<p role="alert" className="text-sm text-error-500">
						Some fields need attention. They&apos;re marked in red above.
					</p>
				)}

				<Button type="submit" isLoading={create.isPending} className="h-14 rounded-md text-base font-semibold">
					Submit
				</Button>
			</form>

			<SuccessDialog
				open={done}
				onClose={() => setDone(false)}
				title="Your product is live"
				description="Customers can find it in the store now. The eco badge shows once Fysi has verified its certificate."
				action={{ label: "View Products", onClick: () => router.push(consoleRoutes.PRODUCTS) }}
			/>
		</>
	);
}

/** aria-invalid and aria-describedby for an input with an error (and, optionally, a hint). */
function aria(id: string, error?: FieldError, hint = false) {
	const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ");
	return { "aria-invalid": !!error, "aria-describedby": describedBy || undefined };
}

function Section({ title, index, hint, children }: { title: string; index: number; hint?: string; children: React.ReactNode }) {
	return (
		<section
			className="animate-rise rounded-md border border-grey-600 bg-white p-4 sm:p-6"
			style={{ "--i": index } as React.CSSProperties}
			aria-label={title}
		>
			<h2 className="text-lg font-medium text-ink lg:text-xl">{title}</h2>
			{hint && <p className="mt-1 text-sm text-grey-900">{hint}</p>}
			<div className="mt-5">{children}</div>
		</section>
	);
}

function Field({
	id,
	label,
	error,
	hint,
	children,
}: {
	id: string;
	label: string;
	error?: FieldError;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="min-w-0 space-y-1.5">
			<label htmlFor={id} className="block text-sm font-medium text-ink">
				{label}
			</label>
			{children}
			{hint && !error && (
				<p id={`${id}-hint`} className="text-xs text-grey-900">
					{hint}
				</p>
			)}
			<ErrorText id={`${id}-error`} error={error} />
		</div>
	);
}

function ErrorText({ id, error }: { id: string; error?: FieldError }) {
	if (!error?.message) return null;
	return (
		<p id={id} className="mt-1.5 text-xs text-error-500">
			{error.message}
		</p>
	);
}

interface SelectBoxProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
	onBlur: () => void;
	ref: React.Ref<HTMLButtonElement>;
	placeholder: string;
	options: { value: string; label: React.ReactNode }[];
	error?: FieldError;
	disabled?: boolean;
}

function SelectBox({ id, value, onChange, onBlur, ref, placeholder, options, error, disabled }: SelectBoxProps) {
	return (
		<Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
			<SelectTrigger
				id={id}
				ref={ref}
				onBlur={onBlur}
				aria-invalid={!!error}
				aria-describedby={error ? `${id}-error` : undefined}
				className={clsx(
					"!h-[55px] w-full rounded-md bg-white px-4 text-base text-ink shadow-none data-[placeholder]:text-grey-800 lg:text-sm [&_svg]:!size-5 [&_svg]:!text-ink [&_svg]:!opacity-100",
					border(error),
				)}
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent position="popper" sideOffset={6} className="max-h-72 w-[var(--radix-select-trigger-width)]">
				{options.map((o) => (
					<SelectItem key={o.value} value={o.value}>
						{o.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

/** A whole-naira amount with a ₦ in front. Digits only. */
function NairaInput({ id, error, ...props }: React.ComponentProps<"input"> & { id: string; error?: FieldError }) {
	return (
		<div
			className={clsx(
				"flex h-[55px] items-center rounded-md border bg-white focus-within:border-primary-500 focus-within:ring-[3px] focus-within:ring-primary-300/30",
				border(error),
			)}
		>
			<span aria-hidden className="pl-4 text-base text-grey-900 lg:text-sm">
				₦
			</span>
			<input
				id={id}
				inputMode="numeric"
				aria-invalid={!!error}
				aria-describedby={error ? `${id}-error` : undefined}
				className="h-full min-w-0 flex-1 rounded-md bg-transparent px-2 text-base text-ink outline-none placeholder:text-grey-800 lg:text-sm"
				{...props}
			/>
		</div>
	);
}
