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
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "bottles", label: "Bottles" },
  { id: "bags", label: "Bags" },
  { id: "apparel", label: "Apparel" },
];

/* `details` only lists what can be seen in the photos.
   Add materials, sizes and capacities once confirmed with your supplier. */
const PRODUCTS = [
  { id: "bottle", name: "Insulated bottle", cat: "bottles", price: 14, tag: "Bestseller",
    variants: { dark: "bottle_dark", terracotta: "bottle_terracotta", sand: "bottle_sand" },
    lead: "Your training partner from first rep to last.",
    description: "A clean, solid bottle with the full Embrava logo running up the side. Easy to grab, easy to carry, and made to sit next to everything else in the range.",
    details: ["Full Embrava logo on the side", "Carry loop on the lid", "Available in Dark, Terracotta and Sand"] },
  { id: "gym-bag", name: "Gym bag", cat: "bags", price: 35,
    variants: { dark: "bag_dark", terracotta: "bag_terracotta", sand: "bag_sand" },
    lead: "Room for everything. Character on the outside.",
    description: "A roomy holdall for gym days, early starts and weekends away. Carry it by the handles or sling it over your shoulder, and let the logo do the talking.",
    details: ["Twin carry handles", "Detachable shoulder strap", "Front pocket", "Embrava logo on the front", "Available in Dark, Terracotta and Sand"] },
  { id: "socks", name: "Socks", cat: "apparel", price: 8,
    variants: { dark: "socks_dark", sand: "socks_sand" },
    lead: "Small detail. Big statement.",
    description: "Ribbed training socks with terracotta cuffs, heels and toes, and the Embrava symbol at the top. One pair.",
    details: ["Ribbed knit", "Contrast cuff, heel and toe", "Embrava symbol on the cuff", "Available in Dark and Sand"] },
  { id: "tote", name: "Tote bag", cat: "bags", price: 12, tag: "New",
    variants: { cream: "tote_cream" },
    lead: "For the gym, the shop and everything in between.",
    description: "A roomy everyday tote in cream with sand handles and the full Embrava logo across the front.",
    details: ["Sand-coloured handles", "Full Embrava logo on the front", "Available in Cream"] },
  { id: "cap", name: "Cap", cat: "apparel", price: 18,
    variants: { sand: "cap_sand" },
    lead: "Keep your head in the game.",
    description: "A classic six-panel cap in sand, with the Embrava symbol on the front. Easy to wear in and out of training.",
    details: ["Curved peak", "Embrava symbol on the front", "Available in Sand"] },
];

const KITS = [
  { id: "kit-gym", name: "Gym kit", theme: "dark", img: "kit_1.png", for: "For gym sessions",
    items: ["Gym bag", "Insulated bottle", "Socks"], products: ["gym-bag", "bottle", "socks"], full: 57, price: 48 },
  { id: "kit-home", name: "Home kit", theme: "terracotta", img: "kit_2.png", for: "For training at home",
    items: ["Yoga mat", "Jump rope", "Lifting straps"], products: [], full: 46, price: 39 },
  { id: "kit-starter", name: "Starter kit", theme: "sand", img: "kit_3.png", for: "Everything to get started",
    items: ["Tote bag", "Insulated bottle", "Headband"], products: ["tote", "bottle"], full: 32, price: 27 },
];
