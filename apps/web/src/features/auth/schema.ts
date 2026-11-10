import { z } from "zod";

/** Nigerian mobile numbers: 080…, 070…, 090…, 081… (11 digits), or the same with +234 / 234 instead of the 0. */
const NG_PHONE = /^(?:\+?234|0)[789][01]\d{8}$/;

/** "Welcome to Fysi": one field that takes an email or a phone number, for both log in and sign up. */
export const IdentifierSchema = z.object({
	identifier: z
		.string()
		.trim()
		.nonempty("Enter your email or phone number")
		.refine(
			(v) => z.email().safeParse(v).success || NG_PHONE.test(v.replace(/[\s-]/g, "")),
			"Enter a valid email or phone number",
		),
});

export type IdentifierValues = z.infer<typeof IdentifierSchema>;

/** Phone numbers are sent in one form, whatever the shopper typed: +234XXXXXXXXXX. Emails are lower-cased. */
export function normaliseIdentifier(value: string) {
	const v = value.trim();
	if (v.includes("@")) return v.toLowerCase();
	const digits = v.replace(/[\s-]/g, "");
	return digits.startsWith("0") ? `+234${digits.slice(1)}` : digits.startsWith("234") ? `+${digits}` : digits;
}

export const isEmailIdentifier = (value: string) => value.includes("@");

/** The design shows four boxes. */
export const CODE_LENGTH = 4;

/** "Welcome back": email and password. `remember_me` asks the API for a 30-day session. */
export const SignInSchema = z.object({
	email: z.string().trim().nonempty("Enter your email").pipe(z.email("Enter a valid email")),
	password: z.string().nonempty("Enter your password"),
	remember_me: z.boolean(),
});

export type SignInValues = z.infer<typeof SignInSchema>;

/** "Create your account" (after the code is verified): "to keep your account safe we need a strong password". */
export const CreateAccountSchema = z
	.object({
		password: z
			.string()
			.min(8, "At least 8 characters")
			.refine((v) => /[A-Z]/.test(v), "Must contain at least 1 uppercase letter")
			.refine((v) => /[a-z]/.test(v), "Must contain at least 1 lowercase letter")
			.refine((v) => /\d/.test(v), "Must contain at least 1 number"),
		confirm_password: z.string().nonempty("Please confirm your password"),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: "Passwords do not match",
		path: ["confirm_password"],
	});

export type CreateAccountValues = z.infer<typeof CreateAccountSchema>;

/** Country codes for the phone picker. Nigeria first (PRD: Nigerian customers); add more as delivery expands. */
export const DIAL_CODES = [
	{ code: "+234", country: "Nigeria" },
	{ code: "+233", country: "Ghana" },
	{ code: "+254", country: "Kenya" },
	{ code: "+27", country: "South Africa" },
	{ code: "+44", country: "United Kingdom" },
	{ code: "+1", country: "United States / Canada" },
] as const;

/** "Personal Details" (step 4). The number is typed without the country code; a leading 0 is dropped. */
export const PersonalDetailsSchema = z
	.object({
		first_name: z.string().trim().nonempty("Enter your first name").max(50, "First name is too long"),
		last_name: z.string().trim().nonempty("Enter your last name").max(50, "Last name is too long"),
		dial_code: z.string().nonempty(),
		phone: z.string().trim().nonempty("Enter your phone number"),
	})
	.refine(
		({ dial_code, phone }) => {
			const digits = phone.replace(/[\s-]/g, "").replace(/^0/, "");
			return dial_code === "+234" ? /^[789][01]\d{8}$/.test(digits) : /^\d{6,12}$/.test(digits);
		},
		{ message: "Enter a valid phone number", path: ["phone"] },
	);

export type PersonalDetailsValues = z.infer<typeof PersonalDetailsSchema>;

/** +234 and "0801 234 5678" → "+2348012345678". */
export const fullPhoneNumber = (dial_code: string, phone: string) =>
	`${dial_code}${phone.replace(/[\s-]/g, "").replace(/^0/, "")}`;

/** Splits a stored "+2348012345678" back into the picker and the field (Nigeria assumed when unsure). */
export function splitPhoneNumber(full: string | undefined): { dial_code: string; phone: string } {
	if (!full) return { dial_code: "+234", phone: "" };
	const match = [...DIAL_CODES].sort((a, b) => b.code.length - a.code.length).find((d) => full.startsWith(d.code));
	return match
		? { dial_code: match.code, phone: full.slice(match.code.length) }
		: { dial_code: "+234", phone: full.replace(/^\+/, "") };
}
