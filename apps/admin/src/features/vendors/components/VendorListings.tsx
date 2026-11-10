import Image from "next/image";
import { Package } from "lucide-react";
import type { VendorDetail } from "@/features/vendors/types";
import { count, naira } from "@/lib/format";

/** The shop's newest listings (up to five), with how many there are in all. */
export function VendorListings({ vendor }: { vendor: VendorDetail }) {
	return (
		<section aria-labelledby="listings" className="overflow-hidden rounded-xl border border-grey-600 bg-white">
			<div className="flex flex-wrap items-center gap-3 px-5 py-5 lg:px-9">
				<h2 id="listings" className="text-xl font-medium text-ink lg:text-2xl">
					Recent listings
				</h2>
				<span className="rounded-full bg-primary-500 px-2 py-px text-xs font-medium text-white">
					{count(vendor.products_count)}
				</span>
			</div>
			{vendor.recent_products.length === 0 ? (
				<p className="border-t border-grey-600 py-12 text-center text-sm text-grey-900">
					{vendor.status === "approved" || vendor.status === "suspended"
						? "No listings yet."
						: "Vendors list products once they're approved."}
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full min-w-[560px]">
						<thead className="bg-grey-500">
							<tr className="text-left text-base text-ink">
								<th scope="col" className="py-4 pr-3 pl-6 font-medium lg:pl-9">
									Product
								</th>
								<th scope="col" className="px-3 py-4 font-medium">
									Price
								</th>
								<th scope="col" className="py-4 pr-6 pl-3 font-medium">
									Stock
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-grey-600">
							{vendor.recent_products.map((p) => (
								<tr key={p.id} className="transition-colors hover:bg-grey-500">
									<td className="py-3 pr-3 pl-6 lg:pl-9">
										<div className="flex items-center gap-3">
											<span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-grey-500">
												{p.image_url ? (
													<Image src={p.image_url} alt="" fill sizes="48px" className="object-cover" />
												) : (
													<Package className="size-5 text-grey-700" aria-hidden />
												)}
											</span>
											<span className="max-w-[260px] truncate text-base text-ink">{p.name}</span>
										</div>
									</td>
									<td className="px-3 py-3 text-base whitespace-nowrap text-ink">{naira(p.price)}</td>
									<td className="py-3 pr-6 pl-3 text-base whitespace-nowrap">
										{p.stock === 0 ? (
											<span className="font-medium text-error-500">Out of stock</span>
										) : (
											<span className="text-grey-900">{count(p.stock)}</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
