"use client";

import clsx from "clsx";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Pagination } from "@/components/Pagination";
import { StatusFilter } from "@/components/StatusFilter";
import { useCampaignAds } from "@/features/campaigns/hooks";
import { AD_STATUS_LABEL, AD_STATUS_TONE } from "@/features/campaigns/options";
import type { CampaignFilters } from "@/features/campaigns/types";
import { count } from "@/lib/format";

const PAGE_SIZE = 6;
/** Filter values: the launch categories (placeholders until the API lists them). */
const CATEGORIES = ["Clothing", "Household items", "Kitchen supplies", "Personal Care", "Office supplies"] as const;
type Category = (typeof CATEGORIES)[number];
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c, c])) as Record<Category, string>;
const OUTLINE =
	"inline-flex h-11 items-center gap-2.5 rounded-lg border border-grey-600 bg-white px-4 text-base font-medium text-grey-900 transition-colors hover:border-primary-500 hover:text-primary-500";

/**
 * Figma "New Ad": each vendor ad with impressions, clicks, category and status; dates, category filter, pages.
 * The page keys it on `filters`, so a new tab, search or status filter starts again at page 1.
 */
export function AdsTable({ filters }: { filters: CampaignFilters }) {
	const [page, setPage] = useState(1);
	const [range, setRange] = useState<{ from?: string; to?: string }>({});
	const [categories, setCategories] = useState<Category[]>([]);

	const { data, isPending, isError, isFetching, refetch } = useCampaignAds({
		...filters,
		...range,
		category: categories.join(",") || undefined,
		page,
		limit: PAGE_SIZE,
	});
	const ads = data?.items ?? [];

	return (
		<section aria-labelledby="new-ad" className="overflow-hidden rounded-xl border border-grey-600 bg-white">
			<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 lg:px-9">
				<h2 id="new-ad" className="text-xl font-medium text-ink lg:text-2xl">
					New Ad
				</h2>
				<div className="flex gap-3 lg:gap-5">
					<DateRangePicker
						from={range.from ?? ""}
						to={range.to ?? ""}
						onApply={(next) => {
							setRange(next);
							setPage(1);
						}}
						title="Ad started"
						label="Select Date"
						triggerClassName={OUTLINE}
					/>
					<StatusFilter
						id="ad-category"
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
					<p>Couldn&apos;t load the ads.</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : !isPending && ads.length === 0 ? (
				<p className="border-t border-grey-600 py-16 text-center text-sm text-grey-900">No ads match.</p>
			) : (
				<div className={clsx("transition-opacity", isFetching && !isPending && "opacity-60")}>
					<div className="overflow-x-auto">
						<table className="w-full min-w-[760px]">
							<thead className="bg-grey-500">
								<tr className="text-left text-base text-ink">
									{["Store", "Impressions", "Clicks", "Category"].map((h, i) => (
										<th key={h} scope="col" className={clsx("py-5 font-medium", i === 0 ? "pr-3 pl-6 lg:pl-8" : "px-3")}>
											{h}
										</th>
									))}
									<th scope="col" className="py-5 pr-6 pl-3 font-medium">
										Status
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-grey-600">
								{isPending
									? Array.from({ length: PAGE_SIZE }, (_, i) => (
											<tr key={i}>
												<td colSpan={5} className="px-6 py-4">
													<Skeleton className="h-12 w-full" />
												</td>
											</tr>
										))
									: ads.map((ad, i) => (
											<tr
												key={ad.id}
												className="animate-rise transition-colors hover:bg-grey-500"
												style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
											>
												<td className="py-4 pr-3 pl-6 leading-tight lg:pl-8">
													<p className="max-w-[240px] truncate text-base text-ink">{ad.vendor.shop_name}</p>
													<p className="mt-1 max-w-[240px] truncate text-base text-grey-900">{ad.vendor.location}</p>
												</td>
												<td className="px-3 py-4 text-base text-ink tabular-nums">{count(ad.impressions)}</td>
												<td className="px-3 py-4 text-base text-ink tabular-nums">{count(ad.clicks)}</td>
												<td className="px-3 py-4 text-base whitespace-nowrap text-grey-900">{ad.category}</td>
												<td className="py-4 pr-6 pl-3">
													<span className={clsx("rounded-full px-3 py-1 text-sm font-medium", AD_STATUS_TONE[ad.status])}>
														{AD_STATUS_LABEL[ad.status]}
													</span>
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
