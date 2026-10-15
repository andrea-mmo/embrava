/* Embrava · catalogue
   Launch prices, copy and details live here. Edit freely. */

const CURRENCY = "£";
const FREE_SHIPPING = 50;
const BUILDER_MIN = 3;
const BUILDER_DISCOUNT = 0.15;
const GIFT_AMOUNTS = [25, 50, 100];

const COLORS = {
  dark: { label: "Dark", hex: "#2A2624" },
  terracotta: { label: "Terracotta", hex: "#C46848" },
  sand: { label: "Sand", hex: "#D9C4A2" },
  cream: { label: "Cream", hex: "#F4EEE3" },
  blush: { label: "Blush", hex: "#D9A795" },
  mixed: { label: "Mixed", hex: "conic-gradient(#D9C4A2 0 33%, #C46848 0 66%, #2A2624 0)" },
  duo: { label: "Dark & Stone", hex: "linear-gradient(135deg, #4E4440 50%, #B3A491 50%)" },
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "bottles", label: "Bottles" },
  { id: "bags", label: "Bags" },
  { id: "apparel", label: "Apparel" },
  { id: "training", label: "Training" },
];

/* `details` only lists what can be seen in the photos.
   Add materials, sizes and capacities once confirmed with your supplier. */
const PRODUCTS = [
  { id: "bottle", name: "Insulated bottle", cat: "bottles", price: 14, tag: "Bestseller", default: "dark",
    variants: { dark: "bottle_dark", terracotta: "bottle_terracotta", sand: "bottle_sand" },
    lead: "Your training partner from first rep to last.",
    description: "A clean, solid bottle with the full Embrava logo running up the side. Easy to grab, easy to carry, and made to sit next to everything else in the range.",
    details: ["Full Embrava logo on the side", "Carry loop on the lid", "Available in Dark, Terracotta and Sand"] },
  { id: "gym-bag", name: "Gym bag", cat: "bags", price: 35, default: "terracotta",
    variants: { dark: "bag_dark", terracotta: "bag_terracotta", sand: "bag_sand", blush: "bag_blush" },
    lead: "Room for everything. Character on the outside.",
    description: "A roomy holdall for gym days, early starts and weekends away. Carry it by the handles or sling it over your shoulder, and let the logo do the talking.",
    details: ["Twin carry handles", "Detachable shoulder strap", "Front pocket", "Embrava logo on the front", "Available in Dark, Terracotta, Sand and Blush"] },
  { id: "socks", name: "Socks", cat: "apparel", price: 8, default: "sand",
    variants: { dark: "socks_dark", sand: "socks_sand", terracotta: "socks_terracotta", cream: "socks_cream" },
    lead: "Small detail. Big statement.",
    description: "Ribbed training socks with the Embrava symbol at the top. Dark and Sand come with terracotta cuffs, heels and toes; Terracotta and Cream are all one colour. One pair.",
    details: ["Ribbed knit", "Embrava symbol on the cuff", "Available in Dark, Sand, Terracotta and Cream"] },
  { id: "tote", name: "Tote bag", cat: "bags", price: 12, tag: "New",
    variants: { cream: "tote_cream", dark: "tote_dark", terracotta: "tote_terracotta" },
    lead: "For the gym, the shop and everything in between.",
    description: "A roomy everyday tote with sand handles and the full Embrava logo across the front.",
    details: ["Sand-coloured handles", "Full Embrava logo on the front", "Available in Cream, Dark and Terracotta"] },
  { id: "cap", name: "Cap", cat: "apparel", price: 18,
    variants: { sand: "cap_sand", dark: "cap_dark", terracotta: "cap_terracotta", duo: "cap_duo" },
    lead: "Keep your head in the game.",
    description: "A classic six-panel cap with the Embrava symbol embroidered on the front. Easy to wear in and out of training.",
    details: ["Curved peak", "Embroidered Embrava symbol on the front", "Available in Sand, Dark, Terracotta and two-tone Dark & Stone"] },
  { id: "shaker", name: "Shaker", cat: "bottles", price: 10, tag: "New", default: "terracotta",
    variants: { sand: "shaker_sand", terracotta: "shaker_terracotta", blush: "shaker_blush", dark: "shaker_dark" },
    lead: "Mix it, shake it, take it with you.",
    description: "A clear shaker with a flip-top lid in the colour of your choice and the full Embrava logo printed on the side.",
    details: ["Clear body", "Flip-top lid with carry hook", "Full Embrava logo on the side", "Available in Sand, Terracotta, Blush and Dark"] },
  { id: "mat", name: "Yoga mat", cat: "training", price: 24, tag: "New", default: "sand",
    variants: { sand: "mat_sand", terracotta: "mat_terracotta", dark: "mat_dark", blush: "mat_blush" },
    lead: "Your space, wherever you roll it out.",
    description: "A smooth, rounded-corner mat with EMBRAVA running along its length and the symbol in one corner. Rolls up neatly for the bag or the corner of the room.",
    details: ["Rounded corners", "EMBRAVA along the length, symbol in the corner", "Available in Sand, Terracotta, Dark and Blush"] },
  { id: "jump-rope", name: "Jump rope", cat: "training", price: 12,
    variants: { dark: "rope_dark" },
    lead: "Ten minutes. Anywhere.",
    description: "A smooth cable rope with weighted-look handles, each carrying the Embrava logo running up the grip.",
    details: ["Coated cable", "Embrava logo on both handles", "Available in Dark"] },
  { id: "straps", name: "Lifting straps", cat: "training", price: 10,
    variants: { sand: "straps_sand", dark: "straps_dark", terracotta: "straps_terracotta", blush: "straps_blush" },
    lead: "Hold on for one more rep.",
    description: "A pair of woven lifting straps with a looped end and the Embrava logo along each strap.",
    details: ["Sold as a pair", "Looped end", "Embrava logo on each strap", "Available in Sand, Dark, Terracotta and Blush"] },
  { id: "bands", name: "Mini bands · set of 3", cat: "training", price: 14,
    variants: { mixed: "bands_3" },
    lead: "Three resistances, one small pouch.",
    description: "Three flat loop bands in Sand, Terracotta and Dark, with the Embrava logo on the Dark band.",
    details: ["Three bands: Sand, Terracotta, Dark", "Embrava logo on the Dark band"] },
  { id: "bands-5", name: "Mini bands · set of 5", cat: "training", price: 20,
    variants: { mixed: "bands_5" },
    lead: "The full set, from gentle to tough.",
    description: "Five flat loop bands in Blush, Cream, Sand, Terracotta and Dark, with the Embrava logo on the Dark band.",
    details: ["Five bands: Blush, Cream, Sand, Terracotta, Dark", "Embrava logo on the Dark band"] },
  { id: "scrunchie", name: "Scrunchie", cat: "apparel", price: 5,
    variants: { dark: "scrunchie_dark", blush: "scrunchie_blush", terracotta: "scrunchie_terracotta", sand: "scrunchie_sand" },
    lead: "Hair up, head down.",
    description: "A soft woven scrunchie with a small Embrava symbol. Made to match the rest of your kit.",
    details: ["Woven fabric", "Small Embrava symbol", "Available in Dark, Blush, Terracotta and Sand"] },
];

const KITS = [
  { id: "kit-gym", name: "Gym kit", theme: "dark", img: "kit_gym.jpg", for: "For gym sessions",
    items: ["Gym bag", "Shaker", "Lifting straps"], products: ["gym-bag", "shaker", "straps"], full: 55, price: 44 },
  { id: "kit-home", name: "Home kit", theme: "terracotta", img: "kit_home.jpg", for: "For training at home",
    items: ["Yoga mat", "Mini bands", "Socks"], products: ["mat", "bands", "socks"], full: 46, price: 36.8 },
  { id: "kit-starter", name: "Starter kit", theme: "sand", img: "kit_starter.jpg", for: "Everything to get started",
    items: ["Tote bag", "Insulated bottle", "Scrunchie"], products: ["tote", "bottle", "scrunchie"], full: 31, price: 24.8 },
];
