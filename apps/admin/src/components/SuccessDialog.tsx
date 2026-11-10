"use client";

import { X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { VerifiedSeal } from "@repo/ui/verified-seal";

interface Props {
	open: boolean;
	onClose: () => void;
	title: string;
	/** For screen readers: what happens next. */
	description: string;
	action: { label: string; onClick: () => void };
}

/** Figma admin success dialog: the green seal, a one-line message and one button; the circled × just closes it. */
export function SuccessDialog({ open, onClose, title, description, action }: Props) {
	return (
		<Dialog open={open} onOpenChange={(next) => !next && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="rounded-3xl bg-white px-6 pt-20 pb-12 text-center sm:max-w-[705px] sm:px-10 sm:pt-[118px] sm:pb-[62px]"
			>
				<DialogClose
					aria-label="Close"
					className="absolute top-12 right-6 grid size-7 place-items-center rounded-full border-[1.5px] border-ink text-ink hover:bg-grey-500 sm:right-[78px]"
				>
					<X className="size-3.5" strokeWidth={2} />
				</DialogClose>
				<VerifiedSeal className="animate-pop mx-auto size-[150px] sm:size-[190px]" />
				<DialogTitle className="mt-7 text-2xl font-medium text-primary-400 sm:text-[26px]">{title}</DialogTitle>
				<DialogDescription className="sr-only">{description}</DialogDescription>
				<div className="mx-auto mt-14 w-full max-w-[427px] sm:mt-[120px]">
					<Button type="button" className="h-14 w-full rounded-md text-base font-semibold" onClick={action.onClick}>
						{action.label}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
