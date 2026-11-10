"use client";

import Link from "next/link";
import { useState } from "react";
import { Checkbox } from "@repo/ui/checkbox";
import type { BestSeller } from "@/features/dashboard/types";
import { naira } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

/** Figma "Best Sellers": the top products with sold count, unit price and profit; rows can be ticked. */
export function BestSellers({ items }: { items: BestSeller[] }) {
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const allSelected = items.length > 0 && selected.size === items.length;

	const toggle = (id: string) =>
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	return (
		<section className="min-w-0 overflow-hidden rounded-xl border border-grey-600 bg-white" aria-labelledby="best-sellers">
			<div className="flex items-center justify-between px-4 py-3 lg:px-5">
				<h2 id="best-sellers" className="text-lg font-semibold text-ink">
					Best Sellers
				</h2>
				<Link
					href={consoleRoutes.PRODUCTS}
					className="rounded-md border border-grey-700 px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:border-primary-500 hover:text-primary-500"
				>
					See All
				</Link>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[520px] text-left text-sm">
					<thead className="bg-grey-500 text-xs text-ink">
						<tr>
							<th scope="col" className="w-12 py-3.5 pl-5">
								<Checkbox
									aria-label="Select all"
									checked={allSelected ? true : selected.size > 0 ? "indeterminate" : false}
									onCheckedChange={() => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)))}
								/>
							</th>
							<th scope="col" className="py-3.5 font-medium">
								Products
							</th>
							<th scope="col" className="py-3.5 font-medium">
								Sold Items
							</th>
							<th scope="col" className="py-3.5 font-medium">
								Amount
							</th>
							<th scope="col" className="py-3.5 pr-5 font-medium">
								Profit
							</th>
						</tr>
					</thead>
					<tbody>
						{items.map((item) => (
							<tr
								key={item.id}
								className="border-t border-grey-600 transition-colors hover:bg-grey-500 data-[selected=true]:bg-primary-50"
								data-selected={selected.has(item.id)}
							>
								<td className="py-5 pl-5">
									<Checkbox
										aria-label={`Select ${item.name}`}
										checked={selected.has(item.id)}
										onCheckedChange={() => toggle(item.id)}
									/>
								</td>
								<td className="py-5 font-semibold text-ink">{item.name}</td>
								<td className="py-5 text-ink">{item.sold} Items</td>
								<td className="py-5 text-ink">{naira(item.price, 2)}</td>
								<td className="py-5 pr-5 text-ink">{naira(item.profit, 2)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
