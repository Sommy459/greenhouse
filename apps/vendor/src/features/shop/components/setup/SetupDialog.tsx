"use client";

import { XIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent } from "@repo/ui/dialog";
import { cn } from "@repo/ui/lib/utils";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** While something is being sent, the dialog can't be closed. */
	locked?: boolean;
	className?: string;
	children: React.ReactNode;
}

/**
 * The frame both sign-up dialogs share (Figma): a white card with an outlined × on desktop, the whole screen on mobile.
 * Children lay out the content; use `mt-auto sm:mt-[…]` on the last block to pin it low on mobile.
 */
export function SetupDialog({ open, onOpenChange, locked = false, className, children }: Props) {
	return (
		<Dialog open={open} onOpenChange={(next) => !locked && onOpenChange(next)}>
			<DialogContent
				showCloseButton={false}
				className={cn(
					// Mobile: full screen on the page background.
					"inset-0 flex h-dvh max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-grey-500 px-4 pt-24 pb-16 shadow-none",
					// Desktop: the white card.
					"sm:inset-auto sm:top-1/2 sm:left-1/2 sm:block sm:h-auto sm:max-w-[705px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:bg-white sm:px-10 sm:pt-[100px] sm:pb-[70px] sm:shadow-xl",
					className,
				)}
			>
				<DialogClose
					disabled={locked}
					aria-label="Close"
					className="absolute top-12 right-5 grid size-8 place-items-center rounded-full border-[1.5px] border-ink text-ink hover:bg-grey-500 disabled:opacity-50 sm:top-12 sm:right-[78px] sm:size-7"
				>
					<XIcon className="size-4 sm:size-3.5" strokeWidth={2} />
				</DialogClose>
				{children}
			</DialogContent>
		</Dialog>
	);
}
