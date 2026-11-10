import { z } from "zod";
import { GENDERS } from "@/features/settings/types";

/** Nigerian numbers: 080… or +23480…; sent as +234…. */
const PHONE = /^(\+?234|0)[789][01]\d{8}$/;

export const profileSchema = z.object({
	first_name: z.string().trim().min(1, "Enter your first name").max(50, "Keep it under 50 characters"),
	last_name: z.string().trim().min(1, "Enter your last name").max(50, "Keep it under 50 characters"),
	email: z.string().trim().toLowerCase().email("Enter a valid e-mail address"),
	phone_number: z
		.string()
		.trim()
		.transform((v) => v.replace(/[\s-]/g, ""))
		.refine((v) => v === "" || PHONE.test(v), "Enter a Nigerian number, e.g. 08012345678")
		.transform((v) => (v === "" ? "" : v.replace(/^(\+?234|0)/, "+234"))),
	gender: z.enum(GENDERS).nullable(),
	address: z.string().trim().max(300, "Keep it under 300 characters"),
});

export type ProfileInput = z.input<typeof profileSchema>;
export type ProfileValues = z.output<typeof profileSchema>;

/** Avatars: PNG, JPG or WebP, up to 2MB. */
export const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
