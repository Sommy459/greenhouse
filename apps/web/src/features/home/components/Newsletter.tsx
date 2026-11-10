"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { backgroundImage, LANDING_IMAGES } from "@/features/home/images";
import { api, errorMessage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Green card over a full-width photo band (white wall on the left, gift bag and fern on the right). Mobile shows the
 * gift-bag end of the photo as a strip above the card.
 */
export function Newsletter() {
	return (
		<section className="animate-reveal relative mt-12 overflow-hidden bg-white lg:mt-16">
			<div
				className="h-[110px] bg-white bg-cover bg-right lg:absolute lg:inset-0 lg:h-auto"
				style={backgroundImage(LANDING_IMAGES.newsletter)}
				aria-hidden
			/>
			<div className="shop-container relative py-6 lg:flex lg:min-h-[530px] lg:items-center lg:py-0">
				<div className="rounded-md bg-primary-400 p-6 text-white lg:max-w-[610px] lg:p-10">
					<h2 className="text-lg font-semibold lg:text-base">Subscribe to our newsletter</h2>
					<p className="mt-6 text-base leading-snug lg:mt-8 lg:text-sm">
						Be the first to know about exclusive offers, eco-tips, and new arrivals!
					</p>
					<NewsletterForm />
				</div>
			</div>
		</section>
	);
}

/** TODO: confirm the external API's newsletter endpoint (backendRoutes.NEWSLETTER is a placeholder). */
function NewsletterForm() {
	const toast = useToast();
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);

	const subscribe = useMutation({
		retry: false,
		mutationFn: async (value: string) =>
			(await api.post(backendRoutes.NEWSLETTER, { email: value, source: "footer" })).data as { message?: string },
		onSuccess: (data) => {
			toast.success(data?.message ?? "You're subscribed.");
			setEmail("");
		},
		onError: (err) => toast.error(errorMessage(err)),
	});

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const value = email.trim();
		if (!EMAIL.test(value)) {
			setError("Enter a valid email address");
			return;
		}
		setError(null);
		subscribe.mutate(value);
	};

	return (
		<form noValidate onSubmit={onSubmit} className="mt-5 flex max-w-[460px] flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-0">
			<label className="relative flex-1">
				<span className="sr-only">Email address</span>
				<Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-grey-800" aria-hidden />
				<input
					type="email"
					autoComplete="email"
					placeholder="Your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					aria-invalid={!!error}
					className="h-9 w-full rounded-sm bg-white pr-3 pl-9 text-sm text-ink outline-none placeholder:text-grey-800 sm:rounded-r-none"
				/>
			</label>
			<button
				type="submit"
				disabled={subscribe.isPending}
				className="h-9 w-fit rounded-sm bg-primary-500 px-6 text-xs font-medium text-white hover:bg-primary-600 disabled:opacity-70 sm:rounded-l-none"
			>
				Subscribe
			</button>
			{error && <p className="text-xs text-lime-200 sm:mt-2 sm:basis-full">{error}</p>}
		</form>
	);
}
