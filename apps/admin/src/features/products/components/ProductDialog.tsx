"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePlus, Trash2, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { useAdminCategories, useSaveAdminProduct } from "@/features/products/hooks";
import type { AdminProduct } from "@/features/products/types";
import { useAdminVendor, useAdminVendors } from "@/features/vendors/hooks";
import type { CertificationId } from "@/features/vendors/types";
import { useToast } from "@/lib/use-toast";

const FIELD =
	"h-11 w-full rounded-md border border-grey-700 bg-white px-3 text-sm text-ink outline-none focus-visible:border-primary-300 focus-visible:ring-[3px] focus-visible:ring-primary-300/40";
const LABEL = "text-sm font-medium text-ink";
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_MAX = 5 * 1024 * 1024;
const MAX_PHOTOS = 8;

/** `"new"` adds a product for a vendor (POST /admin/products); a product edits it (PATCH /admin/products/:id). */
export function ProductDialog({ product, onClose }: { product: AdminProduct | "new" | null; onClose: () => void }) {
	return (
		<Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="block max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white px-5 py-6 sm:max-w-[680px] sm:px-8 sm:py-7"
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<DialogTitle className="text-2xl font-medium text-ink">
							{product === "new" ? "Add a product" : "Edit product"}
						</DialogTitle>
						<DialogDescription className="mt-1 text-sm text-grey-900">
							{product === "new"
								? "Listed in the vendor's shop as if they had added it. The change is recorded in the audit log."
								: `In ${product?.vendorName ?? "the vendor's"} shop. The change is recorded in the audit log.`}
						</DialogDescription>
					</div>
					<DialogClose aria-label="Close" className="rounded-md p-1 text-ink hover:bg-grey-500">
						<X className="size-6" />
					</DialogClose>
				</div>
				{product && (
					<Form key={product === "new" ? "new" : product.id} product={product === "new" ? undefined : product} onDone={onClose} />
				)}
			</DialogContent>
		</Dialog>
	);
}

