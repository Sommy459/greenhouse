/**
 * TEMPORARY sample catalogue for mock mode (lib/api/mock.ts), until the external API is connected. Photos are free
 * Unsplash-License images in public/images/products (credits in its README). Prices are whole naira.
 */
import type {
	Category,
	Certification,
	Collection,
	Paginated,
	Product,
	ProductDetail,
	ProductQuery,
	Review,
} from "@/features/catalog/types";

export const MOCK_CATEGORIES: Category[] = [
	{ id: "cat-household", slug: "household", name: "Household Items", description: "Reusable, low-waste home essentials." },
	{ id: "cat-clothing", slug: "clothing", name: "Clothing", description: "Organic and recycled fabrics." },
	{ id: "cat-personal-care", slug: "personal-care", name: "Personal Care", description: "Plastic-free daily care." },
	{ id: "cat-kitchen", slug: "kitchen", name: "Kitchen Items", description: "Bamboo, steel and natural kitchenware." },
	{ id: "cat-office", slug: "office", name: "Office Supplies", description: "Recycled paper and sustainable desk goods." },
	{ id: "cat-beauty", slug: "beauty", name: "Beauty & Cosmetics", description: "Natural, cruelty-free beauty." },
	{ id: "cat-outdoor", slug: "outdoor", name: "Outdoor & Travel", description: "Reusable gear for days out." },
	{
		id: "cat-accessories",
		slug: "accessories",
		name: "Accessories",
		description: "Wooden watches, recycled jewellery and more.",
	},
];

const VENDORS = {
	adire: { id: "ven-1", shop_name: "Adire Naturals", slug: "adire-naturals", city: "Abeokuta", state: "Ogun", logo_url: null },
	greenleaf: { id: "ven-2", shop_name: "GreenLeaf Home", slug: "greenleaf-home", city: "Lagos", state: "Lagos", logo_url: null },
	kano: { id: "ven-3", shop_name: "Sahel Shea Co.", slug: "sahel-shea", city: "Kano", state: "Kano", logo_url: null },
	adorn: { id: "ven-4", shop_name: "Ìlẹ̀kẹ̀ Adornments", slug: "ileke-adornments", city: "Yaba", state: "Lagos", logo_url: null },
	aso: { id: "ven-5", shop_name: "Aṣọ Green", slug: "aso-green", city: "Ibadan", state: "Oyo", logo_url: null },
	ile: { id: "ven-6", shop_name: "Ilé Wood & Co.", slug: "ile-wood", city: "Enugu", state: "Enugu", logo_url: null },
	paper: {
		id: "ven-7",
		shop_name: "Paper & Leaf",
		slug: "paper-and-leaf",
		city: "Port Harcourt",
		state: "Rivers",
		logo_url: null,
	},
	trail: { id: "ven-8", shop_name: "Trailhead Naija", slug: "trailhead-naija", city: "Jos", state: "Plateau", logo_url: null },
};

type SeedExtras = Partial<
	Pick<Seed, "eco_verified" | "sustainability_score" | "collections" | "rating" | "review_count" | "stock">
>;

/** Short-form seeds for one category and vendor (the Figma category pages). Same fields as SEEDS. */
const seedsFor =
	(category: string, vendor: keyof typeof VENDORS, sourcing: string) =>
	(
		slug: string,
		name: string,
		image: string,
		price: number,
		compare_at_price: number | null,
		materials: string[],
		description: string,
		extra: SeedExtras = {},
	): Seed => ({
		slug,
		name,
		image,
		category,
		vendor,
		price,
		compare_at_price,
		materials,
		description,
		sourcing,
		stock: 30,
		sustainability_score: 80,
		eco_verified: true,
		collections: [],
		rating: 4.5,
		review_count: 12,
		...extra,
	});

const accessory = seedsFor("accessories", "adorn", "Handmade in Lagos from reclaimed and natural materials.");
const clothing = seedsFor("clothing", "aso", "Made in Nigeria from organic, recycled or hand-dyed fabric.");
const kitchen = seedsFor("kitchen", "ile", "Carved and finished by hand in Enugu from responsibly sourced wood.");
const household = seedsFor("household", "greenleaf", "Reusable or compostable; packed plastic-free in Lagos.");
const beauty = seedsFor("beauty", "kano", "Small-batch, cruelty-free, from Nigerian-grown botanicals.");
const care = seedsFor("personal-care", "adire", "Plastic-free personal care, made or packed in Abeokuta.");
const office = seedsFor("office", "paper", "Recycled paper and sustainably sourced wood, finished in Port Harcourt.");
const outdoor = seedsFor("outdoor", "trail", "Built to last and repairable; tested on the Jos Plateau.");

const category = (slug: string) => {
	const c = MOCK_CATEGORIES.find((x) => x.slug === slug)!;
	return { id: c.id, slug: c.slug, name: c.name };
};

const CERT: Certification = {
	id: "cert-1",
	name: "Plastic-free packaging",
	issuer: "Fysi verification team",
	status: "verified",
};

type Seed = Omit<
	Product,
	"id" | "created_at" | "images" | "category" | "vendor" | "description" | "sourcing" | "featured" | "colors" | "sku" | "tags"
