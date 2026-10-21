import { getAdminSession } from "@/lib/auth";
import { uploadObject, type UploadFolder } from "@/lib/storage";
import { NextResponse } from "next/server";

const IMAGE_FOLDERS = new Set<UploadFolder>(["products", "categories"]);

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const fd = await req.formData();
  const folder = String(fd.get("folder") || "");
  const file = fd.get("file");
  if (!IMAGE_FOLDERS.has(folder as UploadFolder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Upload an image file" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
  }
  try {
    const saved = await uploadObject(file, folder as UploadFolder);
    return NextResponse.json(saved);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
