"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { useSession } from "@/features/auth/session";
import { useCreateAdmin, useUsers } from "@/features/users/hooks";
import { ROLE_LABEL, type AdminUser } from "@/features/users/types";
import { consoleRoutes } from "@/lib/routes";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Admin team (PRD A7): super admins and admins. Super admins invite new admins (the first super admin is made on the
 * server); suspending or resetting an admin's 2FA happens on their account page.
 */
export function TeamView() {
	const me = useSession((s) => s.user);
	const supers = useUsers({ role: "super_admin", page: 1, limit: 50 });
	const admins = useUsers({ role: "admin", page: 1, limit: 100 });
	const team = [...(supers.data?.items ?? []), ...(admins.data?.items ?? [])];
	const loading = supers.isPending || admins.isPending;

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Admin team" crumb="Admin team" />
			<div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
				<section className="overflow-hidden rounded-xl border border-grey-600 bg-white" aria-label="Admins">
					{loading ? (
						<div className="space-y-2 p-6">
							{Array.from({ length: 3 }, (_, i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</div>
					) : (
						<ul className="divide-y divide-grey-600">
							{team.map((u: AdminUser) => (
								<li key={u.id} className="flex items-center gap-4 px-6 py-4">
									<UserAvatar name={u.name} src={u.avatarUrl} className="size-10" />
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-ink">
											{u.name}
											{u.id === me?.id && <span className="text-grey-800"> (you)</span>}
										</p>
										<p className="truncate text-xs text-grey-900">{u.email}</p>
									</div>
									<span
										className={clsx(
											"rounded-full px-3 py-1 text-xs font-medium",
											u.role === "super_admin" ? "bg-primary-50 text-primary-500" : "bg-grey-500 text-ink",
										)}
									>
										{ROLE_LABEL[u.role]}
									</span>
									{u.suspended && (
										<span className="rounded-full bg-error-50 px-3 py-1 text-xs font-medium text-error-500">Suspended</span>
									)}
									<Link href={consoleRoutes.USER(u.id)} className="text-sm font-medium text-primary-500 hover:underline">
										View
									</Link>
								</li>
							))}
						</ul>
					)}
				</section>
				{me?.role === "super_admin" ? (
					<Invite />
				) : (
					<p className="h-fit rounded-xl border border-grey-600 bg-white p-5 text-sm text-grey-900">
						Only super admins can add admins.
					</p>
				)}
			</div>
		</div>
	);
}

function Invite() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [problem, setProblem] = useState<string | null>(null);
	const create = useCreateAdmin({
		onCreated: () => {
			setName("");
			setEmail("");
		},
	});
	return (
		<form
			noValidate
			className="h-fit space-y-3 rounded-xl border border-grey-600 bg-white p-5"
			onSubmit={(e) => {
				e.preventDefault();
				if (!name.trim()) return setProblem("Enter their name");
				if (!EMAIL.test(email.trim())) return setProblem("Enter a valid email");
				setProblem(null);
				create.mutate({ name: name.trim(), email: email.trim().toLowerCase() });
			}}
		>
			<h2 className="flex items-center gap-2 text-base font-semibold text-ink">
				<UserPlus className="size-5 text-primary-500" aria-hidden /> Add an admin
			</h2>
			<p className="text-sm text-grey-900">They get an email to set their password, then turn on two-factor sign-in.</p>
			<Input
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Full name"
				aria-label="Full name"
				className="h-11"
			/>
			<Input
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="Work email"
				aria-label="Work email"
				className="h-11"
			/>
			{problem && <p className="text-sm text-error-500">{problem}</p>}
			<Button type="submit" isLoading={create.isPending} className="w-full">
				Send invite
			</Button>
		</form>
	);
}
