import clsx from "clsx";
import { ShoppingBag, Store, UserCheck, UserRoundSearch, Wallet } from "lucide-react";
import type { Dashboard } from "@/features/dashboard/types";
import { count, naira } from "@/lib/format";

/** Figma: five tiles, each a tinted round icon, a label and a big number. */
export function StatCards({ totals }: { totals: Dashboard["totals"] }) {
	const tiles = [
		{
			label: "Total Revenue",
			value: naira(totals.revenue),
			change: totals.revenue_change,
			icon: Wallet,
			tone: "bg-info-50 text-info-500",
		},
		{ label: "New Clients", value: count(totals.new_clients), icon: UserCheck, tone: "bg-info-50 text-info-500" },
		{ label: "Visited Users", value: count(totals.visited_users), icon: UserRoundSearch, tone: "bg-success-50 text-success-500" },
		{ label: "Total Vendors", value: count(totals.vendors), icon: Store, tone: "bg-error-50 text-error-500" },
		{ label: "Order Received", value: count(totals.orders), icon: ShoppingBag, tone: "bg-warning-50 text-warning-500" },
	];

	return (
		<ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-2.5">
			{tiles.map(({ label, value, change, icon: Icon, tone }, i) => (
				// The entrance sits on the <li>: an element's own fill-mode animation would block its hover lift.
				<li
					key={label}
					className={clsx("animate-rise", i === 0 && "col-span-2 md:col-span-1")}
					style={{ "--i": i } as React.CSSProperties}
				>
					<div className="hover-lift h-full rounded-xl border border-grey-600 bg-white p-4 lg:p-5">
						<span className={clsx("flex size-10 items-center justify-center rounded-full", tone)}>
							<Icon className="size-5" aria-hidden />
						</span>
						<p className="mt-6 text-sm text-grey-900 lg:mt-8 lg:text-base">{label}</p>
						<p className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold text-ink lg:text-[26px]">
							{value}
							{change !== undefined && <ChangeBadge change={change} />}
						</p>
					</div>
				</li>
			))}
		</ul>
	);
}

/** "+10%" in green, or "-4%" in red. */
export function ChangeBadge({ change }: { change: number }) {
	const up = change >= 0;
	return (
		<span
			className={clsx(
				"rounded-full px-2 py-0.5 text-xs font-medium",
				up ? "bg-success-50 text-success-500" : "bg-error-50 text-error-500",
			)}
		>
			{up ? "+" : ""}
			{change}%
		</span>
	);
}
