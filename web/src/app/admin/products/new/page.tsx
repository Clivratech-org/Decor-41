"use client";

import { ProductForm } from "@/components/admin/ProductForm";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function NewProduct() {
  const params = useSearchParams();
  const categoryId = params.get("category") || "";
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((rows: { id: string; name: string }[]) => setName(rows.find((c) => c.id === categoryId)?.name || "Category"));
  }, [categoryId]);

  if (!categoryId) return <h1>Choose a category first</h1>;

  return (
    <ProductForm
      categoryName={name || "Category"}
      initial={{
        name: "",
        categoryId,
        tagline: "",
        description: "",
        stock: 1,
        variants: [{ name: "Standard", price: 0, stock: 1 }],
        imageUrl: "",
        visible: true,
      }}
    />
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<h1>New product</h1>}>
      <NewProduct />
    </Suspense>
  );
}
