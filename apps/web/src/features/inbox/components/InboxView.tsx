"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListingPagination } from "@/features/catalog/components/ListingPagination";
import { useDeleteMessage, useInbox, useMarkAllRead, useMarkRead, useUnreadCount } from "@/features/inbox/hooks";
import type { InboxMessage } from "@/features/inbox/types";
import { accountRoutes } from "@/lib/routes";

/** Figma "13 July" (with the year once it isn't this year's). */
function day(iso: string) {
	const d = new Date(iso);
	const sameYear = d.getFullYear() === new Date().getFullYear();
	return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", ...(sameYear ? {} : { year: "numeric" }) });
}

/**
 * Figma "Messages" (desktop) and "Inbox" (phones), PRD C11: order updates and notes from Fysi, newest first. New ones
 * are marked; opening "View Details" marks it read. Mark all read, and delete one.
 */
export function InboxView() {
	const [page, setPage] = useState(1);
	const { data, isPending, isError, isFetching, refetch } = useInbox(page);
	const unread = useUnreadCount();
	const markAll = useMarkAllRead();
	const messages = data?.items ?? [];

	return (
		<div className="pb-6 lg:pb-16">
			<Link href={accountRoutes.DASHBOARD} className="inline-flex items-center gap-3 text-lg text-ink lg:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				<h1>Inbox</h1>
			</Link>

			<section
				aria-label="Messages"
				className={clsx("mt-6 transition-opacity lg:mt-0 lg:min-h-[900px] lg:bg-white", isFetching && !isPending && "opacity-60")}
			>
				<div className="flex items-center justify-between gap-4 lg:border-b lg:border-grey-600 lg:px-10 lg:py-6">
					<h1 className="hidden text-[28px] text-ink lg:block">Messages</h1>
					{!!unread.data && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => markAll.mutate(undefined)}
							disabled={markAll.isPending}
							className="ml-auto"
						>
							Mark all read ({unread.data})
						</Button>
					)}
				</div>

				{isError ? (
					<div className="bg-white py-16 text-center text-sm text-grey-900">
						<p>We couldn&apos;t load your messages.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && messages.length === 0 ? (
					<p className="bg-white py-16 text-center text-base text-grey-900">
						No messages yet. Updates about your orders show up here.
					</p>
				) : (
					<ul className="mt-4 space-y-4 lg:mt-0 lg:space-y-0 lg:divide-y lg:divide-grey-600">
						{isPending
							? Array.from({ length: 3 }, (_, i) => (
									<li key={i} className="bg-white p-4 lg:px-9 lg:py-8">
										<Skeleton className="h-5 w-24" />
										<Skeleton className="mt-5 h-16 w-full" />
									</li>
								))
							: messages.map((m, i) => <Message key={m.id} message={m} index={i} />)}
					</ul>
				)}

				{data && data.meta.total_pages > 1 && (
					<div className="py-8">
						<ListingPagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={setPage} />
					</div>
				)}
			</section>
		</div>
	);
}

function Message({ message: m, index }: { message: InboxMessage; index: number }) {
	const markRead = useMarkRead();
	const remove = useDeleteMessage();
	const open = () => {
		if (!m.read) markRead.mutate(m.id);
	};
	const internal = m.link?.startsWith("/");

	return (
		<li
			className={clsx("animate-rise bg-white px-4 py-5 lg:px-9 lg:py-8", !m.read && "border-l-4 border-primary-500")}
			style={{ "--i": Math.min(index, 6) } as React.CSSProperties}
		>
			<div className="flex items-start justify-between gap-4">
				<p className="flex items-center gap-2 text-lg text-grey-900 lg:text-base">
					<time dateTime={m.createdAt}>{day(m.createdAt)}</time>
					{!m.read && <span className="rounded-full bg-primary-500 px-2 py-px text-xs font-medium text-white">New</span>}
				</p>
				<div className="flex shrink-0 items-center gap-3">
					{m.link &&
						(internal ? (
							<Link href={m.link} onClick={open} className="text-base text-primary-500 hover:underline lg:text-lg">
								View Details
							</Link>
						) : (
							<a
								href={m.link}
								target="_blank"
								rel="noreferrer"
								onClick={open}
								className="text-base text-primary-500 hover:underline lg:text-lg"
							>
								View Details
							</a>
						))}
					{!m.read && !m.link && (
						<button type="button" onClick={open} className="text-sm text-grey-900 hover:text-primary-500">
							Mark read
						</button>
					)}
					<button
						type="button"
						onClick={() => remove.mutate(m.id)}
						disabled={remove.isPending}
						aria-label={`Delete “${m.title}”`}
						className="grid size-8 place-items-center rounded-md text-grey-900 hover:bg-error-50 hover:text-error-500"
					>
						<Trash2 className="size-4" />
					</button>
				</div>
			</div>
			<div className="mt-4 text-lg leading-snug text-grey-900 lg:mt-6 lg:text-base">
				<p className={clsx(!m.read && "font-medium text-ink")}>{m.title}</p>
				<p className="whitespace-pre-line">{m.body}</p>
			</div>
		</li>
	);
}
