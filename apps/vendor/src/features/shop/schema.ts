import { z } from "zod";

/** Seller sign-up step 1 (Figma): the country the seller is based in. */
export const CountrySchema = z.object({
	country: z.string().nonempty("Select your country"),
});

export type CountryValues = z.infer<typeof CountrySchema>;

/** The CAC certificate upload (Figma: "SVG, PNG, JPG, GIF | 10MB max."). */
export const CERTIFICATE_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/gif"] as const;
export const CERTIFICATE_ACCEPT = ".svg,.png,.jpg,.jpeg,.gif";
export const CERTIFICATE_MAX_BYTES = 10 * 1024 * 1024;

/** CAC registration numbers: RC (companies), BN (business names) or IT (trustees) and digits; the prefix is optional. */
const CAC_ID = /^(RC|BN|IT)?\s?\d{4,9}$/i;

/**
 * Figma sign-up step 5 (the account exists by now): the shop itself. Business sellers also give their CAC registration
 * number and certificate; individuals don't.
 */
export const ShopDetailsSchema = z
	.object({
		account_type: z.enum(["business", "individual"], { error: "Choose an account type" }),
		shop_name: z.string().trim().nonempty("Enter your shop name").max(80, "Shop name is too long"),
		cac_id: z.string().trim(),
		shipping_zone: z.string().nonempty("Select your shipping zone"),
		referral_source: z.string().nonempty("Tell us how you heard about Fysi"),
		cac_certificate: z.custom<File>((v) => typeof File !== "undefined" && v instanceof File).nullable(),
		terms_accepted: z.boolean().refine((v) => v, "Agree to the seller terms to continue"),
	})
	.superRefine((v, ctx) => {
		if (v.account_type !== "business") return;
		if (!v.cac_id) ctx.addIssue({ code: "custom", path: ["cac_id"], message: "Enter your CAC ID" });
		else if (!CAC_ID.test(v.cac_id))
			ctx.addIssue({ code: "custom", path: ["cac_id"], message: "Enter a valid CAC ID, e.g. RC1234567" });

		const file = v.cac_certificate;
		if (!file) ctx.addIssue({ code: "custom", path: ["cac_certificate"], message: "Upload your CAC certificate" });
		else if (!(CERTIFICATE_TYPES as readonly string[]).includes(file.type))
			ctx.addIssue({ code: "custom", path: ["cac_certificate"], message: "Upload an SVG, PNG, JPG or GIF file" });
		else if (file.size > CERTIFICATE_MAX_BYTES)
			ctx.addIssue({ code: "custom", path: ["cac_certificate"], message: "The file is over 10MB" });
	});

/** Form state: nothing chosen yet. */
export type ShopDetailsInput = z.input<typeof ShopDetailsSchema>;
export type ShopDetailsValues = z.output<typeof ShopDetailsSchema>;

/**
 * POST /vendor/onboarding, sent as multipart/form-data (it can carry the certificate). Country and e-mail come from the
 * account (sign-up). `cac_id` and `cac_certificate` are only sent for business sellers.
 */
export type OnboardingValues = ShopDetailsValues;

export function toOnboardingFormData(values: OnboardingValues) {
	const data = new FormData();
	data.set("account_type", values.account_type);
	data.set("shop_name", values.shop_name);
	data.set("shipping_zone", values.shipping_zone);
	data.set("referral_source", values.referral_source);
	data.set("terms_accepted", "true");
	if (values.account_type === "business") {
		data.set("cac_id", values.cac_id.replace(/\s/g, "").toUpperCase());
		if (values.cac_certificate) data.set("cac_certificate", values.cac_certificate);
	}
	return data;
}
