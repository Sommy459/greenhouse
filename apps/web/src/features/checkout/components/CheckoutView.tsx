"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { addressLine } from "@/features/addresses/components/AddressesView";
import { useAddresses } from "@/features/addresses/hooks";
import { useSession } from "@/features/auth/session";
import { CartItemRow } from "@/features/cart/components/CartContents";
import { cartSubtotal, useCart } from "@/features/cart/store";
import { useCartPreview } from "@/features/cart/sync";
import { usePlaceOrder } from "@/features/checkout/hooks";
import { CheckoutSchema, normalisePhone, type CheckoutValues } from "@/features/checkout/schema";
import { NIGERIAN_STATES } from "@/features/orders/types";
import { price } from "@/lib/format";
import { checkoutRoutes, shopRoutes } from "@/lib/routes";

const subscribe = (onChange: () => void) => useCart.persist.onFinishHydration(onChange);
const hydrated = () => useCart.persist.hasHydrated();

const FIELD =
	"h-[50px] rounded-md border-grey-600 bg-white px-3.5 text-sm shadow-none placeholder:text-grey-800 focus-visible:border-primary-300 focus-visible:ring-primary-300/40 md:text-sm";
const LABEL = "text-[13px] font-normal text-ink";
/** Desktop only: the white cards around each part (mobile is one plain column). */
const CARD_LG = "lg:rounded-lg lg:border lg:border-grey-600 lg:bg-white";

/**
 * Figma order summary (C5): the cart items and Delivery Information on the left; the order total (priced by the API)
 * and Place order on the right. Placing the order holds the stock for 15 minutes and opens the payment step (C6), where
 * the customer pays in USDC. The order is placed once, never retried.
 */
