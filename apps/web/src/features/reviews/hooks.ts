"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { MyReview, PendingReview, RatingSummary, Review, ReviewInput } from "@/features/reviews/types";

const KEY = ["reviews"];

/** Reviews (C9): delivered products waiting for the customer's rating. */
export function usePendingReviews(page: number, limit = 10) {
	return useQuery({
		queryKey: [...KEY, "pending", page, limit],
		queryFn: () => getPage<PendingReview>(backendRoutes.PENDING_REVIEWS, { page, limit }),
		placeholderData: keepPreviousData,
	});
}

/** The customer's own reviews. */
export function useMyReviews(page: number, limit = 10) {
	return useQuery({
		queryKey: [...KEY, "mine", page, limit],
		queryFn: () => getPage<MyReview>(backendRoutes.MY_REVIEWS, { page, limit }),
		placeholderData: keepPreviousData,
	});
}

/** A product's published reviews, newest first (or by stars). */
export function useProductReviews(slug: string, page: number, sort: "newest" | "highest" | "lowest" = "newest") {
	return useQuery({
		queryKey: [...KEY, "product", slug, page, sort],
		queryFn: () => getPage<Review>(backendRoutes.PRODUCT_REVIEWS(slug), { page, limit: 5, sort }),
		placeholderData: keepPreviousData,
		enabled: !!slug,
	});
}

export function useReviewSummary(slug: string) {
	return useQuery({
		queryKey: [...KEY, "summary", slug],
		queryFn: () => getData<RatingSummary>(backendRoutes.PRODUCT_REVIEW_SUMMARY(slug)),
		enabled: !!slug,
	});
}

/** Write (orderLineId) or edit (id) a review. Not retried; every review list refreshes after. */
export function useSaveReview({ onSaved }: { onSaved: () => void }) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, orderLineId, ...input }: ReviewInput & { id?: string; orderLineId?: string }) =>
			id
				? ((await api.patch(backendRoutes.MY_REVIEW(id), input)).data.data as MyReview)
				: ((await api.post(backendRoutes.MY_REVIEWS, { orderLineId, ...input })).data.data as MyReview),
		retry: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: KEY });
			onSaved();
		},
		onError: (error) => toast.error(errorMessage(error, "We couldn't send your review. Please try again.")),
	});
}

export function useDeleteReview() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => api.delete(backendRoutes.MY_REVIEW(id)),
		retry: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: KEY });
			toast.success("Review deleted");
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}
