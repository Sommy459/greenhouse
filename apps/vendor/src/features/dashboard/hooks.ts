"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import type { VendorDashboard } from "@/features/dashboard/types";

/** Figma Vendor Hub "Dashboard". */
export function useVendorDashboard() {
	return useQuery({ queryKey: ["vendor", "dashboard"], queryFn: () => getData<VendorDashboard>(backendRoutes.DASHBOARD) });
}
