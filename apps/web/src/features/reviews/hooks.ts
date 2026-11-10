"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import type { Paginated } from "@/features/catalog/types";
import type { PendingReview } from "@/features/reviews/types";

const KEY = ["reviews", "pending"];

/** Reviews (C9): delivered products waiting for the customer's rating. */
export function usePendingReviews(page: number, limit = 10) {
	return useQuery({
		queryKey: [...KEY, page, limit],
		queryFn: () => getData<Paginated<PendingReview>>(backendRoutes.PENDING_REVIEWS, { page, limit }),
		placeholderData: keepPreviousData,
	});
}

/** After a review is sent, the list asks again (the rated product drops off). */
export function useRefreshPendingReviews() {
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries({ queryKey: KEY });
}
