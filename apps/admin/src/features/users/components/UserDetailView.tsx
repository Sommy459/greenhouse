"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { ListHeader } from "@/components/ListHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { useSession } from "@/features/auth/session";
import { useDeleteUser, useResetTwoFactor, useSuspendUser, useUser } from "@/features/users/hooks";
import { ROLE_LABEL, type UserDetail } from "@/features/users/types";
import { errorMessage } from "@/lib/api/client";
import { consoleRoutes } from "@/lib/routes";

const CARD = "rounded-xl border border-grey-600 bg-white p-5 lg:p-6";
const when = (iso: string) =>
	new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** One account: who they are, sign-in facts, and the account actions (suspend / restore, reset two-factor, delete a customer). */
export function UserDetailView({ id }: { id: string }) {
	const { data: user, isPending, isError, error, refetch } = useUser(id);
	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader
				title={user?.name ?? "User"}
				crumb={user?.name ?? "User"}
				parents={[{ label: "Users", href: consoleRoutes.USERS }]}
			/>
			<div className="mt-6">
				{isError ? (
					<div className={clsx(CARD, "text-center text-sm text-grey-900")}>
						<p>{errorMessage(error, "Couldn't load this account.")}</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<Skeleton className="h-80 rounded-xl" />
				) : (
					<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
						<Profile user={user} />
						<Actions key={`${user.suspended}-${user.twoFactorEnabled}-${user.deletedAt}`} user={user} />
					</div>
				)}
			</div>
		</div>
	);
}

function Profile({ user: u }: { user: UserDetail }) {
	const rows: [string, React.ReactNode][] = [
		["Email", `${u.email}${u.emailVerified ? "" : " (not verified)"}`],
		["Phone", u.phone],
		["Role", ROLE_LABEL[u.role]],
		["Two-factor sign-in", u.twoFactorEnabled ? "On" : "Off"],
		["Joined", when(u.createdAt)],
		["Last sign-in", u.lastLoginAt ? when(u.lastLoginAt) : "Never"],
		["Signed in on", `${u.activeSessions} device${u.activeSessions === 1 ? "" : "s"}`],
	];
	return (
		<section className={CARD} aria-label="Account">
			<div className="flex items-center gap-4">
				<UserAvatar name={u.name} src={u.avatarUrl} className="size-14" />
				<div>
					<p className="text-lg font-semibold text-ink">{u.name}</p>
					<span
						className={clsx(
							"rounded-full px-3 py-0.5 text-xs font-medium",
							u.suspended ? "bg-error-50 text-error-500" : "bg-success-50 text-success-700",
						)}
					>
						{u.suspended ? "Suspended" : "Active"}
					</span>
				</div>
			</div>
			<dl className="mt-5 space-y-2">
				{rows.map(([label, value]) => (
					<div key={label} className="grid gap-0.5 sm:grid-cols-[180px_minmax(0,1fr)]">
						<dt className="text-sm text-grey-900">{label}</dt>
						<dd className="text-sm text-ink">{value || "—"}</dd>
					</div>
				))}
			</dl>
			{u.vendor && (
				<p className="mt-4 rounded-md bg-grey-500 p-3 text-sm text-ink">
					Vendor: {u.vendor.businessName ?? "unnamed shop"} ({u.vendor.status}).{" "}
					<Link
						href={`${consoleRoutes.VENDORS}?search=${encodeURIComponent(u.email)}`}
						className="font-medium text-primary-500 hover:underline"
					>
						Open in Vendors
					</Link>
				</p>
			)}
			{u.deletedAt && <p className="mt-4 rounded-md bg-grey-500 p-3 text-sm text-ink">Account deleted {when(u.deletedAt)}.</p>}
			{u.suspension && (
				<p className="mt-4 rounded-md bg-error-50 p-3 text-sm text-ink">
					Suspended {when(u.suspension.suspendedAt)}
					{u.suspension.suspendedByName && ` by ${u.suspension.suspendedByName}`}: “{u.suspension.reason}”
				</p>
			)}
		</section>
	);
}

function Actions({ user }: { user: UserDetail }) {
	const me = useSession((s) => s.user);
	const suspend = useSuspendUser(user.id);
	const reset2fa = useResetTwoFactor(user.id);
	const remove = useDeleteUser(user.id);
	const [mode, setMode] = useState<"suspend" | "reset" | "delete" | null>(null);
	const [reason, setReason] = useState("");
	const ok = reason.trim().length >= 10;
	const self = me?.id === user.id;

	return (
		<aside className={clsx(CARD, "h-fit")} aria-label="Account actions">
			<h2 className="text-base font-semibold text-ink">Actions</h2>
			{self ? (
				<p className="mt-2 text-sm text-grey-900">This is your account. Change it in Settings.</p>
			) : user.deletedAt ? (
				<p className="mt-2 text-sm text-grey-900">This account was deleted.</p>
			) : !mode ? (
				<div className="mt-4 grid gap-2">
					{user.suspended ? (
						<Button onClick={() => suspend.mutate(null)} isLoading={suspend.isPending}>
							Restore account
						</Button>
					) : (
						<Button
							variant="outline"
							onClick={() => setMode("suspend")}
							className="border-error-500 text-error-500 hover:bg-error-50"
						>
							Suspend account
						</Button>
					)}
					{user.twoFactorEnabled && (
						<Button variant="outline" onClick={() => setMode("reset")}>
							Reset two-factor sign-in
						</Button>
					)}
					{user.role === "customer" && (
						<Button
							variant="outline"
							onClick={() => setMode("delete")}
							className="border-error-500 text-error-500 hover:bg-error-50"
						>
							Delete account
						</Button>
					)}
				</div>
			) : (
				<form
					noValidate
					className="mt-4 space-y-3"
					onSubmit={(e) => {
						e.preventDefault();
						if (!ok) return;
						const done = { onSuccess: () => setMode(null) };
						if (mode === "suspend") suspend.mutate(reason.trim(), done);
						else if (mode === "delete") remove.mutate(reason.trim(), done);
						else reset2fa.mutate(reason.trim(), done);
					}}
				>
					<p className="text-sm text-grey-900">
						{mode === "suspend"
							? "They're signed out everywhere and can't sign in until restored."
							: mode === "delete"
								? "Their personal details are erased and they're signed out for good. Orders stay for the records. This can't be undone."
								: "For someone who lost their authenticator. They set it up again at their next sign-in."}
					</p>
					<Textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						rows={3}
						aria-label="Reason"
						placeholder="Reason (recorded in the audit log)"
					/>
					<div className="flex gap-2">
						<Button type="button" variant="outline" onClick={() => setMode(null)} className="flex-1">
							Back
						</Button>
						<Button
							type="submit"
							disabled={!ok}
							isLoading={suspend.isPending || reset2fa.isPending || remove.isPending}
							className={clsx("flex-1", mode !== "reset" && "bg-error-500 hover:bg-error-700")}
						>
							{mode === "suspend" ? "Suspend" : mode === "delete" ? "Delete" : "Reset"}
						</Button>
					</div>
				</form>
			)}
		</aside>
	);
}
