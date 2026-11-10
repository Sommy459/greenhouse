"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { pushCartToServer } from "@/features/cart/sync";
import type { CartItem } from "@/features/cart/store";
import type { DeliveryAddress, Order, PayLinkOrder } from "@/features/orders/types";

const orderKey = (id: string) => ["orders", id] as const;

/**
 * "Place order" (C5): this browser's cart becomes the account's cart, then the API creates the order (split per
 * vendor, one payment) and holds the stock for 15 minutes. Never retried automatically: it could order twice.
 */
export function usePlaceOrder({ onPlaced }: { onPlaced: (order: Order) => void }) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			items,
			deliveryAddress,
			addressId,
			saveAddress,
		}: {
			items: CartItem[];
			/** A new address, or `addressId` for a saved one. */
			deliveryAddress?: DeliveryAddress;
			addressId?: string;
			/** Also keep the new address for next time. */
			saveAddress?: boolean;
		}) => {
			const cart = await pushCartToServer(items);
			if (cart.skipped?.length || !cart.readyForCheckout) {
				throw new Error("Some items in your cart are no longer available. Check your cart and try again.");
			}
			if (deliveryAddress && saveAddress) await api.post(backendRoutes.ADDRESSES, deliveryAddress).catch(() => undefined);
			return (await api.post(backendRoutes.CHECKOUT, addressId ? { addressId } : { deliveryAddress })).data.data as Order;
		},
		retry: false,
		onSuccess: (order) => {
			queryClient.setQueryData(orderKey(order.id), order);
			onPlaced(order);
		},
		onError: (error) =>
			toast.error(
				error instanceof Error && !("isAxiosError" in error)
					? error.message
					: errorMessage(error, "We couldn't place your order. Check your orders before trying again."),
			),
	});
}

/** One order. While it waits for payment it checks back every 3 seconds (payments confirm in seconds). */
export function useOrder(id: string) {
	return useQuery({
		queryKey: orderKey(id),
		queryFn: () => getData<Order>(backendRoutes.ORDER(id)),
		refetchInterval: (query) => (query.state.data?.status === "awaiting_payment" ? 3000 : false),
	});
}

/** The payment calls answer with the updated order. */
function usePaymentMutation<V>(id: string, request: (vars: V) => Promise<Order>, fallback: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		retry: false,
		onSuccess: (order) => queryClient.setQueryData(orderKey(id), order),
		onError: (error) => toast.error(errorMessage(error, fallback)),
	});
}

/** Fysi wallet: one tap plus PIN. Five wrong PINs lock payments for 15 minutes (the API says so). */
export function usePayWithWallet(id: string) {
	return usePaymentMutation(
		id,
		async (pin: string) => (await api.post(backendRoutes.PAY_WALLET(id), { pin })).data.data as Order,
		"The payment didn't go through. Try again.",
	);
}

/**
 * External wallet: the API builds the transaction for the customer's address, their wallet signs it, the API submits
 * it. The browser never builds amounts, memos or destinations (PRD payments rule).
 */
export function usePayWithExternalWallet(id: string) {
	return usePaymentMutation(
		id,
		async ({
			sourceAddress,
			sign,
		}: {
			sourceAddress: string;
			sign: (xdr: string, networkPassphrase: string) => Promise<string>;
		}) => {
			const prepared = (await api.post(backendRoutes.PAY_EXTERNAL(id), { sourceAddress })).data.data as {
				transaction: string;
				networkPassphrase: string;
			};
			const signedTransaction = await sign(prepared.transaction, prepared.networkPassphrase);
			return (await api.post(backendRoutes.PAY_EXTERNAL_SUBMIT(id), { signedTransaction })).data.data as Order;
		},
		"Your wallet payment didn't go through. Try again.",
	);
}

/** Cancel an order that hasn't been paid (releases the held stock). */
export function useCancelOrder(id: string) {
	return usePaymentMutation(
		id,
		async () => (await api.post(backendRoutes.CANCEL_ORDER(id))).data.data as Order,
		"Couldn't cancel the order. Try again.",
	);
}

/** The payment link's page (no sign-in): checks back every 3 seconds until paid. */
export function usePayLink(token: string) {
	return useQuery({
		queryKey: ["pay-link", token],
		queryFn: () => getData<PayLinkOrder>(backendRoutes.PAY_LINK(token)),
		refetchInterval: (query) => (query.state.data?.status === "awaiting_payment" ? 3000 : false),
	});
}
