"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { ListHeader } from "@/components/ListHeader";
import { useSaveProduct } from "@/features/products/hooks";
import type { ProductBody, ProductStatus, VendorProduct } from "@/features/products/types";
import { useCategories, useProfile } from "@/features/shop/hooks";
import type { CertificationId } from "@/features/shop/types";
import { errorMessage } from "@/lib/api/client";
import { consoleRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";

const CARD = "rounded-xl border border-grey-600 bg-white p-5 lg:p-7";
const FIELD =
	"h-11 w-full rounded-md border border-grey-700 bg-white px-3 text-sm text-ink outline-none focus-visible:border-primary-300 focus-visible:ring-[3px] focus-visible:ring-primary-300/40";
const LABEL = "text-sm font-medium text-ink";
const MAX_PHOTOS = 8;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_MAX = 5 * 1024 * 1024;

type Photo = { kind: "saved"; id: string; url: string } | { kind: "new"; file: File; url: string };

/**
 * Add Products / edit (PRD V7), as the API takes them: name, description, category, price in dollars (paid 1:1 in
 * USDC), stock, the shop's verified labels that cover it, on sale or hidden, and up to 8 photos (the first is the cover).
 */
export function ProductForm({ product }: { product?: VendorProduct }) {
	const router = useRouter();
	const toast = useToast();
	const save = useSaveProduct();
	const categories = useCategories();
	const profile = useProfile();
	const labels = profile.data?.verifiedCertifications ?? [];

	const [title, setTitle] = useState(product?.title ?? "");
	const [description, setDescription] = useState(product?.description ?? "");
	const [categoryId, setCategoryId] = useState(product?.category?.id ?? "");
	const [dollars, setDollars] = useState(product ? (product.price.cents / 100).toFixed(2) : "");
	const [stock, setStock] = useState(product ? String(product.stock) : "");
	const [certifications, setCertifications] = useState<CertificationId[]>(product?.certifications.map((c) => c.id) ?? []);
	const [status, setStatus] = useState<ProductStatus>(product?.status ?? "active");
	const [photos, setPhotos] = useState<Photo[]>(
		[...(product?.images ?? [])]
			.sort((a, b) => a.position - b.position)
			.filter((i) => i.url)
			.map((i) => ({ kind: "saved", id: i.id, url: i.url! })),
	);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const addFiles = (files: FileList | null) => {
		if (!files) return;
		const room = MAX_PHOTOS - photos.length;
		const ok = [...files].filter((f) => PHOTO_TYPES.includes(f.type) && f.size <= PHOTO_MAX).slice(0, room);
		if (ok.length < files.length) toast.error(`Photos must be JPG, PNG or WebP, up to 5 MB each, ${MAX_PHOTOS} at most.`);
		setPhotos((p) => [...p, ...ok.map((file): Photo => ({ kind: "new", file, url: URL.createObjectURL(file) }))]);
	};
	const move = (i: number, by: number) =>
		setPhotos((p) => {
			const next = [...p];
			const [item] = next.splice(i, 1);
			next.splice(Math.max(0, Math.min(next.length, i + by)), 0, item!);
			return next;
		});
	const drop = (i: number) =>
		setPhotos((p) => {
			const gone = p[i];
			if (gone?.kind === "new") URL.revokeObjectURL(gone.url);
			return p.filter((_, j) => j !== i);
		});

	const validate = () => {
		const e: Record<string, string> = {};
		if (!title.trim()) e.title = "Enter the product name";
		if (description.trim().length < 10) e.description = "Describe it in a few words (10 characters or more)";
		if (!categoryId) e.categoryId = "Choose a category";
		const cents = Math.round(Number(dollars) * 100);
		if (!dollars || !Number.isFinite(cents) || cents <= 0) e.price = "Enter a price above $0";
		if (stock === "" || !Number.isInteger(Number(stock)) || Number(stock) < 0) e.stock = "Enter the units you have (0 or more)";
		setErrors(e);
		return Object.keys(e).length === 0;
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate() || save.isPending) return;
		const body: ProductBody = {
			title: title.trim(),
			description: description.trim(),
			priceCents: Math.round(Number(dollars) * 100),
			stock: Number(stock),
			categoryId,
			certifications,
			status,
		};
		const kept = photos.filter((p): p is Extract<Photo, { kind: "saved" }> => p.kind === "saved").map((p) => p.id);
		const before = [...(product?.images ?? [])].sort((a, b) => a.position - b.position).map((i) => i.id);
		const removed = before.filter((id) => !kept.includes(id));
		const order = kept.join() !== before.filter((id) => kept.includes(id)).join() ? kept : undefined;
		save.mutate(
			{
				id: product?.id,
				body,
				newImages: photos.filter((p): p is Extract<Photo, { kind: "new" }> => p.kind === "new").map((p) => p.file),
				removedImageIds: removed,
				imageOrder: order,
			},
			{
				onSuccess: (saved) => {
					toast.success(product ? "Product saved" : `${saved.title} is listed`);
					router.push(consoleRoutes.PRODUCTS);
				},
				onError: (error) => toast.error(errorMessage(error, "Couldn't save the product. Try again.")),
			},
		);
	};

	return (
		<div className="px-4 py-6 lg:px-8 lg:py-7">
			<ListHeader
				title={product ? "Edit Product" : "Add Products"}
				crumb={product ? product.title : "Add Products"}
				parents={[{ label: "Products", href: consoleRoutes.PRODUCTS }]}
			/>

			{product?.moderationReason && product.moderationStatus !== "visible" && (
				<p role="alert" className="mt-6 rounded-lg border border-error-500 bg-error-50 p-4 text-sm text-ink">
					<strong className="font-semibold">
						{product.moderationStatus === "removed" ? "Removed by Fysi" : "Hidden by Fysi"}:
					</strong>{" "}
					{product.moderationReason}
				</p>
			)}

			<form noValidate onSubmit={onSubmit} className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
				<div className="space-y-6">
					<section className={CARD} aria-labelledby="details-title">
						<h2 id="details-title" className="text-lg font-semibold text-ink">
							Product details
						</h2>
						<div className="mt-4 grid gap-4">
							<Field label="Name" error={errors.title}>
								<Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className={FIELD} />
							</Field>
							<Field label="Description" error={errors.description}>
								<Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={5000} />
							</Field>
							<Field label="Category" error={errors.categoryId}>
								<select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={FIELD}>
									<option value="">Choose a category</option>
									{categories.data?.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</select>
							</Field>
						</div>
					</section>

					<section className={CARD} aria-labelledby="photos-title">
						<h2 id="photos-title" className="text-lg font-semibold text-ink">
							Photos
						</h2>
						<p className="mt-1 text-sm text-grey-900">Up to {MAX_PHOTOS}. The first is the cover. JPG, PNG or WebP, 5 MB each.</p>
						<ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
							{photos.map((p, i) => (
								<li
									key={p.kind === "saved" ? p.id : p.url}
									className="relative overflow-hidden rounded-lg border border-grey-600"
								>
									<div className="relative aspect-square bg-grey-600">
										<Image src={p.url} alt="" fill unoptimized sizes="200px" className="object-cover" />
										{i === 0 && (
											<span className="absolute top-1.5 left-1.5 rounded bg-primary-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
												Cover
											</span>
										)}
									</div>
									<div className="flex justify-between bg-white p-1">
										<button
											type="button"
											onClick={() => move(i, -1)}
											disabled={i === 0}
											aria-label="Move left"
											className="grid size-7 place-items-center rounded hover:bg-grey-500 disabled:opacity-30"
										>
											<ChevronLeft className="size-4" />
										</button>
										<button
											type="button"
											onClick={() => drop(i)}
											aria-label="Remove photo"
											className="grid size-7 place-items-center rounded text-error-500 hover:bg-error-50"
										>
											<Trash2 className="size-4" />
										</button>
										<button
											type="button"
											onClick={() => move(i, 1)}
											disabled={i === photos.length - 1}
											aria-label="Move right"
											className="grid size-7 place-items-center rounded hover:bg-grey-500 disabled:opacity-30"
										>
											<ChevronRight className="size-4" />
										</button>
									</div>
								</li>
							))}
							{photos.length < MAX_PHOTOS && (
								<li>
									<label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-grey-700 text-sm text-grey-900 hover:border-primary-500 hover:text-primary-500">
										<ImagePlus className="size-6" aria-hidden />
										Add photos
										<input
											type="file"
											multiple
											accept={PHOTO_TYPES.join(",")}
											className="sr-only"
											onChange={(e) => {
												addFiles(e.target.files);
												e.target.value = "";
											}}
										/>
									</label>
								</li>
							)}
						</ul>
						{photos.some((p) => p.kind === "saved") && photos.length < (product?.images.length ?? 0) && (
							<p className="mt-2 text-xs text-grey-800">Removed photos are deleted when you save.</p>
						)}
					</section>
				</div>

				<div className="space-y-6">
					<section className={CARD} aria-labelledby="price-title">
						<h2 id="price-title" className="text-lg font-semibold text-ink">
							Price and stock
						</h2>
						<div className="mt-4 grid gap-4">
							<Field label="Price (US$)" error={errors.price}>
								<div className="relative">
									<span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-grey-900">$</span>
									<Input
										inputMode="decimal"
										value={dollars}
										onChange={(e) => setDollars(e.target.value.replace(/[^\d.]/g, ""))}
										placeholder="12.50"
										className={clsx(FIELD, "pl-7")}
									/>
								</div>
								<span className="text-xs text-grey-800">
									Customers pay this in USDC (1 USDC = $1). Fysi&apos;s commission comes off at payout.
								</span>
							</Field>
							<Field label="Units in stock" error={errors.stock}>
								<Input
									inputMode="numeric"
									value={stock}
									onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
									className={FIELD}
								/>
							</Field>
						</div>
					</section>

					<section className={CARD} aria-labelledby="labels-title">
						<h2 id="labels-title" className="text-lg font-semibold text-ink">
							Certifications
						</h2>
						{labels.length === 0 ? (
							<p className="mt-2 text-sm text-grey-900">
								Your shop has no verified labels yet, so products show your shop&apos;s badge
								{profile.data?.badge === "fysi_reviewed" ? " (Fysi Reviewed)" : ""}.
							</p>
						) : (
							<ul className="mt-3 space-y-2">
								{labels.map((c) => (
									<li key={c.id}>
										<label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
											<Checkbox
												checked={certifications.includes(c.id)}
												onCheckedChange={(on) =>
													setCertifications((list) => (on ? [...list, c.id] : list.filter((x) => x !== c.id)))
												}
												className="size-5"
											/>
											{c.name}
										</label>
									</li>
								))}
							</ul>
						)}
					</section>

					<section className={CARD} aria-labelledby="visibility-title">
						<h2 id="visibility-title" className="text-lg font-semibold text-ink">
							Visibility
						</h2>
						<div className="mt-3 space-y-2" role="radiogroup" aria-labelledby="visibility-title">
							{(
								[
									["active", "On sale", "Customers can find and buy it."],
									["hidden", "Hidden", "Only you can see it (finish it first, or pause it)."],
								] as const
							).map(([value, label, hint]) => (
								<label key={value} className="flex cursor-pointer items-start gap-3 text-sm text-ink">
									<input
										type="radio"
										name="status"
										value={value}
										checked={status === value}
										onChange={() => setStatus(value)}
										className="mt-0.5 size-4 accent-primary-500"
									/>
									<span>
										<span className="font-medium">{label}</span>
										<span className="block text-xs text-grey-800">{hint}</span>
									</span>
								</label>
							))}
						</div>
					</section>

					<div className="flex gap-3">
						<Button asChild variant="outline" className="h-12 flex-1">
							<Link href={consoleRoutes.PRODUCTS}>Cancel</Link>
						</Button>
						<Button type="submit" isLoading={save.isPending} className="h-12 flex-1">
							{product ? "Save changes" : "Submit"}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
	return (
		<label className="grid gap-1.5">
			<span className={LABEL}>{label}</span>
			{children}
			{error && <span className="text-sm text-error-500">{error}</span>}
		</label>
	);
}
