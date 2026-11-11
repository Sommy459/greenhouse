"use client";

import clsx from "clsx";
import { useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { useAdminReviews, useModerateReview, type AdminReview } from "@/features/reviews/hooks";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 10;
const SELECT = "h-11 rounded-lg border border-grey-600 bg-white px-3 text-sm";
const when = (s: string) => new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Review moderation (GET /admin/reviews): hide abusive or off-topic reviews with a reason, or show them again. */
export function ReviewsView() {
	const { get, page, set } = useUrlParams();
	const status = (["visible", "hidden"] as const).find((s) => s === get("status"));
	const rating = [1, 2, 3, 4, 5].find((n) => String(n) === get("rating"));
	const sort = (["newest", "highest", "lowest"] as const).find((s) => s === get("sort")) ?? "newest";
	const { data, isPending, isError, isFetching, refetch } = useAdminReviews({ status, rating, sort, page, limit: PAGE_SIZE });
	const reviews = data?.items ?? [];

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Reviews" crumb="Reviews" />
			<div className="mt-8 flex flex-wrap gap-3">
				<select
					value={status ?? ""}
					onChange={(e) => set({ status: e.target.value || undefined })}
					aria-label="Visibility"
					className={SELECT}
				>
					<option value="">All reviews</option>
					<option value="visible">Showing</option>
					<option value="hidden">Hidden</option>
				</select>
				<select
					value={rating ?? ""}
					onChange={(e) => set({ rating: e.target.value || undefined })}
					aria-label="Stars"
					className={SELECT}
				>
					<option value="">All stars</option>
					{[5, 4, 3, 2, 1].map((n) => (
						<option key={n} value={n}>
							{n} star{n === 1 ? "" : "s"}
						</option>
					))}
				</select>
				<select
					value={sort}
					onChange={(e) => set({ sort: e.target.value === "newest" ? undefined : e.target.value })}
					aria-label="Sort"
					className={SELECT}
				>
					<option value="newest">Newest</option>
					<option value="lowest">Lowest rated</option>
					<option value="highest">Highest rated</option>
				</select>
			</div>

			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load reviews.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<Skeleton className="h-80 rounded-xl" />
				) : reviews.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">No reviews here.</p>
				) : (
					<ul className="divide-y divide-grey-600 rounded-xl border border-grey-600 bg-white">
						{reviews.map((r) => (
							<ReviewRow key={`${r.id}-${r.status}`} review={r} />
						))}
					</ul>
				)}
				{data && data.meta.total_pages > 1 && (
					<div className="mt-4">
						<Pagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={(p) => set({ page: String(p) })} />
					</div>
				)}
			</div>
		</div>
	);
}

function ReviewRow({ review: r }: { review: AdminReview }) {
	const moderate = useModerateReview();
	const [hiding, setHiding] = useState(false);
	const [reason, setReason] = useState("");

	return (
		<li className={clsx("px-5 py-4", r.status === "hidden" && "bg-grey-500")}>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-sm font-medium text-ink">
						{r.product.title}
						{r.vendorName && <span className="font-normal text-grey-900"> · {r.vendorName}</span>}
					</p>
					<div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-grey-900">
						<span className="inline-flex" role="img" aria-label={`${r.rating} out of 5 stars`}>
							{Array.from({ length: 5 }, (_, i) => (
								<Star
									key={i}
									className={clsx("size-4", i < r.rating ? "fill-warning-500 text-warning-500" : "text-grey-700")}
									aria-hidden
								/>
							))}
						</span>
						{r.author} ({r.customerEmail}) · {when(r.createdAt)}
						{r.verifiedPurchase && (
							<span className="inline-flex items-center gap-1 text-xs text-primary-500">
								<BadgeCheck className="size-3.5" aria-hidden /> Verified purchase
							</span>
						)}
					</div>
				</div>
				{r.status === "hidden" ? (
					<Button variant="outline" size="sm" isLoading={moderate.isPending} onClick={() => moderate.mutate({ id: r.id })}>
						Show again
					</Button>
				) : (
					!hiding && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setHiding(true)}
							className="border-error-500 text-error-500 hover:bg-error-50"
						>
							Hide
						</Button>
					)
				)}
			</div>
			{r.title && <p className="mt-2 text-sm font-medium text-ink">{r.title}</p>}
			<p className="mt-1 text-sm whitespace-pre-line text-grey-900">{r.body}</p>
			{r.status === "hidden" && r.moderationReason && (
				<p className="mt-2 text-xs text-error-500">Hidden: “{r.moderationReason}”</p>
			)}
			{hiding && (
				<form
					noValidate
					className="mt-3 space-y-2"
					onSubmit={(e) => {
						e.preventDefault();
						if (reason.trim().length < 3) return;
						moderate.mutate({ id: r.id, reason: reason.trim() }, { onSuccess: () => setHiding(false) });
					}}
				>
					<Textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						rows={2}
						aria-label="Reason"
						placeholder="Why it's hidden (the customer sees this)"
					/>
					<div className="flex gap-2">
						<Button type="button" variant="outline" size="sm" onClick={() => setHiding(false)}>
							Back
						</Button>
						<Button
							type="submit"
							size="sm"
							disabled={reason.trim().length < 3}
							isLoading={moderate.isPending}
							variant="destructive"
							className="hover:bg-error-700"
						>
							Hide review
						</Button>
					</div>
				</form>
			)}
		</li>
	);
}
