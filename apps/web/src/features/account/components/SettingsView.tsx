"use client";

import clsx from "clsx";
import Link from "next/link";
import { useId, useState } from "react";
import { useForm, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, CloudUpload, Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { Avatar } from "@/features/account/components/Avatar";
import { useChangePassword, useUpdateProfile } from "@/features/account/hooks";
import {
	ChangePasswordSchema,
	PASSWORD_HINT,
	PersonalInfoSchema,
	PHOTO_MAX_BYTES,
	PHOTO_TYPES,
	type ChangePasswordValues,
	type PersonalInfoValues,
} from "@/features/account/schema";
import { useSession } from "@/features/auth/session";
import { accountRoutes } from "@/lib/routes";

const FIELD =
	"h-11 rounded-lg border-grey-600 bg-white px-3.5 text-base shadow-none placeholder:text-grey-800 focus-visible:border-primary-300 focus-visible:ring-primary-300/40 md:text-base";
const LABEL = "text-sm font-medium text-ink";
const CARD = "rounded-xl border border-grey-600 bg-white";
const OUTLINE = "h-11 rounded-lg border-grey-600 bg-white px-4 text-ink hover:bg-grey-500";

/**
 * Figma "Settings": Personal info (name, email and photo) and Password. Each card saves on its own; Cancel puts back
 * what's saved. The photo is checked here (type and size) before it's sent.
 */
export function SettingsView() {
	return (
		<div className="pb-6 lg:pb-16">
			<Link href={accountRoutes.DASHBOARD} className="mb-8 inline-flex items-center gap-3 text-lg text-ink lg:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				<h1>Settings</h1>
			</Link>
			<h1 className="hidden lg:block lg:sr-only">Settings</h1>
			<PersonalInfo />
			<Password />
		</div>
	);
}

function PersonalInfo() {
	const user = useSession((s) => s.user);
	const saved: PersonalInfoValues = {
		first_name: user?.first_name ?? "",
		last_name: user?.last_name ?? "",
		email: user?.email ?? "",
	};
	const form = useForm<PersonalInfoValues>({ resolver: zodResolver(PersonalInfoSchema), values: saved });
	const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
	const [photoError, setPhotoError] = useState<string | null>(null);
	const [dragging, setDragging] = useState(false);
	const hintId = useId();

	const clearPhoto = () => {
		if (photo) URL.revokeObjectURL(photo.url);
		setPhoto(null);
		setPhotoError(null);
	};
	const update = useUpdateProfile({ onSaved: clearPhoto });

	const choose = (file: File | undefined) => {
		if (!file) return;
		if (!PHOTO_TYPES.includes(file.type)) return setPhotoError("Choose an SVG, PNG, JPG or GIF image.");
		if (file.size > PHOTO_MAX_BYTES) return setPhotoError("That image is over 5 MB. Choose a smaller one.");
		if (photo) URL.revokeObjectURL(photo.url);
		setPhotoError(null);
		setPhoto({ file, url: URL.createObjectURL(file) });
	};

	return (
		<section aria-labelledby="personal-info">
			<h2 id="personal-info" className="text-base font-medium text-ink">
				Personal info
			</h2>
			<p className="text-base text-grey-900">Update your photo and personal details.</p>

			<Form {...form}>
				<form
					noValidate
					onSubmit={form.handleSubmit((values) => update.mutate({ values, photo: photo?.file ?? null }))}
					className={clsx(CARD, "mt-7")}
				>
					<div className="grid gap-5 p-5 md:grid-cols-2 md:gap-x-6">
						<TextField control={form.control} name="first_name" label="First name" autoComplete="given-name" />
						<TextField control={form.control} name="last_name" label="Last name" autoComplete="family-name" />
						<TextField
							control={form.control}
							name="email"
							label="Email address"
							type="email"
							autoComplete="email"
							icon
							className="md:col-span-2"
						/>

						<div className="flex flex-col gap-5 md:col-span-2 md:flex-row">
							<Avatar user={user} src={photo?.url} className="size-16 text-xl" />
							<div className="flex-1">
								<label
									onDragOver={(e) => {
										e.preventDefault();
										setDragging(true);
									}}
									onDragLeave={() => setDragging(false)}
									onDrop={(e) => {
										e.preventDefault();
										setDragging(false);
										choose(e.dataTransfer.files[0]);
									}}
									className={clsx(
										"flex cursor-pointer flex-col items-center rounded-xl border px-6 py-4 text-center transition-colors focus-within:ring-[3px] focus-within:ring-primary-300/40",
										dragging ? "border-primary-500 bg-primary-50" : "border-grey-600 hover:border-primary-300",
									)}
								>
									<input
										type="file"
										accept={PHOTO_TYPES.join(",")}
										className="sr-only"
										aria-describedby={hintId}
										onChange={(e) => {
											choose(e.target.files?.[0]);
											e.target.value = ""; // choosing the same file again still fires
										}}
									/>
									<span className="grid size-10 place-items-center rounded-lg border border-grey-600 text-ink">
										<CloudUpload className="size-5" aria-hidden />
									</span>
									<span className="mt-3 text-sm text-grey-900">
										<span className="font-semibold text-primary-500">Click to upload</span> or drag and drop
									</span>
									<span id={hintId} className="mt-1 text-xs text-grey-900">
										{photo ? `${photo.file.name}: saved when you click Save changes` : "SVG, PNG, JPG or GIF (max. 5 MB)"}
									</span>
								</label>
								{photoError && (
									<p role="alert" className="mt-2 text-sm text-error-500">
										{photoError}
									</p>
								)}
							</div>
						</div>
					</div>
					<div className="flex justify-end gap-3 border-t border-grey-600 px-5 py-4">
						<Button
							type="button"
							variant="outline"
							className={OUTLINE}
							disabled={update.isPending}
							onClick={() => {
								form.reset(saved);
								clearPhoto();
							}}
						>
							Cancel
						</Button>
						<Button type="submit" isLoading={update.isPending} className="h-11 rounded-lg px-4">
							Save changes
						</Button>
					</div>
				</form>
			</Form>
		</section>
	);
}

const EMPTY_PASSWORDS: ChangePasswordValues = { current_password: "", new_password: "", confirm_password: "" };

function Password() {
	const form = useForm<ChangePasswordValues>({ resolver: zodResolver(ChangePasswordSchema), defaultValues: EMPTY_PASSWORDS });
	const change = useChangePassword({ onChanged: () => form.reset(EMPTY_PASSWORDS) });
	const ROW = "grid gap-3 border-b border-grey-600 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-8 lg:pr-20";

	return (
		<section aria-labelledby="password-title" className="mt-12">
			<h2 id="password-title" className="text-xl font-medium text-ink">
				Password
			</h2>
			<p className="border-b border-grey-600 pb-5 text-base text-grey-900">
				Please enter your current password to change your password.
			</p>

			<Form {...form}>
				<form noValidate onSubmit={form.handleSubmit((values) => change.mutate(values))} className={clsx(CARD, "mt-8 px-5")}>
					<PasswordRow
						control={form.control}
						name="current_password"
						label="Current password"
						autoComplete="current-password"
						className={ROW}
					/>
					<PasswordRow
						control={form.control}
						name="new_password"
						label="New password"
						autoComplete="new-password"
						hint={PASSWORD_HINT}
						className={ROW}
					/>
					<PasswordRow
						control={form.control}
						name="confirm_password"
						label="Confirm new password"
						autoComplete="new-password"
						className={ROW}
					/>
					<div className="flex justify-end gap-3 py-5">
						<Button
							type="button"
							variant="outline"
							className={OUTLINE}
							disabled={change.isPending}
							onClick={() => form.reset(EMPTY_PASSWORDS)}
						>
							Cancel
						</Button>
						<Button type="submit" isLoading={change.isPending} className="h-11 rounded-lg px-4">
							Update password
						</Button>
					</div>
				</form>
			</Form>
		</section>
	);
}

function TextField<T extends FieldValues>({
	control,
	name,
	label,
	icon,
	className,
	...input
}: {
	control: Control<T>;
	name: FieldPath<T>;
	label: string;
	/** The envelope inside the email field (Figma). */
	icon?: boolean;
	className?: string;
} & Omit<React.ComponentProps<typeof Input>, "name" | "className">) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={clsx("gap-1.5", className)}>
					<FormLabel className={LABEL}>{label}</FormLabel>
					<div className="relative">
						{icon && (
							<Mail className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-grey-900" aria-hidden />
						)}
						<FormControl>
							<Input {...input} {...field} className={clsx(FIELD, icon && "pl-11")} />
						</FormControl>
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function PasswordRow({
	control,
	name,
	label,
	hint,
	autoComplete,
	className,
}: {
	control: Control<ChangePasswordValues>;
	name: keyof ChangePasswordValues;
	label: string;
	hint?: string;
	autoComplete: string;
	className: string;
}) {
	const [shown, setShown] = useState(false);
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={className}>
					<FormLabel className={LABEL}>{label}</FormLabel>
					<div className="space-y-1.5">
						<div className="relative">
							<FormControl>
								<Input
									{...field}
									type={shown ? "text" : "password"}
									autoComplete={autoComplete}
									className={clsx(FIELD, "pr-11")}
								/>
							</FormControl>
							<button
								type="button"
								onClick={() => setShown(!shown)}
								aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
								className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-grey-900 hover:text-ink"
							>
								{shown ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
							</button>
						</div>
						{hint && <p className="text-sm text-grey-900">{hint}</p>}
						<FormMessage />
					</div>
				</FormItem>
			)}
		/>
	);
}
