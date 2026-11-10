"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { FysiLogo } from "@repo/ui/fysi-logo";
import { FOOTER_NAV, isActive, MAIN_NAV } from "@/components/nav";
import { TopBar } from "@/components/TopBar";
import { UserAvatar } from "@/components/UserAvatar";
import { useSignOut } from "@/features/auth/hooks";
import { useSession } from "@/features/auth/session";
import { consoleRoutes } from "@/lib/routes";

/**
 * Figma admin dashboard: a forest-green sidebar (logo, main sections, Settings and Help, the signed-in admin) beside a
 * white top bar. On desktop the ☰ button folds the sidebar to icons; below `lg` the sidebar slides in over the page.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		if (!drawerOpen) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [drawerOpen]);

	return (
		<div className="flex min-h-dvh bg-grey-500">
			<aside
				className={clsx(
					"sticky top-0 hidden h-dvh shrink-0 transition-[width] duration-300 ease-settle lg:block",
					collapsed ? "w-[84px]" : "w-[272px]",
				)}
			>
				<Sidebar
					pathname={pathname}
					collapsed={collapsed}
					onToggle={() => setCollapsed((v) => !v)}
					toggleLabel={collapsed ? "Expand menu" : "Collapse menu"}
				/>
			</aside>

			{drawerOpen && (
				<div className="fixed inset-0 z-40 lg:hidden">
					<button
						type="button"
						aria-label="Close menu"
						className="absolute inset-0 animate-in bg-black/50 fade-in"
						onClick={() => setDrawerOpen(false)}
					/>
					<aside className="absolute inset-y-0 left-0 w-[272px] max-w-[85vw] animate-in duration-300 slide-in-from-left">
						<Sidebar
							pathname={pathname}
							onToggle={() => setDrawerOpen(false)}
							onNavigate={() => setDrawerOpen(false)}
							toggleLabel="Close menu"
						/>
					</aside>
				</div>
			)}

			<div className="flex min-w-0 flex-1 flex-col">
				<TopBar onMenu={() => setDrawerOpen(true)} />
				<main className="min-w-0 flex-1">{children}</main>
			</div>
		</div>
	);
}

interface SidebarProps {
	pathname: string;
	collapsed?: boolean;
	onToggle: () => void;
	toggleLabel: string;
	onNavigate?: () => void;
}

function Sidebar({ pathname, collapsed = false, onToggle, toggleLabel, onNavigate }: SidebarProps) {
	const user = useSession((s) => s.user);
	const signOut = useSignOut();
	const name = user ? `${user.first_name} ${user.last_name}`.trim() : "";

	return (
		<div className="hide-scroll flex h-full flex-col overflow-y-auto bg-primary-500 px-2 pt-6 pb-6 text-white">
			<div className={clsx("flex items-center pb-5", collapsed ? "flex-col gap-4" : "justify-between pr-2 pl-4")}>
				<Link href={consoleRoutes.OVERVIEW} aria-label="Fysi admin home" onClick={onNavigate} className="text-white">
					{collapsed ? <FysiLogo size="sm" className="[&>svg:last-child]:hidden" /> : <FysiLogo size="console" />}
				</Link>
				<button
					type="button"
					onClick={onToggle}
					aria-label={toggleLabel}
					className="rounded-md p-1.5 transition-colors hover:bg-white/10"
				>
					<Menu className="size-6" />
				</button>
			</div>

			<nav aria-label="Console" className="flex flex-col gap-1">
				{MAIN_NAV.map((item) => (
					<NavItem
						key={item.href}
						{...item}
						active={isActive(pathname, item.href)}
						collapsed={collapsed}
						onNavigate={onNavigate}
					/>
				))}
			</nav>
			<hr className="mx-0 mt-4 border-white/70" />

			<nav aria-label="Account" className="mt-auto flex flex-col gap-1 pt-10">
				{FOOTER_NAV.map((item) => (
					<NavItem
						key={item.href}
						{...item}
						active={isActive(pathname, item.href)}
						collapsed={collapsed}
						onNavigate={onNavigate}
					/>
				))}
			</nav>

			<div className={clsx("mt-8 flex items-center gap-3", collapsed ? "flex-col" : "pr-2 pl-3")}>
				<UserAvatar name={name} src={user?.avatar_url} online className="size-10" />
				{!collapsed && (
					<div className="min-w-0 flex-1 text-sm">
						<p className="truncate font-medium">{name}</p>
						<p className="truncate text-white/90">{user?.email}</p>
					</div>
				)}
				<button
					type="button"
					onClick={signOut}
					aria-label="Log out"
					title="Log out"
					className="rounded-md p-1.5 transition-colors hover:bg-white/10"
				>
					<LogOut className="size-5" />
				</button>
			</div>
		</div>
	);
}

interface NavItemProps {
	href: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	active: boolean;
	collapsed: boolean;
	onNavigate?: () => void;
}

function NavItem({ href, label, icon: Icon, active, collapsed, onNavigate }: NavItemProps) {
	return (
		<Link
			href={href}
			onClick={onNavigate}
			aria-current={active ? "page" : undefined}
			title={collapsed ? label : undefined}
			className={clsx(
				"flex h-11 items-center gap-3 rounded-md text-base transition-colors",
				collapsed ? "justify-center" : "px-4",
				active ? "bg-white/20 font-medium" : "text-white/95 hover:bg-white/10",
			)}
		>
			<Icon className="size-5 shrink-0" />
			<span className={collapsed ? "sr-only" : undefined}>{label}</span>
		</Link>
	);
}
