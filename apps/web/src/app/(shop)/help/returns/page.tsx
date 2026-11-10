import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Newsletter } from "@/features/home/components/Newsletter";
import { supportRoutes } from "@/lib/routes";

export const metadata: Metadata = {
	title: "Returns & Refunds",
	description: "Return an item within 14 days of delivery, unused and in its original packaging. How to start a return, refunds, exceptions and exchanges.",
};

const STEPS = [
	{ label: "Contact Us", text: "Start by reaching out to our customer support team through our contact form or email." },
	{ label: "Receive Return Instructions", text: "We'll guide you through the return process, including how to ship the item back to us." },
	{ label: "Ship the Item", text: "Pack the item securely and send it to the address provided by our team." },
];

/**
 * Figma Returns & Refunds (C13). Policy copy from the design; the intros of "How to Initiate a Return" and "Refund
 * Process" repeated "Easy Returns" there, so they are rewritten without adding new terms. Have the policy approved
 * before launch.
 */
export default function Page() {
	return (
		<>
			<div className="bg-grey-500">
				<article className="shop-container pt-8 pb-12 text-lg leading-snug text-grey-900 lg:pt-10 lg:pb-6 lg:text-[19px]">
					<h1 className="animate-rise text-[22px] font-medium text-ink lg:text-[28px] lg:font-semibold">Returns &amp; Refunds</h1>
					<p className="animate-rise mt-2" style={{ "--i": 1 } as React.CSSProperties}>
						At Fysi, we want you to be completely satisfied with your purchase. If for any reason you are not, our Returns and Refunds policy is here to
						help.
					</p>

					<Section title="Easy Returns">
						<p>
							If you wish to return an item, you can do so within 14 days of receiving your order. Please ensure that the product is unused, in its original
							packaging, and in the same condition you received it.
						</p>
					</Section>

					<Section title="How to Initiate a Return">
						<p>Returns are arranged with our support team, so we can make sure your item gets back to the right vendor quickly. Here&apos;s how it works:</p>
						<ul className="mt-4 list-disc space-y-2 pl-5 lg:mt-3 lg:list-none lg:pl-0">
							{STEPS.map((step) => (
								<li key={step.label}>
									<span className="text-primary-400 lg:font-medium lg:text-grey-900">{step.label}:</span> {step.text}
								</li>
							))}
						</ul>
					</Section>

					<Section title="Refund Process">
						<p>
							Once your return arrives and our team has checked it, we&apos;ll let you know whether your refund is approved. Approved refunds are paid back to
							your original payment method.
						</p>
					</Section>

					<Section title="Exceptions">
						<p>
							Certain items, such as perishable goods or personalized products, may not be eligible for return. Please check the product description for
							specific return eligibility.
						</p>
					</Section>

					<Section title="Exchanges">
						<p>
							If you received a defective or damaged item, we&apos;re happy to offer a replacement. Contact us within 7 days of receiving your order, and
							we&apos;ll arrange an exchange.
						</p>
					</Section>

					<Section title="Need Assistance?">
						<p>
							If you have any questions or need help with your return, our customer support team is here for you. Reach out anytime, and we&apos;ll be glad to
							assist you!
						</p>
					</Section>

					<Button asChild className="mt-7 h-12 w-full max-w-[250px] rounded-lg text-base font-semibold lg:h-[55px]">
						<Link href={supportRoutes.CONTACT}>Contact Support</Link>
					</Button>
				</article>
			</div>
			<Newsletter />
		</>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="animate-reveal mt-7 lg:mt-8">
			<h2 className="text-[22px] font-medium text-ink lg:text-[28px] lg:font-semibold">{title}</h2>
			<div className="mt-2 lg:mt-1.5">{children}</div>
		</section>
	);
}
