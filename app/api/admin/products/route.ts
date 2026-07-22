import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ProductInput } from "@/lib/types";

// Auth check already happened in middleware.ts before this handler runs.

export async function GET() {
  const { data, error } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ProductInput | null;
  if (!body || !body.name || typeof body.price !== "number") {
    return NextResponse.json({ error: "name and price are required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      name: body.name,
      description: body.description || "",
      price: body.price,
      category: body.category || "uncategorized",
      specs: body.specs || {},
      main_image: body.main_image || null,
      gallery_images: body.gallery_images || [],
      status: body.status || "active",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 201 });
}
