"use client";

import clsx from "clsx";
import { Share } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import {
	NOTIFICATION_OPTIONS,
	useNotificationPrefs,
	useSetNotificationPref,
	type NotificationPrefs,
} from "@/features/settings/notifications";
import { saveCsv } from "@/lib/api/download";

/** Figma "Export" on Notification: this admin's e-mail choices, as a CSV. */
function exportPrefs(prefs: NotificationPrefs) {
	saveCsv(
		[["Notification", "E-mail"], ...NOTIFICATION_OPTIONS.map((o) => [o.label, prefs[o.key] ? "On" : "Off"])],
		"fysi-notification-settings",
	);
}

/** Figma admin "Notification": which e-mails the signed-in admin gets. Each switch saves straight away. */
export function NotificationsView() {
	const { data: prefs, isPending, isError, refetch } = useNotificationPrefs();
	const save = useSetNotificationPref();

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<h1 className="animate-rise text-2xl font-medium text-ink lg:text-[28px]">Notification</h1>
				<Button
					type="button"
					size="sm"
					disabled={!prefs}
					onClick={() => prefs && exportPrefs(prefs)}
					className="animate-rise h-12 rounded-lg px-5"
					style={{ "--i": 1 } as React.CSSProperties}
					title="Download your notification settings as a CSV"
				>
					<Share className="size-5" aria-hidden />
					Export
				</Button>
			</div>

			<section
				aria-labelledby="email-notifications"
				className="animate-rise mt-12 grid gap-10 lg:mt-56 lg:grid-cols-2 lg:gap-16"
				style={{ "--i": 2 } as React.CSSProperties}
			>
				<div>
					<h2 id="email-notifications" className="text-2xl font-medium text-ink lg:text-[32px]">
						Email Notification
					</h2>
					<p className="mt-2 max-w-[480px] text-base text-ink lg:text-lg">
						Get email to find out what&apos;s going on when you&apos;re not online. You can turn these off.
					</p>
				</div>

				{isError ? (
					<div className="text-sm text-grey-900">
						<p>Couldn&apos;t load your notification settings.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : (
					<ul className="max-w-[560px] space-y-10">
						{NOTIFICATION_OPTIONS.map((option) => (
							<li key={option.key} className="flex items-start justify-between gap-6">
								<div className="min-w-0">
									<label htmlFor={`notify-${option.key}`} className="block text-base text-ink lg:text-lg">
										{option.label}
									</label>
									<p id={`notify-${option.key}-hint`} className="mt-1 text-base text-grey-800 lg:text-lg">
										{option.description}
									</p>
								</div>
								{isPending || !prefs ? (
									<Skeleton className="h-8 w-[52px] shrink-0 rounded-full" />
								) : (
									<button
										id={`notify-${option.key}`}
										type="button"
										role="switch"
										aria-checked={prefs[option.key]}
										aria-describedby={`notify-${option.key}-hint`}
										disabled={save.isPending}
										onClick={() => save.mutate({ ...prefs, [option.key]: !prefs[option.key] })}
										className={clsx(
											"relative mt-0.5 h-8 w-[52px] shrink-0 rounded-full transition-colors focus-visible:ring-[3px] focus-visible:ring-primary-300/50 focus-visible:outline-none disabled:opacity-60",
											prefs[option.key] ? "bg-primary-500" : "bg-grey-600",
										)}
									>
										<span
											className={clsx(
												"absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform duration-200 ease-spring",
												prefs[option.key] && "translate-x-5",
											)}
										/>
									</button>
								)}
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
