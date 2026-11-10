"use client";

import { useState } from "react";
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
import { useRemoveProduct, useSetProductVisibility } from "@/features/products/hooks";
import type { AdminProduct } from "@/features/products/types";

export type ModerationAction = "hide" | "remove";

const MIN_REASON = 10;
const COPY: Record<ModerationAction, { title: string; body: string; confirm: string; busy: string; example: string }> = {
	hide: {
		title: "Hide {name} from the store?",
		body: "Customers stop seeing it; the vendor sees your reason and can fix the listing. You can show it again later.",
		confirm: "Hide product",
		busy: "Hiding…",
		example: "e.g. The eco claim on this listing isn't backed by a certificate.",
	},
	remove: {
		title: "Remove {name} for good?",
		body: "The listing is deleted and can't be restored. Paid orders for it still need delivering. To pause it instead, hide it.",
		confirm: "Remove listing",
		busy: "Removing…",
		example: "e.g. This product is banned for sale in Nigeria.",
	},
};

/** PRD A5: hide or remove a listing. Both need a reason, because the vendor is told. */
export function ModerationDialog({
	product,
	action,
	onClose,
}: {
	product: AdminProduct;
	action: ModerationAction | null;
	onClose: () => void;
}) {
	const [reason, setReason] = useState("");
	const hide = useSetProductVisibility();
	const remove = useRemoveProduct();
	const busy = hide.isPending || remove.isPending;
	const copy = action ? COPY[action] : null;
	const trimmed = reason.trim();
	const close = () => {
		setReason("");
		onClose();
	};

	return (
		<AlertDialog open={!!action} onOpenChange={(open) => !open && !busy && close()}>
			<AlertDialogContent>
				<form
					noValidate
					onSubmit={(e) => {
						e.preventDefault();
						if (trimmed.length < MIN_REASON) return;
						if (action === "hide") hide.mutate({ id: product.id, visibility: "hidden", reason: trimmed }, { onSuccess: close });
						if (action === "remove") remove.mutate({ product, reason: trimmed }, { onSuccess: close });
					}}
				>
					<AlertDialogHeader>
						<AlertDialogTitle>{copy?.title.replace("{name}", product.name)}</AlertDialogTitle>
						<AlertDialogDescription>{copy?.body}</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="mt-4 space-y-1.5">
						<label htmlFor={`moderation-reason-${product.id}`} className="block text-sm font-medium text-ink">
							Reason for {product.vendor?.shop_name ?? "the record"}
						</label>
						<textarea
							id={`moderation-reason-${product.id}`}
							rows={4}
							maxLength={500}
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder={copy?.example}
							aria-describedby={`moderation-reason-${product.id}-hint`}
							className="w-full resize-y rounded-md border border-grey-600 bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-grey-800 focus:border-primary-500 focus:ring-[3px] focus:ring-primary-300/30"
						/>
						<p id={`moderation-reason-${product.id}-hint`} className="text-xs text-grey-900">
							At least {MIN_REASON} characters. {product.vendor ? "The vendor sees this." : ""}
						</p>
					</div>
					<AlertDialogFooter className="mt-6">
						<AlertDialogCancel type="button" disabled={busy}>
							Cancel
						</AlertDialogCancel>
						<Button type="submit" disabled={busy || trimmed.length < MIN_REASON} className="bg-error-500 hover:bg-error-700">
							{busy ? copy?.busy : copy?.confirm}
						</Button>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