> & {
	image: string;
	category: string;
	vendor: keyof typeof VENDORS;
	description: string;
	sourcing: string;
};

const SEEDS: Seed[] = [
	{
		slug: "bamboo-toothbrush",
		name: "Bamboo Toothbrush",
		image: "bamboo-toothbrush.jpg",
		category: "personal-care",
		vendor: "greenleaf",
		price: 2500,
		compare_at_price: null,
		materials: ["Moso bamboo", "Plant-based bristles"],
		description: "A biodegradable bamboo handle with soft plant-based bristles.",
		sourcing: "FSC bamboo; packed in recycled card.",
		stock: 120,
		sustainability_score: 92,
		eco_verified: true,
		collections: ["on-demand", "sustainability"],
		rating: 4.7,
		review_count: 86,
	},
	{
		slug: "bamboo-cutting-board",
		name: "Bamboo Cutting Board",
		image: "beeswax-wraps.jpg",
		category: "kitchen",
		vendor: "greenleaf",
		price: 9500,
		compare_at_price: 12000,
		materials: ["Bamboo"],
		description: "A sturdy board made from fast-growing bamboo, finished with food-safe oil.",
		sourcing: "Responsibly harvested bamboo.",
		stock: 40,
		sustainability_score: 85,
		eco_verified: true,
		collections: ["hot-deals", "new-in"],
		rating: 4.5,
		review_count: 31,
	},
	{
		slug: "black-soap-bar",
		name: "Handmade Black Soap Bar",
		image: "black-soap.jpg",
		category: "personal-care",
		vendor: "adire",
		price: 3000,
		compare_at_price: null,
		materials: ["Plantain skin ash", "Palm kernel oil", "Shea butter"],
		description: "Traditional dudu-osun style black soap, hand-cut in small batches.",
		sourcing: "Made by a women's cooperative in Abeokuta.",
		stock: 200,
		sustainability_score: 88,
		eco_verified: true,
		collections: ["on-demand", "new-in"],
		rating: 4.8,
		review_count: 142,
	},
	{
		slug: "natural-soap-gift-box",
		name: "Natural Soap Gift Box",
		image: "soap-gift-box.jpg",
		category: "beauty",
		vendor: "adire",
		price: 11000,
		compare_at_price: 14500,
		materials: ["Natural oils", "Recycled card"],
		description: "Three handmade soaps in a plastic-free gift box.",
		sourcing: "Handmade in Ogun State.",
		stock: 25,
		sustainability_score: 80,
		eco_verified: true,
		collections: ["hot-deals"],
		rating: 4.6,
		review_count: 22,
	},
	{
		slug: "organic-cotton-tote",
		name: "Organic Cotton Tote Bag",
		image: "cotton-tote.jpg",
		category: "household",
		vendor: "greenleaf",
		price: 6000,
		compare_at_price: null,
		materials: ["Organic cotton"],
		description: "A roomy everyday tote that replaces hundreds of plastic bags.",
		sourcing: "GOTS-certified cotton.",
		stock: 75,
		sustainability_score: 90,
		eco_verified: true,
		collections: ["on-demand", "new-in", "sustainability"],
		rating: 4.4,
		review_count: 57,
	},
	{
		slug: "insulated-steel-bottle",
		name: "Insulated Steel Bottle, 750 ml",
		image: "steel-tumbler.jpg",
		category: "outdoor",
		vendor: "greenleaf",
		price: 18500,
		compare_at_price: 22000,
		materials: ["Stainless steel"],
		description: "Keeps water cold for 24 hours. Built to last for years.",
		sourcing: "Recyclable 18/8 stainless steel.",
		stock: 18,
		sustainability_score: 78,
		eco_verified: false,
		collections: ["hot-deals", "on-demand"],
		rating: 4.6,
		review_count: 64,
	},
	{
		slug: "steel-water-bottle",
		name: "Stainless Steel Water Bottle",
		image: "steel-bottle.jpg",
		category: "kitchen",
		vendor: "greenleaf",
		price: 15000,
		compare_at_price: null,
		materials: ["Stainless steel", "Bamboo lid"],
		description: "A plastic-free bottle with a bamboo cap.",
		sourcing: "Recyclable stainless steel.",
		stock: 33,
		sustainability_score: 82,
		eco_verified: true,
		collections: ["new-in"],
		rating: 4.3,
		review_count: 19,
	},
	{
		slug: "raw-shea-body-butter",
		name: "Raw Shea Body Butter",
		image: "shea-butter.jpg",
		category: "beauty",
		vendor: "kano",
		price: 7500,
		compare_at_price: 9000,
		materials: ["Unrefined shea butter", "Glass jar"],
		description: "Whipped unrefined shea butter in a reusable glass jar.",
		sourcing: "Fair-trade shea from northern Nigeria.",
		stock: 90,
		sustainability_score: 87,
		eco_verified: true,
		collections: ["hot-deals", "on-demand", "sustainability"],
		rating: 4.9,
		review_count: 203,
	},
	{
		slug: "natural-skincare-set",
		name: "Natural Skincare Set",
		image: "skincare-set.jpg",
		category: "beauty",
		vendor: "kano",
		price: 24000,
		compare_at_price: null,
		materials: ["Plant oils", "Refillable bottles"],
		description: "Cleanser, toner, serum and moisturiser in refillable bottles.",
		sourcing: "Small-batch, cruelty-free.",
		stock: 12,
		sustainability_score: 76,
		eco_verified: false,
		collections: ["new-in"],
		rating: 4.5,
		review_count: 14,
	},
	{
		slug: "coconut-shell-bowl",
		name: "Coconut Shell Bowl",
		image: "coconut-bowl.jpg",
		category: "kitchen",
		vendor: "adire",
		price: 5500,
		compare_at_price: null,
		materials: ["Reclaimed coconut shell"],
		description: "Hand-polished bowls made from coconut shells that would be thrown away.",
		sourcing: "Reclaimed shells from coastal markets.",
		stock: 60,
		sustainability_score: 94,
		eco_verified: true,
		collections: ["on-demand", "sustainability"],
		rating: 4.7,
		review_count: 38,
	},
	{
		slug: "virgin-coconut-oil",
		name: "Cold-Pressed Coconut Oil",
		image: "coconut-oil.jpg",
		category: "personal-care",
		vendor: "adire",
		price: 4500,
		compare_at_price: 5500,
		materials: ["Coconut oil", "Glass jar"],
		description: "Cold-pressed virgin coconut oil for hair, skin and cooking.",
		sourcing: "Pressed in Badagry from local coconuts.",
		stock: 110,
		sustainability_score: 84,
		eco_verified: true,
		collections: ["hot-deals", "new-in"],
		rating: 4.6,
		review_count: 71,
	},
	{
		slug: "bamboo-cutlery-set",
		name: "Bamboo Cutlery Set",
		image: "bamboo-cutlery.jpg",
		category: "kitchen",
		vendor: "greenleaf",
		price: 4000,
		compare_at_price: null,
		materials: ["Bamboo", "Cotton pouch"],
		description: "Spoon, fork and knife in a cotton pouch, for meals on the go.",
		sourcing: "FSC bamboo.",
		stock: 150,
		sustainability_score: 91,
		eco_verified: true,
		collections: ["on-demand", "new-in", "sustainability"],
		rating: 4.4,
		review_count: 45,
	},
	accessory(
		"laser-cut-wooden-earrings",
		"Laser-Cut Wooden Earrings",
		"wooden-earrings.jpg",
		6500,
		null,
		["Reclaimed wood"],
		"Light, intricate earrings cut from offcut wood.",
		{ collections: ["new-in"], rating: 4.8, review_count: 34 },
	),
	accessory(
		"woven-straw-handbag",
		"Woven Straw Handbag",
		"straw-handbag.jpg",
		18500,
		22000,
		["Raffia straw", "Cotton lining"],
		"A structured handbag woven by hand from raffia.",
	),
	accessory(
		"leather-strap-chronograph",
		"Leather Strap Chronograph",
		"chronograph-watch.jpg",
		38000,
		null,
		["Vegetable-tanned leather", "Stainless steel"],
		"A chronograph on a vegetable-tanned leather strap.",
		{ sustainability_score: 64, eco_verified: false },
	),
	accessory(
		"boho-drop-earrings",
		"Boho Drop Earrings",
		"boho-earrings.jpg",
		4800,
		null,
		["Brass", "Natural fibre"],
		"Lightweight drops made from brass and natural fibre.",
	),
	accessory(
		"glass-bead-bracelets",
		"Glass Bead Bracelets (Set of 3)",
		"bead-bracelets.jpg",
		5500,
		7000,
		["Recycled glass beads"],
		"Three stretch bracelets of recycled glass beads.",
		{ collections: ["hot-deals"] },
	),
	accessory(
		"wooden-watch",
		"Wooden Watch",
		"wooden-watch.jpg",
		26000,
		null,
		["Sandalwood", "Ebony"],
		"A watch with a sandalwood and ebony case and strap.",
		{ rating: 4.9, review_count: 51 },
	),
	accessory(
		"crochet-basket-bag",
		"Crochet Basket Bag",
		"crochet-basket.jpg",
		9000,
		null,
		["Cotton yarn"],
		"A soft crochet basket for knitting kits, makeup or keys.",
	),
	accessory(
		"recycled-sunglasses",
		"Recycled Acetate Sunglasses",
		"sunglasses.jpg",
		15000,
		18000,
		["Recycled acetate"],
		"UV400 lenses in frames made from recycled acetate.",
		{ collections: ["hot-deals"] },
	),
	accessory(
		"compostable-phone-case",
		"Compostable Phone Case",
		"phone-case.jpg",
		7000,
		null,
		["Plant-based biopolymer"],
		"A phone case that breaks down in compost at the end of its life.",
	),
	accessory(
		"ankara-earrings",
		"Handmade Ankara Earrings",
		"ankara-earrings.jpg",
		3500,
		null,
		["Ankara offcuts", "Brass"],
		"Bright earrings made from Ankara fabric offcuts.",
		{ rating: 4.7, review_count: 29 },
	),
	accessory(
		"raffia-beach-tote",
		"Raffia Beach Tote",
		"raffia-totes.jpg",
		14000,
		null,
		["Raffia"],
		"A roomy tote for the beach or the market.",
	),
	accessory(
		"classic-analog-watch",
		"Classic Analog Watch",
		"analog-watch.jpg",
		32000,
		null,
		["Leather", "Stainless steel"],
		"A slim analog watch on a black leather strap.",
		{ sustainability_score: 60, eco_verified: false },
	),
	accessory(
		"vegan-leather-purse",
		"Vegan Leather Purse",
		"vegan-purse.jpg",
		21000,
		25000,
		["Cactus leather"],
		"A compact purse in cactus-based vegan leather.",
	),
	clothing(
		"hand-knitted-sweater",
		"Hand-Knitted Wool Sweater",
		"knit-sweaters.jpg",
		22000,
		null,
		["Undyed wool"],
		"Chunky, hand-knitted from undyed wool.",
		{ collections: ["new-in"], rating: 4.8, review_count: 41 },
	),
	clothing(
		"adire-print-dress",
		"Adire Print Dress",
		"adire-dress.jpg",
		24000,
		28000,
		["Organic cotton", "Indigo dye"],
		"Hand-dyed adire cotton in a relaxed cut.",
		{ collections: ["hot-deals"] },
	),
	clothing(
		"recycled-wool-cardigan",
		"Recycled Wool Cardigan",
		"wool-cardigan.jpg",
		28000,
		null,
		["Recycled wool"],
		"A soft cardigan knitted from recycled wool.",
	),
	clothing(
		"organic-cotton-shirts",
		"Organic Cotton Shirt",
		"cotton-shirts.jpg",
		12000,
		null,
		["Organic cotton"],
		"An everyday shirt in GOTS-certified cotton.",
	),
	clothing(
		"upcycled-wide-leg-jeans",
		"Upcycled Wide-Leg Jeans",
		"wide-leg-jeans.jpg",
		21000,
		null,
		["Reclaimed denim"],
		"Wide-leg jeans pieced from reclaimed denim.",
		{ rating: 4.6, review_count: 23 },
	),
	clothing(
		"crochet-cropped-top",
		"Crochet Cropped Top",
		"crochet-top.jpg",
		9500,
		null,
		["Cotton yarn"],
		"A hand-crocheted top in sunny cotton yarn.",
	),
	clothing(
		"organic-wool-jumper",
		"Organic Wool Jumper",
		"wool-jumper.jpg",
		25000,
		null,
		["Organic wool"],
		"A classic jumper in organic wool.",
	),
	clothing(
		"ankara-maxi-dress",
		"Ankara Maxi Dress",
		"ankara-maxi.jpg",
		27000,
		null,
		["Cotton wax print"],
		"A flowing maxi dress in Ankara print.",
		{ collections: ["new-in"], rating: 4.9, review_count: 37 },
	),
	clothing(
		"organic-cotton-hoodie",
		"Organic Cotton Hoodie",
		"cotton-hoodie.jpg",
		18000,
		21000,
		["Organic cotton"],
		"A heavyweight hoodie in organic cotton fleece.",
		{ collections: ["hot-deals"] },
	),
	clothing(
		"linen-shirt-dress",
		"Linen Shirt Dress",
		"linen-dress.jpg",
		19000,
		null,
		["Linen"],
		"A breezy shirt dress in natural linen.",
	),
	clothing(
		"black-hemp-denim",
		"Black Hemp Denim",
		"hemp-denim.jpg",
		23000,
		null,
		["Hemp", "Organic cotton"],
		"Straight-leg jeans in a hemp and cotton blend.",
		{ sustainability_score: 86 },
	),
	clothing("linen-trousers", "Linen Trousers", "linen-trousers.jpg", 16000, null, ["Linen"], "Relaxed trousers in washed linen."),
	clothing(
		"cotton-bucket-hat",
		"Cotton Bucket Hat",
		"bucket-hat.jpg",
		6000,
		null,
		["Organic cotton canvas"],
		"A sun hat in organic cotton canvas.",
		{ sustainability_score: 74, eco_verified: false },
	),
	kitchen(
		"wooden-spoon-set",
		"Wooden Spoon Set (3)",
		"wooden-spoons.jpg",
		5000,
		null,
		["Mahogany offcuts"],
		"Three hand-carved spoons for stirring, serving and tasting.",
		{ collections: ["new-in"], rating: 4.8, review_count: 58 },
	),
	kitchen(
		"serving-board-knife-set",
		"Serving Board",
		"serving-board.jpg",
		13500,
		16000,
		["Iroko wood"],
		"A thick serving board for bread, fruit and small chops.",
		{ collections: ["hot-deals"] },
	),
	kitchen(
		"glass-clamp-jars",
		"Glass Clamp Jars (Pair)",
		"clamp-jars.jpg",
		8000,
		null,
		["Glass", "Natural rubber seal"],
		"Airtight jars for garri, beans and spices: no more plastic bags.",
	),
	kitchen(
		"teak-cooking-spoon",
		"Teak Cooking Spoon",
		"teak-spoon.jpg",
		3000,
		null,
		["Teak"],
		"A long-handled spoon that won't scratch your pots.",
		{ rating: 4.7, review_count: 33 },
	),
	kitchen(
		"bamboo-dish-brush",
		"Bamboo Dish Brush",
		"bamboo-dish-brush.jpg",
		2500,
		null,
		["Bamboo", "Sisal bristles"],
		"A plastic-free dish brush with replaceable sisal head.",
		{ sustainability_score: 93 },
	),
	kitchen(
		"amber-jar-set",
		"Amber Glass Jar Set",
		"pantry-jars.jpg",
		15000,
		null,
		["Amber glass", "Steel lids"],
		"Ten reusable amber jars for honey, spices and shea: they keep light out.",
	),
	kitchen(
		"utensil-crock",
		"Utensil Crock with Spoons",
		"utensil-crock.jpg",
		11000,
		null,
		["Stoneware", "Beech wood"],
		"A stoneware crock with four beech utensils.",
	),
	kitchen(
		"cast-iron-skillet",
		"Cast Iron Skillet",
		"cast-iron-pan.jpg",
		26000,
		null,
		["Cast iron"],
		"Pre-seasoned and built to last generations.",
		{ sustainability_score: 78, eco_verified: false },
	),
	kitchen(
		"reusable-coffee-cup",
		"Reusable Coffee Cup",
		"reusable-cup.jpg",
		6500,
		8000,
		["Recycled polypropylene"],
		"A sturdy takeaway cup that replaces hundreds of paper cups.",
		{ collections: ["hot-deals"] },
	),
	kitchen(
		"wooden-plates-ladles",
		"Wooden Plates & Ladles",
		"wooden-plates.jpg",
		18000,
		null,
		["Mango wood"],
		"Hand-turned plates and ladles for everyday meals.",
	),
	kitchen(
		"bread-board",
		"Bread Board",
		"bread-board.jpg",
		9500,
		null,
		["Acacia wood"],
		"A rounded acacia board for slicing and serving bread.",
	),
	household(
		"plant-based-sponges",
		"Plant-Based Sponges (Pack of 5)",
		"plant-sponges.jpg",
		3500,
		null,
		["Cellulose", "Coconut fibre"],
		"Compostable kitchen sponges with a coconut-fibre scrubber.",
		{ collections: ["new-in"], rating: 4.6, review_count: 48, sustainability_score: 91 },
	),
	household(
		"organic-cotton-napkins",
		"Organic Cotton Napkins (Set of 4)",
		"cotton-napkins.jpg",
		7500,
		null,
		["Organic cotton"],
		"Washable napkins that replace paper serviettes.",
	),
	household(
		"linen-tea-towels",
		"Linen Tea Towels (Pair)",
		"tea-towels.jpg",
		6000,
		7500,
		["Linen"],
		"Absorbent linen towels that get softer with every wash.",
		{ collections: ["hot-deals"] },
	),
	household(
		"mesh-produce-bags",
		"Mesh Produce Bags (Set of 3)",
		"produce-bags.jpg",
		4500,
		null,
		["Recycled polyester mesh"],
		"Take them to the market instead of nylon bags.",
		{ rating: 4.7, review_count: 62 },
	),
	household(
		"glass-meal-prep-containers",
		"Glass Meal Prep Containers",
		"meal-prep-glass.jpg",
		14000,
		null,
		["Borosilicate glass"],
		"Oven-safe glass containers for jollof, beans and more.",
	),
	household(
		"cotton-market-bag",
		"Cotton Mesh Market Bag",
		"market-bag.jpg",
		5000,
		null,
		["Organic cotton"],
		"A stretchy cotton net bag that folds into your pocket.",
	),
	household(
		"compostable-scrub-sponge",
		"Compostable Scrub Sponge",
		"scrub-sponge.jpg",
		2000,
		null,
		["Loofah", "Cellulose"],
		"A loofah-backed sponge for tough pots.",
	),
	household(
		"glass-jars-set",
		"Glass Storage Jars (Set of 6)",
		"glass-jars.jpg",
		9000,
		null,
		["Glass"],
		"Clear jars for grains, nuts and snacks.",
	),
	household(
		"canvas-shopping-tote",
		"Canvas Shopping Tote",
		"canvas-tote.jpg",
		5500,
		null,
		["Cotton canvas"],
		"A sturdy everyday tote with long handles.",
	),
	household(
		"soy-wax-candle",
		"Soy Wax Candle",
		"soy-candle.jpg",
		6500,
		null,
		["Soy wax", "Cotton wick"],
		"A clean-burning candle in a reusable jar.",
		{ sustainability_score: 76 },
	),
	household(
		"beeswax-pillar-candles",
		"Beeswax Pillar Candles (3)",
		"beeswax-candles.jpg",
		8500,
		null,
		["Pure beeswax"],
		"Naturally honey-scented candles from Nigerian beekeepers.",
		{ collections: ["new-in"] },
	),
	beauty(
		"shea-lip-balm",
		"Shea Lip Balm",
		"lip-balm.jpg",
		2500,
		null,
		["Shea butter", "Beeswax", "Aluminium tin"],
		"An unscented lip balm in a recyclable tin.",
		{ collections: ["new-in"], rating: 4.8, review_count: 66 },
	),
	beauty(
		"baobab-face-oil",
		"Baobab Face Oil",
		"face-oil.jpg",
		9500,
		11500,
		["Cold-pressed baobab oil"],
		"A light, fast-absorbing face oil rich in vitamins A and E.",
		{ collections: ["hot-deals"] },
	),
	beauty(
		"vegan-makeup-brushes",
		"Vegan Makeup Brush Set",
		"makeup-brushes.jpg",
		12000,
		null,
		["Bamboo", "Synthetic vegan bristles"],
		"Five cruelty-free brushes with bamboo handles.",
	),
	beauty(
		"chebe-hair-oil",
		"Chebe Hair Oil",
		"hair-oil.jpg",
		8000,
		null,
		["Chebe", "Coconut oil", "Amber glass"],
		"A nourishing oil for length retention, in amber glass.",
		{ rating: 4.7, review_count: 44 },
	),
	beauty(
		"mineral-eyeshadow-palette",
		"Mineral Eyeshadow Palette",
		"brush-palette.jpg",
		11500,
		null,
		["Mineral pigments", "Recycled card"],
		"Twelve earthy shades in a refillable card palette.",
		{ sustainability_score: 72 },
	),
	care(
		"hair-body-bar",
		"Hair & Body Bar",
		"hair-body-bar.jpg",
		4000,
		null,
		["Coconut oil", "Shea butter"],
		"One plastic-free bar for hair and body.",
		{ collections: ["new-in"], sustainability_score: 90 },
	),
	care(
		"steel-safety-razor",
		"Steel Safety Razor",
		"safety-razor.jpg",
		15000,
		18000,
		["Stainless steel"],
		"A lifetime razor that takes recyclable steel blades.",
		{ collections: ["hot-deals"], rating: 4.6, review_count: 39 },
	),
	care(
		"bamboo-hairbrush",
		"Bamboo Hairbrush",
		"bamboo-hairbrush.jpg",
		5500,
		null,
		["Bamboo", "Natural rubber"],
		"A gentle detangling brush with bamboo pins.",
	),
	care(
		"vanilla-oat-soap",
		"Vanilla Oat Soap",
		"vanilla-soap.jpg",
		2800,
		null,
		["Oats", "Vanilla", "Palm kernel oil"],
		"A soothing, gently scented handmade soap.",
	),
	office(
		"recycled-paper-notebook",
		"Recycled Paper Notebook",
		"notebook-pencils.jpg",
		3500,
		null,
		["100% recycled paper"],
		"A5, 120 lined pages of recycled paper.",
		{ collections: ["new-in"], rating: 4.7, review_count: 27 },
	),
	office(
		"dot-grid-journal",
		"Dot-Grid Journal",
		"notebook-desk.jpg",
		5000,
		null,
		["Recycled paper", "Linen cover"],
		"A lay-flat journal for planning and sketching.",
	),
	office(
		"refillable-metal-pen",
		"Refillable Metal Pen",
		"pen-notebook.jpg",
		4500,
		null,
		["Aluminium"],
		"A pen that lasts for years: just change the refill.",
		{ sustainability_score: 77 },
	),
	office(
		"bamboo-desk-organiser",
		"Bamboo Desk Organiser",
		"bamboo-pen-holder.jpg",
		7000,
		8500,
		["Bamboo"],
		"Keeps pens, markers and clips in one place.",
		{ collections: ["hot-deals"] },
	),
	office(
		"wooden-colour-pencils",
		"Wooden Colour Pencils (12)",
		"colour-pencils.jpg",
		3000,
		null,
		["FSC wood", "Non-toxic pigment"],
		"Bright, smooth pencils for school and the office.",
	),
	office(
		"desk-succulent",
		"Desk Succulent in Clay Pot",
		"desk-succulent.jpg",
		4000,
		null,
		["Living plant", "Clay pot"],
		"A low-maintenance plant to brighten your desk.",
	),
	office(
		"kraft-envelopes",
		"Kraft Envelopes (Pack of 25)",
		"envelopes.jpg",
		2500,
		null,
		["Recycled kraft paper"],
		"Unbleached envelopes for letters and invoices.",
	),
	office(
		"jade-plant-terracotta",
		"Jade Plant in Terracotta",
		"potted-succulent.jpg",
		6000,
		null,
		["Living plant", "Terracotta"],
		"A hardy jade plant in a hand-thrown terracotta pot.",
	),
	outdoor(
		"waxed-canvas-backpack",
		"Waxed Canvas Backpack",
		"canvas-backpack.jpg",
		32000,
		38000,
		["Waxed organic canvas", "Leather"],
		"A weatherproof backpack that wears in, not out.",
		{ collections: ["hot-deals"], rating: 4.8, review_count: 21 },
	),
	outdoor(
		"rechargeable-lantern",
		"Rechargeable Lantern",
		"lantern.jpg",
		14000,
		null,
		["Recycled metal", "Glass"],
		"A warm, rechargeable lantern for camping and NEPA cuts.",
		{ collections: ["on-demand"], rating: 4.7, review_count: 88 },
	),
	outdoor(
		"enamel-camping-mug",
		"Enamel Camping Mug",
		"enamel-mug.jpg",
		4500,
		null,
		["Enamelled steel"],
		"A tough mug for the campfire or the office.",
	),
	outdoor(
		"cotton-rope-hammock",
		"Cotton Rope Hammock",
		"hammock.jpg",
		25000,
		null,
		["Organic cotton rope", "Hardwood"],
		"A hand-tied hammock for the garden or the beach.",
	),
];

