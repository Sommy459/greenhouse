/**
 * Choices on the shop details step (Figma sign-up step 5). Placeholder lists until the external API says which values it
 * accepts; the `value`s are what is sent.
 */

export const ACCOUNT_TYPES = [
	{ value: "business", label: "Business" },
	{ value: "individual", label: "Individual" },
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number]["value"];

/** Where the shop ships from / to. Nigeria's geopolitical zones, with Lagos on its own (most orders). */
export const SHIPPING_ZONES = [
	{ value: "lagos", label: "Lagos" },
	{ value: "south-west", label: "South West" },
	{ value: "south-east", label: "South East" },
	{ value: "south-south", label: "South South" },
	{ value: "north-central", label: "North Central (incl. Abuja)" },
	{ value: "north-west", label: "North West" },
	{ value: "north-east", label: "North East" },
	{ value: "nationwide", label: "Nationwide" },
] as const;

export const REFERRAL_SOURCES = [
	{ value: "social-media", label: "Social media" },
	{ value: "search", label: "Search engine (e.g. Google)" },
	{ value: "friend", label: "Friend or family" },
	{ value: "another-seller", label: "Another seller" },
	{ value: "event", label: "Event or market" },
	{ value: "radio-tv", label: "Radio or TV" },
	{ value: "other", label: "Other" },
] as const;
