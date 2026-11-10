import { z } from "zod";

/** Figma Report a Product / Problem → "Issue Type" dropdown. The `value`s are what is sent. */
export const ISSUE_TYPES = [
	{ value: "damaged", label: "Damaged Product" },
	{ value: "incorrect_item", label: "Incorrect Item Received" },
	{ value: "not_as_described", label: "Item Not as Described" },
	{ value: "defective", label: "Defective Product" },
	{ value: "poor_quality", label: "Poor Quality" },
	{ value: "size_color_mismatch", label: "Size/Color Mismatch" },
	{ value: "missing_parts", label: "Missing Parts" },
] as const;

/** Figma "Preferred Resolution" dropdown. */
export const RESOLUTIONS = [
	{ value: "full_refund", label: "Full refund" },
	{ value: "replacement", label: "Replacement" },
	{ value: "exchange", label: "Exchange" },
	{ value: "repair", label: "Repair" },
] as const;

export const ReportSchema = z.object({
	name: z.string().trim().nonempty("Enter your name").max(100, "Too long"),
	email: z.string().trim().nonempty("Enter your email address").pipe(z.email("Enter a valid email address")),
	issue_type: z.string().nonempty("Choose an issue type"),
	order_number: z.string().trim().max(40, "Too long"),
	product_name: z.string().trim().max(120, "Too long"),
	description: z
		.string()
		.trim()
		.nonempty("Describe the issue")
		.min(15, "Tell us a little more (at least 15 characters)")
		.max(2000, "Keep it under 2,000 characters"),
	preferred_resolution: z.string().nonempty("Choose a preferred resolution"),
	comments: z.string().trim().max(1000, "Keep it under 1,000 characters"),
});

export type ReportValues = z.infer<typeof ReportSchema>;
