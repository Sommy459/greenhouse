/**
 * Static photos on the home page, from the Figma landing page (public/images/landing, see its README). The hero is
 * exported with its green tint already applied. Category photos live with the category links in lib/navigation.ts.
 */
export const LANDING_IMAGES = {
	hero: "/images/landing/hero.png",
	sustainability: "/images/landing/sustainability.jpg",
	newsletter: "/images/landing/newsletter.jpg",
};

/** A CSS background that shows the fallback colour underneath when the file is missing. */
export const backgroundImage = (src: string) => ({ backgroundImage: `url("${src}")` });
