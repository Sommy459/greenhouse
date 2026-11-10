"use client";

import { useEffect, useId, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ImagePlus, Plus, Star, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@repo/ui/dialog";
import { cn } from "@repo/ui/lib/utils";
import { FEEDBACK_DIALOG_CLASS, FeedbackDialogClose, FeedbackSent } from "@/components/FeedbackSent";
import { useSession } from "@/features/auth/session";
import { useSubmitReview } from "@/features/catalog/hooks";
import { authRoutes } from "@/lib/routes";

const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
const MIN_COMMENT = 10;
const MAX_COMMENT = 1000;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Leave a review" (C9). Opens the Figma "Your Opinion is Important to us" form; sending it shows the Figma "Thank you!
 * Your feedback has been sent" pop-up. Signed-out shoppers are sent to sign in first and come back here. `renderTrigger`
 * swaps the "Leave a review" button (e.g. Reviews' "Rate this Product"); `onReviewed` runs when the thank-you closes.
 */
export function LeaveReviewDialog({
	slug,
	productName,
	renderTrigger,
	onReviewed,
}: {
	slug: string;
	productName: string;
	renderTrigger?: (open: () => void) => React.ReactNode;
	onReviewed?: () => void;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const signedIn = !!useSession((s) => s.token);
	const [open, setOpen] = useState(false);
	const [sent, setSent] = useState(false);

	const start = () => (signedIn ? setOpen(true) : router.push(authRoutes.SIGN_IN(pathname)));

	const onOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next && sent) onReviewed?.();
		if (!next) setSent(false); // the next review starts from the form again
	};

	return (
		<>
			{renderTrigger ? (
				renderTrigger(start)
			) : (
				<button
					type="button"
					onClick={start}
					className="mt-5 inline-flex h-9 items-center gap-2 rounded-md border border-primary-500 px-3 text-xs font-medium text-primary-500 hover:bg-primary-50"
				>
					<Plus className="size-4" aria-hidden />
					Leave a review
				</button>
			)}

			<Dialog open={open} onOpenChange={onOpenChange}>
				{/* The form card is narrower than the thank-you card (Figma). */}
				<DialogContent
					showCloseButton={false}
					className={cn(
						FEEDBACK_DIALOG_CLASS,
						!sent && "overflow-y-auto sm:max-h-[95dvh] sm:max-w-[568px] sm:px-[58px] sm:pt-14 sm:pb-11",
					)}
				>
					<FeedbackDialogClose />
					{sent ? <FeedbackSent /> : <ReviewForm slug={slug} productName={productName} onSent={() => setSent(true)} />}
				</DialogContent>
			</Dialog>
		</>
	);
}

/** Figma "Your Opinion is Important to us": name, e-mail, rating, optional photo and the review. */
function ReviewForm({ slug, productName, onSent }: { slug: string; productName: string; onSent: () => void }) {
	const user = useSession((s) => s.user);
	const [name, setName] = useState([user?.first_name, user?.last_name].filter(Boolean).join(" "));
	const [email, setEmail] = useState(user?.email ?? "");
	const [rating, setRating] = useState(0);
	const [hover, setHover] = useState(0);
	const [comment, setComment] = useState("");
	const [photo, setPhoto] = useState<File | null>(null);
	const [photoError, setPhotoError] = useState<string | null>(null);
	const [tried, setTried] = useState(false);
	const submit = useSubmitReview(slug, { onSent });
	const ids = useId();

	const errors = {
		name: tried && !name.trim() ? "Enter your name" : null,
		email: tried && !EMAIL.test(email.trim()) ? "Enter a valid e-mail address" : null,
		rating: tried && rating === 0 ? "Choose a star rating" : null,
		comment:
			tried && comment.trim().length < MIN_COMMENT
				? `Tell other shoppers a little more (at least ${MIN_COMMENT} characters)`
				: null,
	};
	const shown = hover || rating;

	const pickPhoto = (file: File | undefined) => {
		if (!file) return;
		if (!PHOTO_TYPES.includes(file.type)) return setPhotoError("Add a JPG, PNG or WebP photo");
		if (file.size > PHOTO_MAX_BYTES) return setPhotoError("The photo is over 5MB");
		setPhotoError(null);
		setPhoto(file);
	};

	return (
		<form
			noValidate
			onSubmit={(e) => {
				e.preventDefault();
				setTried(true);
				const valid = name.trim() && EMAIL.test(email.trim()) && rating > 0 && comment.trim().length >= MIN_COMMENT;
				if (!valid || submit.isPending) return;
				submit.mutate({ name: name.trim(), email: email.trim().toLowerCase(), rating, comment: comment.trim(), photo });
			}}
			className="flex w-full flex-1 flex-col pt-12 sm:pt-0"
		>
			<DialogTitle className="pr-10 text-[26px] leading-tight font-semibold text-ink sm:text-[30px]">
				Your Opinion is Important to us
			</DialogTitle>
			<DialogDescription className="sr-only">Review of {productName}</DialogDescription>

			<Field id={`${ids}-name`} label="Name" error={errors.name} className="mt-8 sm:mt-12">
				<input
					id={`${ids}-name`}
					value={name}
					onChange={(e) => setName(e.target.value)}
					autoComplete="name"
					placeholder="enter your name"
					aria-invalid={!!errors.name}
					className={FIELD}
				/>
			</Field>
			<Field id={`${ids}-email`} label="E-mail Address" error={errors.email} className="mt-4">
				<input
					id={`${ids}-email`}
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					autoComplete="email"
					placeholder="enter your e-mail address"
					aria-invalid={!!errors.email}
					className={FIELD}
				/>
			</Field>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
				<fieldset className="flex items-center gap-2">
					<legend className="float-left mr-2 text-[13px] text-ink">Rating</legend>
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
								{/* Outline stars (Figma), filled amber when chosen. */}
								<Star
									className={cn("size-[19px]", n <= shown ? "fill-warning-500 text-warning-500" : "fill-transparent text-ink")}
									strokeWidth={1.5}
									aria-hidden
								/>
							</button>
						))}
					</div>
				</fieldset>

				<label className="flex cursor-pointer items-center gap-1.5 text-[13px] text-ink hover:text-primary-500">
					<input
						type="file"
						accept={PHOTO_TYPES.join(",")}
						className="sr-only"
						onChange={(e) => (pickPhoto(e.target.files?.[0]), (e.target.value = ""))}
					/>
					<ImagePlus className="size-5" strokeWidth={1.75} aria-hidden />
					{photo ? "Change photo" : "Add photo"}
				</label>
			</div>
			{(errors.rating || photoError) && <p className="mt-1 text-xs text-error-500">{errors.rating ?? photoError}</p>}
			{photo && (
				<PhotoPreview key={`${photo.name}-${photo.size}-${photo.lastModified}`} file={photo} onRemove={() => setPhoto(null)} />
			)}

			<Field id={`${ids}-review`} label="Your Review" error={errors.comment} className="mt-4">
				<textarea
					id={`${ids}-review`}
					value={comment}
					onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
					rows={7}
					aria-invalid={!!errors.comment}
					className={cn(FIELD, "h-auto min-h-[208px] resize-none bg-white py-3")}
				/>
			</Field>

			<Button
				type="submit"
				isLoading={submit.isPending}
				className="mt-auto h-[57px] w-full rounded-lg text-lg font-semibold sm:mt-6"
			>
				Send
			</Button>
		</form>
	);
}

