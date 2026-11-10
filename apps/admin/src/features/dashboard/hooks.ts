"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import type { Dashboard } from "@/features/dashboard/types";

/** A4: the Overview page. */
export function useDashboard() {
	return useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => getData<Dashboard>(backendRoutes.DASHBOARD) });
}
