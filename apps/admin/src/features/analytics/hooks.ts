"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { errorMessage, getData } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Paginated } from "@/features/products/types";
import type { BestSellerParams, BestSellingProduct, SalesAnalytics, SalesPeriod } from "@/features/analytics/types";

/** Figma "Overall Sales" and "Sales Report" for one period. */
export function useSalesAnalytics(period: SalesPeriod) {
	return useQuery({
		queryKey: ["admin", "analytics", "sales", period],
		queryFn: () => getData<SalesAnalytics>(backendRoutes.ANALYTICS, { period }),
		placeholderData: keepPreviousData,
	});
}

/** Figma "Product Best Sellers": most units sold first. */
export function useBestSellers(params: BestSellerParams) {
	return useQuery({
		queryKey: ["admin", "analytics", "best-sellers", params],
		queryFn: () => getData<Paginated<BestSellingProduct>>(backendRoutes.ANALYTICS_BEST_SELLERS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** "Export": the period's sales, by bar and by category, as a CSV. */
export function useExportAnalytics() {
	const toast = useToast();
	return useMutation({
		mutationFn: (period: SalesPeriod) => downloadCsv(backendRoutes.ANALYTICS_EXPORT, { period }, `fysi-sales-${period}`),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't export the report. Try again.")),
	});
}
