import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
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
  variants: { id: string; name: string; price: number }[];
}) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    tagline: p.tagline,
    description: p.description,
    price: p.variants[0]?.price ?? 0,
    stock: p.stock,
    variants: p.variants.map((v) => v.name).join(", "),
    imageUrl: p.imageUrl,
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
    variants?: string;
    imageUrl?: string;
    visible?: boolean;
  };
  const name = body.name?.trim() || "Untitled";
  const categoryId = body.categoryId;
  if (!categoryId) {
    return NextResponse.json({ error: "categoryId required" }, { status: 400 });
  }
  const price = Math.round(Number(body.price) || 0);
  const stock = Math.max(0, Math.round(Number(body.stock) || 0));
  const names = parseVariantNames(body.variants || "Standard");
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
        create: names.map((n, i) => ({
          name: n,
          price,
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
    variants?: string;
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

  const price = Math.round(Number(body.price) ?? existing.variants[0]?.price ?? 0);
  const stock = body.stock !== undefined ? Math.max(0, Math.round(Number(body.stock))) : existing.stock;
  const names = parseVariantNames(body.variants ?? existing.variants.map((v) => v.name).join(", "));
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

  const byName = new Map(existing.variants.map((v) => [v.name.toLowerCase(), v]));
  const kept = new Set<string>();

  for (let i = 0; i < names.length; i++) {
    const n = names[i];
    const key = n.toLowerCase();
    kept.add(key);
    const prev = byName.get(key);
    if (prev) {
      await prisma.productVariant.update({
        where: { id: prev.id },
        data: { name: n, price, sortOrder: i },
      });
    } else {
      await prisma.productVariant.create({
        data: {
          productId: id,
          name: n,
          price,
          color: COLORS[i % COLORS.length],
          sortOrder: i,
        },
      });
    }
  }

  for (const v of existing.variants) {
    if (!kept.has(v.name.toLowerCase())) {
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
