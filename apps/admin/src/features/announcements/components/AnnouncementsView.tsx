"use client";

import clsx from "clsx";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { AUDIENCE_LABEL, AUDIENCES, useAnnouncements, useSendAnnouncement, type Audience } from "@/features/announcements/hooks";
import { count } from "@/lib/format";

const PAGE_SIZE = 10;
const CARD = "rounded-xl border border-grey-600 bg-white p-5 lg:p-6";
const LABEL = "text-sm font-medium text-ink";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const when = (s: string) =>
	new Date(s).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Announcements (POST /admin/notifications): a message in the inbox of everyone, customers, vendors, admins or chosen accounts. */
export function AnnouncementsView() {
	const [page, setPage] = useState(1);
	const { data, isPending, isError, refetch } = useAnnouncements(page, PAGE_SIZE);
	const items = data?.items ?? [];

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Announcements" crumb="Announcements" />
			<div className="mt-8 grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
				<Compose />
				<section className={clsx(CARD, "min-w-0")} aria-label="Sent">
					<h2 className="text-lg font-medium text-ink">Sent</h2>
					{isError ? (
						<div className="py-10 text-center text-sm text-grey-900">
							<p>Couldn&apos;t load announcements.</p>
							<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
								Try again
							</Button>
						</div>
					) : isPending ? (
						<Skeleton className="mt-4 h-60" />
					) : items.length === 0 ? (
						<p className="mt-4 text-sm text-grey-900">Nothing sent yet.</p>
					) : (
						<ul className="mt-4 divide-y divide-grey-600">
							{items.map((a) => (
								<li key={a.id} className="py-4">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<p className="font-medium text-ink">{a.title}</p>
										<span className="rounded-full bg-primary-50 px-3 py-0.5 text-xs font-medium text-primary-500">
											{AUDIENCE_LABEL[a.audience]}
										</span>
									</div>
									<p className="mt-1 text-sm whitespace-pre-line text-grey-900">{a.body}</p>
									<p className="mt-2 text-xs text-grey-800">
										{when(a.createdAt)}
										{a.sentByName && ` · ${a.sentByName}`} · read by {count(a.readCount)} of {count(a.recipientCount)}
										{a.link && ` · links to ${a.link}`}
									</p>
								</li>
							))}
						</ul>
					)}
					{data && data.meta.total_pages > 1 && (
						<Pagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={setPage} />
					)}
				</section>
			</div>
		</div>
	);
}

function Compose() {
	const send = useSendAnnouncement();
	const [audience, setAudience] = useState<Audience>("all");
	const [ids, setIds] = useState("");
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [link, setLink] = useState("");
	const [problem, setProblem] = useState<string | null>(null);

	return (
		<form
			noValidate
			className={clsx(CARD, "grid h-fit gap-4")}
			onSubmit={(e) => {
				e.preventDefault();
				const userIds = ids.split(/[\s,]+/).filter(Boolean);
				if (!title.trim() || !body.trim()) return setProblem("Add a title and a message");
				if (audience === "users" && (userIds.length === 0 || !userIds.every((x) => UUID.test(x))))
					return setProblem("Paste the account ids (from each user's page), separated by commas");
				if (link && !/^(https?:\/\/|\/)/.test(link.trim())) return setProblem("The link must start with https:// or /");
				setProblem(null);
				send.mutate(
					{
						audience,
						title: title.trim(),
						body: body.trim(),
						link: link.trim() || null,
						...(audience === "users" ? { userIds } : {}),
					},
					{
						onSuccess: () => {
							setTitle("");
							setBody("");
							setLink("");
							setIds("");
						},
					},
				);
			}}
		>
			<h2 className="text-lg font-medium text-ink">New announcement</h2>
			<label className="grid gap-1.5">
				<span className={LABEL}>Send to</span>
				<select
					value={audience}
					onChange={(e) => setAudience(e.target.value as Audience)}
					className="h-11 rounded-lg border border-grey-600 bg-white px-3 text-sm"
				>
					{AUDIENCES.map((a) => (
						<option key={a} value={a}>
							{AUDIENCE_LABEL[a]}
						</option>
					))}
				</select>
			</label>
			{audience === "users" && (
				<label className="grid gap-1.5">
					<span className={LABEL}>Account ids</span>
					<Textarea value={ids} onChange={(e) => setIds(e.target.value)} rows={2} placeholder="Separated by commas" />
				</label>
			)}
			<label className="grid gap-1.5">
				<span className={LABEL}>Title</span>
				<Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className="h-11" />
			</label>
			<label className="grid gap-1.5">
				<span className={LABEL}>Message</span>
				<Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={2000} />
			</label>
			<label className="grid gap-1.5">
				<span className={LABEL}>Link (optional)</span>
				<Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/products or https://…" className="h-11" />
			</label>
			{problem && <p className="text-sm text-error-500">{problem}</p>}
			<Button type="submit" isLoading={send.isPending} className="h-12 rounded-lg">
				Send now
			</Button>
			<p className="text-xs text-grey-800">It appears in their Inbox straight away and can&apos;t be unsent.</p>
		</form>
	);
}
