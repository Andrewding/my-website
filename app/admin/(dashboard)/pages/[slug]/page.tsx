import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PAGE_SLUGS } from "@/lib/types";
import type { SitePage } from "@/lib/types";
import PageContentForm from "@/components/admin/PageContentForm";

async function getOrCreatePage(slug: string): Promise<SitePage | null> {
  const known = PAGE_SLUGS.find((p) => p.slug === slug);
  if (!known) return null;

  const { data } = await supabaseAdmin.from("pages").select("*").eq("slug", slug).maybeSingle();
  if (data) return data as SitePage;

  // Row doesn't exist yet (schema-pages.sql seed didn't run, or it's new) —
  // hand the form an empty draft; saving will create the row.
  return {
    slug,
    title: known.label,
    content: "",
    updated_at: new Date().toISOString(),
  };
}

export default async function EditSitePage({ params }: { params: { slug: string } }) {
  const page = await getOrCreatePage(params.slug);
  if (!page) notFound();

  const known = PAGE_SLUGS.find((p) => p.slug === params.slug)!;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-8">Edit: {known.label}</h1>
      <PageContentForm page={page} />
    </div>
  );
}
