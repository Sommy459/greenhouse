"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff, Leaf, Pencil, Plus, Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { Textarea } from "@repo/ui/textarea";
import { ExportButton } from "@/components/ExportButton";
import { ProductDialog } from "@/features/products/components/ProductDialog";
import { ListHeader } from "@/components/ListHeader";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import {
	useAdminCategories,
	useAdminProducts,
	useCreateCategory,
	useModerateProduct,
	useUpdateCategory,
} from "@/features/products/hooks";
import type { AdminCategory, AdminProduct, ModerationStatus } from "@/features/products/types";
import { count, price } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";

const PAGE_SIZE = 12;
const TH = "px-3 py-4 text-left text-sm font-medium whitespace-nowrap text-ink";
const MODERATION_LABEL: Record<ModerationStatus, string> = { visible: "Visible", hidden: "Hidden by Fysi", removed: "Removed" };
const MODERATION_TONE: Record<ModerationStatus, string> = {
	visible: "bg-success-50 text-success-700",
	hidden: "bg-warning-50 text-warning-700",
	removed: "bg-error-50 text-error-500",
};

/** PRD A5: moderate the catalogue (hide, unhide, remove with a reason the vendor sees) and manage categories. */
export function ProductsView() {
	const { get, set } = useUrlParams();
	const tab = get("tab") === "categories" ? "categories" : "products";
	const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader title="Products" crumb="Products">
				<div className="flex flex-wrap gap-3">
					<ExportButton kind="products" />
					<Button onClick={() => setEditing("new")} className="h-12 gap-2 rounded-lg px-5">
						<Plus className="size-5" aria-hidden /> Add product
					</Button>
				</div>
			</ListHeader>
			<div role="tablist" aria-label="Catalogue" className="mt-8 flex border-b border-grey-600">
				{(["products", "categories"] as const).map((t) => (
					<button
						key={t}
						type="button"
						role="tab"
						aria-selected={tab === t}
						onClick={() => set({ tab: t === "products" ? undefined : t })}
						className={clsx(
							"-mb-px border-b-2 px-5 pb-3 text-base capitalize transition-colors",
							tab === t ? "border-primary-500 text-primary-500" : "border-transparent text-grey-800 hover:text-primary-500",
						)}
					>
						{t}
					</button>
				))}
			</div>
			{tab === "products" ? <Products onEdit={setEditing} /> : <Categories />}
			<ProductDialog product={editing} onClose={() => setEditing(null)} />
		</div>
	);
}

