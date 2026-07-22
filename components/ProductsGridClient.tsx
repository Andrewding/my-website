"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

export default function ProductsGridClient({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState("");

  const filtered = useMemo(() => {
    let items = [...initialProducts];

    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (category) {
      items = items.filter((p) => p.category === category);
    }

    if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
    else if (sort === "newest") items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    return items;
  }, [initialProducts, query, category, sort]);

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-8">
      {/* Filters sidebar */}
      <aside className="surface p-5 h-fit md:sticky md:top-24">
        <h2 className="font-display font-semibold text-sm mb-4">Filter &amp; Search</h2>

        <label className="block text-xs text-muted mb-1.5" htmlFor="filter-search">
          Keyword
        </label>
        <input
          id="filter-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="field mb-4 text-sm"
        />

        <label className="block text-xs text-muted mb-1.5" htmlFor="filter-category">
          Category
        </label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="field mb-4 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="block text-xs text-muted mb-1.5" htmlFor="filter-sort">
          Sort by
        </label>
        <select id="filter-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="field mb-5 text-sm">
          <option value="">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="newest">Newest</option>
        </select>

        <button
          type="button"
          className="btn-outline w-full text-sm"
          onClick={() => {
            setQuery("");
            setCategory("");
            setSort("");
          }}
        >
          Clear filters
        </button>
      </aside>

      {/* Grid */}
      <div>
        <p className="text-muted text-sm mb-4">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>
        {filtered.length === 0 ? (
          <p className="text-muted text-center py-16">No products match your filters. Try clearing a filter.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
