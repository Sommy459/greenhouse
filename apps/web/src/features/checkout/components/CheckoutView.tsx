"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, ChevronLeft, Lock } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { useSession } from "@/features/auth/session";
import { CartItemRow } from "@/features/cart/components/CartContents";
import { useCart } from "@/features/cart/store";
import { useCheckoutQuote, usePlaceOrder } from "@/features/checkout/hooks";
import { CheckoutSchema, formatCardNumber, normalisePhone, type CheckoutValues } from "@/features/checkout/schema";
import type { CheckoutQuote, PaymentMethod } from "@/features/checkout/types";
import { checkoutRoutes, shopRoutes } from "@/lib/routes";
import { formatPrice } from "@/lib/site";

const subscribe = (onChange: () => void) => useCart.persist.onFinishHydration(onChange);
const hydrated = () => useCart.persist.hasHydrated();

const FIELD =
	"h-[50px] rounded-md border-grey-600 bg-white px-3.5 text-sm shadow-none placeholder:text-grey-800 focus-visible:border-primary-300 focus-visible:ring-primary-300/40 md:text-sm";
const LABEL = "text-[13px] font-normal text-ink";
/** Desktop only: the white cards around each part (mobile is one plain column). */
const CARD_LG = "lg:rounded-lg lg:border lg:border-grey-600 lg:bg-white";

/**
 * Figma order summary (C5, C6, C15). Desktop: the cart items and Delivery Information on the left, Payment Information
 * (discount code, pay with, card details, totals, Pay) on the right. Mobile: one column under "‹ Order Summary".
 *
 * Totals come from the API (POST /checkout/quote), never from browser prices. The order is placed once, never retried.
 *
 * SECURITY: the card fields follow the design and catch typos, but card details are NEVER sent to our API. Before
 * launch they must be replaced by the payment provider's own secure card fields (Paystack, Flutterwave…: provider
 * still to be chosen, docs/PLAN.md). The API returns the provider's `payment_url` for card orders.
 */
