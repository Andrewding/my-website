"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/types";

/** Uploads one file to /api/admin/upload and returns the public Supabase Storage URL. */
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Image upload failed");
  }
  const body = await res.json();
  return body.url as string;
}

export default function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [heroImage, setHeroImage] = useState<string | null>(settings.hero_image);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSaved(false);
    try {
      const url = await uploadImage(file);
      setHeroImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero_image: heroImage }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {error && (
        <div className="text-sm text-accent mb-5 border border-accent/40 bg-accent/10 rounded-sm px-3 py-2">{error}</div>
      )}
      {saved && !error && (
        <div className="text-sm text-accent2 mb-5 border border-accent2/40 bg-accent2/10 rounded-sm px-3 py-2">
          Saved. The homepage now shows this image.
        </div>
      )}

      <label className="block text-xs text-muted mb-2">Homepage Hero Banner</label>
      <p className="text-xs text-muted mb-4">
        This is the large image at the top of the homepage. Upload a new one to replace it — recommended: a wide
        image (roughly 1600×700px or similar aspect ratio) under 8MB.
      </p>

      <div className="surface w-full aspect-[16/7] flex items-center justify-center overflow-hidden mb-4">
        {heroImage ? (
          <img src={heroImage} alt="Hero preview" className="w-full h-full object-cover" />
        ) : (
          <span className="text-muted text-xs text-center px-2">No custom image yet — homepage shows the default placeholder</span>
        )}
      </div>

      <div className="mb-6">
        <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
        {uploading && <p className="text-xs text-muted mt-1">Uploading…</p>}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={handleSave} disabled={saving || uploading} className="btn-primary disabled:opacity-60">
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {heroImage && (
          <button
            type="button"
            onClick={() => setHeroImage(null)}
            disabled={saving || uploading}
            className="btn-outline"
          >
            Reset to default image
          </button>
        )}
      </div>
    </div>
  );
}
