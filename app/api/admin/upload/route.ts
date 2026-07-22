import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File is larger than 8MB." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
  }

  const originalName = file instanceof File ? file.name : "upload";
  const extension = originalName.includes(".") ? originalName.split(".").pop() : file.type.split("/")[1];
  const safeExt = (extension || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `products/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: publicUrlData.publicUrl, path });
}
