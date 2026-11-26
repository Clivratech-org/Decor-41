import { getProducts } from "@/lib/products";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (q.length < 1) {
    return NextResponse.json({ results: [] });
  }
  const products = await getProducts({ q });
  return NextResponse.json({
    results: products.slice(0, 8).map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      categoryName: product.categoryName,
      fromPrice: product.fromPrice,
      imageUrl: product.imageUrl,
    })),
  });
}
