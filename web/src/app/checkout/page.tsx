import { CheckoutPageClient } from "@/components/CheckoutPage";
import { getCategories } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Checkout" };

export default async function CheckoutRoute() {
  const [settings, cats] = await Promise.all([getSettings(), getCategories()]);
  return (
    <CheckoutPageClient
      settings={settings}
      categories={cats.map((c) => ({ slug: c.slug, name: c.name }))}
      razorpayKey={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ""}
    />
  );
}
