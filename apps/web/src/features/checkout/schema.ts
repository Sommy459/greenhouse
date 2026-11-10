import { z } from "zod";
import { NIGERIAN_STATES } from "@/features/orders/types";

/** Nigerian mobile numbers: 080…, 070…, 090…, 081… (11 digits), or the same with +234 / 234 instead of the 0. */
const NG_PHONE = /^(?:\+?234|0)[789][01]\d{8}$/;

/** "08012345678" → "+2348012345678". */
export const normalisePhone = (value: string) => {
	const digits = value.replace(/[\s-]/g, "");
	return digits.startsWith("0") ? `+234${digits.slice(1)}` : digits.startsWith("234") ? `+${digits}` : digits;
};

/** Checkout "Delivery Information": the API's delivery address (PRD C5). */
export const CheckoutSchema = z.object({
	recipientName: z.string().trim().nonempty("Enter the name of whoever receives it").max(100, "Too long"),
	phone: z
		.string()
		.trim()
		.nonempty("Enter a mobile number")
		.refine((v) => NG_PHONE.test(v.replace(/[\s-]/g, "")), "Enter a valid Nigerian mobile number"),
	line1: z.string().trim().nonempty("Enter the street address").max(200, "Too long"),
	line2: z.string().trim().max(200, "Too long"),
	city: z.string().trim().nonempty("Enter the city or town").max(80, "Too long"),
	state: z.enum(NIGERIAN_STATES, { error: "Choose a state" }),
	notes: z.string().trim().max(500, "Too long"),
});

export type CheckoutValues = z.infer<typeof CheckoutSchema>;

/** Fysi wallet PIN (also set when the wallet is created). */
export const PIN = /^\d{4,6}$/;
