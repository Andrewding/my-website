"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SitePage } from "@/lib/types";

export default function PageContentForm({ page }: { page: SitePage }) {
  const router = useRouter();
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${page.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      router.push("/admin/pages");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div className="text-sm text-accent mb-5 border border-accent/40 bg-accent/10 rounded-sm px-3 py-2">{error}</div>
      )}

      <label className="block text-xs text-muted mb-1.5" htmlFor="title">Page Title (shown as the H1 heading)</label>
      <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="field mb-6" />

      <label className="block text-xs text-muted mb-1.5" htmlFor="content">Content</label>
      <textarea
        id="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={18}
        className="field mb-2 font-mono text-sm"
      />
      <p className="text-xs text-muted mb-6">
        Formatting: leave a <strong>blank line</strong> between paragraphs. Start a line with{" "}
        <code className="text-accent2">## </code> to make it a section heading (Shipping/Return/Privacy use this;
        About and Contact usually don&apos;t need any headings).
      </p>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.push("/admin/pages")} className="btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}
