"use client";

import { CalendarDays } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { BestSellers } from "@/features/dashboard/components/BestSellers";
import { SalesProgress } from "@/features/dashboard/components/SalesProgress";
import { SalesSummary } from "@/features/dashboard/components/SalesSummary";
import { StatCards } from "@/features/dashboard/components/StatCards";
import { WebsiteHealth } from "@/features/dashboard/components/WebsiteHealth";
import { useDashboard } from "@/features/dashboard/hooks";
import { useSession } from "@/features/auth/session";
import { longDate } from "@/lib/format";

/** Figma admin Overview (A4). Rendered only in the browser (inside RequireAdmin), so today's date is the viewer's. */
export function OverviewView() {
	const firstName = useSession((s) => s.user?.first_name);
	const { data, isPending, isError, refetch } = useDashboard();

	return (
		<div className="space-y-5 px-4 py-6 lg:px-8 lg:py-7">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="animate-rise">
					<h1 className="text-2xl font-medium text-ink lg:text-[28px]">Welcome{firstName ? ` ${firstName}` : ""}</h1>
					<p className="mt-1 text-sm text-grey-900 lg:text-base">Take a look at all your report at a glance!</p>
				</div>
				<div
					className="animate-rise flex items-center gap-3 rounded-xl border border-grey-600 bg-white px-4 py-3 lg:px-5"
					style={{ "--i": 1 } as React.CSSProperties}
				>
					<span className="flex size-10 items-center justify-center rounded-full bg-grey-500">
						<CalendarDays className="size-5 text-ink" aria-hidden />
					</span>
					<div>
						<p className="text-xs text-grey-900">Today&apos;s Date</p>
						<p className="font-semibold text-ink lg:text-lg">{longDate(new Date())}</p>
					</div>
				</div>
			</div>

			{isError ? (
				<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
					<p>Couldn&apos;t load the dashboard.</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : isPending ? (
				<DashboardSkeleton />
			) : (
				<>
					<StatCards totals={data.totals} />
					<div
						className="animate-rise grid gap-4 lg:grid-cols-[minmax(0,359fr)_minmax(0,730fr)]"
						style={{ "--i": 2 } as React.CSSProperties}
					>
						<SalesProgress progress={data.sales_progress} />
						<SalesSummary months={data.sales_by_month} />
					</div>
					<div
						className="animate-rise grid gap-4 lg:grid-cols-[minmax(0,600fr)_minmax(0,485fr)]"
						style={{ "--i": 3 } as React.CSSProperties}
					>
						<BestSellers items={data.best_sellers} />
						<WebsiteHealth health={data.website_health} />
					</div>
				</>
			)}
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-4" aria-busy aria-label="Loading">
			<div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
				{Array.from({ length: 5 }, (_, i) => (
					<Skeleton key={i} className="h-[150px] rounded-xl" />
				))}
			</div>
			<div className="grid gap-4 lg:grid-cols-[359fr_730fr]">
				<Skeleton className="h-[360px] rounded-xl" />
				<Skeleton className="h-[360px] rounded-xl" />
			</div>
		</div>
	);
}
