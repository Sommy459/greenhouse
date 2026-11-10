"use client";

import clsx from "clsx";
import { Clock, Package, Wallet } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { VendorDecision } from "@/features/vendors/components/VendorDecision";
import { VendorDocuments } from "@/features/vendors/components/VendorDocuments";
import { VendorListings } from "@/features/vendors/components/VendorListings";
import { VendorProfile } from "@/features/vendors/components/VendorProfile";
import { useAdminVendor } from "@/features/vendors/hooks";
import { errorMessage } from "@/lib/api/client";
import { count, naira } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

/**
 * Vendor details (PRD A1, A6). No Figma frame: laid out like Customers Details. Decision buttons in the header,
 * the shop's card on the left; wallet, business verification and recent listings on the right.
 */
export function VendorDetailsView({ vendorId }: { vendorId: string }) {
	const { data: vendor, isPending, isError, error, refetch } = useAdminVendor(vendorId);

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader
				title="Vendor Details"
				crumb={vendor?.shop_name ?? "…"}
				parents={[{ label: "Vendors List", href: consoleRoutes.VENDORS }]}
			>
				{vendor && <VendorDecision vendor={vendor} />}
			</ListHeader>

			{isError ? (
				<div className="mt-10 rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
					<p>{errorMessage(error, "Couldn't load this vendor.")}</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : isPending ? (
				<div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,580fr)_minmax(0,1160fr)]" aria-busy aria-label="Loading vendor">
					<Skeleton className="h-[720px] rounded-xl" />
					<div className="space-y-8">
						<div className="grid gap-4 sm:grid-cols-3">
							{[0, 1, 2].map((i) => (
								<Skeleton key={i} className="h-[150px] rounded-xl" />
							))}
						</div>
						<Skeleton className="h-[360px] rounded-xl" />
					</div>
				</div>
			) : (
				<div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,580fr)_minmax(0,1160fr)]">
					<div className="animate-rise">
						<VendorProfile vendor={vendor} />
					</div>
					<div className="min-w-0 space-y-8">
						<ul className="grid gap-4 sm:grid-cols-3 lg:gap-6">
							{[
								{
									label: "Available Balance",
									value: vendor.wallet ? naira(vendor.wallet.available, 2) : "No wallet yet",
									icon: Wallet,
									tone: "bg-success-50 text-success-700",
								},
								{
									label: "Pending (escrow)",
									value: vendor.wallet ? naira(vendor.wallet.pending, 2) : "—",
									icon: Clock,
									tone: "bg-warning-50 text-warning-700",
								},
								{
									label: "Products Listed",
									value: count(vendor.products_count),
									icon: Package,
									tone: "bg-info-50 text-info-500",
								},
							].map(({ label, value, icon: Icon, tone }, i) => (
								<li key={label} className="animate-rise" style={{ "--i": i + 1 } as React.CSSProperties}>
									<div className="hover-lift h-full rounded-xl border border-grey-600 bg-white p-5 lg:p-6">
										<span className={clsx("grid size-12 place-items-center rounded-full", tone)}>
											<Icon className="size-6" aria-hidden />
										</span>
										<p className="mt-6 text-base text-grey-900 lg:text-lg">{label}</p>
										<p
											className={clsx(
												"mt-1 font-medium text-ink",
												vendor.wallet || label === "Products Listed" ? "text-2xl lg:text-[28px]" : "text-lg text-grey-900",
											)}
										>
											{value}
										</p>
									</div>
								</li>
							))}
						</ul>
						<div className="animate-rise" style={{ "--i": 4 } as React.CSSProperties}>
							<VendorDocuments vendor={vendor} />
						</div>
						<div className="animate-rise" style={{ "--i": 5 } as React.CSSProperties}>
							<VendorListings vendor={vendor} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
