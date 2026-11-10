"use client";

import { useId, useState } from "react";
import { CloudUpload, FileCheck2, X } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { CERTIFICATE_ACCEPT } from "@/features/shop/schema";

interface Props {
	value: File | null;
	onChange: (file: File | null) => void;
	onBlur?: () => void;
	invalid?: boolean;
	/** Ties the hidden input to the field's label and error (FormControl passes these). */
	id?: string;
	"aria-describedby"?: string;
	"aria-invalid"?: boolean;
}

const formatSize = (bytes: number) =>
	bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * Figma "Upload CAC Certificate": a dashed box with a cloud icon, "Tap to Upload", the allowed types and an Upload
 * button. The whole box opens the file picker; a file can also be dropped on it. Once chosen it shows the file name.
 */
export function CertificateUpload({ value, onChange, onBlur, invalid, id, ...aria }: Props) {
	const fallbackId = useId();
	const inputId = id ?? fallbackId;
	const [dragging, setDragging] = useState(false);

	const pick = (files: FileList | null) => {
		onChange(files?.[0] ?? null);
		onBlur?.();
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
				pick(e.dataTransfer.files);
			}}
			className={cn(
				"relative flex items-center gap-3 rounded-md border border-dashed bg-white px-4 py-4 transition-colors lg:px-5",
				invalid ? "border-error-500" : "border-grey-700",
				dragging && "border-primary-300 bg-primary-50",
			)}
		>
			<input
				id={inputId}
				type="file"
				accept={CERTIFICATE_ACCEPT}
				className="peer sr-only"
				onChange={(e) => {
					pick(e.target.files);
					e.target.value = ""; // so choosing the same file again still fires
				}}
				{...aria}
			/>

			<span className="grid size-9 shrink-0 place-items-center rounded-full bg-grey-500 text-grey-900">
				{value ? (
					<FileCheck2 className="size-[18px] text-primary-500" aria-hidden />
				) : (
					<CloudUpload className="size-[18px]" aria-hidden />
				)}
			</span>

			<div className="min-w-0 flex-1">
				{value ? (
					<>
						<p className="truncate text-base text-ink lg:text-sm">{value.name}</p>
						<p className="text-sm text-grey-800 lg:text-xs">{formatSize(value.size)}</p>
					</>
				) : (
					<>
						<p className="text-base text-ink lg:text-sm">Tap to Upload</p>
						<p className="text-sm text-grey-800 lg:text-xs">SVG, PNG, JPG, GIF | 10MB max.</p>
					</>
				)}
			</div>

			{value && (
				<button
					type="button"
					onClick={() => onChange(null)}
					aria-label="Remove file"
					className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-grey-900 hover:bg-grey-500 hover:text-ink"
				>
					<X className="size-4" aria-hidden />
				</button>
			)}

			{/* The label covers the whole box (after:inset-0), so a tap anywhere opens the picker. */}
			<label
				htmlFor={inputId}
				className="h-9 shrink-0 cursor-pointer rounded-md bg-primary-500 px-5 text-base leading-9 font-semibold text-white peer-focus-visible:ring-[3px] peer-focus-visible:ring-primary-300/50 after:absolute after:inset-0 hover:bg-primary-600 lg:text-sm"
			>
				{value ? "Change" : "Upload"}
			</label>
		</div>
	);
}
