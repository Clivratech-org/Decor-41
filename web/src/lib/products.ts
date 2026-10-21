import { prisma } from "./prisma";

export type ProductCard = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  stock: number;
  artKey: number;
  imageUrl: string | null;
  categorySlug: string;
  categoryName: string;
  fromPrice: number;
  variants: { id: string; name: string; price: number; color: string }[];
  sizes: string[];
};

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getProducts(opts?: { categorySlug?: string; q?: string; includeHidden?: boolean }) {
  const products = await prisma.product.findMany({
    where: {
      ...(opts?.includeHidden ? {} : { visible: true }),
      ...(opts?.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
      ...(opts?.q
        ? {
            OR: [
              { name: { contains: opts.q } },
              { tagline: { contains: opts.q } },
              { description: { contains: opts.q } },
              { category: { name: { contains: opts.q } } },
            ],
          }
        : {}),
    },
    include: { category: true, variants: { orderBy: { sortOrder: "asc" } } },
    orderBy: { id: "asc" },
  });
  return products.map(mapProduct);
}

export async function getProductBySlug(slug: string) {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: { orderBy: { sortOrder: "asc" } } },
  });
  if (!p || !p.visible) return null;
  return {
    ...mapProduct(p),
    description: p.description,
    features: JSON.parse(p.features) as [string, string][],
    specs: JSON.parse(p.specs) as [string, string][],
  };
}

export async function getProductById(id: number) {
  const p = await prisma.product.findUnique({
    where: { id },
    include: { category: true, variants: { orderBy: { sortOrder: "asc" } } },
  });
  if (!p) return null;
  return {
    ...mapProduct(p),
    description: p.description,
    features: JSON.parse(p.features) as [string, string][],
    specs: JSON.parse(p.specs) as [string, string][],
    visible: p.visible,
  };
}

function mapProduct(p: {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  stock: number;
  artKey: number;
  imageUrl: string | null;
  sizes: string;
  category: { slug: string; name: string };
  variants: { id: string; name: string; price: number; color: string }[];
}): ProductCard {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.stock,
    artKey: p.artKey,
    imageUrl: p.imageUrl,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    fromPrice: p.variants[0]?.price ?? 0,
    variants: p.variants.map((v) => ({ id: v.id, name: v.name, price: v.price, color: v.color })),
    sizes: JSON.parse(p.sizes) as string[],
  };
}
