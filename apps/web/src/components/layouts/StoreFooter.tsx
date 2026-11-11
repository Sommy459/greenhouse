import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { Logo } from "@/components/Logo";
import { CATEGORY_LINKS, FOOTER_ACCOUNT, FOOTER_CONTACT, FOOTER_SUPPORT, LEGAL_LINKS } from "@/lib/navigation";
import { aboutRoutes } from "@/lib/routes";
import { SITE_NAME, SITE_TAGLINE, SOCIAL_LINKS, VENDOR_URL } from "@/lib/site";

type FooterLink = { label: string; href: string };

const SOCIALS = [
	{ label: "Instagram", href: SOCIAL_LINKS.instagram, icon: FaInstagram },
	{ label: "X", href: SOCIAL_LINKS.x, icon: FaXTwitter },
	{ label: "Facebook", href: SOCIAL_LINKS.facebook, icon: FaFacebookF },
].filter((s) => s.href);

/** Figma landing page footer: columns on desktop, stacked with a collapsible catalogue on mobile. */
export function StoreFooter() {
	const year = new Date().getFullYear();

	return (
		<footer className="animate-reveal bg-primary-500 text-white">
			{/* Desktop */}
			<div className="shop-container hidden grid-cols-[1.4fr_repeat(6,1fr)] gap-6 pt-14 pb-12 lg:grid">
				<div>
					<Logo tone="light" />
					<p className="mt-2 text-xs text-white/80">{SITE_TAGLINE}</p>
				</div>
				<div>
					<Menu className="mb-3 size-4" aria-label="More" />
					<LinkList
						links={[
							...FOOTER_CONTACT.slice(0, 1),
							...SOCIALS.map(({ label, href }) => ({ label, href })),
							...FOOTER_CONTACT.slice(1),
						]}
					/>
				</div>
				<FooterColumn title="Catalogue" links={CATEGORY_LINKS} />
				<FooterColumn title="Account" links={FOOTER_ACCOUNT} />
				<FooterColumn title="About Us" href={aboutRoutes.ABOUT} />
				<FooterColumn title="Support" links={FOOTER_SUPPORT} />
				<div>
					<a href={VENDOR_URL} className="text-sm font-medium hover:underline">
						Sell on {SITE_NAME}
					</a>
				</div>
			</div>
			<div className="shop-container hidden items-center gap-10 border-t border-white/15 py-5 text-xs lg:flex">
				{LEGAL_LINKS.map((link) => (
					<Link key={link.href} href={link.href} className="hover:underline">
						{link.label}
					</Link>
				))}
				<p className="ml-auto">
					© {year} {SITE_NAME}. All rights reserved.
				</p>
			</div>

			{/* Mobile */}
			<div className="px-4 pt-12 pb-8 lg:hidden">
				<Logo tone="light" />
				<details className="group mt-8">
					<summary className="flex cursor-pointer list-none items-center gap-2 text-base font-medium">
						Catalogue <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
					</summary>
					<div className="mt-3">
						<LinkList links={CATEGORY_LINKS} />
					</div>
				</details>
				<MobileGroup title="Account" links={FOOTER_ACCOUNT} />
				<Link href={aboutRoutes.ABOUT} className="mt-6 block text-base font-medium">
					About Us
				</Link>
				<MobileGroup title="Support" links={FOOTER_SUPPORT} />
				<a href={VENDOR_URL} className="mt-6 block text-base font-medium">
					Sell on {SITE_NAME}
				</a>
				<div className="mt-5 flex gap-3">
					{SOCIALS.map(({ label, href, icon: Icon }) => (
						<a
							key={label}
							href={href}
							aria-label={label}
							className="grid size-7 place-items-center rounded-full bg-white text-primary-500"
						>
							<Icon className="size-3.5" />
						</a>
					))}
				</div>
				<nav aria-label="Legal" className="mt-10 flex flex-col items-center gap-2 text-xs">
					{LEGAL_LINKS.map((link) => (
						<Link key={link.href} href={link.href} className="hover:underline">
							{link.label}
						</Link>
					))}
				</nav>
				<p className="mt-8 text-center text-xs">
					© {year} {SITE_NAME}. All rights reserved.
				</p>
			</div>
		</footer>
	);
}

function FooterColumn({ title, href, links }: { title: string; href?: string; links?: FooterLink[] }) {
	return (
		<div>
			{href ? (
				<Link href={href} className="text-sm font-medium hover:underline">
					{title}
				</Link>
			) : (
				<p className="text-sm font-medium">{title}</p>
			)}
			{links && (
				<div className="mt-3">
					<LinkList links={links} />
				</div>
			)}
		</div>
	);
}

function MobileGroup({ title, links }: { title: string; links: FooterLink[] }) {
	return (
		<div className="mt-6">
			<p className="text-base font-medium">{title}</p>
			<div className="mt-3">
				<LinkList links={links} />
			</div>
		</div>
	);
}

function LinkList({ links }: { links: FooterLink[] }) {
	return (
		<ul className="flex flex-col gap-2 text-xs text-white/80">
			{links.map((link) => (
				<li key={link.label}>
					<Link href={link.href} className="hover:text-white hover:underline">
						{link.label}
					</Link>
				</li>
			))}
		</ul>
	);
}
