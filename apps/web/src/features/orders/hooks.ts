"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { useCart } from "@/features/cart/store";
import { useCartDrawer } from "@/features/cart/drawer";
import type { Paginated, ProductDetail } from "@/features/catalog/types";
import type { CustomerOrder, CustomerOrderItem, CustomerOrderRow, OrderListParams } from "@/features/orders/types";

const KEY = ["orders"];

/** Order History (C8): the customer's orders, newest first. */
export function useOrders(params: OrderListParams) {
	return useQuery({
		queryKey: [...KEY, "list", params],
		queryFn: () => getData<Paginated<CustomerOrderRow>>(backendRoutes.ORDERS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function useOrder(id: string) {
	return useQuery({ queryKey: [...KEY, id], queryFn: () => getData<CustomerOrder>(backendRoutes.ORDER(id)) });
}

/** "Confirm delivery" (C8): releases the vendor's payout from escrow. Never retried. */
export function useConfirmDelivery() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => (await api.post(backendRoutes.CONFIRM_DELIVERY(id))).data.data as CustomerOrder,
		retry: false,
		onSuccess: (order) => {
			queryClient.setQueryData([...KEY, order.id], order);
			queryClient.invalidateQueries({ queryKey: [...KEY, "list"] });
			toast.success("Thanks! We've let the seller know it arrived.");
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't confirm the delivery. Try again.")),
	});
}

/** "Buy Again": puts the product back in the cart at today's price (the API reprices at checkout) and opens the cart. */
export function useBuyAgain() {
	const toast = useToast();
	const add = useCart((s) => s.add);
	const openCart = useCartDrawer((s) => s.setOpen);
	return useMutation({
		mutationFn: (item: CustomerOrderItem) => getData<ProductDetail>(backendRoutes.PRODUCT(item.slug)),
		onSuccess: (product, item) => {
			if (product.stock <= 0) {
				toast.error(`${product.name} is out of stock right now.`);
				return;
			}
			add(product, Math.min(item.quantity, product.stock));
			openCart(true);
		},
		onError: (error) => toast.error(errorMessage(error, "That product isn't available any more.")),
	});
}
