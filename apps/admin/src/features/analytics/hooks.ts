"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import type { AdminAnalytics, Period } from "@/features/analytics/types";

export function useAdminAnalytics(params: { from: string; to: string; period: Period }) {
	return useQuery({
		queryKey: ["admin", "analytics", params],
		queryFn: () => getData<AdminAnalytics>(backendRoutes.ANALYTICS, params),
		placeholderData: keepPreviousData,
	});
}
