"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { ListHeader } from "@/components/ListHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { useSession } from "@/features/auth/session";
import type { User } from "@/features/auth/types";
import { api, errorMessage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";

const CARD = "rounded-xl border border-grey-600 bg-white p-5 lg:p-6";
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** The admin's own account: name, phone and photo (PATCH /auth/me), password, and two-factor status. */
export function SettingsView() {
	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Settings" crumb="Settings" />
			<div className="mt-8 grid max-w-3xl gap-6">
				<Profile />
				<Password />
				<TwoFactor />
			</div>
		</div>
	);
}

function Profile() {
	const toast = useToast();
	const user = useSession((s) => s.user);
	const setUser = useSession((s) => s.setUser);
	const [name, setName] = useState(user?.name ?? "");
	const [phone, setPhone] = useState(user?.phone ?? "");
	const save = useMutation({
		mutationFn: async () =>
			(await api.patch(backendRoutes.ME, { name: name.trim(), phone: phone.trim() || null })).data.data as User,
		retry: false,
		onSuccess: (u) => {
			setUser(u);
			toast.success("Saved");
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
	const photo = useMutation({
		mutationFn: async (file: File) => {
			const data = new FormData();
			data.set("avatar", file);
			return (await api.put(backendRoutes.AVATAR, data, { headers: { "Content-Type": "multipart/form-data" } })).data
				.data as User;
		},
		retry: false,
		onSuccess: (u) => setUser(u),
		onError: (error) => toast.error(errorMessage(error, "Couldn't upload the photo.")),
	});

	return (
		<form
			noValidate
			className={CARD}
			onSubmit={(e) => {
				e.preventDefault();
				if (name.trim()) save.mutate();
			}}
		>
			<h2 className="text-base font-semibold text-ink">Profile</h2>
			<div className="mt-4 flex items-center gap-4">
				<UserAvatar name={user?.name ?? ""} src={user?.avatarUrl} className="size-16" />
				<label className="cursor-pointer rounded-md border border-grey-600 px-3 py-2 text-sm font-medium text-ink hover:border-primary-500">
					{photo.isPending ? "Uploading…" : "Change photo"}
					<input
						type="file"
						accept={PHOTO_TYPES.join(",")}
						className="sr-only"
						onChange={(e) => {
							const file = e.target.files?.[0];
							e.target.value = "";
							if (file && PHOTO_TYPES.includes(file.type)) photo.mutate(file);
							else if (file) toast.error("Choose a JPG, PNG or WebP image.");
						}}
					/>
				</label>
			</div>
			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<label className="grid gap-1.5 text-sm font-medium text-ink">
					Name
					<Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
				</label>
				<label className="grid gap-1.5 text-sm font-medium text-ink">
					Phone
					<Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
				</label>
				<p className="text-sm text-grey-900 sm:col-span-2">Email: {user?.email} (can&apos;t be changed)</p>
			</div>
			<Button type="submit" isLoading={save.isPending} disabled={!name.trim()} className="mt-4">
				Save
			</Button>
		</form>
	);
}

function Password() {
	const toast = useToast();
	const [current, setCurrent] = useState("");
	const [next, setNext] = useState("");
	const [problem, setProblem] = useState<string | null>(null);
	const change = useMutation({
		mutationFn: async () => api.post(backendRoutes.CHANGE_PASSWORD, { currentPassword: current, newPassword: next }),
		retry: false,
		onSuccess: () => {
			setCurrent("");
			setNext("");
			toast.success("Password changed");
		},
		onError: (error) => toast.error(errorMessage(error, "Check your current password.")),
	});
	return (
		<form
			noValidate
			className={CARD}
			onSubmit={(e) => {
				e.preventDefault();
				if (!current) return setProblem("Enter your current password");
				if (!PASSWORD_RULE.test(next))
					return setProblem("At least 8 characters, with an uppercase letter, a lowercase letter and a number");
				setProblem(null);
				change.mutate();
			}}
		>
			<h2 className="text-base font-semibold text-ink">Password</h2>
			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<label className="grid gap-1.5 text-sm font-medium text-ink">
					Current password
					<Input
						type="password"
						autoComplete="current-password"
						value={current}
						onChange={(e) => setCurrent(e.target.value)}
						className="h-11"
					/>
				</label>
				<label className="grid gap-1.5 text-sm font-medium text-ink">
					New password
					<Input
						type="password"
						autoComplete="new-password"
						value={next}
						onChange={(e) => setNext(e.target.value)}
						className="h-11"
					/>
				</label>
			</div>
			{problem && <p className="mt-2 text-sm text-error-500">{problem}</p>}
			<Button type="submit" variant="outline" isLoading={change.isPending} className="mt-4">
				Change password
			</Button>
		</form>
	);
}

function TwoFactor() {
	const user = useSession((s) => s.user);
	return (
		<section className={CARD} aria-label="Two-factor sign-in">
			<p className="flex items-center gap-2 text-base font-semibold text-ink">
				<ShieldCheck className="size-5 text-primary-500" aria-hidden /> Two-factor sign-in:{" "}
				{user?.twoFactorEnabled ? "on" : "off"}
			</p>
			<p className="mt-1 text-sm text-grey-900">
				Required for admins. Lost your authenticator? Ask a super admin to reset it from your account page.
			</p>
		</section>
	);
}
