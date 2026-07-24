import { supabasePublic } from "@/lib/supabase/public";
import type { SiteSettings } from "@/lib/types";

// Falls back to hero_image: null (which the homepage then renders as the
// built-in /hero-1.svg) if the row is missing — e.g. schema-settings.sql
// hasn't been run yet — so the homepage never hard-crashes.
export async function getSiteSettings(): Promise<SiteSettings> {
  const { data } = await supabasePublic.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (data) return data as SiteSettings;
  return { id: 1, hero_image: null, updated_at: new Date().toISOString() };
}
