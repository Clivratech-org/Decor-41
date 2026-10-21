import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { slug: "laser", name: "Laser Cut Designs", description: "Wood & acrylic art", sortOrder: 1 },
  { slug: "poster", name: "Posters", description: "Art prints & framed", sortOrder: 2 },
  { slug: "spoiler", name: "Spoilers", description: "Car styling", sortOrder: 3 },
  { slug: "plant", name: "Table Plants", description: "Faux greens", sortOrder: 4 },
  { slug: "wall", name: "Wallpaper", description: "Peel-and-stick", sortOrder: 5 },
  { slug: "stand", name: "Car Stands", description: "Model displays", sortOrder: 6 },
  { slug: "car", name: "Cars", description: "Diecast collectibles", sortOrder: 7 },
];

const products = [
  {
    id: 1,
    slug: "mandala-wall-art",
    cat: "laser",
    name: "Mandala Wall Art",
    tagline: "Precision laser-cut mandala in wood or acrylic.",
    description:
      "A statement piece for living rooms, studios and entryways. Each Mandala Wall Art is cut from a single sheet by laser, so every petal and perforation is crisp, symmetrical and burr-free. The layered cut-outs throw soft shadows on the wall that change through the day. It arrives ready to hang with a concealed keyhole mount.",
    features: [
      ["Single-sheet laser cut", "No joins or glue lines — clean edges throughout."],
      ["Three finishes", "Natural wood, black acrylic or gold mirror acrylic."],
      ["Ready to hang", "Concealed keyhole mount and wall plugs included."],
      ["Made to order", "Cut and finished in 3–5 working days."],
    ],
    specs: [
      ["Material", "Birch ply / cast acrylic, 3 mm"],
      ["Sizes", "12, 18 or 24 inch diameter"],
      ["Weight", "350 g – 1.2 kg"],
      ["Care", "Wipe with a dry or slightly damp cloth"],
    ],
    sizes: ["12 in", "18 in", "24 in"],
    rating: 4.9,
    reviewCount: 312,
    stock: 24,
    artKey: 1,
    variants: [
      { name: "Natural wood", price: 1299, color: "#c58b55" },
      { name: "Black acrylic", price: 1599, color: "#5b6277" },
      { name: "Gold acrylic", price: 1799, color: "#f0b73a" },
    ],
  },
  {
    id: 2,
    slug: "custom-name-plate",
    cat: "laser",
    name: "Custom Name Plate",
    tagline: "Family name plate with optional backlight.",
    description:
      "Welcome guests with a name plate made for your family. Choose the name, we laser-cut the letters through the plate and add a warm LED backlight so the name glows after dark. Ideal for house-warming gifts, villas and apartment doors.",
    features: [
      ["Your name, your font", "Send us the name and pick from 12 cut styles."],
      ["Warm LED backlight", "Low-power strip with adapter included."],
      ["Weather-sealed", "Safe for covered porches and entrances."],
      ["Gift packaging", "Arrives boxed with a protective foam layer."],
    ],
    specs: [
      ["Material", "Walnut veneer or white acrylic"],
      ["Sizes", "Small 8×3 in · Large 14×5 in"],
      ["Power", "5 V USB adapter included"],
      ["Lead time", "4–6 working days"],
    ],
    sizes: ["Small", "Large"],
    rating: 4.8,
    reviewCount: 208,
    stock: 30,
    artKey: 2,
    variants: [
      { name: "Walnut", price: 899, color: "#8a5a3b" },
      { name: "White", price: 999, color: "#f1f1ec" },
    ],
  },
  {
    id: 3,
    slug: "mountain-sunrise-poster",
    cat: "poster",
    name: "Mountain Sunrise Poster",
    tagline: "Matte art print, 300 GSM.",
    description:
      "A calm, layered landscape print that makes a room feel bigger. Printed on thick 300 GSM paper with fade-resistant inks, so the sunrise colours stay rich for years. Pair two or three sizes together for a gallery wall.",
    features: [
      ["300 GSM paper", "Thick, premium stock that lies flat on the wall."],
      ["Fade-resistant ink", "Colours stay true under indoor light."],
      ["Matte or glossy", "Matte hides glare; glossy deepens colour."],
      ["Rolled in a tube", "Shipped crease-free in a rigid tube."],
    ],
    specs: [
      ["Paper", "300 GSM art paper"],
      ["Sizes", "A4 · A3 · A2"],
      ["Finish", "Matte or glossy"],
      ["Frame", "Not included"],
    ],
    sizes: ["A4", "A3", "A2"],
    rating: 4.7,
    reviewCount: 174,
    stock: 80,
    artKey: 3,
    variants: [
      { name: "Matte", price: 399, color: "#ff9f6e" },
      { name: "Glossy", price: 449, color: "#ff7a8a" },
    ],
  },
  {
    id: 4,
    slug: "retro-racing-poster",
    cat: "poster",
    name: "Retro Racing Poster",
    tagline: "Vintage motorsport graphic.",
    description:
      "A tribute to the golden age of motorsport, drawn in a bold 1970s sunburst style. Perfect above a desk, in a garage or in a teen room. Choose the plain matte print, or the framed version that arrives wall-ready in a wooden frame.",
    features: [
      ["Vintage artwork", "Original illustration, not a stock image."],
      ["Framed option", "Solid wood frame with acrylic front."],
      ["Garage-ready", "Looks great alongside model cars."],
      ["Easy hanging", "Hooks included with framed version."],
    ],
    specs: [
      ["Paper", "300 GSM matte art paper"],
      ["Sizes", "A4 · A3 · A2"],
      ["Frame", "Dark wood, 20 mm profile (framed)"],
      ["Weight", "150 g – 1.4 kg"],
    ],
    sizes: ["A4", "A3", "A2"],
    rating: 4.8,
    reviewCount: 141,
    stock: 45,
    artKey: 4,
    variants: [
      { name: "Matte", price: 449, color: "#ffb13d" },
      { name: "Framed", price: 899, color: "#ff5a3d" },
    ],
  },
  {
    id: 5,
    slug: "gt-rear-spoiler",
    cat: "spoiler",
    name: "GT Rear Spoiler",
    tagline: "Carbon-look ABS spoiler, 3M mounting.",
    description:
      "Give your hatchback or sedan a sportier stance without drilling. This GT-style rear spoiler is moulded from impact-resistant ABS and mounts with automotive-grade 3M tape, so it is easy to fit and easy to remove. The shaped end plates add a clean, track-inspired profile.",
    features: [
      ["No-drill install", "Pre-applied 3M VHB tape, fits in 20 minutes."],
      ["Impact-resistant ABS", "Handles sun, rain and car washes."],
      ["Three looks", "Gloss black, carbon look or red."],
      ["Body-specific shapes", "Separate fit for hatchback and sedan."],
    ],
    specs: [
      ["Material", "UV-stable ABS plastic"],
      ["Fitment", "Hatchback or sedan (see size)"],
      ["Mounting", "3M tape + alignment guide"],
      ["Warranty", "6 months against defects"],
    ],
    sizes: ["Hatchback", "Sedan"],
    rating: 4.6,
    reviewCount: 96,
    stock: 9,
    artKey: 5,
    variants: [
      { name: "Gloss black", price: 3299, color: "#1b2033" },
      { name: "Carbon look", price: 4299, color: "#2a2f3d" },
      { name: "Red", price: 3499, color: "#e0313f" },
    ],
  },
  {
    id: 6,
    slug: "succulent-desk-plant",
    cat: "plant",
    name: "Succulent Desk Plant",
    tagline: "Realistic faux greens in a ceramic pot.",
    description:
      "All the calm of a succulent, none of the watering. Hand-finished faux leaves with natural colour variation sit in a glazed ceramic pot, so it looks real even up close. A cheerful addition to desks, shelves and bedside tables.",
    features: [
      ["Zero upkeep", "No water, no sunlight, no fading."],
      ["Glazed ceramic pot", "Weighted base so it does not tip."],
      ["Realistic finish", "Layered leaves with natural colour shading."],
      ["Gift friendly", "Boxed with a protective sleeve."],
    ],
    specs: [
      ["Plant", "Premium faux foliage"],
      ["Pot", "Glazed ceramic with drainage-free base"],
      ["Height", "Small 12 cm · Medium 18 cm"],
      ["Care", "Dust with a soft brush"],
    ],
    sizes: ["Small", "Medium"],
    rating: 4.8,
    reviewCount: 263,
    stock: 41,
    artKey: 6,
    variants: [
      { name: "White pot", price: 599, color: "#f1f1ec" },
      { name: "Terracotta", price: 549, color: "#c8693f" },
      { name: "Black pot", price: 599, color: "#2b2f3c" },
    ],
  },
  {
    id: 7,
    slug: "geometric-wallpaper-roll",
    cat: "wall",
    name: "Geometric Wallpaper Roll",
    tagline: "Peel-and-stick, washable.",
    description:
      "Transform a wall in an afternoon. This geometric peel-and-stick wallpaper needs no paste, no mess and no professional fitter. The washable vinyl surface handles smudges, and it can be repositioned while you line up the pattern — and removed later without damaging paint.",
    features: [
      ["Peel and stick", "No paste, no tools — just a smooth, clean wall."],
      ["Repositionable", "Lift and re-align while fitting."],
      ["Washable vinyl", "Wipe clean with a damp cloth."],
      ["Rent-friendly", "Removes cleanly from painted walls."],
    ],
    specs: [
      ["Material", "Self-adhesive PVC vinyl"],
      ["Roll width", "53 cm"],
      ["Length", "5 m or 10 m"],
      ["Pattern repeat", "44 cm, straight match"],
    ],
    sizes: ["5 m", "10 m"],
    rating: 4.7,
    reviewCount: 189,
    stock: 3,
    artKey: 7,
    variants: [
      { name: "Teal", price: 1199, color: "#2cc7b8" },
      { name: "Gold", price: 1399, color: "#e8b341" },
      { name: "Grey", price: 1199, color: "#98a2c0" },
    ],
  },
  {
    id: 8,
    slug: "showcase-car-stand",
    cat: "stand",
    name: "Showcase Car Stand",
    tagline: "Display stand for model cars.",
    description:
      "Show off your collection the way it deserves. This display stand lifts the model off the shelf, tilts it slightly for a showroom angle, and keeps it dust-free behind a clear cover. Choose the size that matches your scale cars.",
    features: [
      ["Showroom angle", "Tilted riser shows the car’s profile."],
      ["Dust cover", "Clear acrylic cover protects the paint."],
      ["Anti-slip base", "Rubber feet keep it steady on any shelf."],
      ["Stackable", "Build a multi-level collector’s wall."],
    ],
    specs: [
      ["Material", "Powder-coated metal + acrylic"],
      ["Scales", "1:18 or 1:24"],
      ["Base", "Rubber anti-slip feet"],
      ["Weight", "600 g – 900 g"],
    ],
    sizes: ["1:18", "1:24"],
    rating: 4.7,
    reviewCount: 88,
    stock: 15,
    artKey: 8,
    variants: [
      { name: "Black", price: 1499, color: "#2b2f3c" },
      { name: "Silver", price: 1599, color: "#c5cbe2" },
    ],
  },
  {
    id: 9,
    slug: "diecast-sports-car",
    cat: "car",
    name: "Diecast Sports Car",
    tagline: "Collectible with opening doors.",
    description:
      "A detailed metal model for collectors and gift-givers. The diecast body has opening doors, a detailed interior and rubber tyres that roll smoothly. It comes in a display box, ready to gift or to place on a showcase stand.",
    features: [
      ["Diecast metal body", "Heavy, solid feel with glossy paint."],
      ["Opening doors", "Detailed cabin and steering wheel."],
      ["Rubber tyres", "Smooth-rolling with realistic tread."],
      ["Display box", "Collector packaging with clear window."],
    ],
    specs: [
      ["Material", "Zinc alloy diecast + ABS"],
      ["Scales", "1:18 or 1:24"],
      ["Features", "Opening doors, steerable wheels"],
      ["Age", "14 years and above"],
    ],
    sizes: ["1:18", "1:24"],
    rating: 4.9,
    reviewCount: 227,
    stock: 12,
    artKey: 9,
    variants: [
      { name: "Red", price: 2499, color: "#e0313f" },
      { name: "Yellow", price: 2499, color: "#f5c518" },
      { name: "Blue", price: 2599, color: "#2d7bff" },
    ],
  },
];

