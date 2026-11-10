import Link from "next/link";
import { ArrowDown, ArrowUp, EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/ui/dropdown-menu";
import { ChangeBadge } from "@/features/dashboard/components/StatCards";
import type { Dashboard } from "@/features/dashboard/types";
import { naira, nairaShort } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

/** The gauge sweeps 220°, open at the bottom (Figma). */
const SWEEP = 220;
const R = 90;
const CX = 110;
const CY = 105;

function point(angle: number) {
	// 0° is straight up; angles grow clockwise.
	const rad = ((angle - 90) * Math.PI) / 180;
	return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function arc(from: number, to: number) {
	const a = point(from);
	const b = point(to);
	return `M ${a.x} ${a.y} A ${R} ${R} 0 ${to - from > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

/** Figma "Sales Progress": this quarter's revenue as a share of target, with target, revenue and today below. */
export function SalesProgress({ progress }: { progress: Dashboard["sales_progress"] }) {
	const share = progress.target > 0 ? Math.min(progress.revenue / progress.target, 1) : 0;
	const start = -SWEEP / 2;
	const end = start + SWEEP * share;
	const diff = progress.today - progress.yesterday;

	return (
		<section className="rounded-xl border border-grey-600 bg-white p-4 lg:p-5" aria-labelledby="sales-progress">
			<div className="flex items-start justify-between">
				<div>
					<h2 id="sales-progress" className="text-lg font-medium text-ink lg:text-xl">
						Sales Progress
					</h2>
					<p className="text-sm text-grey-900">This Quarter</p>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button type="button" aria-label="Sales progress options" className="rounded-md p-1 hover:bg-grey-500">
							<EllipsisVertical className="size-5 text-grey-900" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<Link href={consoleRoutes.ANALYTICS}>View analytics</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="relative mx-auto mt-4 max-w-[290px]">
				<svg
					viewBox="0 0 220 180"
					className="w-full"
					role="img"
					aria-label={`${(share * 100).toFixed(2)}% of the quarter's target`}
				>
					<path d={arc(start, SWEEP / 2)} fill="none" stroke="var(--color-grey-600)" strokeWidth="12" strokeLinecap="round" />
					{share > 0 && (
						<path
							d={arc(start, Math.max(end, start + 0.5))}
							fill="none"
							stroke="var(--color-primary-500)"
							strokeWidth="14"
							strokeLinecap="round"
							pathLength={1}
							className="gauge-fill"
						/>
					)}
				</svg>
				<div className="absolute inset-x-0 top-[38%] flex flex-col items-center gap-1.5">
					<p className="text-3xl font-medium text-ink">{(share * 100).toFixed(2)}%</p>
					<ChangeBadge change={progress.change} />
				</div>
			</div>

			<p className="mx-auto -mt-4 max-w-xs text-center text-sm text-grey-900">
				You earned <strong className="font-semibold text-ink">{naira(progress.today)}</strong> today,{" "}
				{diff === 0 ? "the same as yesterday" : `${naira(Math.abs(diff))} ${diff > 0 ? "more" : "less"} than yesterday`}.
			</p>

			<dl className="mt-4 grid grid-cols-3 text-center">
				<Figure label="Target" value={progress.target} up={progress.revenue >= progress.target} />
				<Figure label="Revenue" value={progress.revenue} up={progress.change >= 0} />
				<Figure label="Today" value={progress.today} up={diff >= 0} />
			</dl>
		</section>
	);
}

function Figure({ label, value, up }: { label: string; value: number; up: boolean }) {
	const Arrow = up ? ArrowUp : ArrowDown;
	return (
		<div>
			<dt className="text-xs text-grey-900">{label}</dt>
			<dd className="mt-1 flex items-center justify-center gap-1 text-xl font-medium text-ink lg:text-2xl">
				{nairaShort(value)}
				<Arrow className={up ? "size-4 text-success-500" : "size-4 text-error-500"} aria-label={up ? "up" : "down"} />
			</dd>
		</div>
	);
}
