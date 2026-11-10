"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Paginated } from "@/features/products/types";
import type { AdminCustomer, CustomerDetail, CustomerListParams, CustomerStatus } from "@/features/customers/types";

/** A2: every customer account. `meta.total` feeds the "All Customers" count. */
export function useAdminCustomers(params: CustomerListParams) {
	return useQuery({
		queryKey: ["admin", "customers", params],
		queryFn: () => getData<Paginated<AdminCustomer>>(backendRoutes.CUSTOMERS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** The Customers Details page. */
export function useAdminCustomer(customerId: string) {
	return useQuery({
		queryKey: ["admin", "customers", "detail", customerId],
		queryFn: () => getData<CustomerDetail>(backendRoutes.CUSTOMER(customerId)),
	});
}

/** "Blacklist this customer": blocked customers can't sign in or order; switching it off restores them. */
export function useSetCustomerStatus(customerId: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (status: CustomerStatus) =>
			(await api.post(backendRoutes.CUSTOMER_STATUS(customerId), { status })).data.data as CustomerDetail,
		retry: false,
		onSuccess: (customer) => {
			queryClient.setQueryData(["admin", "customers", "detail", customerId], customer);
			// The customer list shows the status too; this page already has the answer.
			queryClient.invalidateQueries({ queryKey: ["admin", "customers"], predicate: (q) => q.queryKey[2] !== "detail" });
			const name = `${customer.first_name} ${customer.last_name}`;
			toast.success(customer.status === "blocked" ? `${name} is blacklisted` : `${name} can shop again`);
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

export function useDeleteCustomer() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (customer: AdminCustomer) => {
			await api.delete(backendRoutes.CUSTOMER(customer.id));
			return customer;
		},
		retry: false,
		onSuccess: (customer) => {
			toast.success(`${customer.first_name} ${customer.last_name}'s account was deleted`);
			queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** "Export": the ticked customers, or everyone matching the tab, search and filter. */
export function useExportCustomers() {
	const toast = useToast();
	return useMutation({
		mutationFn: (params: Omit<CustomerListParams, "page" | "limit"> & { ids?: string }) =>
			downloadCsv(backendRoutes.CUSTOMERS_EXPORT, params, "fysi-customers"),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't export the customers. Try again.")),
	});
}
