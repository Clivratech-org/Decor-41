export type SizeOption = {
  name: string;
  price: number;
};

export function parseSizeOptions(raw: string | null | undefined, fallbackPrice = 0): SizeOption[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (typeof item === "string") {
          const name = item.trim();
          if (!name) return null;
          return { name, price: Math.max(0, Math.round(fallbackPrice)) };
        }
        if (item && typeof item === "object") {
          const name = String((item as { name?: string }).name || "").trim();
          if (!name) return null;
          const price = Math.max(
            0,
            Math.round(Number((item as { price?: number }).price) || fallbackPrice || 0),
          );
          return { name, price };
        }
        return null;
      })
      .filter((row): row is SizeOption => Boolean(row))
      .slice(0, 12);
  } catch {
    return [];
  }
}

export function cleanSizeOptions(raw: unknown, fallbackPrice = 0): SizeOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") {
        const name = item.trim();
        if (!name) return null;
        return { name, price: Math.max(0, Math.round(fallbackPrice)) };
      }
      if (item && typeof item === "object") {
        const name = String((item as { name?: string }).name || "").trim();
        if (!name) return null;
        return {
          name,
          price: Math.max(0, Math.round(Number((item as { price?: number }).price) || fallbackPrice || 0)),
        };
      }
      return null;
    })
    .filter((row): row is SizeOption => Boolean(row))
    .slice(0, 12);
}

export function sizeNames(sizes: SizeOption[]) {
  return sizes.map((size) => size.name);
}