export function CheckoutView() {
	const router = useRouter();
	const ready = useSyncExternalStore(subscribe, hydrated, () => false);
	const items = useCart((s) => s.items);
	const clearCart = useCart((s) => s.clear);
	const user = useSession((s) => s.user);
	const preview = useCartPreview(ready ? items : []);
	const priced = preview.data;

	const form = useForm<CheckoutValues>({
		resolver: zodResolver(CheckoutSchema),
		defaultValues: {
			recipientName: user?.name ?? "",
			phone: user?.phone ?? "",
			line1: "",
			line2: "",
			city: "",
			state: undefined,
			notes: "",
		},
	});

	const addresses = useAddresses();
	/** A saved address id, "new", or nothing yet (the default is picked once they load). */
	const [picked, setPicked] = useState<string | null>(null);
	const [saveNew, setSaveNew] = useState(true);
	const saved = addresses.data ?? [];
	const chosen = picked ?? (saved[0]?.id || "new");

	const placeOrder = usePlaceOrder({
		onPlaced: (order) => {
			clearCart();
			router.replace(checkoutRoutes.PAY(order.id));
		},
	});

	const onSubmit = (values: CheckoutValues) => {
		if (placeOrder.isPending) return;
		placeOrder.mutate({
			items,
			saveAddress: saveNew,
			deliveryAddress: {
				recipientName: values.recipientName,
				phone: normalisePhone(values.phone),
				line1: values.line1,
				line2: values.line2 || null,
				city: values.city,
				state: values.state,
				notes: values.notes || null,
			},
		});
	};

	if (!ready) return <CheckoutSkeleton />;
	if (items.length === 0) {
		return (
			<div className="shop-container py-20 text-center">
				<p className="text-base font-medium text-ink">Your cart is empty</p>
				<p className="mt-1 text-sm text-grey-800">Add something you love, then come back to check out.</p>
				<Button asChild className="mt-6 h-11 rounded-lg px-6">
					<Link href={shopRoutes.HOME}>Continue shopping</Link>
				</Button>
			</div>
		);
	}

	const blocked = !!priced && !priced.readyForCheckout;

	return (
		<div className="shop-container pt-4 pb-10 lg:pt-8">
			{/* Mobile: "‹ Order Summary". Desktop has no visible title, but keeps it for screen readers. */}
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => router.back()}
					aria-label="Back"
					className="grid size-8 place-items-center rounded-md text-ink hover:bg-grey-500 lg:hidden"
				>
					<ChevronLeft className="size-5" />
				</button>
				<h1 className="text-base font-medium text-ink lg:sr-only">Order Summary</h1>
			</div>

			<Form {...form}>
				<form
					noValidate
					onSubmit={(e) => {
						if (chosen !== "new") {
							e.preventDefault();
							if (!placeOrder.isPending) placeOrder.mutate({ items, addressId: chosen });
						} else form.handleSubmit(onSubmit)(e);
					}}
					className="mt-4 grid items-start gap-8 lg:mt-0 lg:grid-cols-[minmax(0,760px)_minmax(0,423px)] lg:justify-between lg:gap-8"
				>
					<div className="space-y-8">
						<section aria-label="Items" className={cn("animate-rise lg:p-7", CARD_LG)}>
							<ul className="space-y-5 lg:space-y-6">
								{items.map((item, i) => (
									<CartItemRow
										key={item.product_id}
										item={item}
										line={priced?.items.find((l) => l.productId === item.product_id)}
										variant="checkout"
										index={i}
									/>
								))}
							</ul>
						</section>

						{saved.length > 0 && (
							<section aria-labelledby="saved-title" className={cn("animate-rise lg:px-7 lg:py-8", CARD_LG)}>
								<h2 id="saved-title" className="text-[22px] font-semibold text-ink lg:text-2xl">
									Deliver to
								</h2>
								<div role="radiogroup" aria-labelledby="saved-title" className="mt-4 space-y-3">
									{saved.map((a) => (
										<label
											key={a.id}
											className={cn(
												"flex cursor-pointer gap-3 rounded-lg border p-4 text-sm",
												chosen === a.id ? "border-primary-500 bg-primary-50" : "border-grey-600 bg-white",
											)}
										>
											<input
												type="radio"
												name="address"
												checked={chosen === a.id}
												onChange={() => setPicked(a.id)}
												className="mt-0.5 accent-primary-500"
											/>
											<span>
												<span className="font-medium text-ink">{a.label || a.recipientName}</span>
												{a.isDefault && <span className="ml-2 text-xs text-primary-500">Default</span>}
												<span className="block text-grey-900">
													{a.recipientName} · {a.phone}
												</span>
												<span className="block text-grey-900">{addressLine(a)}</span>
											</span>
										</label>
									))}
									<label
										className={cn(
											"flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm",
											chosen === "new" ? "border-primary-500 bg-primary-50" : "border-grey-600 bg-white",
										)}
									>
										<input
											type="radio"
											name="address"
											checked={chosen === "new"}
											onChange={() => setPicked("new")}
											className="accent-primary-500"
										/>
										<span className="font-medium text-ink">Use a new address</span>
									</label>
								</div>
							</section>
						)}

						{chosen === "new" && (
							<>
								<DeliveryInformation control={form.control} />
								<label className="flex items-center gap-2 text-sm text-ink">
									<Checkbox checked={saveNew} onCheckedChange={(on) => setSaveNew(on === true)} />
									Save this address for next time
								</label>
							</>
						)}
					</div>

					<section
						aria-labelledby="total-title"
						className={cn("animate-rise lg:sticky lg:top-6 lg:px-7 lg:py-8", CARD_LG)}
						style={{ "--i": 2 } as React.CSSProperties}
					>
						<h2 id="total-title" className="text-[22px] font-semibold text-ink lg:text-2xl">
							Payment
						</h2>
						<p className="mt-3 text-[13px] leading-relaxed text-grey-900">
							You pay in <strong className="font-semibold text-ink">USDC on Stellar</strong> (1 USDC = $1): from your Fysi wallet,
							any Stellar wallet, a QR code or a payment link. You choose on the next step.
						</p>

						<dl className="mt-6 space-y-3 text-[13px] text-ink">
							<Row
								label={`Items (${priced?.itemCount ?? items.length})`}
								value={price(priced?.subtotal ?? cartSubtotal(items))}
							/>
							{priced && priced.vendorCount > 1 && <Row label="Shops" value={String(priced.vendorCount)} />}
						</dl>
						<dl className="mt-5 border-t border-grey-600 pt-6 text-[13px] text-ink">
							<Row label="Total" value={priced ? price(priced.subtotal) : "…"} strong />
						</dl>
						{preview.isError && (
							<p className="mt-2 text-xs text-error-500">Couldn&apos;t check your cart. Check your connection and try again.</p>
						)}
						{blocked && (
							<p role="alert" className="mt-3 rounded-md bg-warning-50 px-3 py-2 text-xs text-warning-700">
								Some items changed. Update them in your cart, then place the order.
							</p>
						)}

						<Button
							type="submit"
							isLoading={placeOrder.isPending}
							disabled={!priced || blocked || placeOrder.isPending}
							className="mt-6 h-[54px] w-full rounded-lg text-base font-semibold"
						>
							{priced ? `Place order · ${price(priced.subtotal)}` : "Place order"}
						</Button>
						<p className="mt-3 flex items-start gap-2 text-xs text-grey-800">
							<ShieldCheck className="mt-px size-4 shrink-0 text-primary-500" aria-hidden />
							Your payment is held safely until you confirm delivery (or 7 days after shipping). Items are held for 15 minutes
							while you pay.
						</p>
					</section>
				</form>
			</Form>
		</div>
	);
}

