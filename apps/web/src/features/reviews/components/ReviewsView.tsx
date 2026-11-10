"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, Leaf } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListingPagination } from "@/features/catalog/components/ListingPagination";
import { LeaveReviewDialog } from "@/features/catalog/components/product/LeaveReviewDialog";
import { StarRating } from "@/features/catalog/components/product/StarRating";
import { useDeleteReview, useMyReviews, usePendingReviews } from "@/features/reviews/hooks";
import { accountRoutes, shopRoutes } from "@/lib/routes";

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const RATE = "text-lg font-medium text-primary-500 hover:underline";

/**
 * Figma "Reviews (49)" (C9): delivered products waiting for a rating ("Rate this Product"), and the customer's own
 * reviews, which they can edit or delete. Fysi can hide a review; the reason shows here.
 */
export function ReviewsView() {
	const [tab, setTab] = useState<"pending" | "mine">("pending");
	const pending = usePendingReviews(1, 1);

	return (
		<div className="pb-6 lg:pb-16">
			<Link href={accountRoutes.DASHBOARD} className="inline-flex items-center gap-3 text-lg text-ink lg:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				<h1>Reviews</h1>
			</Link>

			<section aria-label="Reviews" className="mt-6 lg:mt-0 lg:min-h-[900px] lg:bg-white">
				<h1 className="hidden border-b border-grey-600 px-5 py-6 text-[28px] text-ink lg:block">
					Reviews{pending.data ? ` (${pending.data.meta.total})` : ""}
				</h1>
				<div role="tablist" aria-label="Reviews" className="flex border-b border-grey-600 lg:px-7">
					{(
						[
							["pending", "To review"],
							["mine", "My reviews"],
						] as const
					).map(([value, label]) => (
						<button
							key={value}
							type="button"
							role="tab"
							aria-selected={tab === value}
							onClick={() => setTab(value)}
							className={clsx(
								"-mb-px border-b-2 px-4 py-3 text-base transition-colors",
								tab === value ? "border-primary-500 text-primary-500" : "border-transparent text-ink hover:text-primary-500",
							)}
						>
							{label}
						</button>
					))}
				</div>
				{tab === "pending" ? <Pending /> : <Mine />}
			</section>
		</div>
	);
}

function Pending() {
	const [page, setPage] = useState(1);
	const { data, isPending, isError, refetch } = usePendingReviews(page);
	const items = data?.items ?? [];

	if (isError)
		return (
			<div className="bg-white py-16 text-center text-sm text-grey-900">
				<p>We couldn&apos;t load the products to review.</p>
				<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
					Try again
				</Button>
			</div>
		);
	if (!isPending && items.length === 0)
		return (
			<p className="bg-white py-16 text-center text-base text-grey-900">
				Nothing to review right now. Products show up here once their order is delivered.
			</p>
		);

	return (
		<>
			<ul className="space-y-5 py-5 lg:space-y-7 lg:px-7 lg:py-7">
				{isPending
					? Array.from({ length: 3 }, (_, i) => (
							<li key={i}>
								<Skeleton className="h-[176px] w-full rounded-lg" />
							</li>
						))
					: items.map((r, i) => (
							<li
								key={r.orderLineId}
								className="animate-rise flex gap-6 rounded-lg border border-grey-800 bg-white p-4 lg:gap-8 lg:px-5 lg:py-2.5"
								style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
							>
								<Link
									href={shopRoutes.PRODUCT(r.product.slug)}
									className="relative grid h-[156px] w-[140px] shrink-0 place-items-center overflow-hidden rounded-md bg-grey-600 lg:w-[167px]"
								>
									{r.imageUrl ? (
										<Image src={r.imageUrl} alt="" fill unoptimized sizes="167px" className="object-cover" />
									) : (
										<Leaf className="size-8 text-grey-700" aria-hidden />
									)}
									<span className="sr-only">{r.product.title}</span>
								</Link>
								<div className="flex min-w-0 flex-1 flex-col lg:flex-row lg:justify-between lg:gap-6">
									<div className="flex flex-1 flex-col lg:py-3">
										<p className="text-lg text-grey-900">{r.product.title}</p>
										{r.vendorName && <p className="text-sm text-grey-800">Sold by {r.vendorName}</p>}
										<p className="mt-2 text-sm text-ink lg:mt-auto">Order no: {r.orderNumber}</p>
										{r.deliveredAt && <p className="mt-2 text-sm text-ink">Delivered on: {day(r.deliveredAt)}</p>}
									</div>
									<div className="mt-auto pt-4 lg:mt-0 lg:pt-3">
										<LeaveReviewDialog
											orderLineId={r.orderLineId}
											productName={r.product.title}
											renderTrigger={(open) => (
												<button type="button" onClick={open} className={RATE}>
													Rate this Product
												</button>
											)}
										/>
									</div>
								</div>
							</li>
						))}
			</ul>
			{data && data.meta.total_pages > 1 && (
				<div className="pb-8">
					<ListingPagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={setPage} />
				</div>
			)}
		</>
	);
}

function Mine() {
	const [page, setPage] = useState(1);
	const { data, isPending, isError, refetch } = useMyReviews(page);
	const remove = useDeleteReview();
	const items = data?.items ?? [];

	if (isError)
		return (
			<div className="bg-white py-16 text-center text-sm text-grey-900">
				<p>We couldn&apos;t load your reviews.</p>
				<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
					Try again
				</Button>
			</div>
		);
	if (!isPending && items.length === 0)
		return <p className="bg-white py-16 text-center text-base text-grey-900">You haven&apos;t written any reviews yet.</p>;

	return (
		<>
			<ul className="divide-y divide-grey-600 bg-white lg:px-7">
				{isPending
					? Array.from({ length: 3 }, (_, i) => (
							<li key={i} className="py-5">
								<Skeleton className="h-20 w-full" />
							</li>
						))
					: items.map((r) => (
							<li key={r.id} className="px-4 py-5 lg:px-0">
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="min-w-0">
										<Link
											href={shopRoutes.PRODUCT(r.product.slug)}
											className="font-medium text-ink hover:text-primary-500 hover:underline"
										>
											{r.product.title}
										</Link>
										<div className="mt-1 flex items-center gap-2">
											<StarRating rating={r.rating} className="size-4" />
											<span className="text-xs text-grey-800">{day(r.createdAt)}</span>
										</div>
									</div>
									<div className="flex gap-3 text-sm">
										<LeaveReviewDialog
											existing={r}
											productName={r.product.title}
											renderTrigger={(open) => (
												<button type="button" onClick={open} className="font-medium text-primary-500 hover:underline">
													Edit
												</button>
											)}
										/>
										<button
											type="button"
											onClick={() => remove.mutate(r.id)}
											disabled={remove.isPending}
											className="text-error-500 hover:underline"
										>
											Delete
										</button>
									</div>
								</div>
								{r.title && <p className="mt-2 text-sm font-medium text-ink">{r.title}</p>}
								<p className="mt-1 text-sm whitespace-pre-line text-grey-900">{r.body}</p>
								{r.status === "hidden" && (
									<p className="mt-2 rounded-md bg-warning-50 px-3 py-2 text-xs text-warning-700">
										Hidden by Fysi{r.moderationReason ? `: ${r.moderationReason}` : ""}
									</p>
								)}
							</li>
						))}
			</ul>
			{data && data.meta.total_pages > 1 && (
				<div className="py-8">
					<ListingPagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={setPage} />
				</div>
			)}
		</>
	);
}
