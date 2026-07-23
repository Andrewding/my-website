import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PAGE_SLUGS } from "@/lib/types";

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  const known = PAGE_SLUGS.some((p) => p.slug === params.slug);
  if (!known) {
    return NextResponse.json({ error: "Unknown page slug." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== "string" || typeof body.content !== "string") {
    return NextResponse.json({ error: "title and content are required." }, { status: 400 });
  }

  // upsert: creates the row if it doesn't exist yet (e.g. seed data was
  // never run), updates it if it does.
  const { data, error } = await supabaseAdmin
    .from("pages")
    .upsert({ slug: params.slug, title: body.title, content: body.content }, { onConflict: "slug" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ page: data });
}
