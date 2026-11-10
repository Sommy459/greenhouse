import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Page numbers to show: the first three, the last three and the current page's neighbours, with gaps as null. */
function pageList(page: number, total: number): (number | null)[] {
	const keep = new Set([1, 2, 3, total - 2, total - 1, total, page - 1, page, page + 1].filter((n) => n >= 1 && n <= total));
	const sorted = [...keep].sort((a, b) => a - b);
	return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1]! > 1 ? [null, n] : [n]));
}

interface Props {
	page: number;
	totalPages: number;
	onChange: (page: number) => void;
	/** Figma (Customers Details): a "Go to page" picker in place of the previous / next buttons. */
	goTo?: boolean;
}

/** Figma table footer: "Page 1 of 30" on the left, page numbers in the middle, previous and next (or Go to page) on the right. */
export function Pagination({ page, totalPages, onChange, goTo = false }: Props) {
	return (
		<nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white px-4 py-4">
			<p className="text-sm font-semibold text-ink">
				Page {page} of {totalPages}
			</p>
			<ol className="order-last flex w-full items-center justify-center gap-1 text-sm sm:order-none sm:w-auto">
				{pageList(page, totalPages).map((n, i) =>
					n === null ? (
						<li key={`gap-${i}`} aria-hidden className="px-1 text-grey-800">
							…
						</li>
					) : (
						<li key={n}>
							<button
								type="button"
								onClick={() => onChange(n)}
								aria-current={n === page ? "page" : undefined}
								aria-label={`Page ${n}`}
								className={clsx(
									"size-8 rounded-md transition-colors",
									n === page
										? "border border-primary-500 font-medium text-ink"
										: "text-grey-800 hover:bg-grey-500 hover:text-ink",
								)}
							>
								{n}
							</button>
						</li>
					),
				)}
			</ol>
			{goTo ? (
				<label className="flex items-center gap-3 text-sm text-grey-800">
					Go to page
					<select
						value={page}
						onChange={(e) => onChange(Number(e.target.value))}
						className="h-10 rounded-md border border-grey-600 bg-white pr-8 pl-3 text-sm text-ink focus:border-primary-500 focus:outline-none"
					>
						{Array.from({ length: totalPages }, (_, i) => (
							<option key={i + 1} value={i + 1}>
								{String(i + 1).padStart(2, "0")}
							</option>
						))}
					</select>
				</label>
			) : (
				<div className="flex overflow-hidden rounded-md border border-grey-600">
					<button
						type="button"
						onClick={() => onChange(page - 1)}
						disabled={page <= 1}
						aria-label="Previous page"
						className="p-2 transition-colors hover:bg-grey-500 disabled:text-grey-700 disabled:hover:bg-transparent"
					>
						<ChevronLeft className="size-5" />
					</button>
					<button
						type="button"
						onClick={() => onChange(page + 1)}
						disabled={page >= totalPages}
						aria-label="Next page"
						className="p-2 transition-colors hover:bg-grey-500 disabled:text-grey-700 disabled:hover:bg-transparent"
					>
						<ChevronRight className="size-5" />
					</button>
				</div>
			)}
		</nav>
	);
}
