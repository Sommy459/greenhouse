"use client";

import clsx from "clsx";
import { useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { useVendorDashboard, useVendorReviews } from "@/features/insights/hooks";

const when = (s: string) => new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function Stars({ rating }: { rating: number }) {
	return (
		<span className="inline-flex" role="img" aria-label={`${rating} out of 5 stars`}>
			{Array.from({ length: 5 }, (_, i) => (
				<Star
					key={i}
					className={clsx("size-4", i < rating ? "fill-warning-500 text-warning-500" : "text-grey-700")}
					aria-hidden
				/>
			))}
		</span>
	);
}

/** What customers say about the shop's products (GET /vendor/reviews), by stars, newest or best/worst first. */
export function VendorReviewsView() {
	const [rating, setRating] = useState<number | undefined>();
	const [sort, setSort] = useState<"newest" | "highest" | "lowest">("newest");
	const [page, setPage] = useState(1);
	const dashboard = useVendorDashboard();
	const { data, isPending, isError, refetch } = useVendorReviews({ rating, sort, page });
	const reviews = data?.items ?? [];
	const r = dashboard.data?.rating;

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Reviews" crumb="Reviews" />
			{r && r.count > 0 && (
				<p className="mt-6 flex items-center gap-2 text-base text-ink">
					<Stars rating={Math.round(r.average ?? 0)} />
					<strong>{r.average?.toFixed(1)}</strong> from {r.count} review{r.count === 1 ? "" : "s"}
				</p>
			)}
			<div className="mt-6 flex flex-wrap gap-3">
				<select
					value={rating ?? ""}
					onChange={(e) => {
						setRating(e.target.value ? Number(e.target.value) : undefined);
						setPage(1);
					}}
					aria-label="Stars"
					className="h-10 rounded-lg border border-grey-600 bg-white px-3 text-sm"
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
					onChange={(e) => setSort(e.target.value as typeof sort)}
					aria-label="Sort"
					className="h-10 rounded-lg border border-grey-600 bg-white px-3 text-sm"
				>
					<option value="newest">Newest</option>
					<option value="highest">Highest rated</option>
					<option value="lowest">Lowest rated</option>
				</select>
			</div>
			<div className="mt-6">
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load reviews.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : isPending ? (
					<Skeleton className="h-64 rounded-xl" />
				) : reviews.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">No reviews yet.</p>
				) : (
					<ul className="divide-y divide-grey-600 rounded-xl border border-grey-600 bg-white">
						{reviews.map((v) => (
							<li key={v.id} className="px-5 py-4">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<p className="text-sm font-medium text-ink">{v.product.title}</p>
									<span className="text-xs text-grey-800">{when(v.createdAt)}</span>
								</div>
								<div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-grey-900">
									<Stars rating={v.rating} />
									{v.author}
									{v.verifiedPurchase && (
										<span className="inline-flex items-center gap-1 text-xs text-primary-500">
											<BadgeCheck className="size-3.5" aria-hidden /> Verified purchase
										</span>
									)}
								</div>
								{v.title && <p className="mt-2 text-sm font-medium text-ink">{v.title}</p>}
								<p className="mt-1 text-sm whitespace-pre-line text-grey-900">{v.body}</p>
							</li>
						))}
					</ul>
				)}
				{data && data.meta.total_pages > 1 && (
					<div className="mt-4">
						<Pagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={setPage} />
					</div>
				)}
			</div>
		</div>
	);
}
