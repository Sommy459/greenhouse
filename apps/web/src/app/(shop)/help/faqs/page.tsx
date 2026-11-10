import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { FaqList } from "@/features/support/components/FaqList";
import { FAQS } from "@/features/support/faqs";
import { Newsletter } from "@/features/home/components/Newsletter";
import { supportRoutes } from "@/lib/routes";

export const metadata: Metadata = {
	title: "Frequently Asked Questions",
	description: "Answers about Fysi: eco-certification, vendors, ordering and returns.",
};

/** Lets search engines show the questions and answers directly. */
const faqJsonLd = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer.join(" ") } })),
};

/**
 * Figma FAQ (C13): the questions on the left and a mesh-bag photo on the right (desktop), then "Contact Support". The
 * grey page background matches the photo's, which was cut from the design.
 */
export default function Page() {
	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
			<div className="bg-grey-500">
				<div className="shop-container grid gap-8 pt-6 pb-12 lg:grid-cols-[minmax(0,625px)_minmax(0,1fr)] lg:pt-7 lg:pb-16">
					<div className="min-w-0">
						<h1 className="animate-rise text-center text-2xl leading-tight font-medium text-ink lg:max-w-[300px] lg:text-left lg:text-[34px] lg:font-semibold">
							Frequently Asked Questions
						</h1>
						<div className="mt-2 lg:mt-0">
							<FaqList />
						</div>

						<div className="animate-reveal">
							<p className="mt-6 text-lg leading-snug text-ink lg:mt-[50px] lg:text-[19px]">
								Didn&apos;t find the answer you were looking for? Contact our support team, we&apos;re here to help!
							</p>
							<Button asChild className="mt-4 h-12 w-full max-w-[248px] rounded-lg text-base font-semibold lg:mt-5 lg:h-[55px]">
								<Link href={supportRoutes.CONTACT}>Contact Support</Link>
							</Button>
						</div>
					</div>

					{/* The bag slides in, then sways gently from the hand. */}
					<div className="animate-slide relative hidden lg:block" style={{ animationDelay: "150ms" }}>
						<Image
							src="/images/help/faq-bag.jpg"
							alt="A hand holding a cotton mesh bag full of fruit"
							width={920}
							height={1540}
							sizes="460px"
							className="animate-float ml-auto h-auto w-full max-w-[460px] lg:mt-[50px]"
						/>
					</div>
				</div>
			</div>
			<Newsletter />
		</>
	);
}
