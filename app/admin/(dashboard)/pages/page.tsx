import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PAGE_SLUGS } from "@/lib/types";
import type { SitePage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const { data } = await supabaseAdmin.from("pages").select("*");
  const pages = (data as SitePage[]) || [];
  const bySlug = new Map(pages.map((p) => [p.slug, p]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-2">Site Pages</h1>
      <p className="text-muted text-sm mb-8">
        Edit the text on About Us, the Contact page intro, and the three legal pages.
        These are separate from products — no images here, just headings and paragraphs.
      </p>

      <div className="surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-muted text-left">
              <th className="p-3 font-medium">Page</th>
              <th className="p-3 font-medium">Current Title</th>
              <th className="p-3 font-medium">Last Updated</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {PAGE_SLUGS.map(({ slug, label }) => {
              const page = bySlug.get(slug);
              return (
                <tr key={slug} className="border-b border-line last:border-0">
                  <td className="p-3">{label}</td>
                  <td className="p-3 text-muted">{page ? page.title : "— not set up yet —"}</td>
                  <td className="p-3 text-muted">
                    {page ? new Date(page.updated_at).toLocaleString() : "—"}
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/pages/${slug}`} className="text-accent2 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