/**
 * Mock colours for the Filter menu's four (Figma): guessed from each product's name and materials (the real API stores
 * them). A product can match several, or none.
 */
const COLOR_WORDS: [string, RegExp][] = [
	["red", /\bred\b|ankara|glass bead|adire print|eyeshadow/i],
	["black", /\bblack|ebony|charcoal|cast iron|analog watch|hoodie/i],
	[
		"brown",
		/wood|bamboo|teak|mahogany|iroko|acacia|leather|cork|coconut|kraft|chebe|chronograph|terracotta|straw|raffia|canvas backpack/i,
	],
	["green", /green|plant|succulent|jade|leaf|herb|compostable phone/i],
];
const colorsFor = (text: string) => COLOR_WORDS.filter(([, re]) => re.test(text)).map(([color]) => color);

/** Product-page chips (Figma: "Non toxic", "Sustainable", "Biodegradable"), guessed from category and materials. */
function tagsFor(seed: Seed): string[] {
	const text = `${seed.name} ${seed.materials.join(" ")}`;
	const tags: string[] = [];
	if (["beauty", "personal-care", "kitchen"].includes(seed.category)) tags.push("Non toxic");
	if (seed.eco_verified) tags.push("Sustainable");
	if (/wood|bamboo|cotton|linen|hemp|loofah|cellulose|coconut|jute|raffia|straw|paper|kraft|wax|shea|soap|plant/i.test(text))
		tags.push("Biodegradable");
	if (/recycled|reclaimed|upcycled|offcut/i.test(text)) tags.push("Recycled");
	if (/reusable|steel|glass|bag|tote|cup|bottle|jar|container/i.test(text)) tags.push("Reusable");
	return tags.slice(0, 3);
}

