import Link from "next/link";
import { supabasePublic } from "@/lib/supabase/public";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import RecentlyViewedRail from "@/components/RecentlyViewedRail";
import { CATEGORIES } from "@/lib/types";

// Renders fresh on every request so newly published/edited products from the
// admin back office show up immediately without a redeploy.
export const dynamic = "force-dynamic";

async function getHomepageProducts() {
  // "Best sellers" = first active products; swap the .order() below for a
  // real popularity metric later if you add one. "New arrivals" = most
  // recently created active products.
  const [{ data: bestSellers }, { data: newArrivals }] = await Promise.all([
    supabasePublic.from("products").select("*").eq("status", "active").order("created_at", { ascending: true }).limit(8),
    supabasePublic.from("products").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(8),
  ]);
  return {
    bestSellers: (bestSellers as Product[]) || [],
    newArrivals: (newArrivals as Product[]) || [],
  };
}

export default async function HomePage() {
  const { bestSellers, newArrivals } = await getHomepageProducts();

  return (
    <>
      {/* Hero */}
      <section className="container-page pt-6 md:pt-10">
        <div className="surface overflow-hidden rounded-lg">
          <img src="/hero-1.svg" alt="Warmth that moves with you" className="w-full block" />
        </div>
      </section>

      {/* Category quick entry */}
      <section className="container-page py-14">
        <p className="eyebrow mb-2">Shop by category</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">Find your warmth</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/products?category=${c.id}`} className="surface p-6 flex items-center gap-4">
              <span className="dial" style={{ ["--dial-size" as string]: "44px" }} />
              <div>
                <h3 className="font-display font-semibold">{c.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="container-page py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow mb-2">Customer favorites</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold">Best-selling warmth</h2>
          </div>
          <Link href="/products" className="btn-outline text-sm hidden sm:inline-flex">
            View all products
          </Link>
        </div>
        {bestSellers.length === 0 ? (
          <p className="text-muted text-sm">No products yet — add one from the admin back office at /admin.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <RecentlyViewedRail />

      {/* New arrivals */}
      <section className="container-page py-14">
        <p className="eyebrow mb-2">Just landed</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">New Arrivals</h2>
        {newArrivals.length === 0 ? (
          <p className="text-muted text-sm">Nothing here yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
