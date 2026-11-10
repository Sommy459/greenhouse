"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { FysiLogo } from "@repo/ui/fysi-logo";
import { FOOTER_NAV, isActive, isChildActive, MAIN_NAV, type NavItem } from "@/components/nav";
import { TopBar } from "@/components/TopBar";
import { UserAvatar } from "@/components/UserAvatar";
import { useSignOut } from "@/features/auth/hooks";
import { useSession } from "@/features/auth/session";
import { consoleRoutes } from "@/lib/routes";

/**
 * Figma "Fysi Vendor Hub": a forest-green sidebar (logo, sections with fold-out groups, Settings and Help, the signed-in
 * seller) beside a white top bar. On desktop ☰ folds the sidebar to icons; below `lg` it slides in over the page.
 */
export function VendorShell({ children }: { children: React.ReactNode }) {
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
					collapsed ? "w-[84px]" : "w-[300px]",
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
					<aside className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] animate-in duration-300 slide-in-from-left">
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
	const name = user?.name ?? "";

	return (
		<div className="hide-scroll flex h-full flex-col overflow-y-auto bg-primary-500 px-2 pt-6 pb-6 text-white">
			<div className={clsx("flex items-center pb-5", collapsed ? "flex-col gap-4" : "justify-between pr-2 pl-4")}>
				<Link
					href={consoleRoutes.OVERVIEW}
					aria-label="Fysi Vendor Hub home"
					onClick={onNavigate}
					className="flex items-center gap-2 text-white"
				>
					{collapsed ? (
						<FysiLogo size="sm" className="[&>svg:last-child]:hidden" />
					) : (
						<>
							<FysiLogo size="console" />
							<span className="text-sm font-bold tracking-wide uppercase">Vendor Hub</span>
						</>
					)}
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

			<nav aria-label="Vendor Hub" className="flex flex-col gap-1">
				{MAIN_NAV.map((item) => (
					<NavEntry key={item.label} item={item} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
				))}
			</nav>
			<hr className="mx-0 mt-4 border-white/70" />

			<nav aria-label="Account" className="mt-auto flex flex-col gap-1 pt-10">
				{FOOTER_NAV.map((item) => (
					<NavEntry key={item.label} item={item} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
				))}
			</nav>

			<div className={clsx("mt-8 flex items-center gap-3", collapsed ? "flex-col" : "pr-2 pl-3")}>
				<UserAvatar name={name} src={user?.avatarUrl} online className="size-10" />
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

const ROW = "flex h-11 w-full items-center gap-3 rounded-md text-base transition-colors";

function NavEntry({
	item,
	pathname,
	collapsed,
	onNavigate,
}: {
	item: NavItem;
	pathname: string;
	collapsed: boolean;
	onNavigate?: () => void;
}) {
	const { href, label, icon: Icon, children } = item;
	const active = isActive(pathname, href);
	// A group opens on its own pages; the chevron toggles it. Remembered per path, so navigating in resets it.
	const [toggled, setToggled] = useState<{ path: string; open: boolean } | null>(null);
	const open = toggled?.path === pathname ? toggled.open : active;

	// Folded sidebar, or a plain link: one icon row to the section.
	if (!children || collapsed) {
		return (
			<Link
				href={href}
				onClick={onNavigate}
				aria-current={active && !children ? "page" : undefined}
				title={collapsed ? label : undefined}
				className={clsx(
					ROW,
					collapsed ? "justify-center" : "px-4",
					active ? "bg-white/20 font-medium" : "text-white/95 hover:bg-white/10",
				)}
			>
				<Icon className="size-5 shrink-0" />
				<span className={collapsed ? "sr-only" : undefined}>{label}</span>
			</Link>
		);
	}

	const listId = `nav-${label.replace(/\W+/g, "-").toLowerCase()}`;
	return (
		<div>
			<button
				type="button"
				aria-expanded={open}
				aria-controls={listId}
				onClick={() => setToggled({ path: pathname, open: !open })}
				className={clsx(ROW, "px-4 text-left", active ? "font-medium" : "text-white/95 hover:bg-white/10")}
			>
				<Icon className="size-5 shrink-0" />
				<span className="min-w-0 flex-1 truncate">{label}</span>
				<ChevronDown className={clsx("size-5 shrink-0 transition-transform duration-200", open && "rotate-180")} aria-hidden />
			</button>
			{open && (
				<ul id={listId} className="mt-1 flex flex-col gap-1 pl-0">
					{children.map((child) => {
						const childActive = isChildActive(pathname, child.href, children);
						return (
							<li key={child.href + child.label}>
								<Link
									href={child.href}
									onClick={onNavigate}
									aria-current={childActive ? "page" : undefined}
									className={clsx(
										"flex h-11 items-center rounded-md pr-4 pl-12 text-base transition-colors",
										childActive ? "bg-white/20 font-medium" : "text-white/95 hover:bg-white/10",
									)}
								>
									{child.label}
								</Link>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
