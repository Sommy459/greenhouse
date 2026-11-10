/**
 * FAQ questions (Figma) and answers. The answers are draft copy describing how the site works today: have them checked
 * before launch. The returns answer follows the Figma Returns & Refunds page.
 */
export const FAQS: { id: string; question: string; answer: string[] }[] = [
	{
		id: "what-is-fysi",
		question: "What is Fysi",
		answer: [
			"Fysi is an online marketplace for certified eco-friendly products in Nigeria. We connect shoppers with vendors who make or sell sustainable clothing, household and kitchen items, personal care, beauty, office supplies, outdoor gear and accessories.",
		],
	},
	{
		id: "eco-friendly",
		question: "How do I know if a product is truly eco-friendly?",
		answer: [
			"Look for the Eco-verified badge and the sustainability score on the product page. Both come only from checks by the Fysi team: we review each product's certifications, materials and sourcing before the badge is shown.",
			"Open “Eco Certification” on any product page to see what was verified.",
		],
	},
	{
		id: "trust-vendors",
		question: "Can I trust the vendors on Fysi?",
		answer: [
			"Every vendor is reviewed and approved by our team before they can sell. Registered businesses also give their CAC details and certificate.",
			"Reviews on product pages come from shoppers whose orders were delivered. If something isn't right, use Report a Product / Problem and we'll look into it.",
		],
	},
	{
		id: "place-order",
		question: "How do I place an order?",
		answer: [
			"Add what you like to your cart, then tap Checkout. Sign in (or create an account), enter your delivery details, apply any discount code and choose to pay by card or on delivery.",
			"You'll see a thank-you page with your order number, which you can use to follow your order.",
		],
	},
	{
		id: "returns",
		question: "What is the return policy?",
		answer: [
			"You can return an item within 14 days of receiving your order, as long as it's unused, in its original packaging and in the same condition you received it. Perishable or personalised items may not be returnable.",
			"Received something defective or damaged? Contact us within 7 days and we'll arrange an exchange. See Returns & Refunds for the full policy and how to start a return.",
		],
	},
];
