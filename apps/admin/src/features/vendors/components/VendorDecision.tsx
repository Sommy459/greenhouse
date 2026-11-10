"use client";

import { useState } from "react";
import { Ban, Check, RotateCcw, X } from "lucide-react";
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
import { useSetVendorStatus } from "@/features/vendors/hooks";
import type { VendorDetail, VendorStatus } from "@/features/vendors/types";

type Action = "approve" | "reject" | "suspend" | "reactivate";

const ACTION: Record<
	Action,
	{ status: VendorStatus; title: string; body: string; confirm: string; busy: string; reason: "required" | "optional" | null }
> = {
	approve: {
		status: "approved",
		title: "Approve this shop?",
		body: "Fysi creates their wallet and they can start listing products straight away.",
		confirm: "Approve",
		busy: "Approving…",
		reason: null,
	},
	reject: {
		status: "rejected",
		title: "Reject this application?",
		body: "The vendor sees your reason on their pending page and can fix it and resubmit.",
		confirm: "Reject",
		busy: "Rejecting…",
		reason: "required",
	},
	suspend: {
		status: "suspended",
		title: "Suspend this shop?",
		body: "Their listings are hidden and they can't sell or withdraw until you reactivate them. Orders already paid still need delivering.",
		confirm: "Suspend",
		busy: "Suspending…",
		reason: "optional",
	},
	reactivate: {
		status: "approved",
		title: "Reactivate this shop?",
		body: "Their listings show again and they can sell.",
		confirm: "Reactivate",
		busy: "Reactivating…",
		reason: null,
	},
};

/** Which decisions fit each state (PRD A1): the queue gets approve / reject; live shops suspend; blocked shops come back. */
const ACTIONS_FOR: Record<VendorStatus, Action[]> = {
	pending: ["reject", "approve"],
	approved: ["suspend"],
	suspended: ["reactivate"],
	rejected: ["approve"],
};

const MIN_REASON = 10;

/** The header buttons on Vendor details, each confirmed in a dialog. */
export function VendorDecision({ vendor }: { vendor: VendorDetail }) {
	const [action, setAction] = useState<Action | null>(null);
	const [reason, setReason] = useState("");
	const setStatus = useSetVendorStatus();
	const spec = action ? ACTION[action] : null;
	const trimmed = reason.trim();
	const reasonMissing = spec?.reason === "required" && trimmed.length < MIN_REASON;

	const open = (next: Action) => {
		setReason("");
		setAction(next);
	};

	return (
		<>
			<div className="flex flex-wrap gap-3">
				{ACTIONS_FOR[vendor.status].map((a) => (
					<Button
						key={a}
						type="button"
						size="sm"
						variant={a === "reject" || a === "suspend" ? "outline" : "default"}
						onClick={() => open(a)}
						className={
							a === "reject" || a === "suspend"
								? "h-12 rounded-lg border-error-500 bg-white px-5 text-error-500 hover:bg-error-50 hover:text-error-500"
								: "h-12 rounded-lg px-5"
						}
					>
						{a === "approve" && <Check className="size-5" aria-hidden />}
						{a === "reject" && <X className="size-5" aria-hidden />}
						{a === "suspend" && <Ban className="size-5" aria-hidden />}
						{a === "reactivate" && <RotateCcw className="size-5" aria-hidden />}
						{ACTION[a].confirm}
					</Button>
				))}
			</div>

			<AlertDialog open={!!action} onOpenChange={(o) => !o && !setStatus.isPending && setAction(null)}>
				<AlertDialogContent>
					<form
						noValidate
						onSubmit={(e) => {
							e.preventDefault();
							if (!spec || reasonMissing) return;
							setStatus.mutate(
								{ id: vendor.id, status: spec.status, reason: trimmed || undefined },
								{ onSuccess: () => setAction(null) },
							);
						}}
					>
						<AlertDialogHeader>
							<AlertDialogTitle>{spec?.title.replace("this shop", vendor.shop_name)}</AlertDialogTitle>
							<AlertDialogDescription>{spec?.body}</AlertDialogDescription>
						</AlertDialogHeader>

						{spec?.reason && (
							<div className="mt-4 space-y-1.5">
								<label htmlFor="decision-reason" className="block text-sm font-medium text-ink">
									Reason{spec.reason === "optional" && <span className="font-normal text-grey-900"> (optional)</span>}
								</label>
								<textarea
									id="decision-reason"
									rows={4}
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									maxLength={500}
									placeholder={
										spec.reason === "required"
											? "e.g. The CAC certificate is unreadable. Upload a clearer scan."
											: "For the activity log"
									}
									aria-describedby="decision-reason-hint"
									className="w-full resize-y rounded-md border border-grey-600 bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-grey-800 focus:border-primary-500 focus:ring-[3px] focus:ring-primary-300/30"
								/>
								<p id="decision-reason-hint" className="text-xs text-grey-900">
									{spec.reason === "required"
										? `At least ${MIN_REASON} characters. Be specific: the vendor uses this to fix their application.`
										: "Only staff see this."}
								</p>
							</div>
						)}

						<AlertDialogFooter className="mt-6">
							<AlertDialogCancel type="button" disabled={setStatus.isPending}>
								Cancel
							</AlertDialogCancel>
							<Button
								type="submit"
								disabled={setStatus.isPending || reasonMissing}
								className={action === "reject" || action === "suspend" ? "bg-error-500 hover:bg-error-700" : undefined}
							>
								{setStatus.isPending ? spec?.busy : spec?.confirm}
							</Button>
						</AlertDialogFooter>
					</form>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
