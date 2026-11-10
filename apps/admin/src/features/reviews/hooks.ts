"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";

/** A row of GET /admin/reviews. */
export interface AdminReview {
	id: string;
	rating: number;
	title: string | null;
	body: string;
	author: string;
	verifiedPurchase: boolean;
	product: { id: string; title: string; slug: string };
	createdAt: string;
	updatedAt: string;
	status: "visible" | "hidden";
	/** Why Fysi hid it. */
	moderationReason: string | null;
	orderLineId: string;
	customerId: string;
	customerEmail: string;
	vendorName: string | null;
}

const KEY = ["admin", "reviews"];

export function useAdminReviews(params: {
	status?: "visible" | "hidden";
	rating?: number;
	sort?: "newest" | "highest" | "lowest";
	page: number;
	limit: number;
}) {
	return useQuery({
		queryKey: [...KEY, params],
		queryFn: () => getPage<AdminReview>(backendRoutes.REVIEWS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** Hide (with a reason; it leaves the product page and the rating) or show again. */
export function useModerateReview() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, reason }: { id: string; reason?: string }) =>
			(reason ? await api.post(backendRoutes.HIDE_REVIEW(id), { reason }) : await api.post(backendRoutes.UNHIDE_REVIEW(id))).data
				.data as AdminReview,
		retry: false,
		onSuccess: (review) => {
			queryClient.invalidateQueries({ queryKey: KEY });
			toast.success(review.status === "hidden" ? "Review hidden" : "Review is showing again");
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}
