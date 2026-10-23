"use client";

import { CategoryForm } from "@/components/admin/CategoryForm";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function NewCategory() {
  const params = useSearchParams();
  const parentId = params.get("parent") || "";
  const [parents, setParents] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((rows: { id: string; name: string; parentId: string | null }[]) => {
        if (Array.isArray(rows)) setParents(rows.filter((row) => !row.parentId));
      });
  }, []);

  return (
    <CategoryForm
      parents={parents}
      initial={{ name: "", description: "", sortOrder: 0, imageUrl: "", parentId }}
    />
  );
}

export default function NewCategoryPage() {
  return (
    <Suspense fallback={<h1>New category</h1>}>
      <NewCategory />
    </Suspense>
  );
}