function Products({ onEdit }: { onEdit: (product: AdminProduct) => void }) {
	const { get, page, set } = useUrlParams();
	const q = get("search");
	const vendorId = get("vendor") || undefined;
	const moderation = (["visible", "hidden", "removed"] as const).find((m) => m === get("moderation"));
	const includeDeleted = get("deleted") === "1";
	const { data, isPending, isError, isFetching, refetch } = useAdminProducts({
		q: q || undefined,
		vendorId,
		moderationStatus: moderation,
		includeDeleted: includeDeleted || undefined,
		page,
		limit: PAGE_SIZE,
	});
	const moderate = useModerateProduct();
	const [acting, setActing] = useState<{ product: AdminProduct; action: "hide" | "remove" } | null>(null);
	const products = data?.items ?? [];

	return (
		<>
			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchBox
					value={q}
					onChange={(v) => set({ search: v || undefined })}
					placeholder="Product name"
					label="Search products"
					className="w-full sm:w-72"
				/>
				<select
					value={moderation ?? ""}
					onChange={(e) => set({ moderation: e.target.value || undefined })}
					aria-label="Moderation"
					className="h-11 rounded-lg border border-grey-600 bg-white px-3 text-sm text-ink"
				>
					<option value="">All</option>
					<option value="visible">Visible</option>
					<option value="hidden">Hidden by Fysi</option>
					<option value="removed">Removed</option>
				</select>
				<label className="flex items-center gap-2 text-sm text-ink">
					<Checkbox checked={includeDeleted} onCheckedChange={(on) => set({ deleted: on ? "1" : undefined })} />
					Include deleted by vendor
				</label>
				{vendorId && (
					<button
						type="button"
						onClick={() => set({ vendor: undefined })}
						className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-500 hover:underline"
					>
						One vendor only ×
					</button>
				)}
			</div>

			<div className={clsx("mt-6 transition-opacity", isFetching && !isPending && "opacity-60")}>
				{isError ? (
					<div className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">
						<p>Couldn&apos;t load products.</p>
						<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
							Try again
						</Button>
					</div>
				) : !isPending && products.length === 0 ? (
					<p className="rounded-xl border border-grey-600 bg-white py-16 text-center text-sm text-grey-900">No products here.</p>
				) : (
					<div className="overflow-hidden rounded-xl border border-grey-600 bg-white">
						<div className="relative overflow-x-auto">
							<table className="w-full min-w-[960px]">
								<thead className="border-b border-grey-600 bg-grey-500">
									<tr>
										{["Product", "Vendor", "Price", "Stock", "Category", "Moderation", ""].map((h, i) => (
											<th key={h || i} scope="col" className={clsx(TH, i === 0 && "pl-6")}>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-grey-600">
									{isPending
										? Array.from({ length: 6 }, (_, i) => (
												<tr key={i}>
													<td colSpan={7} className="px-6 py-3">
														<Skeleton className="h-12 w-full" />
													</td>
												</tr>
											))
										: products.map((p) => {
												const cover = [...p.images].sort((a, b) => a.position - b.position)[0]?.url;
												return (
													<tr key={p.id} className="hover:bg-grey-500">
														<td className="py-3 pr-3 pl-6">
															<div className="flex items-center gap-3">
																<span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-grey-600">
																	{cover ? (
																		<Image src={cover} alt="" fill unoptimized sizes="48px" className="object-cover" />
																	) : (
																		<Leaf className="size-5 text-grey-700" aria-hidden />
																	)}
																</span>
																<span className="min-w-0">
																	<span className="block max-w-64 truncate text-sm font-medium text-ink">{p.title}</span>
																	{p.deletedAt && <span className="text-xs text-grey-800">Deleted by vendor</span>}
																	{p.moderationReason && p.moderationStatus !== "visible" && (
																		<span className="block max-w-64 truncate text-xs text-grey-800" title={p.moderationReason}>
																			“{p.moderationReason}”
																		</span>
																	)}
																</span>
															</div>
														</td>
														<td className="px-3 py-3 text-sm text-ink">{p.vendorName ?? "—"}</td>
														<td className="px-3 py-3 text-sm whitespace-nowrap text-ink">{price(p.price)}</td>
														<td className="px-3 py-3 text-sm text-ink">{count(p.stock)}</td>
														<td className="px-3 py-3 text-sm text-ink">{p.category?.name ?? "—"}</td>
														<td className="px-3 py-3">
															<span
																className={clsx(
																	"rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
																	MODERATION_TONE[p.moderationStatus],
																)}
															>
																{MODERATION_LABEL[p.moderationStatus]}
															</span>
														</td>
														<td className="py-3 pr-6 pl-3">
															<div className="flex justify-end gap-1">
																{!p.deletedAt && p.moderationStatus !== "removed" && (
																	<button
																		type="button"
																		onClick={() => onEdit(p)}
																		aria-label={`Edit ${p.title}`}
																		className="grid size-9 place-items-center rounded-md hover:bg-grey-500 hover:text-primary-500"
																	>
																		<Pencil className="size-4" />
																	</button>
																)}
																{p.moderationStatus === "visible" && (
																	<button
																		type="button"
																		onClick={() => setActing({ product: p, action: "hide" })}
																		aria-label={`Hide ${p.title}`}
																		className="grid size-9 place-items-center rounded-md hover:bg-grey-500 hover:text-primary-500"
																	>
																		<EyeOff className="size-4" />
																	</button>
																)}
																{p.moderationStatus === "hidden" && (
																	<button
																		type="button"
																		onClick={() => moderate.mutate({ product: p, moderation: { action: "unhide" } })}
																		disabled={moderate.isPending}
																		aria-label={`Show ${p.title} again`}
																		className="grid size-9 place-items-center rounded-md hover:bg-grey-500 hover:text-primary-500"
																	>
																		<Eye className="size-4" />
																	</button>
																)}
																{p.moderationStatus !== "removed" && (
																	<button
																		type="button"
																		onClick={() => setActing({ product: p, action: "remove" })}
																		aria-label={`Remove ${p.title}`}
																		className="grid size-9 place-items-center rounded-md hover:bg-error-50 hover:text-error-500"
																	>
																		<Trash2 className="size-4" />
																	</button>
																)}
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

			<ModerationDialog key={acting?.product.id ?? "none"} acting={acting} onClose={() => setActing(null)} />
		</>
	);
}

function ModerationDialog({
	acting,
	onClose,
}: {
	acting: { product: AdminProduct; action: "hide" | "remove" } | null;
	onClose: () => void;
}) {
	const moderate = useModerateProduct();
	const [reason, setReason] = useState("");
	const ok = reason.trim().length >= 10;
	return (
		<AlertDialog open={!!acting} onOpenChange={(open) => !open && !moderate.isPending && onClose()}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{acting?.action === "remove" ? `Remove ${acting.product.title}?` : `Hide ${acting?.product.title} from the store?`}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{acting?.action === "remove"
							? "It comes off the store for good. Paid orders for it still need delivering."
							: "Customers stop seeing it; the vendor sees your reason and can fix it. You can show it again later."}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<label htmlFor="moderation-reason" className="text-sm font-medium text-ink">
					Reason (the vendor sees it)
				</label>
				<Textarea
					id="moderation-reason"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					rows={3}
					placeholder="e.g. The eco claim isn't backed by a certificate."
				/>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={moderate.isPending}>Cancel</AlertDialogCancel>
					<Button
						disabled={!ok || moderate.isPending || !acting}
						isLoading={moderate.isPending}
						variant="destructive"
						className="hover:bg-error-700"
						onClick={() =>
							acting &&
							moderate.mutate(
								{ product: acting.product, moderation: { action: acting.action, reason: reason.trim() } },
								{ onSuccess: onClose },
							)
						}
					>
						{acting?.action === "remove" ? "Remove" : "Hide"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function Categories() {
	const { data, isPending, isError, refetch } = useAdminCategories();
	const create = useCreateCategory();
	const [name, setName] = useState("");
	const categories = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

	return (
		<div className="mt-6 space-y-6">
			<form
				noValidate
				className="flex flex-wrap items-end gap-3 rounded-xl border border-grey-600 bg-white p-5"
				onSubmit={(e) => {
					e.preventDefault();
					if (name.trim())
						create.mutate({ name: name.trim(), sortOrder: categories.length + 1 }, { onSuccess: () => setName("") });
				}}
			>
				<label className="grid flex-1 gap-1.5">
					<span className="text-sm font-medium text-ink">New category</span>
					<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Baby and kids" className="h-11" />
				</label>
				<Button type="submit" isLoading={create.isPending} disabled={!name.trim()} className="h-11 gap-2">
					<Plus className="size-4" aria-hidden /> Add
				</Button>
			</form>

			{isError ? (
				<div className="rounded-xl border border-grey-600 bg-white py-12 text-center text-sm text-grey-900">
					<p>Couldn&apos;t load categories.</p>
					<Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
						Try again
					</Button>
				</div>
			) : isPending ? (
				<Skeleton className="h-64 rounded-xl" />
			) : (
				<ul className="divide-y divide-grey-600 rounded-xl border border-grey-600 bg-white">
					{categories.map((c) => (
						<CategoryRow key={`${c.id}-${c.name}-${c.isActive}-${c.sortOrder}`} category={c} />
					))}
				</ul>
			)}
		</div>
	);
}

function CategoryRow({ category: c }: { category: AdminCategory }) {
	const update = useUpdateCategory();
	const [name, setName] = useState(c.name);
	const [order, setOrder] = useState(String(c.sortOrder));
	const changed = name.trim() !== c.name || Number(order) !== c.sortOrder;
	return (
		<li className="flex flex-wrap items-center gap-3 px-5 py-3">
			<Input value={name} onChange={(e) => setName(e.target.value)} aria-label={`Name of ${c.name}`} className="h-10 w-56" />
			<Input
				value={order}
				onChange={(e) => setOrder(e.target.value.replace(/\D/g, ""))}
				aria-label={`Position of ${c.name}`}
				className="h-10 w-16"
			/>
			<span className="text-sm text-grey-900">
				/{c.slug} · {count(c.productCount)} product{c.productCount === 1 ? "" : "s"}
			</span>
			<span
				className={clsx(
					"rounded-full px-2.5 py-0.5 text-xs font-medium",
					c.isActive ? "bg-success-50 text-success-700" : "bg-grey-500 text-grey-900",
				)}
			>
				{c.isActive ? "Active" : "Off"}
			</span>
			<div className="ml-auto flex gap-2">
				{changed && (
					<Button
						size="sm"
						isLoading={update.isPending}
						onClick={() => update.mutate({ id: c.id, name: name.trim(), sortOrder: Number(order) || c.sortOrder })}
					>
						Save
					</Button>
				)}
				<Button
					size="sm"
					variant="outline"
					disabled={update.isPending}
					onClick={() => update.mutate({ id: c.id, isActive: !c.isActive })}
				>
					{c.isActive ? "Turn off" : "Turn on"}
				</Button>
			</div>
		</li>
	);
}
