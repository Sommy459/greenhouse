import { Star } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

/** Five amber stars (Figma), filled up to the rounded rating. The number is read out to screen readers. */
export function StarRating({ rating, className = "size-4" }: { rating: number; className?: string }) {
	const filled = Math.round(rating);
	return (
		<span className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
			{Array.from({ length: 5 }, (_, i) => (
				<Star
					key={i}
					className={cn(className, i < filled ? "fill-warning-500 text-warning-500" : "fill-grey-600 text-grey-600")}
					aria-hidden
				/>
			))}
		</span>
	);
}
