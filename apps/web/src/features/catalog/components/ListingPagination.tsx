"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

/** Page numbers to show: the first two, the current one and its neighbours, the last three; gaps become "…". */
function pageItems(current: number, total: number): (number | "gap")[] {
	const keep = new Set([1, 2, current - 1, current, current + 1, total - 2, total - 1, total]);
	const pages = [...keep].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
	return pages.flatMap((p, i) => (i > 0 && p - pages[i - 1] > 1 ? (["gap", p] as const) : ([p] as const)));
}

/** Figma: "Page 1 of 30", the numbers (current one in a green square), and "Go to page" with a picker. */
export function ListingPagination({
	page,
	totalPages,
	onChange,
}: {
	page: number;
	totalPages: number;
	onChange: (page: number) => void;
}) {
	return (
		<nav aria-label="Pages" className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs">
			<p className="font-medium text-ink">
				Page {page} of {totalPages}
			</p>

			<ul className="flex items-center gap-3 text-grey-800">
				{pageItems(page, totalPages).map((item, i) =>
					item === "gap" ? (
						<li key={`gap-${i}`} aria-hidden>
							…
						</li>
					) : (
						<li key={item}>
							<button
								type="button"
								onClick={() => onChange(item)}
								aria-label={`Page ${item}`}
								aria-current={item === page ? "page" : undefined}
								className={cn(
									"grid size-6 place-items-center rounded-[3px] hover:text-primary-500",
									item === page && "bg-primary-500 font-semibold text-white hover:text-white",
								)}
							>
								{item}
							</button>
						</li>
					),
				)}
			</ul>

			<label className="flex items-center gap-2 text-grey-800">
				Go to page
				<span className="relative">
					<select
						value={page}
						onChange={(e) => onChange(Number(e.target.value))}
						className="h-7 w-14 cursor-pointer appearance-none rounded-[4px] border border-grey-700 bg-white pr-5 pl-2 text-xs text-ink outline-none focus-visible:border-primary-300"
					>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<option key={p} value={p}>
								{String(p).padStart(2, "0")}
							</option>
						))}
					</select>
					<ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2" aria-hidden />
				</span>
			</label>
		</nav>
	);
}
