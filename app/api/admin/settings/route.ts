import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Reads the single site_settings row (id = 1). Route (not the plain
// lib/settings.ts helper) is used from the admin form so it always hits
// the service-role client — consistent with how /admin/pages/[slug] works.
export async function GET() {
  const { data, error } = await supabaseAdmin.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data || { id: 1, hero_image: null, updated_at: new Date().toISOString() } });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || (body.hero_image !== null && typeof body.hero_image !== "string")) {
    return NextResponse.json({ error: "hero_image must be a string URL or null." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .upsert({ id: 1, hero_image: body.hero_image }, { onConflict: "id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