/** Newest first: the seed order, a day apart. */
export const MOCK_PRODUCTS: ProductDetail[] = SEEDS.map(({ image, category: cat, vendor, ...seed }, i) => ({
	...seed,
	// Grouped like the Figma page ("2,51,594").
	sku: new Intl.NumberFormat("en-IN").format(251594 + i * 37),
	tags: tagsFor({ image, category: cat, vendor, ...seed }),
	colors: colorsFor(`${seed.name} ${seed.materials.join(" ")}`),
	id: `prod-${i + 1}`,
	images: [`/images/products/${image}`],
	category: category(cat),
	vendor: VENDORS[vendor],
	featured: i < 4,
	created_at: new Date(Date.UTC(2026, 9, 30) - i * 86_400_000).toISOString(),
	certifications: seed.eco_verified ? [CERT] : [],
}));

/** List items carry no certifications (only GET /products/:slug does). */
function toListItem(product: ProductDetail): Product {
	const item: Partial<ProductDetail> = { ...product };
	delete item.certifications;
	return item as Product;
}

/** GET /products with the same filters the storefront sends. */
export function listProducts(params: Record<string, unknown>): Paginated<Product> {
	const q = params as ProductQuery & Record<string, unknown>;
	let items = MOCK_PRODUCTS.slice();

	if (q.collection) items = items.filter((p) => p.collections.includes(q.collection as Collection));
	// List filters are comma-separated (Filter ▾ ticks): category=clothing,kitchen, colors=green,brown, availability=in_stock.
	const list = (v: unknown) => (v ? String(v).split(",").filter(Boolean) : []);
	const categories = list(q.category);
	if (categories.length) items = items.filter((p) => !!p.category && categories.includes(p.category.slug));
	const colors = list(q.colors);
	if (colors.length) items = items.filter((p) => p.colors.some((c) => colors.includes(c)));
	// Availability: popular (well rated or much reviewed) and/or sale (has a "was" price); either one matches.
	const availability = list(q.availability);
	if (availability.length) {
		const popular = (p: ProductDetail) => p.rating >= 4.7 || p.review_count >= 40;
		const onSale = (p: ProductDetail) => p.compare_at_price !== null && p.compare_at_price > p.price;
		items = items.filter((p) => (availability.includes("popular") && popular(p)) || (availability.includes("sale") && onSale(p)));
	}
	if (q.q) {
		const term = String(q.q).toLowerCase();
		items = items.filter((p) => `${p.name} ${p.description} ${p.materials.join(" ")}`.toLowerCase().includes(term));
	}
	if (q.min_price != null) items = items.filter((p) => p.price >= Number(q.min_price));
	if (q.max_price != null) items = items.filter((p) => p.price <= Number(q.max_price));
	if (q.min_rating != null) items = items.filter((p) => p.rating >= Number(q.min_rating));
	if (String(q.verified) === "true") items = items.filter((p) => p.eco_verified);
	if (String(q.featured) === "true") items = items.filter((p) => p.featured);

	if (q.sort === "price_asc") items.sort((a, b) => a.price - b.price);
	else if (q.sort === "price_desc") items.sort((a, b) => b.price - a.price);
	else if (q.sort === "rating") items.sort((a, b) => b.rating - a.rating);

	const limit = Math.max(1, Number(q.limit ?? 20));
	const page = Math.max(1, Number(q.page ?? 1));
	const total = items.length;
	return {
		items: items.slice((page - 1) * limit, page * limit).map(toListItem),
		meta: { page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) },
	};
}

