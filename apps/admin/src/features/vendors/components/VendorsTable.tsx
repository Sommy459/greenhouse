"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, Package, Trash2 } from "lucide-react";
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
import { UserAvatar } from "@/components/UserAvatar";
import { useDeleteVendor } from "@/features/vendors/hooks";
import { VENDOR_STATUS_LABEL, VENDOR_STATUS_TONE } from "@/features/vendors/options";
import type { AdminVendor } from "@/features/vendors/types";
import { count, naira } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";

interface Props {
	vendors: AdminVendor[];
	loading: boolean;
	rows: number;
	selected: Set<string>;
	onSelectedChange: (selected: Set<string>) => void;
}

const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const TD = "px-3 py-5 text-base whitespace-nowrap text-ink";
const ICON = "grid size-9 place-items-center rounded-md text-grey-900 transition-colors";

/** Figma vendor list: tick, owner with e-mail, products, SKU, balance, date created, status, view / delete. */
export function VendorsTable({ vendors, loading, rows, selected, onSelectedChange }: Props) {
	const [deleting, setDeleting] = useState<AdminVendor | null>(null);
	const deleteVendor = useDeleteVendor();
	const pageIds = vendors.map((v) => v.id);
	const ticked = pageIds.filter((id) => selected.has(id)).length;

	const toggleAll = () => {
		const next = new Set(selected);
		if (ticked === pageIds.length) pageIds.forEach((id) => next.delete(id));
		else pageIds.forEach((id) => next.add(id));
		onSelectedChange(next);
	};
	const toggle = (id: string) => {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		onSelectedChange(next);
	};

	return (
		<>
			<div className="overflow-x-auto rounded-t-lg border border-grey-600 bg-white">
				<table className="w-full min-w-[1120px]">
					<thead className="border-b border-grey-600 bg-grey-500">
						<tr>
							<th scope="col" className="w-14 py-4 pl-8">
								<Checkbox
									aria-label="Select all vendors on this page"
									disabled={loading || pageIds.length === 0}
									checked={pageIds.length > 0 && ticked === pageIds.length ? true : ticked > 0 ? "indeterminate" : false}
									onCheckedChange={toggleAll}
									className="size-5"
								/>
							</th>
							{["Vendor Name", "Products", "SKU", "Balance", "Date Created", "Status"].map((h) => (
								<th key={h} scope="col" className={TH}>
									{h}
								</th>
							))}
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
							: vendors.map((v, i) => (
									<tr
										key={v.id}
										data-selected={selected.has(v.id)}
										className="animate-rise transition-colors hover:bg-grey-500 data-[selected=true]:bg-primary-50"
										style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
									>
										<td className="py-5 pl-8">
											{/* Round tick boxes on rows (Figma). */}
											<Checkbox
												aria-label={`Select ${v.shop_name}`}
												checked={selected.has(v.id)}
												onCheckedChange={() => toggle(v.id)}
												className="size-5 rounded-full"
											/>
										</td>
										<td className="px-3 py-3">
											<Link href={consoleRoutes.VENDOR(v.id)} title={v.shop_name} className="group flex items-center gap-3">
												<UserAvatar name={v.owner_name} className="size-12" />
												<span className="min-w-0 leading-tight">
													<span className="block max-w-[220px] truncate text-base text-ink group-hover:text-primary-500 group-hover:underline">
														{v.owner_name}
													</span>
													<span className="mt-0.5 block max-w-[220px] truncate text-base text-grey-900">{v.email}</span>
												</span>
											</Link>
										</td>
										<td className="px-3 py-3">
											{v.first_product ? (
												<div className="flex items-center gap-3">
													<span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-grey-500">
														{v.first_product.image_url ? (
															<Image src={v.first_product.image_url} alt="" fill sizes="48px" className="object-cover" />
														) : (
															<Package className="size-5 text-grey-700" aria-hidden />
														)}
													</span>
													<span className="min-w-0 leading-tight">
														<span className="block max-w-[200px] truncate text-base text-ink">{v.first_product.name}</span>
														{v.other_products > 0 && (
															<span className="mt-0.5 block text-base text-grey-900">
																+{count(v.other_products)} other product{v.other_products === 1 ? "" : "s"}
															</span>
														)}
													</span>
												</div>
											) : (
												<span className="text-base text-grey-900">No products yet</span>
											)}
										</td>
										<td className={TD}>{count(v.sku_count)}</td>
										<td className={TD}>{naira(v.balance, 2)}</td>
										<td className={TD}>
											<time dateTime={v.created_at}>{date(v.created_at)}</time>
										</td>
										<td className={TD}>
											<span className={clsx("rounded-full px-3 py-1 text-sm font-medium", VENDOR_STATUS_TONE[v.status])}>
												{VENDOR_STATUS_LABEL[v.status]}
											</span>
										</td>
										<td className="py-3 pr-6 pl-3">
											<div className="flex items-center justify-center gap-1">
												<Link
													href={consoleRoutes.VENDOR(v.id)}
													aria-label={`View ${v.shop_name}`}
													title="View"
													className={clsx(ICON, "hover:bg-grey-500 hover:text-primary-500")}
												>
													<Eye className="size-5" />
												</Link>
												<button
													type="button"
													onClick={() => setDeleting(v)}
													aria-label={`Delete ${v.shop_name}`}
													title="Delete"
													className={clsx(ICON, "hover:bg-error-50 hover:text-error-500")}
												>
													<Trash2 className="size-5" />
												</button>
											</div>
										</td>
									</tr>
								))}
					</tbody>
				</table>
			</div>

			<AlertDialog open={!!deleting} onOpenChange={(open) => !open && !deleteVendor.isPending && setDeleting(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {deleting?.shop_name}?</AlertDialogTitle>
						<AlertDialogDescription>
							{deleting?.owner_name} won&apos;t be able to sign in, and the shop and its listings will be removed for good. To
							stop them selling for now, block the vendor instead.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteVendor.isPending}>Keep vendor</AlertDialogCancel>
						<AlertDialogAction
							disabled={deleteVendor.isPending}
							className="bg-error-500 hover:bg-error-700"
							onClick={(e) => {
								// Stay open until the API answers.
								e.preventDefault();
								if (deleting)
									deleteVendor.mutate(deleting, {
										onSuccess: () => {
											const next = new Set(selected);
											next.delete(deleting.id);
											onSelectedChange(next);
											setDeleting(null);
										},
									});
							}}
						>
							{deleteVendor.isPending ? "Deleting…" : "Delete vendor"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
