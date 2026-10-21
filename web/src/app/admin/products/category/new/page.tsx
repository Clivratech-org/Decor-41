"use client";

import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return <CategoryForm initial={{ name: "", description: "", sortOrder: 0, imageUrl: "" }} />;
}