function Form({ product, onDone }: { product?: AdminProduct; onDone: () => void }) {
	const toast = useToast();
	const save = useSaveAdminProduct();
	const categories = useAdminCategories();
	const vendors = useAdminVendors({ status: "approved", page: 1, limit: 100 });

	const [vendorId, setVendorId] = useState(product?.vendorId ?? "");
	const vendor = useAdminVendor(vendorId);
	const labels = vendor.data?.verifiedCertifications ?? [];
	const [title, setTitle] = useState(product?.title ?? "");
	const [description, setDescription] = useState(product?.description ?? "");
	const [categoryId, setCategoryId] = useState(product?.category?.id ?? "");
	const [dollars, setDollars] = useState(product ? (product.price.cents / 100).toFixed(2) : "");
	const [stock, setStock] = useState(product ? String(product.stock) : "");
	const [certifications, setCertifications] = useState<CertificationId[]>(
		(product?.certifications.map((c) => c.id) as CertificationId[]) ?? [],
	);
	const [status, setStatus] = useState<"active" | "hidden">(product?.status ?? "active");
	const [kept, setKept] = useState(() =>
		[...(product?.images ?? [])].sort((a, b) => a.position - b.position).filter((i) => i.url),
	);
	const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const addFiles = (list: FileList | null) => {
		if (!list) return;
		const room = MAX_PHOTOS - kept.length - files.length;
		const ok = [...list].filter((f) => PHOTO_TYPES.includes(f.type) && f.size <= PHOTO_MAX).slice(0, room);
		if (ok.length < list.length) toast.error(`Photos must be JPG, PNG or WebP, up to 5 MB each, ${MAX_PHOTOS} at most.`);
		setFiles((f) => [...f, ...ok.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (save.isPending) return;
		const er: Record<string, string> = {};
		if (!product && !vendorId) er.vendorId = "Choose the vendor";
		if (!title.trim()) er.title = "Enter the product name";
		if (description.trim().length < 10) er.description = "10 characters or more";
		if (!categoryId) er.categoryId = "Choose a category";
		const cents = Math.round(Number(dollars) * 100);
		if (!dollars || !Number.isFinite(cents) || cents <= 0) er.price = "Enter a price above $0";
		if (stock === "" || !Number.isInteger(Number(stock)) || Number(stock) < 0) er.stock = "0 or more";
		setErrors(er);
		if (Object.keys(er).length) return;
		const body = {
			title: title.trim(),
			description: description.trim(),
			priceCents: cents,
			stock: Number(stock),
			categoryId,
			certifications: certifications.filter((c) => labels.some((l) => l.id === c)),
			status,
		};
		const removed = (product?.images ?? []).filter((i) => !kept.some((k) => k.id === i.id)).map((i) => i.id);
		save.mutate(
			{
				id: product?.id,
				body: product ? body : { ...body, vendorId },
				newImages: files.map((f) => f.file),
				removedImageIds: removed,
			},
			{ onSuccess: onDone },
		);
	};

	const err = (k: string) => errors[k] && <span className="text-sm text-error-500">{errors[k]}</span>;

	return (
		<form noValidate onSubmit={onSubmit} className="mt-6 grid gap-4">
			{!product && (
				<label className="grid gap-1.5">
					<span className={LABEL}>Vendor</span>
					<select
						value={vendorId}
						onChange={(e) => setVendorId(e.target.value)}
						className={FIELD}
						aria-invalid={!!errors.vendorId}
					>
						<option value="">{vendors.isPending ? "Loading…" : "Choose an approved vendor"}</option>
						{(vendors.data?.items ?? []).map((v) => (
							<option key={v.id} value={v.id}>
								{v.businessName ?? v.email}
							</option>
						))}
					</select>
					{err("vendorId")}
				</label>
			)}
			<label className="grid gap-1.5">
				<span className={LABEL}>Name</span>
				<Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" aria-invalid={!!errors.title} />
				{err("title")}
			</label>
			<label className="grid gap-1.5">
				<span className={LABEL}>Description</span>
				<Textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={4}
					aria-invalid={!!errors.description}
				/>
				{err("description")}
			</label>
			<div className="grid gap-4 sm:grid-cols-3">
				<label className="grid gap-1.5">
					<span className={LABEL}>Category</span>
					<select
						value={categoryId}
						onChange={(e) => setCategoryId(e.target.value)}
						className={FIELD}
						aria-invalid={!!errors.categoryId}
					>
						<option value="">Choose</option>
						{(categories.data ?? [])
							.filter((c) => c.isActive || c.id === categoryId)
							.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
					</select>
					{err("categoryId")}
				</label>
				<label className="grid gap-1.5">
					<span className={LABEL}>Price (USD)</span>
					<Input
						value={dollars}
						onChange={(e) => setDollars(e.target.value)}
						inputMode="decimal"
						className="h-11"
						aria-invalid={!!errors.price}
					/>
					{err("price")}
				</label>
				<label className="grid gap-1.5">
					<span className={LABEL}>Stock</span>
					<Input
						value={stock}
						onChange={(e) => setStock(e.target.value)}
						inputMode="numeric"
						className="h-11"
						aria-invalid={!!errors.stock}
					/>
					{err("stock")}
				</label>
			</div>

			<fieldset className="grid gap-2">
				<legend className={LABEL}>Verified labels it carries</legend>
				{!vendorId ? (
					<p className="text-sm text-grey-800">Choose the vendor first.</p>
				) : labels.length === 0 ? (
					<p className="text-sm text-grey-800">{vendor.isPending ? "Loading…" : "This vendor has no verified labels."}</p>
				) : (
					<div className="flex flex-wrap gap-4">
						{labels.map((l) => (
							<label key={l.id} className="flex items-center gap-2 text-sm text-ink">
								<Checkbox
									checked={certifications.includes(l.id)}
									onCheckedChange={(on) => setCertifications((c) => (on ? [...c, l.id] : c.filter((x) => x !== l.id)))}
								/>
								{l.name}
							</label>
						))}
					</div>
				)}
			</fieldset>

			<fieldset className="flex flex-wrap gap-5 text-sm text-ink">
				<legend className={`${LABEL} mb-2`}>Vendor&apos;s switch</legend>
				<label className="flex items-center gap-2">
					<input type="radio" checked={status === "active"} onChange={() => setStatus("active")} className="accent-primary-500" />{" "}
					On sale
				</label>
				<label className="flex items-center gap-2">
					<input type="radio" checked={status === "hidden"} onChange={() => setStatus("hidden")} className="accent-primary-500" />{" "}
					Hidden
				</label>
			</fieldset>

			<div className="grid gap-2">
				<span className={LABEL}>Photos (the first is the cover)</span>
				<ul className="flex flex-wrap gap-3">
					{kept.map((i) => (
						<li key={i.id} className="relative size-20 overflow-hidden rounded-md bg-grey-600">
							<Image src={i.url!} alt="" fill unoptimized sizes="80px" className="object-cover" />
							<button
								type="button"
								onClick={() => setKept((k) => k.filter((x) => x.id !== i.id))}
								aria-label="Remove photo"
								className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-white text-error-500"
							>
								<Trash2 className="size-3.5" />
							</button>
						</li>
					))}
					{files.map((f, n) => (
						<li key={f.url} className="relative size-20 overflow-hidden rounded-md bg-grey-600">
							<Image src={f.url} alt="" fill unoptimized sizes="80px" className="object-cover" />
							<button
								type="button"
								onClick={() => {
									URL.revokeObjectURL(f.url);
									setFiles((all) => all.filter((_, j) => j !== n));
								}}
								aria-label="Remove photo"
								className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-white text-error-500"
							>
								<Trash2 className="size-3.5" />
							</button>
						</li>
					))}
					{kept.length + files.length < MAX_PHOTOS && (
						<li>
							<label className="grid size-20 cursor-pointer place-items-center rounded-md border border-dashed border-grey-700 text-grey-800 hover:border-primary-500 hover:text-primary-500">
								<ImagePlus className="size-6" aria-hidden />
								<span className="sr-only">Add photos</span>
								<input
									type="file"
									accept={PHOTO_TYPES.join(",")}
									multiple
									className="sr-only"
									onChange={(e) => addFiles(e.target.files)}
								/>
							</label>
						</li>
					)}
				</ul>
			</div>

			<div className="mt-2 flex gap-3">
				<Button type="submit" isLoading={save.isPending} className="h-12 flex-1 rounded-lg">
					{product ? "Save changes" : "Add product"}
				</Button>
				<DialogClose asChild>
					<Button type="button" variant="outline" className="h-12 flex-1 rounded-lg">
						Cancel
					</Button>
				</DialogClose>
			</div>
		</form>
	);
}
