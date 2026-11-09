import { CustomOrderForm } from "@/components/CustomOrderForm";
import { getCategories } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Custom order" };

export default async function CustomPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, cats, settings] = await Promise.all([
    searchParams,
    getCategories(),
    getSettings(),
  ]);
  const customCategories = cats
    .filter((c) => c.customOrderEnabled)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      customOrderEnabled: c.customOrderEnabled,
      customOrderTitle: c.customOrderTitle,
      customOrderBody: c.customOrderBody,
    }));

  return (
    <CustomOrderForm
      categories={cats.filter((c) => !c.parentId).map((c) => ({ slug: c.slug, name: c.name }))}
      customCategories={customCategories}
      settings={settings}
      initialCategory={category}
    />
  );
}
