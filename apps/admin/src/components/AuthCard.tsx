import { Logo } from "@/components/Logo";

/** The centred card the sign-in, sign-up, onboarding and approval screens share. Layout placeholder until the Figma screens. */
export function AuthCard({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<main className="flex min-h-dvh items-center justify-center bg-primary-50 px-4 py-10">
			<div className="animate-rise w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-10">
				<Logo />
				<h1 className="h2-auth mt-6">{title}</h1>
				{subtitle && <div className="mt-1 text-sm text-grey-900">{subtitle}</div>}
				<div className="mt-8">{children}</div>
			</div>
		</main>
	);
}