function DeliveryInformation({ control }: { control: Control<CheckoutValues> }) {
	return (
		<section
			aria-labelledby="delivery-title"
			className={cn("animate-rise lg:px-7 lg:py-8", CARD_LG)}
			style={{ "--i": 1 } as React.CSSProperties}
		>
			<h2 id="delivery-title" className="text-[22px] font-semibold text-ink lg:text-2xl">
				Delivery Information
			</h2>
			<div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:mt-6">
				<TextField control={control} name="recipientName" label="Full name" placeholder="e.g. Nike Bankole" autoComplete="name" />
				<TextField
					control={control}
					name="phone"
					label="Mobile Number"
					placeholder="e.g. 0801 234 5678"
					autoComplete="tel"
					type="tel"
					inputMode="tel"
				/>
				<TextField
					control={control}
					name="line1"
					label="Address"
					placeholder="House number and street"
					autoComplete="address-line1"
					className="sm:col-span-2"
				/>
				<TextField
					control={control}
					name="line2"
					label="Apartment, landmark (optional)"
					placeholder="e.g. Flat 3, opposite the market"
					autoComplete="address-line2"
					className="sm:col-span-2"
				/>
				<TextField control={control} name="city" label="City/Town" placeholder="e.g. Ikeja" autoComplete="address-level2" />
				<FormField
					control={control}
					name="state"
					render={({ field }) => (
						<FormItem className="gap-1.5">
							<FormLabel className={LABEL}>State</FormLabel>
							<FormControl>
								<select
									{...field}
									value={field.value ?? ""}
									autoComplete="address-level1"
									className={cn(
										FIELD,
										"w-full border px-3 outline-none focus-visible:ring-[3px]",
										!field.value && "text-grey-800",
									)}
								>
									<option value="" disabled>
										Choose a state
									</option>
									{NIGERIAN_STATES.map((s) => (
										<option key={s} value={s} className="text-ink">
											{s}
										</option>
									))}
								</select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<TextField
					control={control}
					name="notes"
					label="Delivery notes (optional)"
					placeholder="e.g. Call before you come"
					className="sm:col-span-2"
				/>
			</div>
		</section>
	);
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
	return (
		<div className="flex items-center justify-between gap-4">
			<dt>{label}</dt>
			<dd className={cn(strong ? "text-base font-semibold" : "")}>{value}</dd>
		</div>
	);
}

type TextName = Exclude<keyof CheckoutValues, "state">;

function TextField({
	control,
	name,
	label,
	className,
	...input
}: {
	control: Control<CheckoutValues>;
	name: TextName;
	label: string;
	className?: string;
} & Omit<React.ComponentProps<typeof Input>, "name" | "className">) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={cn("gap-1.5", className)}>
					<FormLabel className={LABEL}>{label}</FormLabel>
					<FormControl>
						<Input {...input} {...field} className={FIELD} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function CheckoutSkeleton() {
	return (
		<div
			className="shop-container grid gap-8 pt-8 pb-10 lg:grid-cols-[minmax(0,760px)_minmax(0,423px)] lg:justify-between"
			aria-busy="true"
			aria-label="Loading checkout"
		>
			<div className="space-y-8">
				<div className="h-64 animate-pulse rounded-lg bg-grey-600" />
				<div className="h-96 animate-pulse rounded-lg bg-grey-600" />
			</div>
			<div className="h-[420px] animate-pulse rounded-lg bg-grey-600" />
		</div>
	);
}
