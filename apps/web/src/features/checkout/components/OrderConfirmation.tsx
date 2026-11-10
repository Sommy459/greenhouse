import Link from "next/link";
import { Button } from "@repo/ui/button";
import { FysiLogo } from "@repo/ui/fysi-logo";
import { RecentlyViewedRow } from "@/features/catalog/components/RecentlyViewedRow";
import { shopRoutes } from "@/lib/routes";

/**
 * Figma "Thank you!" page (C5, C8): the order is placed. Big logo, thanks, "Go back to catalogue", then the products
 * this shopper viewed recently. A confirmation email is the API's job.
 */
export function OrderConfirmation({ orderId }: { orderId: string }) {
	return (
		<div className="shop-container pt-10 pb-6 lg:pt-9">
			<div className="flex flex-col items-center text-center">
				<span className="animate-pop text-primary-500">
					<FysiLogo size="xl" />
				</span>
				<h1
					className="animate-rise mt-8 text-[32px] leading-tight font-semibold text-ink lg:mt-3 lg:text-[34px]"
					style={{ "--i": 2 } as React.CSSProperties}
				>
					Thank you!
				</h1>
				<p className="animate-rise mt-1 text-[15px] text-ink lg:text-base" style={{ "--i": 3 } as React.CSSProperties}>
					Your order is being processed
				</p>
				<p className="animate-rise mt-1 text-xs text-grey-800" style={{ "--i": 4 } as React.CSSProperties}>
					Order number <span className="font-medium text-ink">{orderId}</span>: keep it to track your order.
				</p>
				<Button asChild className="mt-16 h-14 rounded-lg px-7 text-lg font-semibold lg:mt-3 lg:h-[60px] lg:px-8">
					<Link href={shopRoutes.SEARCH()}>Go back to catalogue</Link>
				</Button>
			</div>

			<div className="mt-10 lg:mt-7">
				<RecentlyViewedRow />
			</div>
		</div>
	);
}
