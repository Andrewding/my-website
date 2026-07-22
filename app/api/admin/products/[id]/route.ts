import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ProductInput } from "@/lib/types";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => null)) as ProductInput | null;
  if (!body || !body.name || typeof body.price !== "number") {
    return NextResponse.json({ error: "name and price are required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      name: body.name,
      description: body.description || "",
      price: body.price,
      category: body.category || "uncategorized",
      specs: body.specs || {},
      main_image: body.main_image || null,
      gallery_images: body.gallery_images || [],
      status: body.status || "active",
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  // Hard delete. If you'd rather keep a history of removed products, change
  // this to `.update({ status: "inactive" })` instead — the admin UI's
  // "Take off-shelf" button already covers that softer case.
  const { error } = await supabaseAdmin.from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