export const findProduct = (slug: string) => MOCK_PRODUCTS.find((p) => p.slug === slug);
const findProductById = (id: string) => MOCK_PRODUCTS.find((p) => p.id === id);

/** Checkout coupons in mock mode. */
const COUPONS: Record<string, { description: string; discount: (subtotal: number) => number; min?: number }> = {
	GREEN250: { description: "GREEN250: ₦250 off orders over ₦1,000", discount: () => 250, min: 1000 },
	FYSI10: { description: "FYSI10: 10% off, up to ₦5,000", discount: (s) => Math.min(5000, Math.round(s * 0.1)) },
};
const SHIPPING = 1500;
const FREE_SHIPPING_FROM = 50000;

/** POST /checkout/quote: prices the cart from the catalogue (never the browser's prices), with coupon and shipping. */
export function quoteCheckout(body: { items?: { product_id: string; quantity: number }[]; coupon_code?: string }) {
	const subtotal = (body.items ?? []).reduce(
		(sum, line) => sum + (findProductById(line.product_id)?.price ?? 0) * Math.max(0, line.quantity),
		0,
	);
	const code = body.coupon_code?.trim().toUpperCase();
	const rule = code ? COUPONS[code] : undefined;
	let coupon_error: string | undefined;
	if (code && !rule) coupon_error = "That code isn't valid. (Mock mode: try GREEN250 or FYSI10.)";
	else if (rule?.min && subtotal < rule.min) coupon_error = `This code needs an order of at least ₦${rule.min.toLocaleString()}.`;
	const discount = rule && !coupon_error ? Math.min(subtotal, rule.discount(subtotal)) : 0;
	const shipping = subtotal - discount >= FREE_SHIPPING_FROM || subtotal === 0 ? 0 : SHIPPING;
	return {
		subtotal,
		discount,
		shipping,
		total: subtotal - discount + shipping,
		coupon: rule && !coupon_error && code ? { code, description: rule.description } : null,
		...(coupon_error ? { coupon_error } : {}),
	};
}