const settings: Record<string, string> = {
  shippingStandardFee: "79",
  shippingExpressFee: "149",
  freeShippingThreshold: "999",
  shippingStandardDays: "3–6 working days",
  shippingExpressDays: "1–3 working days",
  customProductionDays: "3–5 working days",
  returnPolicyDays: "7",
  siteTagline: "Style it. Cut it. Drive it.",
  contactPhone: "86677 06941",
  contactEmail: "hello@decor41.com",
  contactAddress: "Sooleswaranpetti, Valparai road, Pollachi",
  whatsapp: "918667706941",
};

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.admin.deleteMany();

  const email = process.env.ADMIN_EMAIL || "admin@decor41.com";
  const password = process.env.ADMIN_PASSWORD || "Decor41@Admin";
  await prisma.admin.create({
    data: {
      email,
      name: "Decor 41 Admin",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.create({ data: { key, value } });
  }

  const catMap = new Map<string, string>();
  for (const c of categories) {
    const row = await prisma.category.create({ data: c });
    catMap.set(c.slug, row.id);
  }

  for (const p of products) {
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        categoryId: catMap.get(p.cat)!,
        tagline: p.tagline,
        description: p.description,
        features: JSON.stringify(p.features),
        specs: JSON.stringify(p.specs),
        sizes: JSON.stringify(p.sizes),
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        visible: true,
        artKey: p.artKey,
        variants: {
          create: p.variants.map((v, i) => ({
            name: v.name,
            price: v.price,
            color: v.color,
            sortOrder: i,
          })),
        },
      },
    });
  }

  await prisma.lead.createMany({
    data: [
      { name: "Arjun K.", contact: "98400 11122", interest: "GT Rear Spoiler", status: "New" },
      { name: "Meera S.", contact: "meera@mail.com", interest: "Mandala Wall Art 24in", status: "Contacted" },
      { name: "Rahul V.", contact: "97900 55541", interest: "Geometric Wallpaper", status: "New" },
      { name: "Lakshmi P.", contact: "lakshmi@mail.com", interest: "Custom name plate", status: "Won" },
    ],
  });

  console.log(`Seeded admin ${email} / ${password}`);
  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
