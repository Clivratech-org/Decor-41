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
};

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((rows: Category[]) => setCategory(rows.find((c) => c.id === id) || null));
  }, [id]);

  if (!category) return <h1>Edit category</h1>;
  return (
    <CategoryForm
      initial={{
        id: category.id,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        imageUrl: category.imageUrl || "",
      }}
    />
  );
}
