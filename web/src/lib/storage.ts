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
  return `/api/media?key=${encodeURIComponent(key)}`;
}

export function isSafeKey(key: string) {
  return /^(products|categories|custom)\/[a-zA-Z0-9._-]+$/.test(key);
}

export async function uploadObject(file: File, folder: UploadFolder) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "file";
  const key = `${folder}/${Date.now()}-${safe}`;
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
