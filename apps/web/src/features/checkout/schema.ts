import { z } from "zod";

/** Nigerian mobile numbers: 080…, 070…, 090…, 081… (11 digits), or the same with +234 / 234 instead of the 0. */
const NG_PHONE = /^(?:\+?234|0)[789][01]\d{8}$/;

/** Luhn check: catches most mistyped card numbers before the shopper reaches the payment provider. */
function luhn(digits: string) {
	let sum = 0;
	for (let i = 0; i < digits.length; i++) {
		let d = Number(digits[digits.length - 1 - i]);
		if (i % 2 === 1) {
			d *= 2;
			if (d > 9) d -= 9;
		}
		sum += d;
	}
	return sum % 10 === 0;
}

/** "09/2024" (or "09/24") and not in the past. */
function validExpiry(value: string) {
	const match = value.trim().match(/^(0[1-9]|1[0-2])\s*\/\s*(\d{2}|\d{4})$/);
	if (!match) return false;
	const month = Number(match[1]);
	const year = match[2].length === 2 ? 2000 + Number(match[2]) : Number(match[2]);
	const now = new Date();
	return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

/** A delivery address (checkout, and the one saved on My Account). */
export const AddressSchema = z.object({
	first_name: z.string().trim().nonempty("Enter your first name").max(50, "Too long"),
	last_name: z.string().trim().nonempty("Enter your last name").max(50, "Too long"),
	address: z.string().trim().nonempty("Enter your delivery address").max(200, "Too long"),
	city: z.string().trim().nonempty("Enter your city or town").max(80, "Too long"),
	zip_code: z.string().trim().max(10, "Too long"),
	phone_number: z
		.string()
		.trim()
		.nonempty("Enter your mobile number")
		.refine((v) => NG_PHONE.test(v.replace(/[\s-]/g, "")), "Enter a valid Nigerian mobile number"),
	email: z.string().trim().nonempty("Enter your email address").pipe(z.email("Enter a valid email address")),
});
export type AddressValues = z.infer<typeof AddressSchema>;

/**
 * Figma order summary: delivery information and how to pay. Card fields are only checked when paying by card.
 * IMPORTANT: card details are checked here for typos only and are never sent to our API (see CheckoutView).
 */
export const CheckoutSchema = AddressSchema.extend({
	payment_method: z.enum(["card", "pay_on_delivery"]),
	cardholder_name: z.string().trim(),
	card_number: z.string(),
	card_expiry: z.string(),
	card_cvv: z.string(),
}).superRefine((v, ctx) => {
	if (v.payment_method !== "card") return;
	const digits = v.card_number.replace(/\D/g, "");
	if (!v.cardholder_name) ctx.addIssue({ code: "custom", path: ["cardholder_name"], message: "Enter the name on the card" });
	if (digits.length < 13 || digits.length > 19 || !luhn(digits))
		ctx.addIssue({ code: "custom", path: ["card_number"], message: "Enter a valid card number" });
	if (!validExpiry(v.card_expiry))
		ctx.addIssue({ code: "custom", path: ["card_expiry"], message: "Enter a valid expiry date (MM/YYYY)" });
	if (!/^\d{3,4}$/.test(v.card_cvv.trim()))
		ctx.addIssue({ code: "custom", path: ["card_cvv"], message: "Enter the 3 or 4 digits on the back" });
});

export type CheckoutValues = z.infer<typeof CheckoutSchema>;

/** "08012345678" → "+2348012345678". */
export const normalisePhone = (value: string) => {
	const digits = value.replace(/[\s-]/g, "");
	return digits.startsWith("0") ? `+234${digits.slice(1)}` : digits.startsWith("234") ? `+${digits}` : digits;
};

/** Groups card digits in fours as they're typed: "4084 0840 8408 4081". */
export const formatCardNumber = (value: string) =>
	value
		.replace(/\D/g, "")
		.slice(0, 19)
		.replace(/(\d{4})(?=\d)/g, "$1 ");
