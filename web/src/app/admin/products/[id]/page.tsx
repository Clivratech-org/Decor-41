"use client";

import { ProductForm } from "@/components/admin/ProductForm";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  categoryId: string;
  categoryName: string;
  tagline: string;
  description: string;
  stock: number;
  variants: { id: string; name: string; price: number }[];
  imageUrl: string | null;
  visible: boolean;
};

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => {
        const found = (data.products as Product[]).find((p) => String(p.id) === id);
        setProduct(found || null);
      });
  }, [id]);

  if (!product) return <h1>Product</h1>;

  return (
    <ProductForm
      categoryName={product.categoryName}
      initial={{
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        tagline: product.tagline || "",
        description: product.description || "",
        stock: product.stock,
        variants: product.variants?.length ? product.variants : [{ name: "Standard", price: 0 }],
        imageUrl: product.imageUrl || "",
        visible: product.visible,
      }}
    />
  );
}
