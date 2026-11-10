"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListingPagination } from "@/features/catalog/components/ListingPagination";
import { LeaveReviewDialog } from "@/features/catalog/components/product/LeaveReviewDialog";
import { usePendingReviews, useRefreshPendingReviews } from "@/features/reviews/hooks";
import { accountRoutes, shopRoutes } from "@/lib/routes";

const delivered = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const RATE = "text-lg font-medium text-primary-500 hover:underline";

/**
 * Figma "Reviews (49)": products from delivered orders waiting for a rating. "Rate this Product" opens the same review
 * form as the product page; once sent, the product drops off the list. Reviews are outside the PRD's MVP.
 */
export function ReviewsView() {
	const [page, setPage] = useState(1);
	const { data, isPending, isError, isFetching, refetch } = usePendingReviews(page);
	const refresh = useRefreshPendingReviews();
	const items = data?.items ?? [];

	return (
		<div className="pb-6 lg:pb-16">
			<Link href={accountRoutes.DASHBOARD} className="inline-flex items-center gap-3 text-lg text-ink lg:hidden">
				<ChevronLeft className="size-6" aria-hidden />
				<h1>Reviews</h1>
			</Link>

			<section
				aria-label="Products to review"
				className={clsx("mt-6 transition-opacity lg:mt-0 lg:min-h-[900px] lg:bg-white", isFetching && !isPending && "opacity-60")}
			>
				<h1 className="hidden border-b border-grey-600 px-5 py-6 text-[28px] text-ink lg:block">
					Reviews{data ? ` (${data.meta.total})` : ""}
				</h1>

				{isError ? (
					<div className="bg-white py-16 text-center text-sm text-grey-900">
						<p>We couldn&apos;t load the products to review.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && items.length === 0 ? (
					<p className="bg-white py-16 text-center text-base text-grey-900">
						Nothing to review right now. Products show up here once their order is delivered.
					</p>
				) : (
					<ul className="space-y-5 lg:space-y-7 lg:px-7 lg:py-7">
						{isPending
							? Array.from({ length: 4 }, (_, i) => (
									<li key={i}>
										<Skeleton className="h-[176px] w-full rounded-lg" />
									</li>
								))
							: items.map((r, i) => (
									<li
										key={r.id}
										className="animate-rise flex gap-6 rounded-lg border border-grey-800 bg-white p-4 lg:gap-8 lg:px-5 lg:py-2.5"
										style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
									>
										<Link
											href={shopRoutes.PRODUCT(r.product.slug)}
											className="relative h-[156px] w-[140px] shrink-0 overflow-hidden rounded-md bg-grey-600 lg:w-[167px]"
										>
											{r.product.image_url && (
												<Image src={r.product.image_url} alt="" fill sizes="167px" className="object-cover" />
											)}
											<span className="sr-only">{r.product.name}</span>
										</Link>
										<div className="flex min-w-0 flex-1 flex-col lg:flex-row lg:justify-between lg:gap-6">
											<div className="flex flex-1 flex-col lg:py-3">
												<p className="text-lg text-grey-900">{r.product.name}</p>
												<p className="mt-2 text-sm text-ink lg:mt-auto">
													Order no:{" "}
													<Link href={accountRoutes.ORDER(r.order.id)} className="hover:text-primary-500 hover:underline">
														{r.order.number}
													</Link>
												</p>
												<p className="mt-2 text-sm text-ink">Delivered on: {delivered(r.delivered_at)}</p>
											</div>
											<div className="mt-auto pt-4 lg:mt-0 lg:pt-3">
												<LeaveReviewDialog
													slug={r.product.slug}
													productName={r.product.name}
													onReviewed={refresh}
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
				)}

				{data && data.meta.total_pages > 1 && (
					<div className="pb-8">
						<ListingPagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={setPage} />
					</div>
				)}
			</section>
		</div>
	);
}