/** Sample reviewers and comments (Figma product page), rotated per product so pages differ. */
const REVIEWERS = [
	{ name: "Kristin Watson", avatar_url: null },
	{ name: "Chinedu Maduka", avatar_url: null },
	{ name: "Tunde Adebayo", avatar_url: null },
	{ name: "Grace Edwards", avatar_url: null },
	{ name: "Amaka Obi", avatar_url: null },
	{ name: "Ibrahim Musa", avatar_url: null },
];
const COMMENTS = [
	(n: string) =>
		`The ${n} looks great and fits my eco-conscious lifestyle. A good choice for anyone looking for a sustainable option.`,
	(n: string) =>
		`I was pleasantly surprised by the quality. The ${n} is sturdy and well made. A little smaller than I expected, but it fits perfectly.`,
	() =>
		`Exactly as described and it arrived quickly in plastic-free packaging. The only downside is the price, but it's worth it.`,
	(n: string) =>
		`I absolutely love this ${n}! It feels natural, looks good at home, and knowing it's eco-friendly makes me feel even better about my purchase.`,
	(n: string) => `Second time buying the ${n}. Still great quality, and the vendor was very helpful on delivery.`,
];
const MINUTE = 60_000;
const AGES = [2 * MINUTE, 3 * 60 * MINUTE, 2 * 24 * 60 * MINUTE, 40 * 24 * 60 * MINUTE];

