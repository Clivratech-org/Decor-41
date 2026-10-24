import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { normalizeMediaUrl } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true, children: true } } },
  });
  return NextResponse.json(
    categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      sortOrder: c.sortOrder,
      imageUrl: normalizeMediaUrl(c.imageUrl),
      parentId: c.parentId,
      productCount: c._count.products,
      childCount: c._count.children,
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
    parentId?: string | null;
  };
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const parentId = body.parentId?.trim() || null;
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
    if (parent.parentId) {
      return NextResponse.json({ error: "A subcategory cannot contain another subcategory" }, { status: 400 });
    }
  }
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
      parentId,
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
    parentId?: string | null;
  };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await prisma.category.findUnique({
    where: { id: body.id },
    include: { _count: { select: { children: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const name = body.name?.trim() || existing.name;
  let parentId = body.parentId !== undefined ? body.parentId?.trim() || null : existing.parentId;
  if (parentId === body.id) {
    return NextResponse.json({ error: "A category cannot be inside itself" }, { status: 400 });
  }
  if (parentId && existing._count.children > 0) {
    return NextResponse.json({ error: "Move the subcategories out before placing this category inside another" }, { status: 400 });
  }
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
    if (parent.parentId) {
      return NextResponse.json({ error: "A subcategory cannot contain another subcategory" }, { status: 400 });
    }
  }
  await prisma.category.update({
    where: { id: body.id },
    data: {
      name,
      description: body.description !== undefined ? body.description.trim() : existing.description,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) || 0 : existing.sortOrder,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl?.trim() || null : existing.imageUrl,
      parentId,
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
  const [count, children] = await Promise.all([
    prisma.product.count({ where: { categoryId: id } }),
    prisma.category.count({ where: { parentId: id } }),
  ]);
  if (children > 0) {
    return NextResponse.json({ error: "Remove the subcategories in this category first" }, { status: 400 });
  }
  if (count > 0) {
    return NextResponse.json({ error: "Remove the products in this category first" }, { status: 400 });
  }
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
