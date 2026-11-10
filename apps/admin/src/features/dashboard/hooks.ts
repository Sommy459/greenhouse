"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import type { Dashboard, DashboardPeriod } from "@/features/dashboard/types";

/** PRD A4: the Overview. Days back: 14 by day, 84 (12 weeks) by week. */
export function useDashboard(period: DashboardPeriod) {
	const days = period === "day" ? 14 : 84;
	return useQuery({
		queryKey: ["admin", "dashboard", period],
		queryFn: () => getData<Dashboard>(backendRoutes.DASHBOARD, { period, days }),
		placeholderData: keepPreviousData,
	});
}
