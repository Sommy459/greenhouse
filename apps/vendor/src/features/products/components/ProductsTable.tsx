"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronsUpDown, ChevronUp, Eye, Pencil, Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { Checkbox } from "@repo/ui/checkbox";
import { Skeleton } from "@repo/ui/skeleton";
import { useDeleteProduct } from "@/features/products/hooks";
import { STOCK_LABEL, STOCK_TONE } from "@/features/products/options";
import { stockState, type ProductSort, type ProductSortKey, type VendorProduct } from "@/features/products/types";
import { count, naira } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

interface Props {
	products: VendorProduct[];
	loading: boolean;
	rows: number;
	selected: Set<string>;
	onSelectedChange: (selected: Set<string>) => void;
	sort: ProductSort | undefined;
	onSortChange: (sort: ProductSort | undefined) => void;
}

const TH = "px-3 py-5 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-6 text-base whitespace-nowrap text-ink";
const ICON = "grid size-9 place-items-center rounded-md text-grey-900 transition-colors";

/** Figma "Manage Products" table: tick, name (variants), Seller SKU, price, category, quantity, status, view / edit / delete. */
export function ProductsTable({ products, loading, rows, selected, onSelectedChange, sort, onSortChange }: Props) {
	const [deleting, setDeleting] = useState<VendorProduct | null>(null);
	const remove = useDeleteProduct();
	const ids = products.map((p) => p.id);
	const ticked = ids.filter((id) => selected.has(id)).length;

	const toggle = (id: string) => {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		onSelectedChange(next);
	};
	const toggleAll = () => {
		const next = new Set(selected);
		if (ticked === ids.length) ids.forEach((id) => next.delete(id));
		else ids.forEach((id) => next.add(id));
		onSelectedChange(next);
	};

	return (
		<>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[1080px]">
					<thead className="border-b border-grey-600 bg-grey-500">
						<tr>
							<th scope="col" className="w-14 py-5 pl-8">
								<Checkbox
									aria-label="Select all products on this page"
									disabled={loading || ids.length === 0}
									checked={ids.length > 0 && ticked === ids.length ? true : ticked > 0 ? "indeterminate" : false}
									onCheckedChange={toggleAll}
									className="size-5"
								/>
							</th>
							<SortHeader label="Name" sortKey="name" sort={sort} onSortChange={onSortChange} />
							<SortHeader label="Seller SKU" sortKey="sku" sort={sort} onSortChange={onSortChange} />
							<th scope="col" className={TH}>
								Price
							</th>
							<th scope="col" className={TH}>
								Category
							</th>
							<SortHeader label="Quantity" sortKey="quantity" sort={sort} onSortChange={onSortChange} />
							<th scope="col" className={TH}>
								Status
							</th>
							<th scope="col" className={clsx(TH, "pr-6 text-center")}>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-grey-600">
						{loading
							? Array.from({ length: rows }, (_, i) => (
									<tr key={i}>
										<td colSpan={8} className="px-8 py-4">
											<Skeleton className="h-14 w-full" />
										</td>
									</tr>
								))
							: products.map((p, i) => {
									const state = stockState(p);
									return (
										<tr
											key={p.id}
											data-selected={selected.has(p.id)}
											className="animate-rise transition-colors hover:bg-grey-500 data-[selected=true]:bg-primary-50"
											style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
										>
											<td className="py-6 pl-8 align-top">
												<Checkbox
													aria-label={`Select ${p.name}`}
													checked={selected.has(p.id)}
													onCheckedChange={() => toggle(p.id)}
													className="mt-0.5 size-5"
												/>
											</td>
											<td className="max-w-[300px] px-3 py-5">
												<Link
													href={consoleRoutes.PRODUCT(p.id)}
													className="block truncate text-base font-semibold text-ink hover:text-primary-500 hover:underline"
												>
													{p.name}
												</Link>
												{p.variants_count > 0 && (
													<p className="text-base text-grey-900">
														{count(p.variants_count)} Variant{p.variants_count === 1 ? "" : "s"}
													</p>
												)}
												{p.moderation && (
													<p className="mt-1 text-sm whitespace-normal text-error-500">Fysi: {p.moderation.reason}</p>
												)}
											</td>
											<td className={TD}>{p.sku}</td>
											<td className={TD}>{naira(p.price, 2)}</td>
											<td className={TD}>{p.category}</td>
											<td className={TD}>{count(p.quantity)}</td>
											<td className={TD}>
												<span className={clsx("rounded-full px-3 py-1 text-base font-medium", STOCK_TONE[state])}>
													{STOCK_LABEL[state]}
												</span>
											</td>
											<td className="py-3 pr-6 pl-3">
												<div className="flex items-center justify-center gap-1">
													<Link
														href={consoleRoutes.PRODUCT(p.id)}
														aria-label={`View ${p.name}`}
														title="View"
														className={clsx(ICON, "hover:bg-grey-500 hover:text-primary-500")}
													>
														<Eye className="size-5" />
													</Link>
													<Link
														href={consoleRoutes.EDIT_PRODUCT(p.id)}
														aria-label={`Edit ${p.name}`}
														title="Edit"
														className={clsx(ICON, "hover:bg-grey-500 hover:text-primary-500")}
													>
														<Pencil className="size-5" />
													</Link>
													<button
														type="button"
														onClick={() => setDeleting(p)}
														aria-label={`Delete ${p.name}`}
														title="Delete"
														className={clsx(ICON, "hover:bg-error-50 hover:text-error-500")}
													>
														<Trash2 className="size-5" />
													</button>
												</div>
											</td>
										</tr>
									);
								})}
					</tbody>
				</table>
			</div>

			<AlertDialog open={!!deleting} onOpenChange={(open) => !open && !remove.isPending && setDeleting(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
						<AlertDialogDescription>
							It comes off the store and can&apos;t be restored. Orders already paid for it still need shipping. To take it down
							for a while, hide it instead.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={remove.isPending}>Keep it</AlertDialogCancel>
						<AlertDialogAction
							disabled={remove.isPending}
							className="bg-error-500 hover:bg-error-700"
							onClick={(e) => {
								e.preventDefault();
								if (deleting)
									remove.mutate(deleting, {
										onSuccess: () => {
											const next = new Set(selected);
											next.delete(deleting.id);
											onSelectedChange(next);
											setDeleting(null);
										},
									});
							}}
						>
							{remove.isPending ? "Deleting…" : "Delete product"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

/** Figma ⇅ headers: click for A→Z (or low→high), again for the reverse, a third time to clear. */
function SortHeader({
	label,
	sortKey,
	sort,
	onSortChange,
}: {
	label: string;
	sortKey: ProductSortKey;
	sort: ProductSort | undefined;
	onSortChange: (sort: ProductSort | undefined) => void;
}) {
	const dir = sort === `${sortKey}_asc` ? "asc" : sort === `${sortKey}_desc` ? "desc" : null;
	const Icon = dir === "asc" ? ChevronUp : dir === "desc" ? ChevronDown : ChevronsUpDown;
	return (
		<th scope="col" aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"} className={TH}>
			<button
				type="button"
				onClick={() => onSortChange(dir === null ? `${sortKey}_asc` : dir === "asc" ? `${sortKey}_desc` : undefined)}
				className="inline-flex items-center gap-1.5 hover:text-primary-500"
			>
				{label}
				<Icon className={clsx("size-5", dir ? "text-primary-500" : "text-grey-900")} aria-hidden />
			</button>
		</th>
	);
}
