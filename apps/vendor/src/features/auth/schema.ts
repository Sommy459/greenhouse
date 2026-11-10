import { z } from "zod";

export const SignInSchema = z.object({
	email: z.string().nonempty("Email is required").email("Invalid email address"),
	password: z.string().nonempty("Password is required"),
});

export type SignInValues = z.infer<typeof SignInSchema>;

/* Seller sign-up (Figma "Set up your shop"): country → e-mail → code → personal information → shop details. */

/** Step 2: the e-mail the account is created with. */
export const EmailSchema = z.object({
	email: z.string().trim().nonempty("Enter your e-mail address").pipe(z.email("Enter a valid e-mail address")),
});

export type EmailValues = z.infer<typeof EmailSchema>;

/** Step 3: the code sent to that address. Digits only; spaces are ignored. */
export const VerifyCodeSchema = z.object({
	code: z
		.string()
		.transform((v) => v.replace(/\s/g, ""))
		.pipe(
			z
				.string()
				.nonempty("Enter the verification code")
				.regex(/^\d{6}$/, "Enter the 6-digit code from the e-mail"),
		),
});

export type VerifyCodeInput = z.input<typeof VerifyCodeSchema>;
export type VerifyCodeValues = z.output<typeof VerifyCodeSchema>;

/** Country codes for the phone picker. Nigeria first (PRD: Nigerian sellers). */
export const DIAL_CODES = [
	{ code: "+234", country: "Nigeria" },
	{ code: "+233", country: "Ghana" },
	{ code: "+229", country: "Benin" },
	{ code: "+237", country: "Cameroon" },
	{ code: "+254", country: "Kenya" },
	{ code: "+27", country: "South Africa" },
	{ code: "+44", country: "United Kingdom" },
	{ code: "+1", country: "United States / Canada" },
] as const;

/** Step 2 (Figma "Personal Information" plus your name and shop name): the hint under the fields lists the password rules. */
export const PersonalInfoSchema = z
	.object({
		name: z.string().trim().nonempty("Enter your full name").max(100, "Too long"),
		business_name: z.string().trim().nonempty("Enter your shop name").max(80, "Too long"),
		dial_code: z.string().nonempty(),
		phone: z.string().trim().nonempty("Enter your phone number"),
		password: z
			.string()
			.min(8, "At least 8 characters")
			.refine((v) => /[A-Z]/.test(v), "Add a capital letter")
			.refine((v) => /[a-z]/.test(v), "Add a lower-case letter")
			.refine((v) => /\d/.test(v), "Add a number")
			.refine((v) => /[^A-Za-z0-9]/.test(v), "Add a special character"),
		confirm_password: z.string().nonempty("Confirm your password"),
	})
	.refine(
		({ dial_code, phone }) => {
			const digits = phone.replace(/[\s-]/g, "").replace(/^0/, "");
			return dial_code === "+234" ? /^[789][01]\d{8}$/.test(digits) : /^\d{6,12}$/.test(digits);
		},
		{ message: "Enter a valid phone number", path: ["phone"] },
	)
	.refine((v) => v.password === v.confirm_password, { message: "Passwords do not match", path: ["confirm_password"] });

export type PersonalInfoValues = z.infer<typeof PersonalInfoSchema>;

/** +234 and "0801 234 5678" → "+2348012345678". */
export const fullPhoneNumber = (dial_code: string, phone: string) =>
	`${dial_code}${phone.replace(/[\s-]/g, "").replace(/^0/, "")}`;
