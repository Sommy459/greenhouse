import Link from "next/link";
import { ScrollArrows } from "@/components/ScrollRow";

/**
 * A home page section title. Desktop shows "See All" when there is a page to go to, otherwise the arrows; mobile
 * always shows the arrows (the rows scroll there).
 */
export function SectionHeader({
	title,
	seeAllHref,
	onPrev,
	onNext,
}: {
	title: string;
	seeAllHref?: string;
	onPrev: () => void;
	onNext: () => void;
}) {
	return (
		<div className="mb-4 flex items-center justify-between gap-4 lg:mb-5">
			<h2 className="text-2xl font-semibold text-ink lg:text-[28px]">{title}</h2>
			<ScrollArrows onPrev={onPrev} onNext={onNext} className={seeAllHref ? "lg:hidden" : ""} />
			{seeAllHref && (
				<Link href={seeAllHref} className="hidden text-sm font-semibold text-primary-500 hover:underline lg:block">
					See All
				</Link>
			)}
		</div>
	);
}
