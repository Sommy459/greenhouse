"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, UserRound } from "lucide-react";
import { ListingPagination } from "@/features/catalog/components/ListingPagination";
import { StarRating } from "@/features/catalog/components/product/StarRating";
import { useProductReviews, useReviewSummary } from "@/features/reviews/hooks";
import type { Review } from "@/features/reviews/types";
import { accountRoutes } from "@/lib/routes";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** "2 min ago", "3 h ago", "2 days ago", then the date ("30 Apr, 2021") after a week, as in the Figma page. */
function timeAgo(iso: string) {
	const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
	if (minutes < 60) return `${minutes} min ago`;
	if (minutes < 24 * 60) return `${Math.round(minutes / 60)} h ago`;
	if (minutes < 7 * 24 * 60) return `${Math.round(minutes / 60 / 24)} days ago`;
	return dateFormat.format(new Date(iso)).replace(/ (\d{4})$/, ", $1");
}

/**
 * Figma "Customers feedback" (C9): the average and how the stars spread, then each review (customer, stars, when, title
 * and text; "Verified purchase" when it came from a delivered order). Customers review from Account → Reviews, where
 * their delivered products wait.
 */
export function ProductReviews({ slug }: { slug: string; productName: string }) {
	const [page, setPage] = useState(1);
	const [sort, setSort] = useState<"newest" | "highest" | "lowest">("newest");
	const summary = useReviewSummary(slug);
	const { data, isPending, isError } = useProductReviews(slug, page, sort);
	const reviews = data?.items ?? [];
	const s = summary.data;

	return (
		<section aria-labelledby="reviews-title" className="max-w-[760px]">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<h2 id="reviews-title" className="text-2xl font-semibold text-ink lg:text-[28px]">
					Customers feedback
				</h2>
				{!!s?.count && (
					<select
						value={sort}
						onChange={(e) => {
							setSort(e.target.value as typeof sort);
							setPage(1);
						}}
						aria-label="Sort reviews"
						className="h-9 rounded-md border border-grey-600 bg-white px-2 text-sm text-ink"
					>
						<option value="newest">Newest</option>
						<option value="highest">Highest rated</option>
						<option value="lowest">Lowest rated</option>
					</select>
				)}
			</div>

			{s && s.count > 0 && (
				<div className="mt-4 flex flex-wrap items-center gap-6 rounded-lg bg-white p-4">
					<div>
						<p className="text-3xl font-semibold text-ink">{s.average?.toFixed(1)}</p>
						<StarRating rating={s.average ?? 0} className="size-4" />
						<p className="mt-1 text-xs text-grey-800">
							{s.count} review{s.count === 1 ? "" : "s"}
						</p>
					</div>
					<ul className="min-w-48 flex-1 space-y-1">
						{[5, 4, 3, 2, 1].map((n) => {
							const c = s.distribution[String(n)] ?? 0;
							return (
								<li key={n} className="flex items-center gap-2 text-xs text-grey-900">
									<span className="w-3">{n}</span>
									<span className="h-2 flex-1 overflow-hidden rounded-full bg-grey-600">
										<span className="block h-full rounded-full bg-warning-500" style={{ width: `${(c / s.count) * 100}%` }} />
									</span>
									<span className="w-6 text-right">{c}</span>
								</li>
							);
						})}
					</ul>
				</div>
			)}

			{isPending ? (
				<div className="mt-6 space-y-6" aria-hidden>
					{Array.from({ length: 3 }, (_, i) => (
						<div key={i} className="h-24 animate-pulse rounded-md bg-grey-600" />
					))}
				</div>
			) : isError ? (
				<p className="mt-6 text-sm text-grey-900">Couldn&apos;t load reviews right now.</p>
			) : reviews.length === 0 ? (
				<p className="mt-6 text-sm text-grey-900">No reviews yet.</p>
			) : (
				<ul className="mt-4 lg:mt-6">
					{reviews.map((review) => (
						<ReviewItem key={review.id} review={review} />
					))}
				</ul>
			)}
			{data && data.meta.total_pages > 1 && (
				<div className="mt-6">
					<ListingPagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={setPage} />
				</div>
			)}

			<p className="mt-5 text-sm text-grey-900">
				Bought this?{" "}
				<Link href={accountRoutes.REVIEWS} className="font-medium text-primary-500 hover:underline">
					Review it from your account
				</Link>{" "}
				once it&apos;s delivered.
			</p>
		</section>
	);
}

function ReviewItem({ review }: { review: Review }) {
	return (
		<li className="animate-reveal border-b border-grey-600 py-5">
			<div className="flex items-start gap-3">
				<span className="grid size-10 shrink-0 place-items-center rounded-full bg-grey-600 text-ink">
					<UserRound className="size-5" aria-hidden />
				</span>
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline justify-between gap-3">
						<p className="text-[15px] font-medium text-ink">
							{review.author}
							{review.verifiedPurchase && (
								<span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-primary-500">
									<BadgeCheck className="size-3.5" aria-hidden /> Verified purchase
								</span>
							)}
						</p>
						<time dateTime={review.createdAt} className="shrink-0 text-[11px] text-grey-800" suppressHydrationWarning>
							{timeAgo(review.createdAt)}
						</time>
					</div>
					<StarRating rating={review.rating} className="size-[18px]" />
				</div>
			</div>
			{review.title && <p className="mt-3 text-sm font-medium text-ink">{review.title}</p>}
			<p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line text-grey-900">{review.body}</p>
		</li>
	);
}