export function CheckoutView() {
	const router = useRouter();
	const ready = useSyncExternalStore(subscribe, hydrated, () => false);
	const items = useCart((s) => s.items);
	const clearCart = useCart((s) => s.clear);
	const user = useSession((s) => s.user);

	const [couponInput, setCouponInput] = useState("");
	const [coupon, setCoupon] = useState<string | undefined>(undefined);
	const lines = items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }));
	const quote = useCheckoutQuote({ items: lines, coupon_code: coupon }, ready && items.length > 0);

	const form = useForm<CheckoutValues>({
		resolver: zodResolver(CheckoutSchema),
		defaultValues: {
			first_name: user?.first_name ?? "",
			last_name: user?.last_name ?? "",
			address: "",
			city: "",
			zip_code: "",
			phone_number: user?.phone_number ?? "",
			email: user?.email ?? "",
			payment_method: "card",
			cardholder_name: "",
			card_number: "",
			card_expiry: "",
			card_cvv: "",
		},
	});
	const paymentMethod = useWatch({ control: form.control, name: "payment_method" });

	const placeOrder = usePlaceOrder({
		onPlaced: ({ order, payment_url }) => {
			// Card orders continue on the payment provider's page; the cart is kept until payment is confirmed.
			if (payment_url) {
				window.location.assign(payment_url);
				return;
			}
			clearCart();
			router.replace(checkoutRoutes.CONFIRMATION(order.id));
		},
	});

	const onSubmit = (values: CheckoutValues) => {
		if (placeOrder.isPending) return;
		placeOrder.mutate({
			items: lines,
			coupon_code: quote.data?.coupon ? coupon : undefined,
			payment_method: values.payment_method,
			// Delivery only: card fields are deliberately left out (see the note above).
			delivery: {
				first_name: values.first_name.trim(),
				last_name: values.last_name.trim(),
				address: values.address.trim(),
				city: values.city.trim(),
				zip_code: values.zip_code.trim(),
				phone_number: normalisePhone(values.phone_number),
				email: values.email.trim().toLowerCase(),
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
					onSubmit={form.handleSubmit(onSubmit)}
					className="mt-4 grid items-start gap-8 lg:mt-0 lg:grid-cols-[minmax(0,760px)_minmax(0,423px)] lg:justify-between lg:gap-8"
				>
					<div className="space-y-8">
						<section aria-label="Items" className={cn("animate-rise lg:p-7", CARD_LG)}>
							<ul className="space-y-5 lg:space-y-6">
								{items.map((item, i) => (
									<CartItemRow key={item.product_id} item={item} variant="checkout" index={i} />
								))}
							</ul>
						</section>

						<DeliveryInformation control={form.control} />
					</div>

					<PaymentInformation
						control={form.control}
						paymentMethod={paymentMethod}
						quote={quote.data}
						quoteLoading={quote.isPending || quote.isFetching}
						quoteError={quote.isError}
						couponInput={couponInput}
						onCouponInput={setCouponInput}
						appliedCoupon={coupon}
						onApplyCoupon={() => setCoupon(couponInput.trim().toUpperCase() || undefined)}
						onRemoveCoupon={() => {
							setCoupon(undefined);
							setCouponInput("");
						}}
						submitting={placeOrder.isPending}
					/>
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
				<TextField control={control} name="first_name" label="First Name" placeholder="e.g. Nike" autoComplete="given-name" />
				<TextField control={control} name="last_name" label="Last Name" placeholder="e.g. Bankole" autoComplete="family-name" />
				<TextField
					control={control}
					name="address"
					label="Address"
					placeholder="House number and street"
					autoComplete="street-address"
					className="sm:col-span-2"
				/>
				<div className="grid grid-cols-2 gap-x-3 sm:contents sm:gap-x-5">
					<TextField control={control} name="city" label="City/Town" placeholder="e.g. Ikeja" autoComplete="address-level2" />
					<TextField
						control={control}
						name="zip_code"
						label="Zip Code"
						placeholder="Optional"
						autoComplete="postal-code"
						inputMode="numeric"
					/>
				</div>
				<TextField
					control={control}
					name="phone_number"
					label="Mobile Number"
					placeholder="e.g. 0801 234 5678"
					autoComplete="tel"
					type="tel"
					inputMode="tel"
				/>
				<TextField
					control={control}
					name="email"
					label="Email address"
					placeholder="you@example.com"
					autoComplete="email"
					type="email"
				/>
			</div>
		</section>
	);
}

interface PaymentProps {
	control: Control<CheckoutValues>;
	paymentMethod: PaymentMethod;
	quote: CheckoutQuote | undefined;
	quoteLoading: boolean;
	quoteError: boolean;
	couponInput: string;
	onCouponInput: (value: string) => void;
	appliedCoupon: string | undefined;
	onApplyCoupon: () => void;
	onRemoveCoupon: () => void;
	submitting: boolean;
}

function PaymentInformation(props: PaymentProps) {
	const { control, paymentMethod, quote, quoteLoading, quoteError, submitting } = props;
	const couponApplied = !!quote?.coupon && quote.coupon.code === props.appliedCoupon;
	const couponError = props.appliedCoupon && quote?.coupon_error;

	return (
		<section
			aria-labelledby="payment-title"
			className={cn("animate-rise lg:sticky lg:top-6 lg:px-7 lg:py-8", CARD_LG)}
			style={{ "--i": 2 } as React.CSSProperties}
		>
			{/* Mobile shows no title here (design), but screen readers still get it. */}
			<h2 id="payment-title" className="sr-only text-[22px] font-semibold text-ink lg:not-sr-only">
				Payment Information
			</h2>

			<div className="lg:mt-7">
				<label htmlFor="coupon" className="text-[15px] font-medium text-ink">
					Apply Discount
				</label>
				<div className="mt-2.5 flex gap-3">
					<Input
						id="coupon"
						value={props.couponInput}
						onChange={(e) => props.onCouponInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								props.onApplyCoupon();
							}
						}}
						placeholder="Enter Coupon Code"
						autoComplete="off"
						disabled={couponApplied}
						className="h-[50px] flex-1 rounded-md border-0 bg-grey-500 px-3.5 text-sm uppercase shadow-none placeholder:normal-case placeholder:text-grey-800 md:text-sm"
					/>
					{couponApplied ? (
						<Button
							type="button"
							variant="outline"
							onClick={props.onRemoveCoupon}
							className="h-[50px] rounded-md border-grey-700 px-5"
						>
							Remove
						</Button>
					) : (
						<Button
							type="button"
							onClick={props.onApplyCoupon}
							disabled={!props.couponInput.trim()}
							className="h-[50px] rounded-md px-6 text-base font-semibold"
						>
							Apply
						</Button>
					)}
				</div>
				{couponApplied && <p className="mt-1.5 text-xs text-success-500">{quote?.coupon?.description}</p>}
				{couponError && <p className="mt-1.5 text-xs text-error-500">{couponError}</p>}
			</div>

			<FormField
				control={control}
				name="payment_method"
				render={({ field }) => (
					<FormItem className="mt-6 gap-0">
						<fieldset>
							<legend className="text-[15px] font-medium text-ink">Pay With</legend>
							<div className="mt-3 space-y-2.5">
								<Radio
									name={field.name}
									value="card"
									checked={field.value === "card"}
									onChange={() => field.onChange("card")}
									label="Debit or Credit Card"
								/>
								<Radio
									name={field.name}
									value="pay_on_delivery"
									checked={field.value === "pay_on_delivery"}
									onChange={() => field.onChange("pay_on_delivery")}
									label="Pay on Delivery"
								/>
							</div>
						</fieldset>
					</FormItem>
				)}
			/>

			{paymentMethod === "card" && (
				<div className="mt-6">
					<p className="text-[15px] font-medium text-ink">Enter Card Information</p>
					<div className="mt-3 space-y-4">
						<TextField
							control={control}
							name="cardholder_name"
							label="Cardholder Name"
							placeholder="Name on the card"
							autoComplete="cc-name"
						/>
						<FormField
							control={control}
							name="card_number"
							render={({ field }) => (
								<FormItem className="gap-1.5">
									<FormLabel className={LABEL}>Card Number</FormLabel>
									<FormControl>
										<Input
											{...field}
											onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
											placeholder="0000 0000 0000 0000"
											autoComplete="cc-number"
											inputMode="numeric"
											className={FIELD}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-3">
							<TextField
								control={control}
								name="card_expiry"
								label="Expiry Date"
								placeholder="MM/YYYY"
								autoComplete="cc-exp"
								inputMode="numeric"
								icon={CalendarDays}
							/>
							<TextField
								control={control}
								name="card_cvv"
								label="CVV"
								placeholder="123"
								autoComplete="cc-csc"
								inputMode="numeric"
								maxLength={4}
								icon={Lock}
							/>
						</div>
					</div>
				</div>
			)}

			<dl className="mt-6 space-y-3 text-[13px] text-ink">
				<Row label="Sub Total" value={quote ? formatPrice(quote.subtotal) : "…"} />
				<Row
					label="Promo Discount"
					value={quote ? (quote.discount > 0 ? `−${formatPrice(quote.discount)}` : formatPrice(0)) : "…"}
				/>
				<Row label="Shipping" value={quote ? (quote.shipping === 0 ? "Free" : formatPrice(quote.shipping)) : "…"} />
			</dl>
			<dl className="mt-5 border-t border-grey-600 pt-6 text-[13px] text-ink">
				<Row label="Total" value={quote ? formatPrice(quote.total) : "…"} strong />
			</dl>
			{quoteError && (
				<p className="mt-2 text-xs text-error-500">Couldn&apos;t work out your total. Check your connection and try again.</p>
			)}

			<Button
				type="submit"
				isLoading={submitting}
				disabled={!quote || quoteLoading || submitting}
				className="mt-6 h-[54px] w-full rounded-lg text-base font-semibold"
			>
				{quote
					? paymentMethod === "card"
						? `Pay ${formatPrice(quote.total)}`
						: `Place order · ${formatPrice(quote.total)}`
					: "Pay"}
			</Button>
			<p className="mt-3 text-center text-xs text-grey-800">
				{paymentMethod === "card"
					? "You'll confirm the payment securely with our payment partner."
					: "Pay the courier in cash or by transfer when your order arrives."}
			</p>
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

/** Green ring and dot when chosen (Figma). */
function Radio({
	name,
	value,
	checked,
	onChange,
	label,
}: {
	name: string;
	value: string;
	checked: boolean;
	onChange: () => void;
	label: string;
}) {
	return (
		<label className="flex w-fit cursor-pointer items-center gap-3 text-[15px] text-ink">
			<input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" />
			<span
				aria-hidden
				className="grid size-5 place-items-center rounded-full border-[1.5px] border-grey-700 bg-white peer-checked:border-primary-400 peer-focus-visible:ring-[3px] peer-focus-visible:ring-primary-300/40 peer-checked:[&>span]:block"
			>
				<span className="hidden size-2.5 rounded-full bg-primary-400" />
			</span>
			{label}
		</label>
	);
}

type TextName = Exclude<keyof CheckoutValues, "payment_method">;

function TextField({
	control,
	name,
	label,
	icon: Icon,
	className,
	...input
}: {
	control: Control<CheckoutValues>;
	name: TextName;
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
	className?: string;
} & Omit<React.ComponentProps<typeof Input>, "name" | "className">) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={cn("gap-1.5", className)}>
					<FormLabel className={LABEL}>{label}</FormLabel>
					<div className="relative">
						<FormControl>
							<Input {...input} {...field} className={cn(FIELD, Icon && "pr-10")} />
						</FormControl>
						{Icon && (
							<Icon
								className="pointer-events-none absolute top-1/2 right-3.5 size-[18px] -translate-y-1/2 text-grey-900"
								aria-hidden
							/>
						)}
					</div>
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
			<div className="h-[520px] animate-pulse rounded-lg bg-grey-600" />
		</div>
	);
}
