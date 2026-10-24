import { prisma } from "./prisma";
import { productPhotoList } from "./photos";
import { normalizeMediaUrl } from "./storage";

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
  images: string[];
  categorySlug: string;
  categoryName: string;
  fromPrice: number;
  variants: { id: string; name: string; price: number; stock: number; color: string }[];
  sizes: string[];
};

export async function getCategories() {
  const rows = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((category) => ({ ...category, imageUrl: normalizeMediaUrl(category.imageUrl) }));
}

export async function getProducts(opts?: { categorySlug?: string; q?: string; includeHidden?: boolean }) {
  const products = await prisma.product.findMany({
    where: {
      ...(opts?.includeHidden ? {} : { visible: true }),
      ...(opts?.categorySlug
        ? {
            category: {
              OR: [{ slug: opts.categorySlug }, { parent: { slug: opts.categorySlug } }],
            },
          }
        : {}),
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
  images: string;
  sizes: string;
  category: { slug: string; name: string };
  variants: { id: string; name: string; price: number; stock: number; color: string }[];
}): ProductCard {
  const prices = p.variants.map((v) => v.price);
  const images = productPhotoList(p.images, p.imageUrl);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    artKey: p.artKey,
    imageUrl: images[0] || null,
    images,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    fromPrice: prices.length ? Math.min(...prices) : 0,
    variants: p.variants.map((v) => ({ id: v.id, name: v.name, price: v.price, stock: v.stock, color: v.color })),
    sizes: JSON.parse(p.sizes) as string[],
  };
}