const FIELD =
	"h-[55px] w-full rounded-md border border-grey-700 bg-grey-500 px-4 text-sm text-ink outline-none placeholder:text-grey-800 focus-visible:border-primary-300 focus-visible:ring-[3px] focus-visible:ring-primary-300/40 sm:text-base";

function Field({
	id,
	label,
	error,
	className,
	children,
}: {
	id: string;
	label: string;
	error: string | null;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div className={className}>
			<label htmlFor={id} className="text-[15px] font-medium text-ink">
				{label}
			</label>
			<div className="mt-1.5">{children}</div>
			{error && <p className="mt-1 text-xs text-error-500">{error}</p>}
		</div>
	);
}

/** A thumbnail of the chosen photo with a remove button. The preview URL is released when it changes or closes. */
function PhotoPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
	const [url] = useState(() => URL.createObjectURL(file));
	useEffect(() => () => URL.revokeObjectURL(url), [url]);

	return (
		<div className="relative mt-2 size-16 overflow-hidden rounded-md border border-grey-600">
			{/* eslint-disable-next-line @next/next/no-img-element -- a local preview (blob: URL), not an optimisable image */}
			<img src={url} alt="Your photo" className="size-full object-cover" />
			<button
				type="button"
				onClick={onRemove}
				aria-label="Remove photo"
				className="absolute top-0.5 right-0.5 grid size-5 place-items-center rounded-full bg-ink/70 text-white hover:bg-ink"
			>
				<X className="size-3" />
			</button>
		</div>
	);
}
