import { CustomOrderForm } from "@/components/CustomOrderForm";
import { getCategories } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Custom laser cut" };

export default async function CustomPage() {
  const [cats, settings] = await Promise.all([getCategories(), getSettings()]);
  return (
    <CustomOrderForm
      categories={cats.map((c) => ({ slug: c.slug, name: c.name }))}
      settings={settings}
    />
  );
}
