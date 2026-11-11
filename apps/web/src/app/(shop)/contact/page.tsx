import type { Metadata } from "next";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { cn } from "@repo/ui/lib/utils";
import { CONTACT, SOCIAL_HANDLES, SOCIAL_LINKS } from "@/lib/site";
import { Newsletter } from "@/features/home/components/Newsletter";

export const metadata: Metadata = {
	title: "Contact Us",
	description: "Reach the Fysi team any day, any time: email, phone and our social channels.",
};

/** Figma "Follow us" photos, staggered: the 2nd and 4th sit lower (on mobile, the right-hand column). */
const PHOTOS = [
	{ src: "/images/contact/social-1.jpg", alt: "Kraft and black envelopes" },
	{ src: "/images/contact/social-2.jpg", alt: "A reed diffuser in an amber bottle" },
	{ src: "/images/contact/social-3.jpg", alt: "A bamboo bottle beside a leaf" },
	{ src: "/images/contact/social-4.jpg", alt: "A glowing lamp beside a vase" },
];

/** Figma Contact page (C13): our contacts beside the Eco Friendly photo, then social channels with staggered photos. */
export default function Page() {
	return (
		<>
			<div className="bg-grey-500">
				<div className="shop-container pt-6 pb-12 lg:pt-12 lg:pb-8">
					<div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)] lg:gap-8">
						<div className="animate-rise order-2 lg:order-1" style={{ "--i": 1 } as React.CSSProperties}>
							<h1 className="text-[28px] leading-tight font-semibold text-ink lg:text-[30px]">Our Contacts</h1>
							<dl className="mt-1 text-ink">
								<dt className="mt-1 text-xl lg:text-[21px]">Working hours:</dt>
								<dd className="text-base">{CONTACT.hours}</dd>
								<dt className="mt-2 text-xl lg:text-[21px]">Email:</dt>
								<dd className="text-base">
									<a href={`mailto:${CONTACT.email.toLowerCase()}`} className="hover:text-primary-500 hover:underline">
										{CONTACT.email}
									</a>
								</dd>
								<dt className="mt-2 text-xl lg:text-[21px]">Phone Number:</dt>
								<dd className="text-base">
									<a href={`tel:${CONTACT.phone}`} className="hover:text-primary-500 hover:underline">
										{CONTACT.phone}
									</a>
								</dd>
							</dl>
						</div>
						<div className="relative order-1 aspect-[1801/1018] overflow-hidden rounded-lg border border-grey-600 lg:order-2">
							<Image
								src="/images/contact/eco-friendly.jpg"
								alt="Paper letters spelling “Eco friendly” on grass"
								fill
								priority
								sizes="(min-width: 1024px) 900px, 100vw"
								className="animate-zoom object-cover"
							/>
						</div>
					</div>

					<section aria-labelledby="social-title" className="animate-reveal mt-10 lg:mt-8">
						<h2 id="social-title" className="text-xl font-medium text-ink lg:text-[30px] lg:font-semibold">
							Follow us on our social platforms
						</h2>
						<div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 lg:mt-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-0">
							{PHOTOS.map((photo, i) => (
								<div key={photo.src} className={cn("animate-reveal", i % 2 === 1 && "mt-16 lg:mt-[191px]")}>
									<div className="hover-lift relative aspect-[313/349] overflow-hidden rounded-md border border-grey-600">
										<Image
											src={photo.src}
											alt={photo.alt}
											fill
											sizes="(min-width: 1024px) 300px, 48vw"
											className="object-cover"
										/>
									</div>
									{/* Desktop: the handles sit under the third photo (Figma). */}
									{i === 2 && <SocialHandles className="mt-10 hidden lg:flex" />}
								</div>
							))}
						</div>
						<SocialHandles className="mt-8 lg:hidden" />
					</section>
				</div>
			</div>
			<Newsletter />
		</>
	);
}

/** Instagram, Facebook and X with the brands' own icon colours, as in the design. */
function SocialHandles({ className }: { className?: string }) {
	const links = [
		{
			label: "Instagram",
			handle: SOCIAL_HANDLES.instagram,
			href: SOCIAL_LINKS.instagram,
			icon: (
				<span className="grid size-6 place-items-center rounded-md bg-linear-to-tr from-social-instagram-from via-social-instagram-via to-social-instagram-to text-white">
					<FaInstagram className="size-4" />
				</span>
			),
		},
		{
			label: "Facebook",
			handle: SOCIAL_HANDLES.facebook,
			href: SOCIAL_LINKS.facebook,
			icon: <FaFacebook className="size-6 text-social-facebook" />,
		},
		{ label: "X", handle: SOCIAL_HANDLES.x, href: SOCIAL_LINKS.x, icon: <FaXTwitter className="size-6 text-ink" /> },
	];

	return (
		<ul className={cn("flex flex-col gap-2", className)} aria-label="Fysi on social media">
			{links.map((link) => (
				<li key={link.label}>
					{/* Until a profile URL is set in lib/site.ts the handle shows as text, not a link that goes nowhere. */}
					{link.href ? (
						<a
							href={link.href}
							target="_blank"
							rel="noreferrer"
							className="flex w-fit items-center gap-1.5 text-[13px] text-ink hover:text-primary-500"
							aria-label={`${link.label} ${link.handle}`}
						>
							<span aria-hidden>{link.icon}</span>
							{link.handle}
						</a>
					) : (
						<span className="flex w-fit items-center gap-1.5 text-[13px] text-ink" aria-label={`${link.label} ${link.handle}`}>
							<span aria-hidden>{link.icon}</span>
							{link.handle}
						</span>
					)}
				</li>
			))}
		</ul>
	);
}
