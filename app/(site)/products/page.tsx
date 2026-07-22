import { supabasePublic } from "@/lib/supabase/public";
import type { Product } from "@/lib/types";
import ProductsGridClient from "@/components/ProductsGridClient";

export const dynamic = "force-dynamic";

async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabasePublic
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load products from Supabase:", error.message);
    return [];
  }
  return data as Product[];
}

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">Catalog</p>
        <h1 className="font-display text-3xl font-semibold">All Products</h1>
      </div>
      <ProductsGridClient initialProducts={products} />
    </div>
  );
}