/** Reviews left in mock mode, kept in this browser per product slug. */
const REVIEWS_KEY = "fysi-mock-reviews";
function savedReviews(): Record<string, Review[]> {
	try {
		return JSON.parse(localStorage.getItem(REVIEWS_KEY) ?? "{}") as Record<string, Review[]>;
	} catch {
		return {};
	}
}

/** POST /products/:slug/reviews in mock mode: anyone signed in may review (the real API checks for a delivered order). */
export function addReview(slug: string, author: string, rating: number, comment: string): Review | undefined {
	const product = findProduct(slug);
	if (!product) return undefined;
	const review: Review = {
		id: `${product.id}-review-${Date.now()}`,
		author: { name: author, avatar_url: null },
		rating: Math.min(5, Math.max(1, Math.round(rating))),
		comment: comment.trim(),
		created_at: new Date().toISOString(),
	};
	const all = savedReviews();
	all[slug] = [review, ...(all[slug] ?? [])];
	try {
		localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
	} catch {
		// Storage blocked: the review is still returned, it just won't survive a reload.
	}
	return review;
}

/** GET /products/:slug/reviews: reviews left here first, then four samples per product, newest first. */
export function reviewsFor(slug: string): Review[] | undefined {
	const product = findProduct(slug);
	if (!product) return undefined;
	const seed = MOCK_PRODUCTS.indexOf(product);
	const name = product.name.toLowerCase();
	const samples: Review[] = AGES.map((age, i) => ({
		id: `${product.id}-review-${i + 1}`,
		author: REVIEWERS[(seed + i) % REVIEWERS.length],
		rating: i === 2 && product.rating < 4.6 ? 4 : 5,
		comment: COMMENTS[(seed + i) % COMMENTS.length](name),
		created_at: new Date(Date.now() - age).toISOString(),
	}));
	return [...(savedReviews()[slug] ?? []), ...samples];
}
