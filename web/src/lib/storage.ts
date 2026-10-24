import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const FOLDERS = ["products", "categories", "custom"] as const;
export type UploadFolder = (typeof FOLDERS)[number];

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function client() {
  return new S3Client({
    region: "auto",
    endpoint: required("R2_ENDPOINT"),
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function mediaUrl(key: string) {
  const path = key.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `/api/media/${path}`;
}

export function normalizeMediaUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = url.startsWith("/") ? new URL(url, "http://local") : new URL(url);
    if (!parsed.pathname.startsWith("/api/media")) return url;
    const queryKey = parsed.searchParams.get("key");
    if (queryKey && isSafeKey(queryKey)) return mediaUrl(queryKey);
  } catch {
    return url;
  }
  return url;
}

export function isSafeKey(key: string) {
  return /^(products|categories|custom)\/[a-zA-Z0-9._-]+$/.test(key);
}

export async function uploadObject(file: File, folder: UploadFolder) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "file";
  const rand = Math.random().toString(36).slice(2, 8);
  const key = `${folder}/${Date.now()}-${rand}-${safe}`;
  await client().send(
    new PutObjectCommand({
      Bucket: required("R2_BUCKET_NAME"),
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || "application/octet-stream",
    }),
  );
  return { key, url: mediaUrl(key) };
}

export async function readObject(key: string) {
  if (!isSafeKey(key)) return null;
  const result = await client().send(
    new GetObjectCommand({
      Bucket: required("R2_BUCKET_NAME"),
      Key: key,
    }),
  );
  const bytes = await result.Body?.transformToByteArray();
  if (!bytes) return null;
  return {
    bytes,
    contentType: result.ContentType || "application/octet-stream",
  };
}
