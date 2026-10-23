"use client";

import { CategoryForm } from "@/components/admin/CategoryForm";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  imageUrl: string | null;
  parentId: string | null;
  childCount: number;
};

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [rows, setRows] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data: Category[]) => setRows(Array.isArray(data) ? data : []));
  }, [id]);

  const category = rows.find((c) => c.id === id);
  if (!category) return <h1>Edit category</h1>;
  const parents = rows.filter((row) => !row.parentId && row.id !== category.id && category.childCount === 0);
  return (
    <CategoryForm
      parents={parents}
      initial={{
        id: category.id,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        imageUrl: category.imageUrl || "",
        parentId: category.parentId || "",
      }}
    />
  );
}
