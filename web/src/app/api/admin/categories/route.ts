import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(
    categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      sortOrder: c.sortOrder,
      imageUrl: c.imageUrl,
      productCount: c._count.products,
    })),
  );
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    name?: string;
    description?: string;
    sortOrder?: number;
    imageUrl?: string;
  };
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  let slug = slugify(name, "category");
  const taken = await prisma.category.findUnique({ where: { slug } });
  if (taken) slug = `${slug}-${Date.now().toString().slice(-4)}`;
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description: body.description?.trim() || "",
      sortOrder: Number(body.sortOrder) || 0,
      imageUrl: body.imageUrl?.trim() || null,
    },
  });
  return NextResponse.json({ ok: true, id: category.id });
}

export async function PUT(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    id?: string;
    name?: string;
    description?: string;
    sortOrder?: number;
    imageUrl?: string | null;
  };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await prisma.category.findUnique({ where: { id: body.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const name = body.name?.trim() || existing.name;
  await prisma.category.update({
    where: { id: body.id },
    data: {
      name,
      description: body.description !== undefined ? body.description.trim() : existing.description,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) || 0 : existing.sortOrder,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl?.trim() || null : existing.imageUrl,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json({ error: "Remove the products in this category first" }, { status: 400 });
  }
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
