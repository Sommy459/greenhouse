import clsx from "clsx";
import { Skeleton } from "@repo/ui/skeleton";

/** "+10%" in green, "-25%" in red, "0%" in grey (Figma badges). */
export function ChangeBadge({ change }: { change: number }) {
	return (
		<span
			className={clsx(
				"rounded-full px-2 py-0.5 text-xs font-medium",
				change > 0 ? "bg-success-50 text-success-500" : change < 0 ? "bg-error-50 text-error-500" : "bg-grey-500 text-grey-900",
			)}
		>
			{change > 0 ? "+" : ""}
			{change}%
		</span>
	);
}

/** Figma Vendor Hub total card: a tinted icon, the label, then the value with its change on the previous period. */
export function StatCard({
	label,
	value,
	change,
	icon: Icon,
	tone,
	index = 0,
}: {
	label: string;
	value: string;
	change?: number;
	icon: React.ComponentType<{ className?: string }>;
	/** Icon circle colours, e.g. "bg-info-50 text-info-500". */
	tone: string;
	index?: number;
}) {
	return (
		<li className="animate-rise" style={{ "--i": index } as React.CSSProperties}>
			<div className="hover-lift h-full rounded-xl border border-grey-600 bg-white p-5 lg:p-6">
				<span className={clsx("grid size-12 place-items-center rounded-full", tone)}>
					<Icon className="size-6" aria-hidden />
				</span>
				<p className="mt-6 text-base text-grey-900 lg:text-lg">{label}</p>
				<p className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-medium text-ink lg:text-[28px]">
					{value}
					{change !== undefined && <ChangeBadge change={change} />}
				</p>
			</div>
		</li>
	);
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
	return (
		<ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8" aria-hidden>
			{Array.from({ length: count }, (_, i) => (
				<li key={i}>
					<Skeleton className="h-[170px] rounded-xl" />
				</li>
			))}
		</ul>
	);
}
