"use client";

import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { FysiLogo } from "@repo/ui/fysi-logo";
import { cn } from "@repo/ui/lib/utils";

/** The Figma "sent feedback" pop-up frame: the whole screen on mobile, a wide light card on desktop, × in the corner. */
export const FEEDBACK_DIALOG_CLASS = cn(
	"inset-0 flex h-dvh max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-grey-500 p-5 shadow-none",
	"sm:inset-auto sm:top-1/2 sm:left-1/2 sm:block sm:h-auto sm:min-h-[362px] sm:max-w-[790px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-10 sm:shadow-xl",
);

export function FeedbackDialogClose() {
	return (
		<DialogClose aria-label="Close" className="absolute top-5 right-5 grid size-9 place-items-center rounded-md text-ink hover:bg-grey-600 sm:top-12 sm:right-[34px]">
			<X className="size-7" strokeWidth={1.5} />
		</DialogClose>
	);
}

/** Figma "Thank you! Your feedback has been sent": the contents, for use inside a dialog. */
export function FeedbackSent() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center py-10 text-center sm:py-14">
			<span className="animate-pop text-primary-500">
				<FysiLogo size="xl" />
			</span>
			<DialogTitle className="animate-rise mt-6 text-[32px] leading-tight font-bold text-primary-500 sm:mt-8 sm:text-4xl" style={{ "--i": 2 } as React.CSSProperties}>
				Thank you!
			</DialogTitle>
			<DialogDescription className="animate-rise mt-4 mb-0 text-base text-grey-800 sm:mt-6 sm:text-lg" style={{ "--i": 3 } as React.CSSProperties}>
				Your feedback has been sent
			</DialogDescription>
		</div>
	);
}

/** The whole pop-up, for forms that show it on its own after sending (e.g. Report a Product / Problem). */
export function FeedbackSentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent showCloseButton={false} className={FEEDBACK_DIALOG_CLASS}>
				<FeedbackDialogClose />
				<FeedbackSent />
			</DialogContent>
		</Dialog>
	);
}
