"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useRef } from "react";
import { Controller, useForm, type FieldError } from "react-hook-form";
import { Share } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { useAdminProfile, useDeleteAvatar, useUpdateProfile, useUploadAvatar } from "@/features/settings/hooks";
import { AVATAR_MAX_BYTES, AVATAR_TYPES, profileSchema, type ProfileInput, type ProfileValues } from "@/features/settings/schema";
import { GENDERS, type AdminProfile } from "@/features/settings/types";
import { saveCsv } from "@/lib/api/download";
import { useToast } from "@/lib/use-toast";

const INPUT =
	"h-[60px] w-full rounded-md border bg-transparent px-5 text-base text-ink outline-none placeholder:text-grey-800 focus:border-primary-500 focus:ring-[3px] focus:ring-primary-300/30 disabled:bg-grey-500 disabled:text-grey-900";
const border = (error?: FieldError) => (error ? "border-error-500" : "border-grey-600");
const GENDER_LABEL = { female: "Female", male: "Male" } as const;

const toInput = (p: AdminProfile): ProfileInput => ({
	first_name: p.first_name,
	last_name: p.last_name,
	email: p.email,
	phone_number: p.phone_number,
	gender: p.gender,
	address: p.address,
});

/** Figma "Export" on Settings: the admin's saved details, as a CSV (built here; the profile is already loaded). */
function exportProfile(p: AdminProfile) {
	saveCsv(
		[
			["Admin Id", "First name", "Last name", "Email", "Phone", "Gender", "Residential address"],
			[p.admin_code, p.first_name, p.last_name, p.email, p.phone_number, p.gender ?? "", p.address],
		],
		"fysi-admin-profile",
	);
}

/** Figma admin "Settings": the signed-in admin's photo and details, and Export. */
export function SettingsView() {
	const { data: profile, isPending, isError, refetch } = useAdminProfile();

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<h1 className="animate-rise text-2xl font-medium text-ink lg:text-[28px]">Settings</h1>
				<Button
					type="button"
					size="sm"
					disabled={!profile}
					onClick={() => profile && exportProfile(profile)}
					className="animate-rise h-12 rounded-lg px-5"
					style={{ "--i": 1 } as React.CSSProperties}
					title="Download your saved details as a CSV"
				>
					<Share className="size-5" aria-hidden />
					Export
				</Button>
			</div>
			{isError ? (
				<div className="mt-10 rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
					<p>Couldn&apos;t load your details.</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : isPending ? (
				<div className="mt-10 max-w-[1500px] space-y-8 lg:mt-14">
					<Skeleton className="size-32 rounded-full lg:size-40" />
					<div className="grid gap-8 md:grid-cols-2">
						{Array.from({ length: 4 }, (_, i) => (
							<Skeleton key={i} className="h-[60px] w-full" />
						))}
					</div>
				</div>
			) : (
				<>
					<AvatarSection profile={profile} />
					<ProfileForm profile={profile} />
				</>
			)}
		</div>
	);
}

function AvatarSection({ profile }: { profile: AdminProfile }) {
	const toast = useToast();
	const input = useRef<HTMLInputElement>(null);
	const upload = useUploadAvatar();
	const remove = useDeleteAvatar();
	const name = `${profile.first_name} ${profile.last_name}`;

	const pick = (file: File | undefined) => {
		if (!file) return;
		if (!AVATAR_TYPES.includes(file.type)) return toast.error("Choose a PNG, JPG or WebP image.");
		if (file.size > AVATAR_MAX_BYTES) return toast.error("Choose an image under 2MB.");
		upload.mutate(file);
	};

	return (
		<div
			className="animate-rise mt-10 flex flex-wrap items-center gap-6 lg:mt-14 lg:gap-20"
			style={{ "--i": 1 } as React.CSSProperties}
		>
			<UserAvatar name={name} src={profile.avatar_url} className="size-32 lg:size-40" textClassName="text-4xl" />
			<div className="flex flex-wrap gap-4">
				<Button
					type="button"
					onClick={() => remove.mutate()}
					isLoading={remove.isPending}
					disabled={!profile.avatar_url || upload.isPending}
					className="h-12 rounded-lg px-5"
				>
					Delete Avatar
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={() => input.current?.click()}
					isLoading={upload.isPending}
					disabled={remove.isPending}
					className="h-12 rounded-lg bg-white px-5 text-grey-900 hover:bg-primary-50 hover:text-primary-500"
				>
					Update new avatar
				</Button>
				<input
					ref={input}
					type="file"
					accept={AVATAR_TYPES.join(",")}
					className="sr-only"
					tabIndex={-1}
					aria-hidden
					onChange={(e) => {
						pick(e.target.files?.[0]);
						// Lets the same file be chosen again.
						e.target.value = "";
					}}
				/>
			</div>
		</div>
	);
}

