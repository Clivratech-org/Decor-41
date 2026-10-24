import { normalizeMediaUrl } from "./storage";

export const MAX_PRODUCT_PHOTOS = 3;

export function productPhotoList(images: string | null | undefined, imageUrl: string | null | undefined) {
  let raw: unknown = [];
  try {
    raw = JSON.parse(images || "[]");
  } catch {
    raw = [];
  }
  const fromList = Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim())
    : [];
  const urls = (fromList.length ? fromList : imageUrl ? [imageUrl] : []).slice(0, MAX_PRODUCT_PHOTOS);
  return urls.map((url) => normalizeMediaUrl(url)).filter((url): url is string => Boolean(url));
}

export function cleanProductPhotos(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, MAX_PRODUCT_PHOTOS);
}
