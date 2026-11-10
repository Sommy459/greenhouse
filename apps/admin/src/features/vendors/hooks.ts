"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Paginated } from "@/features/products/types";
import type {
	AdminVendor,
	Certification,
	CertificationStatus,
	VendorDetail,
	VendorListParams,
	VendorStatus,
} from "@/features/vendors/types";

/** A1 / A6: every vendor. `meta.total` feeds the "All Vendors" count; `status: "pending"` is the verification queue. */
export function useAdminVendors(params: VendorListParams) {
	return useQuery({
		queryKey: ["admin", "vendors", params],
		queryFn: () => getData<Paginated<AdminVendor>>(backendRoutes.VENDORS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** Vendor details: the shop, its documents, wallet and recent listings. */
export function useAdminVendor(vendorId: string) {
	return useQuery({
		queryKey: ["admin", "vendors", "detail", vendorId],
		queryFn: () => getData<VendorDetail>(backendRoutes.VENDOR(vendorId)),
	});
}

const DECISION_TOAST: Record<VendorStatus, (shop: string) => string> = {
	approved: (shop) => `${shop} is approved and can start selling`,
	rejected: (shop) => `${shop} was rejected; they'll see your reason`,
	suspended: (shop) => `${shop} is suspended`,
	pending: (shop) => `${shop} is back in the queue`,
};

/** A1: approve, reject (with a reason the vendor sees), suspend or reactivate. */
export function useSetVendorStatus() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, status, reason }: { id: string; status: VendorStatus; reason?: string }) =>
			(await api.post(backendRoutes.VENDOR_STATUS(id), { status, reason })).data.data as VendorDetail,
		retry: false,
		onSuccess: (vendor) => {
			queryClient.setQueryData(["admin", "vendors", "detail", vendor.id], vendor);
			queryClient.invalidateQueries({ queryKey: ["admin", "vendors"], predicate: (q) => q.queryKey[2] !== "detail" });
			toast.success(DECISION_TOAST[vendor.status](vendor.shop_name));
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

export function useDeleteVendor() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (vendor: AdminVendor) => {
			await api.delete(backendRoutes.VENDOR(vendor.id));
			return vendor;
		},
		retry: false,
		onSuccess: (vendor) => {
			toast.success(`${vendor.shop_name} was deleted`);
			queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** "Export": the ticked vendors, or every vendor matching the tab, search and filter. */
export function useExportVendors() {
	const toast = useToast();
	return useMutation({
		mutationFn: (params: Omit<VendorListParams, "page" | "limit"> & { ids?: string }) =>
			downloadCsv(backendRoutes.VENDORS_EXPORT, params, "fysi-vendors"),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't export the vendors. Try again.")),
	});
}

/** Certificates a vendor submitted; verifying or revoking one sets the badge on the shop's products. */
export function useCertifications(status?: CertificationStatus) {
	return useQuery({
		queryKey: ["admin", "certifications", status ?? "all"],
		queryFn: () => getData<Certification[]>(backendRoutes.CERTIFICATIONS, { status }),
	});
}

export function useSetCertificationStatus() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, status }: { id: string; status: CertificationStatus }) =>
			(await api.post(backendRoutes.CERTIFICATION_STATUS(id), { status })).data.data as Certification,
		retry: false,
		onSuccess: (cert) => {
			toast.success(
				cert.status === "verified" ? `${cert.name} verified: the badge shows on this shop` : `${cert.name}: ${cert.status}`,
			);
			queryClient.invalidateQueries({ queryKey: ["admin", "certifications"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "vendors", "detail", cert.vendor_id] });
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}
