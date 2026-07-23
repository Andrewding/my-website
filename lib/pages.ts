import { supabasePublic } from "@/lib/supabase/public";
import type { SitePage } from "@/lib/types";

// Falls back to a generic placeholder if the row is missing (e.g. schema-pages.sql
// hasn't been run yet) so pages never hard-crash — they just show a hint instead.
export async function getPage(slug: string): Promise<SitePage> {
  const { data } = await supabasePublic.from("pages").select("*").eq("slug", slug).maybeSingle();
  if (data) return data as SitePage;
  return {
    slug,
    title: slug,
    content: `[This page's content hasn't been set up yet. Run supabase/schema-pages.sql, then edit it from /admin/pages.]`,
    updated_at: new Date().toISOString(),
  };
}
