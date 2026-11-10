import { z } from "zod";

/** Figma Settings "Personal info". */
export const PersonalInfoSchema = z.object({
	first_name: z.string().trim().nonempty("Enter your first name").max(50, "Too long"),
	last_name: z.string().trim().nonempty("Enter your last name").max(50, "Too long"),
	email: z.string().trim().nonempty("Enter your email address").pipe(z.email("Enter a valid email address")),
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

/** Figma "SVG, PNG, JPG or GIF". */
export const PHOTO_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/gif"];
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
