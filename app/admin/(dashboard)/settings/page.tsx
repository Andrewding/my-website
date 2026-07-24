import { supabaseAdmin } from "@/lib/supabase/admin";
import type { SiteSettings } from "@/lib/types";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";

async function getOrCreateSettings(): Promise<SiteSettings> {
  const { data } = await supabaseAdmin.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (data) return data as SiteSettings;
  // Row doesn't exist yet (schema-settings.sql seed didn't run) — hand the
  // form an empty draft; saving will create the row via upsert.
  return { id: 1, hero_image: null, updated_at: new Date().toISOString() };
}

export default async function SiteSettingsPage() {
  const settings = await getOrCreateSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-8">Site Settings</h1>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
