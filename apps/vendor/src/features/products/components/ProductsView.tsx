"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Leaf, Pencil, Plus, Trash2, X } from "lucide-react";
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
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Skeleton } from "@repo/ui/skeleton";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { useDeleteProduct, useMyProducts, useSetProductsStatus } from "@/features/products/hooks";
import { productState, STATE_LABEL, STATE_TONE, type ProductStatus, type VendorProduct } from "@/features/products/types";
import { count, price } from "@/lib/format";
import { consoleRoutes } from "@/lib/routes";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 10;
const TABS: { value: ProductStatus | undefined; label: string }[] = [
	{ value: undefined, label: "All" },
	{ value: "active", label: "On sale" },
	{ value: "hidden", label: "Hidden" },
];
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";

/**
 * Figma Vendor Hub "Manage Products" (PRD V7), on the API: All / On sale / Hidden, search by name, the table (photo,
 * price, stock, category, status), bulk hide and show, edit and delete. Products Fysi hid or removed say why.
 */
export function ProductsView() {
	const { get, page, set } = useUrlParams();
	const status = (["active", "hidden"] as const).find((s) => s === get("status"));
	const q = get("search");
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [deleting, setDeleting] = useState<VendorProduct | null>(null);
	const { data, isPending, isError, isFetching, refetch } = useMyProducts({ status, q: q || undefined, page, limit: PAGE_SIZE });
	const all = useMyProducts({ page: 1, limit: 1 });
	const setStatus = useSetProductsStatus();
	const remove = useDeleteProduct();
	const products = data?.items ?? [];
	const ids = products.map((p) => p.id);
	const ticked = ids.filter((id) => selected.has(id));

	const toggle = (id: string) => {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		setSelected(next);
	};
	const bulk = (to: ProductStatus) =>
		setStatus.mutate({ ids: [...selected], status: to }, { onSuccess: () => setSelected(new Set()) });

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Products" crumb="Products">
				<Button asChild className="h-12 rounded-lg px-5">
					<Link href={consoleRoutes.NEW_PRODUCT}>
						<Plus className="size-5" aria-hidden /> Add Product
					</Link>
				</Button>
			</ListHeader>

			<div className="mt-8 flex flex-wrap items-end justify-between gap-4">
				<div role="tablist" aria-label="Product status" className="flex border-b border-grey-600">
					{TABS.map((t) => (
						<button
							key={t.label}
							type="button"
							role="tab"
							aria-selected={status === t.value}
							onClick={() => {
								setSelected(new Set());
								set({ status: t.value });
							}}
							className={clsx(
								"-mb-px flex items-center gap-2 border-b-2 px-5 pb-3 text-base transition-colors",
								status === t.value
									? "border-primary-500 text-primary-500"
									: "border-transparent text-grey-800 hover:text-primary-500",
							)}
						>
							{t.label}
							{!t.value && all.data && (
								<span className="rounded-full bg-primary-500 px-2 py-px text-xs font-medium text-white">
									{count(all.data.meta.total)}
								</span>
							)}
						</button>
					))}
				</div>
				<SearchBox
					value={q}
					onChange={(value) => set({ search: value || undefined })}
					placeholder="Search by product name"
					label="Search products"
					className="w-full sm:w-80"
				/>
			</div>

			{selected.size > 0 && (
				<div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg bg-primary-50 px-4 py-3 text-sm text-ink">
					<span className="font-medium">{selected.size} selected</span>
					<Button
						size="sm"
						variant="outline"
						onClick={() => bulk("hidden")}
						disabled={setStatus.isPending}
						className="gap-1.5 bg-white"
					>
						<EyeOff className="size-4" aria-hidden /> Hide
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={() => bulk("active")}
						disabled={setStatus.isPending}
						className="gap-1.5 bg-white"
					>
						<Eye className="size-4" aria-hidden /> Show
					</Button>
					<button
						type="button"
						onClick={() => setSelected(new Set())}
						className="ml-auto inline-flex items-center gap-1 text-grey-900 hover:text-ink"
					>
						<X className="size-4" aria-hidden /> Clear
					</button>
				</div>
			)}

			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load your products.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && products.length === 0 ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>{q ? "No products match." : status ? "Nothing here." : "No products yet."}</p>
						{!q && !status && (
							<Button asChild className="mt-4">
								<Link href={consoleRoutes.NEW_PRODUCT}>Add your first product</Link>
							</Button>
						)}
					</div>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[900px]">
								<thead className="border-b border-grey-600 bg-grey-500">
									<tr>
										<th scope="col" className="w-12 py-4 pl-6">
											<Checkbox
												aria-label="Select all products on this page"
												checked={
													ids.length > 0 && ticked.length === ids.length ? true : ticked.length > 0 ? "indeterminate" : false
												}
												onCheckedChange={() => {
													const next = new Set(selected);
													if (ticked.length === ids.length) ids.forEach((id) => next.delete(id));
													else ids.forEach((id) => next.add(id));
													setSelected(next);
												}}
												className="size-5"
											/>
										</th>
										{["Product", "Price", "Stock", "Category", "Status"].map((h) => (
											<th key={h} scope="col" className={TH}>
												{h}
											</th>
										))}
										<th scope="col" className={clsx(TH, "pr-6 text-right")}>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: 5 }, (_, i) => (
												<tr key={i}>
													<td colSpan={7} className="px-6 py-3">
														<Skeleton className="h-12 w-full" />
													</td>
												</tr>
											))
										: products.map((p) => {
												const state = productState(p);
												const cover = [...p.images].sort((a, b) => a.position - b.position)[0]?.url;
												return (
													<tr
														key={p.id}
														data-selected={selected.has(p.id)}
														className="transition-colors hover:bg-grey-500 data-[selected=true]:bg-primary-50"
													>
														<td className="py-3 pl-6">
															<Checkbox
																aria-label={`Select ${p.title}`}
																checked={selected.has(p.id)}
																onCheckedChange={() => toggle(p.id)}
																className="size-5"
															/>
														</td>
														<td className="px-3 py-3">
															<div className="flex items-center gap-3">
																<span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-grey-600">
																	{cover ? (
																		<Image src={cover} alt="" fill unoptimized sizes="48px" className="object-cover" />
																	) : (
																		<Leaf className="size-5 text-grey-700" aria-hidden />
																	)}
																</span>
																<span className="min-w-0">
																	<Link
																		href={consoleRoutes.PRODUCT(p.id)}
																		className="block max-w-72 truncate font-medium text-ink hover:text-primary-500 hover:underline"
																	>
																		{p.title}
																	</Link>
																	{p.moderationReason && state !== "live" && (
																		<span className="block max-w-72 truncate text-xs text-error-500" title={p.moderationReason}>
																			Fysi: {p.moderationReason}
																		</span>
																	)}
																</span>
															</div>
														</td>
														<td className="px-3 py-3 text-sm whitespace-nowrap text-ink">{price(p.price)}</td>
														<td className="px-3 py-3 text-sm text-ink">{count(p.stock)}</td>
														<td className="px-3 py-3 text-sm text-ink">{p.category?.name ?? "—"}</td>
														<td className="px-3 py-3">
															<span
																className={clsx(
																	"rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
																	STATE_TONE[state],
																)}
															>
																{STATE_LABEL[state]}
															</span>
														</td>
														<td className="py-3 pr-6 pl-3">
															<div className="flex justify-end gap-1">
																<Link
																	href={consoleRoutes.PRODUCT(p.id)}
																	aria-label={`Edit ${p.title}`}
																	className="grid size-9 place-items-center rounded-md text-ink hover:bg-grey-500 hover:text-primary-500"
																>
																	<Pencil className="size-4" />
																</Link>
																<button
																	type="button"
																	onClick={() =>
																		setStatus.mutate({ ids: [p.id], status: p.status === "active" ? "hidden" : "active" })
																	}
																	disabled={setStatus.isPending || p.moderationStatus === "removed"}
																	aria-label={p.status === "active" ? `Hide ${p.title}` : `Show ${p.title}`}
																	className="grid size-9 place-items-center rounded-md text-ink hover:bg-grey-500 hover:text-primary-500 disabled:opacity-40"
																>
																	{p.status === "active" ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
																</button>
																<button
																	type="button"
																	onClick={() => setDeleting(p)}
																	aria-label={`Delete ${p.title}`}
																	className="grid size-9 place-items-center rounded-md text-ink hover:bg-error-50 hover:text-error-500"
																>
																	<Trash2 className="size-4" />
																</button>
															</div>
														</td>
													</tr>
												);
											})}
								</tbody>
							</table>
						</div>
						{data && data.meta.total_pages > 1 && (
							<div className="border-t border-grey-600">
								<Pagination
									page={data.meta.page}
									totalPages={data.meta.total_pages}
									onChange={(n) => set({ page: n > 1 ? String(n) : undefined })}
								/>
							</div>
						)}
					</div>
				)}
			</div>

			<AlertDialog open={!!deleting} onOpenChange={(open) => !open && !remove.isPending && setDeleting(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {deleting?.title}?</AlertDialogTitle>
						<AlertDialogDescription>It comes off the store for good. Orders already placed keep it.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={remove.isPending}>Keep it</AlertDialogCancel>
						<AlertDialogAction
							disabled={remove.isPending}
							className="bg-error-500 hover:bg-error-700"
							onClick={(e) => {
								e.preventDefault();
								if (deleting) remove.mutate(deleting, { onSuccess: () => setDeleting(null) });
							}}
						>
							{remove.isPending ? "Deleting…" : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
