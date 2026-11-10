"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { AdminVendor, CertificationId, VendorDetail, VendorStatus } from "@/features/vendors/types";

const KEY = ["admin", "vendors"];

/** PRD A1: the verification queue (`status: "pending"`, oldest waiting first per the API) and every vendor. */
export function useAdminVendors(params: { status?: VendorStatus; q?: string; page: number; limit: number }) {
	return useQuery({
		queryKey: [...KEY, "list", params],
		queryFn: () => getPage<AdminVendor>(backendRoutes.VENDORS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function useAdminVendor(id: string) {
	return useQuery({ queryKey: [...KEY, id], queryFn: () => getData<VendorDetail>(backendRoutes.VENDOR(id)), enabled: !!id });
}

export type Decision =
	| { action: "approve"; certifications: CertificationId[]; foundingVendor: boolean; note?: string }
	| { action: "reject"; reason: string }
	| { action: "suspend"; reason: string }
	| { action: "reinstate"; note?: string };

/** Approve (confirming labels and founding status), reject or suspend (with a reason the vendor sees), reinstate. */
export function useDecideVendor(id: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (decision: Decision) => {
			const { action, ...body } = decision;
			const url =
				action === "approve"
					? backendRoutes.APPROVE_VENDOR(id)
					: action === "reject"
						? backendRoutes.REJECT_VENDOR(id)
						: action === "suspend"
							? backendRoutes.SUSPEND_VENDOR(id)
							: backendRoutes.REINSTATE_VENDOR(id);
			return (await api.post(url, body)).data.data as VendorDetail;
		},
		retry: false,
		onSuccess: (vendor, decision) => {
			queryClient.setQueryData([...KEY, id], vendor);
			queryClient.invalidateQueries({ queryKey: [...KEY, "list"] });
			const name = vendor.businessName ?? "The vendor";
			toast.success(
				decision.action === "approve"
					? `${name} is approved and can start selling`
					: decision.action === "reject"
						? `${name} was rejected; they'll see your reason`
						: decision.action === "suspend"
							? `${name} is suspended`
							: `${name} is active again`,
			);
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't save the decision. Try again.")),
	});
}
