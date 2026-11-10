"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { cn } from "@repo/ui/lib/utils";
import { FEEDBACK_DIALOG_CLASS, FeedbackDialogClose, FeedbackSent } from "@/components/FeedbackSent";
import { useSaveReview } from "@/features/reviews/hooks";
import type { MyReview } from "@/features/reviews/types";

const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
const MIN_BODY = 10;
const MAX_BODY = 2000;

/**
 * Figma "Your Opinion is Important to us" (C9): stars, an optional title and the review, for a product from a delivered
 * order (`orderLineId`), or editing `existing`. Sending shows the Figma "Thank you!" pop-up; `onReviewed` runs when it
 * closes.
 */
export function LeaveReviewDialog({
	orderLineId,
	existing,
	productName,
	renderTrigger,
	onReviewed,
}: {
	orderLineId?: string;
	existing?: MyReview;
	productName: string;
	renderTrigger: (open: () => void) => React.ReactNode;
	onReviewed?: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [sent, setSent] = useState(false);

	const onOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next && sent) onReviewed?.();
		if (!next) setSent(false);
	};

	return (
		<>
			{renderTrigger(() => setOpen(true))}
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent
					showCloseButton={false}
					className={cn(
						FEEDBACK_DIALOG_CLASS,
						!sent && "overflow-y-auto sm:max-h-[95dvh] sm:max-w-[568px] sm:px-[58px] sm:pt-14 sm:pb-11",
					)}
				>
					<FeedbackDialogClose />
					{sent ? (
						<FeedbackSent />
					) : (
						<ReviewForm orderLineId={orderLineId} existing={existing} productName={productName} onSent={() => setSent(true)} />
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

function ReviewForm({
	orderLineId,
	existing,
	productName,
	onSent,
}: {
	orderLineId?: string;
	existing?: MyReview;
	productName: string;
	onSent: () => void;
}) {
	const [rating, setRating] = useState(existing?.rating ?? 0);
	const [hover, setHover] = useState(0);
	const [title, setTitle] = useState(existing?.title ?? "");
	const [body, setBody] = useState(existing?.body ?? "");
	const [tried, setTried] = useState(false);
	const save = useSaveReview({ onSaved: onSent });
	const ids = useId();
	const shown = hover || rating;
	const errors = {
		rating: tried && rating === 0 ? "Choose a star rating" : null,
		body: tried && body.trim().length < MIN_BODY ? `Tell other shoppers a little more (at least ${MIN_BODY} characters)` : null,
	};

	return (
		<form
			noValidate
			onSubmit={(e) => {
				e.preventDefault();
				setTried(true);
				if (rating === 0 || body.trim().length < MIN_BODY || save.isPending) return;
				save.mutate({ id: existing?.id, orderLineId, rating, title: title.trim() || null, body: body.trim() });
			}}
			className="flex w-full flex-1 flex-col pt-12 sm:pt-0"
		>
			<DialogTitle className="pr-10 text-[26px] leading-tight font-semibold text-ink sm:text-[30px]">
				Your Opinion is Important to us
			</DialogTitle>
			<DialogDescription className="mt-2 text-sm text-grey-900">Your review of {productName}</DialogDescription>

			<fieldset className="mt-8 flex items-center gap-2 sm:mt-10">
				<legend className="float-left mr-2 text-[15px] font-medium text-ink">Rating</legend>
				<div className="flex" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
					{[1, 2, 3, 4, 5].map((n) => (
						<button
							key={n}
							type="button"
							role="radio"
							aria-checked={rating === n}
							aria-label={`${n} star${n === 1 ? "" : "s"}: ${RATING_WORDS[n]}`}
							onClick={() => setRating(n)}
							onMouseEnter={() => setHover(n)}
							className="rounded p-px outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
						>
							<Star
								className={cn("size-6", n <= shown ? "fill-warning-500 text-warning-500" : "fill-transparent text-ink")}
								strokeWidth={1.5}
								aria-hidden
							/>
						</button>
					))}
				</div>
				{shown > 0 && <span className="text-sm text-grey-900">{RATING_WORDS[shown]}</span>}
			</fieldset>
			{errors.rating && <p className="mt-1 text-xs text-error-500">{errors.rating}</p>}

			<label htmlFor={`${ids}-title`} className="mt-5 text-[15px] font-medium text-ink">
				Title <span className="font-normal text-grey-800">(optional)</span>
			</label>
			<input
				id={`${ids}-title`}
				value={title}
				onChange={(e) => setTitle(e.target.value.slice(0, 120))}
				placeholder="Sum it up in a few words"
				className={cn(FIELD, "mt-1.5")}
			/>

			<label htmlFor={`${ids}-review`} className="mt-4 text-[15px] font-medium text-ink">
				Your Review
			</label>
			<textarea
				id={`${ids}-review`}
				value={body}
				onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
				rows={7}
				aria-invalid={!!errors.body}
				className={cn(FIELD, "mt-1.5 h-auto min-h-[180px] resize-none bg-white py-3")}
			/>
			{errors.body && <p className="mt-1 text-xs text-error-500">{errors.body}</p>}

			<Button
				type="submit"
				isLoading={save.isPending}
				className="mt-auto h-[57px] w-full rounded-lg text-lg font-semibold sm:mt-6"
			>
				{existing ? "Save" : "Send"}
			</Button>
		</form>
	);
}

const FIELD =
	"h-[55px] w-full rounded-md border border-grey-700 bg-grey-500 px-4 text-sm text-ink outline-none placeholder:text-grey-800 focus-visible:border-primary-300 focus-visible:ring-[3px] focus-visible:ring-primary-300/40 sm:text-base";
