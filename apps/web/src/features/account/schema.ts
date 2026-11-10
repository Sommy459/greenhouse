import { z } from "zod";

/** Figma Settings "Personal info": the API keeps one name and an optional phone. Email can't be changed. */
export const PersonalInfoSchema = z.object({
	name: z.string().trim().nonempty("Enter your name").max(100, "Too long"),
	phone: z
		.string()
		.trim()
		.refine(
			(v) => v === "" || /^(?:\+?234|0)[789][01]\d{8}$/.test(v.replace(/[\s-]/g, "")),
			"Enter a valid Nigerian mobile number",
		),
});
export type PersonalInfoValues = z.infer<typeof PersonalInfoSchema>;

/** The same rule as "Create your account". */
export const PASSWORD_HINT = "At least 8 characters, with an uppercase letter, a lowercase letter and a number.";

/** Figma Settings "Password". */
export const ChangePasswordSchema = z
	.object({
		current_password: z.string().nonempty("Enter your current password"),
		new_password: z
			.string()
			.min(8, "At least 8 characters")
			.refine((v) => /[A-Z]/.test(v), "Must contain at least 1 uppercase letter")
			.refine((v) => /[a-z]/.test(v), "Must contain at least 1 lowercase letter")
			.refine((v) => /\d/.test(v), "Must contain at least 1 number"),
		confirm_password: z.string().nonempty("Confirm your new password"),
	})
	.refine((v) => v.new_password === v.confirm_password, { message: "Passwords do not match", path: ["confirm_password"] })
	.refine((v) => v.new_password !== v.current_password, {
		message: "Choose a password different from the current one",
		path: ["new_password"],
	});
export type ChangePasswordValues = z.infer<typeof ChangePasswordSchema>;

/** Profile photos: PNG, JPG or WebP. */
export const PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
