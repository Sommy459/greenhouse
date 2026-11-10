"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { SuccessDialog } from "@/components/SuccessDialog";
import { ImageUpload } from "@/features/products/components/ImageUpload";
import { useCreateCategory } from "@/features/products/hooks";
import { categorySchema, type CategoryValues } from "@/features/products/schema";
import { errorMessage } from "@/lib/api/client";
import { consoleRoutes } from "@/lib/routes";

const EMPTY: CategoryValues = { name: "", description: "", thumbnail: null };
const FIELD =
	"w-full rounded-md border bg-white px-4 text-base text-ink outline-none placeholder:text-grey-800 focus:border-primary-500 focus:ring-[3px] focus:ring-primary-300/30 lg:text-sm";
const CARD = "rounded-xl border border-grey-600 p-4 shadow-xs sm:p-6";
const SUBMIT = "h-14 w-full rounded-md text-base font-semibold";

/**
 * Figma "+ New Category" → "Add Category" (name, description, thumbnail, Submit) → "Category successfully created"
 * with a Home button. A failed submit keeps the form open with the API's message.
 */
export function NewCategoryDialog({ triggerClassName }: { triggerClassName: string }) {
	const router = useRouter();
	const [step, setStep] = useState<"closed" | "form" | "done">("closed");
	const create = useCreateCategory();
	const form = useForm<CategoryValues>({ resolver: zodResolver(categorySchema), defaultValues: EMPTY });
	const { errors } = form.formState;

	const close = () => {
		if (create.isPending) return;
		setStep("closed");
		form.reset(EMPTY);
		create.reset();
	};

	const onSubmit = form.handleSubmit((values) =>
		create.mutate(values, {
			onSuccess: () => {
				form.reset(EMPTY);
				setStep("done");
			},
		}),
	);

	return (
		<>
			<button type="button" className={triggerClassName} onClick={() => setStep("form")}>
				<Plus className="size-5" aria-hidden /> New Category
			</button>

			<Dialog open={step === "form"} onOpenChange={(open) => !open && close()}>
				<DialogContent
					showCloseButton={false}
					className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-2xl bg-white px-4 py-6 sm:max-w-[583px] sm:px-6 sm:py-10 lg:px-[55px]"
				>
					<div className="flex items-center justify-between">
						<DialogTitle className="text-2xl font-medium text-ink lg:text-[26px]">Add Category</DialogTitle>
						<DialogClose
							disabled={create.isPending}
							aria-label="Close"
							className="rounded-md p-1 text-ink hover:bg-grey-500 disabled:opacity-50"
						>
							<X className="size-6" />
						</DialogClose>
					</div>
					<DialogDescription className="sr-only">Name the category, describe it and add a thumbnail.</DialogDescription>

					<form noValidate onSubmit={onSubmit} className="mt-6 space-y-6 lg:mt-10">
						<fieldset className={CARD}>
							<legend className="float-left mb-4 text-lg font-medium text-ink lg:text-xl">General Information</legend>
							<div className="clear-both space-y-1.5">
								<label htmlFor="category-name" className="text-sm font-medium text-ink">
									Category Name
								</label>
								<input
									id="category-name"
									placeholder="Type category name here....."
									aria-invalid={!!errors.name}
									aria-describedby={errors.name ? "category-name-error" : undefined}
									className={`${FIELD} h-14 ${errors.name ? "border-error-500" : "border-grey-600"}`}
									{...form.register("name")}
								/>
								{errors.name && (
									<p id="category-name-error" className="text-xs text-error-500">
										{errors.name.message}
									</p>
								)}
							</div>
							<div className="mt-4 space-y-1.5">
								<label htmlFor="category-description" className="text-sm font-medium text-ink">
									Description
								</label>
								<textarea
									id="category-description"
									placeholder="Type category description here. . ."
									rows={6}
									aria-invalid={!!errors.description}
									aria-describedby={errors.description ? "category-description-error" : undefined}
									className={`${FIELD} resize-none py-3 ${errors.description ? "border-error-500" : "border-grey-600"}`}
									{...form.register("description")}
								/>
								{errors.description && (
									<p id="category-description-error" className="text-xs text-error-500">
										{errors.description.message}
									</p>
								)}
							</div>
						</fieldset>

						<fieldset className={CARD}>
							<legend className="float-left mb-5 text-lg font-medium text-ink lg:text-xl">Thumbnail</legend>
							<div className="clear-both">
								<Controller
									control={form.control}
									name="thumbnail"
									render={({ field, fieldState }) => (
										<ImageUpload
											id="category-thumbnail"
											value={field.value}
											onChange={(file) => {
												field.onChange(file);
												form.clearErrors("thumbnail");
											}}
											onReject={(message) => form.setError("thumbnail", { message })}
											invalid={!!fieldState.error}
											describedBy={fieldState.error ? "category-thumbnail-error" : undefined}
										/>
									)}
								/>
								{errors.thumbnail && (
									<p id="category-thumbnail-error" className="mt-1.5 text-xs text-error-500">
										{errors.thumbnail.message}
									</p>
								)}
							</div>
						</fieldset>

						{create.isError && (
							<p role="alert" className="rounded-md bg-error-50 px-4 py-3 text-sm text-error-700">
								{errorMessage(create.error)}
							</p>
						)}

						<Button type="submit" isLoading={create.isPending} className={SUBMIT}>
							Submit
						</Button>
					</form>
				</DialogContent>
			</Dialog>

			<SuccessDialog
				open={step === "done"}
				onClose={close}
				title="Category successfully created"
				description="Vendors can now list products under it."
				action={{
					label: "Home",
					onClick: () => {
						close();
						router.push(consoleRoutes.OVERVIEW);
					},
				}}
			/>
		</>
	);
}
