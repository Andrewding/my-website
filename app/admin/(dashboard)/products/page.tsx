"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to load products");
      const body = await res.json();
      setProducts(body.products as Product[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(product: Product) {
    const newStatus = product.status === "active" ? "inactive" : "active";
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, status: newStatus }),
    });
    if (res.ok) load();
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">+ New Product</Link>
      </div>

      {error && <p className="text-accent text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-muted text-sm">No products yet. Click &quot;New Product&quot; to add your first one.</p>
      ) : (
        <div className="surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-muted text-left">
                <th className="p-3 font-medium">Image</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <img src={p.main_image || "/placeholder-product.svg"} alt={p.name} className="w-12 h-12 object-cover rounded-sm" />
                  </td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-muted">{p.category}</td>
                  <td className="p-3 text-accent">${Number(p.price).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`tag-pill ${p.status === "active" ? "heat" : ""}`}>{p.status}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3 text-xs">
                      <Link href={`/admin/products/${p.id}`} className="text-accent2 hover:underline">Edit</Link>
                      <button onClick={() => toggleStatus(p)} className="text-muted hover:text-text">
                        {p.status === "active" ? "Take off-shelf" : "Put on-shelf"}
                      </button>
                      <button onClick={() => deleteProduct(p)} className="text-accent hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
