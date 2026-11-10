"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { CloudUpload, X } from "lucide-react";
import { IMAGE_ACCEPT, IMAGE_MAX } from "@/features/products/schema";

interface Props {
	id: string;
	value: File | null;
	onChange: (file: File | null) => void;
	/** A file the box turned away before it reached the form (too many pixels). */
	onReject: (message: string) => void;
	invalid?: boolean;
	describedBy?: string;
	/** Product photo slots have a dashed border; the category thumbnail a solid one (Figma). */
	dashed?: boolean;
	/** Screen-reader name, e.g. "Product image 2". */
	label?: string;
}

/** Bitmap pixel size; SVGs scale, so they always pass. */
function imageSize(file: File): Promise<{ width: number; height: number } | null> {
	if (file.type === "image/svg+xml" || !file.type.startsWith("image/")) return Promise.resolve(null);
	return new Promise((resolve) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			resolve({ width: img.naturalWidth, height: img.naturalHeight });
			URL.revokeObjectURL(url);
		};
		img.onerror = () => {
			resolve(null);
			URL.revokeObjectURL(url);
		};
		img.src = url;
	});
}

/**
 * Figma upload box: an upload icon, "Click to upload or drag and drop" and the rules. Once a file is chosen it shows
 * the picture, with a way to remove it.
 */
export function ImageUpload({ id, value, onChange, onReject, invalid, describedBy, dashed = false, label = "image" }: Props) {
	const [dragging, setDragging] = useState(false);
	const preview = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
	useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

	const pick = async (file: File | undefined) => {
		if (!file) return;
		if (!IMAGE_ACCEPT.split(",").includes(file.type)) {
			onReject("Use an SVG, PNG, JPG or GIF.");
			return;
		}
		const size = await imageSize(file);
		if (size && (size.width > IMAGE_MAX.width || size.height > IMAGE_MAX.height)) {
			onReject(`That image is ${size.width}×${size.height}px. Use one up to ${IMAGE_MAX.width}×${IMAGE_MAX.height}px.`);
			return;
		}
		onChange(file);
	};

	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				setDragging(true);
			}}
			onDragLeave={() => setDragging(false)}
			onDrop={(e) => {
				e.preventDefault();
				setDragging(false);
				void pick(e.dataTransfer.files[0]);
			}}
			className={clsx(
				"relative flex min-h-[150px] flex-col items-center justify-center px-4 py-5 text-center transition-colors",
				dashed ? "rounded-md border border-dashed" : "rounded-xl border",
				invalid ? "border-error-500" : dashed ? "border-grey-700" : "border-grey-600",
				dragging && "border-primary-300 bg-primary-50",
			)}
		>
			<input
				id={id}
				type="file"
				accept={IMAGE_ACCEPT}
				aria-invalid={invalid}
				aria-describedby={describedBy}
				className="peer sr-only"
				onChange={(e) => {
					void pick(e.target.files?.[0]);
					e.target.value = ""; // so choosing the same file again still fires
				}}
			/>

			{value && preview ? (
				<>
					{/* eslint-disable-next-line @next/next/no-img-element -- a local blob preview, nothing to optimise */}
					<img src={preview} alt="" className="h-20 max-w-full rounded-md object-contain" />
					<p className="mt-2 max-w-full truncate text-xs text-ink">{value.name}</p>
					<p className="text-xs text-grey-900">
						<span className="font-semibold text-primary-500">Click to change</span> or drag and drop
					</p>
					<button
						type="button"
						onClick={() => onChange(null)}
						aria-label={`Remove ${label}`}
						className="absolute top-2 right-2 z-10 grid size-8 place-items-center rounded-full text-grey-900 hover:bg-grey-500 hover:text-ink"
					>
						<X className="size-4" aria-hidden />
					</button>
				</>
			) : (
				<>
					<span
						className={clsx(
							"grid size-10 place-items-center",
							dashed ? "rounded-full bg-grey-500" : "rounded-lg border border-grey-600 shadow-xs",
						)}
					>
						<CloudUpload className="size-5 text-ink" aria-hidden />
					</span>
					<p className="mt-3 text-sm text-grey-900">
						<span className="font-semibold text-primary-500">Click to upload</span> or drag and drop
					</p>
					<p className="mt-1 text-xs text-grey-900">
						SVG, PNG, JPG or GIF (max. {IMAGE_MAX.width}×{IMAGE_MAX.height}px)
					</p>
				</>
			)}

			{/* The label covers the whole box, so a click anywhere opens the picker. */}
			<label
				htmlFor={id}
				className={clsx(
					"absolute inset-0 cursor-pointer peer-focus-visible:ring-[3px] peer-focus-visible:ring-primary-300/50",
					dashed ? "rounded-md" : "rounded-xl",
				)}
			>
				<span className="sr-only">{value ? `Change ${label}` : `Upload ${label}`}</span>
			</label>
		</div>
	);
}
