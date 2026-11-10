"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { Package, Star } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Pagination } from "@/components/Pagination";
import { StatusFilter } from "@/components/StatusFilter";
import { UserAvatar } from "@/components/UserAvatar";
import { useBestSellers } from "@/features/analytics/hooks";
import { count } from "@/lib/format";

const PAGE_SIZE = 6;
/** Filter values: the launch categories (placeholders until the API lists them). */
const CATEGORIES = ["Clothing", "Household items", "Kitchen supplies", "Personal Care", "Office supplies"] as const;
type Category = (typeof CATEGORIES)[number];
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c, c])) as Record<Category, string>;
const OUTLINE =
	"inline-flex h-11 items-center gap-2.5 rounded-lg border border-grey-600 bg-white px-4 text-base font-medium text-grey-900 transition-colors hover:border-primary-500 hover:text-primary-500";

/** Figma "Product Best Sellers": the store, the product and units sold, its category and rating; dates, filter, pages. */
export function ProductBestSellers() {
	const [page, setPage] = useState(1);
	const [range, setRange] = useState<{ from?: string; to?: string }>({});
	const [categories, setCategories] = useState<Category[]>([]);

	const { data, isPending, isError, isFetching, refetch } = useBestSellers({
		from: range.from,
		to: range.to,
		category: categories.join(",") || undefined,
		page,
		limit: PAGE_SIZE,
	});
	const rows = data?.items ?? [];
	const filtered = !!(range.from || range.to || categories.length);

	return (
		<section aria-labelledby="best-sellers" className="overflow-hidden rounded-xl border border-grey-600 bg-white">
			<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 lg:px-9">
				<h2 id="best-sellers" className="text-xl font-medium text-ink lg:text-2xl">
					Product Best Sellers
				</h2>
				<div className="flex gap-3 lg:gap-5">
					<DateRangePicker
						from={range.from ?? ""}
						to={range.to ?? ""}
						onApply={(next) => {
							setRange(next);
							setPage(1);
						}}
						title="Sold between"
						label="Select Date"
						triggerClassName={OUTLINE}
					/>
					<StatusFilter
						id="best-seller-category"
						options={CATEGORIES}
						labels={CATEGORY_LABEL}
						value={categories}
						onChange={(next) => {
							setCategories(next);
							setPage(1);
						}}
						legend="Category"
						variant="sliders"
						triggerClassName={OUTLINE}
					/>
				</div>
			</div>

			{isError ? (
				<div className="border-t border-grey-600 py-16 text-center text-sm text-grey-900">
					<p>Couldn&apos;t load the best sellers.</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : !isPending && rows.length === 0 ? (
				<p className="border-t border-grey-600 py-16 text-center text-sm text-grey-900">
					{filtered ? "No sales match these dates and categories." : "No sales yet."}
				</p>
			) : (
				<div className={clsx("transition-opacity", isFetching && !isPending && "opacity-60")}>
					<div className="overflow-x-auto">
						<table className="w-full min-w-[760px]">
							<thead className="bg-grey-500">
								<tr className="text-left text-base text-ink">
									<th scope="col" className="py-5 pr-3 pl-6 font-medium lg:pl-8">
										Store
									</th>
									<th scope="col" className="px-3 py-5 font-medium">
										Product
									</th>
									<th scope="col" className="px-3 py-5 font-medium">
										Product Category
									</th>
									<th scope="col" className="py-5 pr-6 pl-3 font-medium">
										Rating
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-grey-600">
								{isPending
									? Array.from({ length: PAGE_SIZE }, (_, i) => (
											<tr key={i}>
												<td colSpan={4} className="px-6 py-4">
													<Skeleton className="h-14 w-full" />
												</td>
											</tr>
										))
									: rows.map((p, i) => (
											<tr
												key={p.id}
												className="animate-rise transition-colors hover:bg-grey-500"
												style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
											>
												<td className="py-4 pr-3 pl-6 lg:pl-8">
													<div className="flex items-center gap-3">
														<UserAvatar name={p.vendor.shop_name} className="size-12" />
														<div className="min-w-0 leading-tight">
															<p className="max-w-[200px] truncate text-base text-ink">{p.vendor.shop_name}</p>
															<p className="mt-1 max-w-[200px] truncate text-base text-grey-900">{p.vendor.location}</p>
														</div>
													</div>
												</td>
												<td className="px-3 py-4">
													<div className="flex items-center gap-3">
														<span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-grey-500">
															{p.image_url ? (
																<Image src={p.image_url} alt="" fill sizes="48px" className="object-cover" />
															) : (
																<Package className="size-5 text-grey-700" aria-hidden />
															)}
														</span>
														<div className="min-w-0 leading-tight">
															<p className="max-w-[220px] truncate text-base text-ink">{p.name}</p>
															<p className="mt-1 text-sm text-grey-900">{count(p.sold)} sold</p>
														</div>
													</div>
												</td>
												<td className="px-3 py-4 text-base whitespace-nowrap text-grey-900">{p.category}</td>
												<td className="py-4 pr-6 pl-3">
													<Stars rating={p.rating} />
												</td>
											</tr>
										))}
							</tbody>
						</table>
					</div>
					{data && <Pagination page={data.meta.page} totalPages={data.meta.total_pages} onChange={setPage} goTo />}
				</div>
			)}
		</section>
	);
}

/** Five stars, filled to the nearest whole star; the exact rating is in the label. */
function Stars({ rating }: { rating: number }) {
	const filled = Math.round(rating);
	return (
		<span role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`} title={`${rating.toFixed(1)} / 5`} className="flex gap-1">
			{Array.from({ length: 5 }, (_, i) => (
				<Star
					key={i}
					aria-hidden
					className={clsx("size-5", i < filled ? "fill-warning-500 text-warning-500" : "fill-grey-600 text-grey-600")}
				/>
			))}
		</span>
	);
}