function ProfileForm({ profile }: { profile: AdminProfile }) {
	const update = useUpdateProfile();
	const form = useForm<ProfileInput, unknown, ProfileValues>({
		resolver: zodResolver(profileSchema),
		// Follows the saved profile (e.g. after Submit) without an effect.
		values: toInput(profile),
	});
	const {
		register,
		control,
		formState: { errors, isDirty },
	} = form;
	const onSubmit = form.handleSubmit((values) => update.mutate(values));

	return (
		<form
			noValidate
			onSubmit={onSubmit}
			className="animate-rise mt-10 max-w-[1500px] space-y-8 lg:mt-12"
			style={{ "--i": 2 } as React.CSSProperties}
		>
			<div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
				<Field id="first_name" label="First Name" error={errors.first_name}>
					<input
						id="first_name"
						autoComplete="given-name"
						placeholder="first name"
						className={clsx(INPUT, border(errors.first_name))}
						{...aria("first_name", errors.first_name)}
						{...register("first_name")}
					/>
				</Field>
				<Field id="last_name" label="Last Name" error={errors.last_name}>
					<input
						id="last_name"
						autoComplete="family-name"
						placeholder="last name"
						className={clsx(INPUT, border(errors.last_name))}
						{...aria("last_name", errors.last_name)}
						{...register("last_name")}
					/>
				</Field>
				<Field id="email" label="Email address" error={errors.email}>
					<input
						id="email"
						type="email"
						autoComplete="email"
						placeholder="your email"
						className={clsx(INPUT, border(errors.email))}
						{...aria("email", errors.email)}
						{...register("email")}
					/>
				</Field>
				<Field id="phone_number" label="Phone Number" error={errors.phone_number}>
					<input
						id="phone_number"
						type="tel"
						autoComplete="tel"
						placeholder="08012345678"
						className={clsx(INPUT, border(errors.phone_number))}
						{...aria("phone_number", errors.phone_number)}
						{...register("phone_number")}
					/>
				</Field>

				<div className="min-w-0 space-y-2.5">
					<span id="gender-label" className="block text-base font-medium text-ink">
						Gender
					</span>
					<Controller
						control={control}
						name="gender"
						render={({ field }) => (
							<div role="radiogroup" aria-labelledby="gender-label" className="flex gap-4">
								{GENDERS.map((g) => (
									<button
										key={g}
										type="button"
										role="radio"
										aria-checked={field.value === g}
										onClick={() => field.onChange(field.value === g ? null : g)}
										className={clsx(
											"h-14 rounded-md px-7 text-lg font-medium transition-colors",
											field.value === g ? "bg-primary-500 text-white" : "bg-white text-grey-800 hover:text-primary-500",
										)}
									>
										{GENDER_LABEL[g]}
									</button>
								))}
							</div>
						)}
					/>
				</div>
				<Field id="admin_code" label="Admin Id" hint="Set by Fysi; it can't be changed here.">
					<input
						id="admin_code"
						value={profile.admin_code}
						readOnly
						disabled
						aria-describedby="admin_code-hint"
						className={clsx(INPUT, "border-grey-600")}
					/>
				</Field>
			</div>

			<Field id="address" label="Residential address" error={errors.address} className="max-w-[940px]">
				<textarea
					id="address"
					rows={6}
					autoComplete="street-address"
					placeholder="address"
					className={clsx(INPUT, "h-auto resize-y bg-white py-4", border(errors.address))}
					{...aria("address", errors.address)}
					{...register("address")}
				/>
			</Field>

			<Button
				type="submit"
				isLoading={update.isPending}
				disabled={!isDirty}
				className="h-14 w-full rounded-lg text-lg sm:w-[390px]"
			>
				Submit
			</Button>
		</form>
	);
}

const aria = (id: string, error?: FieldError) => ({
	"aria-invalid": !!error,
	"aria-describedby": error ? `${id}-error` : undefined,
});

function Field({
	id,
	label,
	error,
	hint,
	className,
	children,
}: {
	id: string;
	label: string;
	error?: FieldError;
	hint?: string;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div className={clsx("min-w-0 space-y-2.5", className)}>
			<label htmlFor={id} className="block text-base font-medium text-ink">
				{label}
			</label>
			{children}
			{hint && !error && (
				<p id={`${id}-hint`} className="text-sm text-grey-900">
					{hint}
				</p>
			)}
			{error && (
				<p id={`${id}-error`} role="alert" className="text-sm text-error-500">
					{error.message}
				</p>
			)}
		</div>
	);
}
