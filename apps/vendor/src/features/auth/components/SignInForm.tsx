"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { useSignIn } from "@/features/auth/hooks";
import { SignInSchema, type SignInValues } from "@/features/auth/schema";

export function SignInForm() {
	const signIn = useSignIn();
	const form = useForm<SignInValues>({ resolver: zodResolver(SignInSchema), defaultValues: { email: "", password: "" } });

	return (
		<Form {...form}>
			<form noValidate onSubmit={form.handleSubmit((values) => signIn.mutate(values))} className="flex flex-col gap-5">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" autoComplete="email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input type="password" autoComplete="current-password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" isLoading={signIn.isPending}>
					Sign in
				</Button>
			</form>
		</Form>
	);
}
