"use client";

import Image from "next/image";
import { UserRound } from "lucide-react";
import { LeaveReviewDialog } from "@/features/catalog/components/product/LeaveReviewDialog";
import { StarRating } from "@/features/catalog/components/product/StarRating";
import { useProductReviews } from "@/features/catalog/hooks";
import type { Review } from "@/features/catalog/types";

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
 * Figma "Customers feedback" (C9): each review with the customer, stars, when and what they said, then "Leave a review".
 * "Leave a review" opens the review form; the API checks the customer may review (their order was delivered).
 */
export function ProductReviews({ slug, productName }: { slug: string; productName: string }) {
	const { data: reviews, isPending, isError } = useProductReviews(slug);

	return (
		<section aria-labelledby="reviews-title" className="max-w-[760px]">
			<h2 id="reviews-title" className="text-2xl font-semibold text-ink lg:text-[28px]">
				Customers feedback
			</h2>

			{isPending ? (
				<div className="mt-6 space-y-6" aria-hidden>
					{Array.from({ length: 3 }, (_, i) => (
						<div key={i} className="h-24 animate-pulse rounded-md bg-grey-600" />
					))}
				</div>
			) : isError ? (
				<p className="mt-6 text-sm text-grey-900">Couldn&apos;t load reviews right now.</p>
			) : reviews.length === 0 ? (
				<p className="mt-6 text-sm text-grey-900">No reviews yet. Bought this? Tell other shoppers what you think.</p>
			) : (
				<ul className="mt-4 lg:mt-6">
					{reviews.map((review) => (
						<ReviewItem key={review.id} review={review} />
					))}
				</ul>
			)}

			<LeaveReviewDialog slug={slug} productName={productName} />
		</section>
	);
}

function ReviewItem({ review }: { review: Review }) {
	return (
		<li className="animate-reveal border-b border-grey-600 py-5">
			<div className="flex items-start gap-3">
				<span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-grey-600 text-ink">
					{review.author.avatar_url ? (
						<Image src={review.author.avatar_url} alt="" fill unoptimized className="object-cover" />
					) : (
						<UserRound className="size-5" aria-hidden />
					)}
				</span>
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline justify-between gap-3">
						<p className="text-[15px] font-medium text-ink">{review.author.name}</p>
						<time dateTime={review.created_at} className="shrink-0 text-[11px] text-grey-800" suppressHydrationWarning>
							{timeAgo(review.created_at)}
						</time>
					</div>
					<StarRating rating={review.rating} className="size-[18px]" />
				</div>
			</div>
			<p className="mt-3 text-[13px] leading-relaxed text-grey-900">{review.comment}</p>
			{review.photo_url && (
				<div className="relative mt-3 size-24 overflow-hidden rounded-md border border-grey-600">
					<Image src={review.photo_url} alt={`Photo from ${review.author.name}`} fill unoptimized className="object-cover" />
				</div>
			)}
		</li>
	);
}
