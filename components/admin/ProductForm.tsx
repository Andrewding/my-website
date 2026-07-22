"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductStatus } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

type SpecRow = { key: string; value: string };

function specsObjectToRows(specs: Record<string, string> | undefined): SpecRow[] {
  const entries = Object.entries(specs || {});
  return entries.length > 0 ? entries.map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }];
}

function specsRowsToObject(rows: SpecRow[]): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const row of rows) {
    if (row.key.trim()) obj[row.key.trim()] = row.value;
  }
  return obj;
}

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

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [category, setCategory] = useState(product?.category || CATEGORIES[0].id);
  const [status, setStatus] = useState<ProductStatus>(product?.status || "active");
  const [specRows, setSpecRows] = useState<SpecRow[]>(specsObjectToRows(product?.specs));
  const [mainImage, setMainImage] = useState<string | null>(product?.main_image || null);
  const [galleryImages, setGalleryImages] = useState<string[]>(product?.gallery_images || []);

  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    setError("");
    try {
      const url = await uploadImage(file);
      setMainImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingMain(false);
      e.target.value = "";
    }
  }

  async function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingGallery(true);
    setError("");
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setGalleryImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  }

  function updateSpecRow(index: number, field: "key" | "value", value: string) {
    setSpecRows((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const priceNum = Number(price);
    if (!name.trim()) return setError("Product name is required.");
    if (!Number.isFinite(priceNum) || priceNum < 0) return setError("Price must be a valid, non-negative number.");

    setSaving(true);
    const payload = {
      name: name.trim(),
      description,
      price: priceNum,
      category,
      status,
      specs: specsRowsToObject(specRows),
      main_image: mainImage,
      gallery_images: galleryImages,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      router.push("/admin/products");
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

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs text-muted mb-1.5" htmlFor="name">Product Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="field" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5" htmlFor="price">Price (USD)</label>
          <input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required className="field" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5" htmlFor="category">
            Category
          </label>
          {/* Free-text input with a datalist: pick an existing category, or type a
              brand-new one — no code change needed to introduce a category. */}
          <input id="category" list="category-options" value={category} onChange={(e) => setCategory(e.target.value)} required className="field" />
          <datalist id="category-options">
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5" htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className="field">
            <option value="active">Active (visible on storefront)</option>
            <option value="inactive">Inactive (off-shelf, hidden)</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs text-muted mb-1.5" htmlFor="description">English Description</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="field" />
      </div>

      {/* ---------- Specs: simple key/value rows, stored as JSONB ---------- */}
      <div className="mb-6">
        <label className="block text-xs text-muted mb-2">Specifications</label>
        <div className="space-y-2">
          {specRows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="Label, e.g. Material"
                value={row.key}
                onChange={(e) => updateSpecRow(i, "key", e.target.value)}
                className="field flex-1"
              />
              <input
                placeholder="Value, e.g. Neoprene"
                value={row.value}
                onChange={(e) => updateSpecRow(i, "value", e.target.value)}
                className="field flex-1"
              />
              <button
                type="button"
                onClick={() => setSpecRows((rows) => rows.filter((_, idx) => idx !== i))}
                className="btn-outline px-3"
                aria-label="Remove spec row"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSpecRows((rows) => [...rows, { key: "", value: "" }])}
          className="btn-outline text-sm mt-2"
        >
          + Add spec row
        </button>
        <p className="text-xs text-muted mt-2">
          Add or remove rows freely — specs are stored as flexible JSON, so there&apos;s no fixed field list to update in code.
        </p>
      </div>

      {/* ---------- Main image ---------- */}
      <div className="mb-6">
        <label className="block text-xs text-muted mb-2">Main Image</label>
        <div className="flex items-center gap-4">
          <div className="surface w-28 h-28 flex items-center justify-center overflow-hidden shrink-0">
            {mainImage ? (
              <img src={mainImage} alt="Main product" className="w-full h-full object-cover" />
            ) : (
              <span className="text-muted text-xs text-center px-2">No image</span>
            )}
          </div>
          <div>
            <input type="file" accept="image/*" onChange={handleMainImageChange} disabled={uploadingMain} />
            {uploadingMain && <p className="text-xs text-muted mt-1">Uploading…</p>}
          </div>
        </div>
      </div>

      {/* ---------- Gallery images ---------- */}
      <div className="mb-8">
        <label className="block text-xs text-muted mb-2">Detail / Gallery Images (multiple)</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {galleryImages.map((url, i) => (
            <div key={url + i} className="surface w-20 h-20 relative overflow-hidden">
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setGalleryImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 bg-bg/80 text-text text-xs rounded-full w-5 h-5 flex items-center justify-center"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={handleGalleryChange} disabled={uploadingGallery} />
        {uploadingGallery && <p className="text-xs text-muted mt-1">Uploading…</p>}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}
