"use client";

import { CouponForm } from "@/components/admin/CouponForm";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Coupon = { id: string; code: string; discountPercent: number; active: boolean; showOnSite: boolean };

export default function EditCouponPage() {
  const { id } = useParams<{ id: string }>();
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((rows: Coupon[]) => setCoupon(rows.find((c) => c.id === id) || null));
  }, [id]);

  if (!coupon) return <h1>Edit coupon</h1>;
  return <CouponForm initial={coupon} />;
}
