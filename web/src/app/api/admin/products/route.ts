import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { normalizeMediaUrl } from "@/lib/storage";
import { NextResponse } from "next/server";

const PLACEHOLDER_FEATURES = JSON.stringify([["Quality build", "Crafted for everyday use."]]);
const PLACEHOLDER_SPECS = JSON.stringify([["Material", "See product description"]]);
const DEFAULT_SIZES = JSON.stringify(["Standard"]);

function parseVariantNames(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

type VariantInput = { id?: string; name: string; price: number; stock: number };

function normalizeVariants(raw: unknown, fallbackPrice: number, fallbackStock = 0): VariantInput[] {
  if (Array.isArray(raw)) {
    const rows = raw
      .map((item) => {
        const row = item as { id?: string; name?: string; price?: number; stock?: number };
        return {
          id: row.id,
          name: String(row.name || "").trim(),
          price: Math.max(0, Math.round(Number(row.price) || 0)),
          stock: Math.max(0, Math.round(Number(row.stock) || 0)),
        };
      })
      .filter((row) => row.name);
    if (rows.length) return rows;
  }
  if (typeof raw === "string") {
    const names = parseVariantNames(raw);
    if (names.length) {
      return names.map((name) => ({
        name,
        price: Math.max(0, Math.round(fallbackPrice)),
        stock: Math.max(0, Math.round(fallbackStock)),
      }));
    }
  }
  return [{ name: "Standard", price: Math.max(0, Math.round(fallbackPrice)), stock: Math.max(0, Math.round(fallbackStock)) }];
}

const COLORS = ["#c58b55", "#5b6277", "#f0b73a", "#3dd6ff", "#c6ff3d", "#ff5d6c"];

function mapProduct(p: {
  id: number;
  slug: string;
  name: string;
  categoryId: string;
  tagline: string;
  description: string;
  stock: number;
  imageUrl: string | null;
  visible: boolean;
  artKey: number;
  category: { name: string };
  variants: { id: string; name: string; price: number; stock: number }[];
}) {
  const prices = p.variants.map((v) => v.price);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    tagline: p.tagline,
    description: p.description,
    price: prices.length ? Math.min(...prices) : 0,
    stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    variants: p.variants.map((v) => ({ id: v.id, name: v.name, price: v.price, stock: v.stock })),
    imageUrl: normalizeMediaUrl(p.imageUrl),
    visible: p.visible,
    artKey: p.artKey,
  };
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, variants: { orderBy: { sortOrder: "asc" } } },
      orderBy: { id: "asc" },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return NextResponse.json({
    categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    products: products.map(mapProduct),
  });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    name?: string;
    categoryId?: string;
    tagline?: string;
    description?: string;
    price?: number;
    stock?: number;
    variants?: unknown;
    imageUrl?: string;
    visible?: boolean;
  };
  const name = body.name?.trim() || "Untitled";
  const categoryId = body.categoryId;
  if (!categoryId) {
    return NextResponse.json({ error: "categoryId required" }, { status: 400 });
  }
  const variants = normalizeVariants(body.variants, Number(body.price) || 0, Number(body.stock) || 0);
  const stock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const max = await prisma.product.aggregate({ _max: { id: true } });
  const id = (max._max.id ?? 0) + 1;
  let slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${id}`;

  const product = await prisma.product.create({
    data: {
      id,
      slug,
      name,
      categoryId,
      tagline: body.tagline?.trim() || name,
      description: body.description?.trim() || `${name} — available from Decor 41.`,
      features: PLACEHOLDER_FEATURES,
      specs: PLACEHOLDER_SPECS,
      sizes: DEFAULT_SIZES,
      stock,
      visible: body.visible !== false,
      imageUrl: body.imageUrl?.trim() || null,
      artKey: id,
      variants: {
        create: variants.map((variant, i) => ({
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          color: COLORS[i % COLORS.length],
          sortOrder: i,
        })),
      },
    },
    include: { category: true, variants: true },
  });
  return NextResponse.json({ ok: true, id: product.id });
}

export async function PUT(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    id?: number;
    name?: string;
    categoryId?: string;
    tagline?: string;
    description?: string;
    price?: number;
    stock?: number;
    variants?: unknown;
    imageUrl?: string;
    visible?: boolean;
  };
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const variants = normalizeVariants(
    body.variants ?? existing.variants.map((v) => ({ id: v.id, name: v.name, price: v.price, stock: v.stock })),
    (existing.variants[0]?.price ?? Number(body.price)) || 0,
    existing.stock,
  );
  const stock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const name = body.name?.trim() || existing.name;
  const categoryId = body.categoryId || existing.categoryId;

  await prisma.product.update({
    where: { id },
    data: {
      name,
      categoryId,
      tagline: body.tagline !== undefined ? body.tagline.trim() || name : existing.tagline,
      description: body.description !== undefined ? body.description.trim() || existing.description : existing.description,
      stock,
      visible: body.visible !== undefined ? !!body.visible : existing.visible,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl.trim() || null : existing.imageUrl,
    },
  });

  const kept = new Set<string>();

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const prev = variant.id ? existing.variants.find((row) => row.id === variant.id) : undefined;
    if (prev) {
      kept.add(prev.id);
      await prisma.productVariant.update({
        where: { id: prev.id },
        data: { name: variant.name, price: variant.price, stock: variant.stock, sortOrder: i },
      });
    } else {
      const created = await prisma.productVariant.create({
        data: {
          productId: id,
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          color: COLORS[i % COLORS.length],
          sortOrder: i,
        },
      });
      kept.add(created.id);
    }
  }

  for (const v of existing.variants) {
    if (!kept.has(v.id)) {
      await prisma.productVariant.delete({ where: { id: v.id } });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
