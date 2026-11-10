import { z } from "zod";

/** Admin accounts are created by a super admin, never through sign-up. */
export const SignInSchema = z.object({
	email: z.string().nonempty("Email is required").email("Invalid email address"),
	password: z.string().nonempty("Password is required"),
});

export type SignInValues = z.infer<typeof SignInSchema>;
