/** Copy for the About Us page, from the Figma design. Images in public/images/about (see its README). */

export interface AboutSection {
	/** Anchor for links such as /about#mission. */
	id: string;
	title: string;
	image: string;
	imageAlt: string;
	body?: string;
	/** "Why Fysi?" is a list instead of a paragraph: a green label and its text. */
	points?: { label: string; text: string }[];
}

export const ABOUT_SECTIONS: AboutSection[] = [
	{
		id: "about",
		title: "About Us",
		image: "/images/about/about.jpg",
		imageAlt: "Two women potting seedlings at a table",
		body: "Welcome to Fysi, your go-to marketplace for eco-friendly products that help you live a more sustainable lifestyle. At Fysi, we believe in the power of nature and the importance of making conscious choices that benefit both you and the planet.",
	},
	{
		id: "mission",
		title: "Our Mission",
		image: "/images/about/mission.jpg",
		imageAlt: "Two men smiling as they pot plants on a balcony",
		body: "We are committed to connecting eco-conscious customers with vendors who share our passion for sustainability. Our mission is to make it easy for you to find and purchase products that are not only good for you but also good for the environment. Every item on our platform is carefully vetted and certified to meet our high standards of eco-friendliness.",
	},
	{
		id: "vendors",
		title: "Our Vendors",
		image: "/images/about/vendors.jpg",
		imageAlt: "A plant seller holding a “Now open” sign in her greenhouse",
		body: "We partner with a diverse range of vendors who are dedicated to creating high-quality, sustainable products. From organic cotton clothing to handcrafted bamboo items, our vendors are at the forefront of the green movement. They are passionate about what they do, and we are proud to support them in their mission to make a positive impact on the world.",
	},
	{
		id: "certification",
		title: "Eco-Certification",
		image: "/images/about/eco-certification.jpg",
		imageAlt: "Paper cut-out reading “Eco friendly” with green leaves",
		body: "At Fysi, we take sustainability seriously. That's why we have developed a rigorous eco-certification process to ensure that every product on our platform meets our strict criteria for environmental responsibility. When you shop with us, you can trust that you are making a choice that aligns with your values.",
	},
	{
		id: "why-fysi",
		title: "Why Fysi?",
		image: "/images/about/why-fysi.jpg",
		imageAlt: "A cardboard sign reading “Choose eco, not ego”",
		points: [
			{ label: "Sustainability", text: "Every product is eco-certified, ensuring you make responsible choices." },
			{ label: "Quality", text: "Our vendors are selected for their commitment to high standards and sustainable practices." },
			{ label: "Convenience", text: "Shop from a wide range of eco-friendly products, all in one place." },
		],
	},
];

export interface Testimonial {
	quote: string;
	name: string;
	role: "Customer" | "Vendor";
	rating: number;
}

/** Figma "Testimonial" cards. Replace with real, permitted quotes before launch. */
export const TESTIMONIALS: Testimonial[] = [
	{
		quote:
			"Fysi has completely changed the way I shop! I love knowing that every purchase I make supports sustainable practices and eco-friendly products. It's like shopping with a purpose.",
		name: "Grace Adebayo",
		role: "Customer",
		rating: 5,
	},
	{
		quote:
			"Listing my products on Fysi has been a game-changer for my business. The platform's focus on eco-friendly products has connected me with the right audience who truly value sustainability.",
		name: "Chinedu Okafor",
		role: "Vendor",
		rating: 5,
	},
	{
		quote:
			"Shopping on Fysi feels empowering! The sustainability scores and eco-certifications make it easy for me to choose products that align with my values. It's my go-to marketplace for all things green.",
		name: "Tunde Adebayo",
		role: "Customer",
		rating: 5,
	},
];
