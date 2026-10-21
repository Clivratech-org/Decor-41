"use client";

import { CouponForm } from "@/components/admin/CouponForm";

export default function NewCouponPage() {
  return <CouponForm initial={{ code: "", discountPercent: 10, active: true, showOnSite: true }} />;
}
