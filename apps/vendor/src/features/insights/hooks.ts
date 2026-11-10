"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { errorMessage, getData, getPage } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Period, ProductReview, ProductStat, Statement, VendorAnalytics, VendorDashboard } from "@/features/insights/types";

const KEY = ["vendor", "insights"];

export function useVendorDashboard() {
	return useQuery({ queryKey: [...KEY, "dashboard"], queryFn: () => getData<VendorDashboard>(backendRoutes.DASHBOARD) });
}

/** `from` / `to` are YYYY-MM-DD (the API defaults to the last 30 days). */
export function useAnalytics(range: { from?: string; to?: string; period: Period }) {
	return useQuery({
		queryKey: [...KEY, "analytics", range],
		queryFn: () => getData<VendorAnalytics>(backendRoutes.ANALYTICS, range),
		placeholderData: keepPreviousData,
	});
}

export function useProductStats(params: {
	from?: string;
	to?: string;
	sort: "sales" | "units" | "views" | "title";
	page: number;
}) {
	return useQuery({
		queryKey: [...KEY, "products", params],
		queryFn: () => getPage<ProductStat>(backendRoutes.PRODUCT_STATS, { ...params, limit: 10 }),
		placeholderData: keepPreviousData,
	});
}

export function useStatement(range: { from?: string; to?: string }) {
	return useQuery({
		queryKey: [...KEY, "statement", range],
		queryFn: () => getData<Statement>(backendRoutes.STATEMENT, range),
		placeholderData: keepPreviousData,
	});
}

export function useVendorReviews(params: { rating?: number; sort: "newest" | "highest" | "lowest"; page: number }) {
	return useQuery({
		queryKey: [...KEY, "reviews", params],
		queryFn: () => getPage<ProductReview>(backendRoutes.REVIEWS, { ...params, limit: 10 }),
		placeholderData: keepPreviousData,
	});
}

/** Downloads one of the API's CSV files (orders, products with stats, statement). */
export function useExportCsv() {
	const toast = useToast();
	return useMutation({
		mutationFn: ({ url, params = {}, name }: { url: string; params?: Record<string, unknown>; name: string }) =>
			downloadCsv(url, params, name),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't export. Try again.")),
	});
}
