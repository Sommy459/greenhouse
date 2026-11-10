/**
 * Countries a shop can be based in (ISO 3166-1 alpha-2). Nigeria first: the marketplace launches there (PRD).
 * Placeholder list until the external API says which countries it accepts.
 */
export const COUNTRIES = [
	{ code: "NG", name: "Nigeria" },
	{ code: "GH", name: "Ghana" },
	{ code: "BJ", name: "Benin" },
	{ code: "CM", name: "Cameroon" },
	{ code: "CI", name: "Côte d'Ivoire" },
	{ code: "EG", name: "Egypt" },
	{ code: "KE", name: "Kenya" },
	{ code: "MA", name: "Morocco" },
	{ code: "RW", name: "Rwanda" },
	{ code: "SN", name: "Senegal" },
	{ code: "ZA", name: "South Africa" },
	{ code: "TZ", name: "Tanzania" },
	{ code: "TG", name: "Togo" },
	{ code: "UG", name: "Uganda" },
	{ code: "GB", name: "United Kingdom" },
	{ code: "US", name: "United States" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? code;
