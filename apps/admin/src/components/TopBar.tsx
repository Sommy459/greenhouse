"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, Settings } from "lucide-react";
import { FysiLogo } from "@repo/ui/fysi-logo";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { currentSection } from "@/components/nav";
import { UserAvatar } from "@/components/UserAvatar";
import { useSignOut } from "@/features/auth/hooks";
import { useSession } from "@/features/auth/session";
import { consoleRoutes } from "@/lib/routes";

/** Figma top bar: the current section, a wide search (searches products), notifications and the admin's menu. */
export function TopBar({ onMenu }: { onMenu: () => void }) {
	const router = useRouter();
	const section = currentSection(usePathname());
	const user = useSession((s) => s.user);
	const signOut = useSignOut();
	const name = user?.name ?? "";

	const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
		router.push(q ? `${consoleRoutes.PRODUCTS}?${new URLSearchParams({ search: q })}` : consoleRoutes.PRODUCTS);
	};

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-grey-600 bg-white px-4 lg:gap-10 lg:px-8">
			<button type="button" onClick={onMenu} aria-label="Open menu" className="rounded-md p-1.5 hover:bg-grey-500 lg:hidden">
				<Menu className="size-6" />
			</button>
			<Link href={consoleRoutes.OVERVIEW} aria-label="Fysi admin home" className="text-primary-500 lg:hidden">
				<FysiLogo size="sm" />
			</Link>

			{/* Figma: the section you're in ("Home" on the Overview). */}
			<Link
				href={section.href}
				className="hidden shrink-0 items-center gap-1.5 text-sm text-grey-800 transition-colors hover:text-primary-500 lg:flex"
			>
				<section.icon className="size-5" aria-hidden />
				{section.label}
			</Link>

			<form role="search" onSubmit={onSearch} className="hidden max-w-[526px] flex-1 md:block">
				<label className="flex h-10 items-center gap-3 rounded-lg bg-grey-500 px-4 focus-within:ring-2 focus-within:ring-primary-200">
					<Search className="size-5 shrink-0 text-ink" aria-hidden />
					<span className="sr-only">Search products</span>
					<input
						name="q"
						type="search"
						placeholder="Search here..."
						className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-grey-900"
					/>
				</label>
			</form>

			<div className="ml-auto flex items-center gap-4 lg:gap-6">
				<Popover>
					<PopoverTrigger asChild>
						<button type="button" aria-label="Notifications" className="rounded-full p-1.5 transition-colors hover:bg-grey-500">
							<Bell className="size-6" />
						</button>
					</PopoverTrigger>
					<PopoverContent align="end" className="w-72 text-sm">
						<p className="font-semibold">Work queues</p>
						<p className="mt-1 text-grey-900">Where your attention is usually needed:</p>
						<ul className="mt-2 space-y-1.5">
							<li>
								<Link href={consoleRoutes.VENDOR_QUEUE} className="font-medium text-primary-500 hover:underline">
									Vendors waiting for review
								</Link>
							</li>
							<li>
								<Link href={consoleRoutes.PAYMENTS} className="font-medium text-primary-500 hover:underline">
									Payments to refund
								</Link>
							</li>
							<li>
								<Link href={consoleRoutes.ORDERS} className="font-medium text-primary-500 hover:underline">
									Disputed orders
								</Link>
							</li>
						</ul>
					</PopoverContent>
				</Popover>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							aria-label="Account menu"
							className="rounded-full focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:outline-none"
						>
							<UserAvatar name={name} src={user?.avatarUrl} className="size-9" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuLabel>
							<p className="truncate">{name}</p>
							<p className="truncate text-xs font-normal text-grey-900">{user?.email}</p>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href={consoleRoutes.SETTINGS}>
								<Settings /> Settings
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={signOut}>
							<LogOut /> Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
