import Link from "next/link";
import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";
import type { Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import RecentlyViewedRail from "@/components/RecentlyViewedRail";
import RecordView from "@/components/RecordView";

export const dynamic = "force-dynamic";

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await supabasePublic.from("products").select("*").eq("id", id).eq("status", "active").maybeSingle();
  return (data as Product) || null;
}

async function getRelated(category: string, excludeId: string): Promise<Product[]> {
  const { data } = await supabasePublic
    .from("products")
    .select("*")
    .eq("status", "active")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(4);
  return (data as Product[]) || [];
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const related = await getRelated(product.category, product.id);
  const categoryName = CATEGORIES.find((c) => c.id === product.category)?.name || product.category;
  const specEntries = Object.entries(product.specs || {});
  const gallery = [product.main_image, ...(product.gallery_images || [])].filter(Boolean) as string[];

  return (
    <div className="container-page py-10">
      <RecordView product={product} />

      <p className="text-sm text-muted mb-6">
        <Link href="/" className="hover:text-accent">Home</Link> /{" "}
        <Link href="/products" className="hover:text-accent">All Products</Link> / {categoryName}
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        <ProductGallery images={gallery} alt={product.name} />

        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold mb-2">{product.name}</h1>
          <p className="text-2xl text-accent font-semibold font-display mb-6">${Number(product.price).toFixed(2)}</p>

          <div className="flex gap-3">
            <Link href="/contact" className="btn-primary flex-1 text-center">
              Ask About This Product
            </Link>
            <Link href="/products" className="btn-outline flex-1 text-center">
              Back to Catalog
            </Link>
          </div>
          <p className="text-xs text-muted mt-3">
            This display site does not process orders yet. To purchase, visit our Amazon storefront (link reserved for a future update).
          </p>
        </div>
      </div>

      <section className="mt-16 grid md:grid-cols-[2fr_1fr] gap-10">
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">Product Description</h2>
          <p className="text-muted leading-relaxed mb-10 whitespace-pre-line">{product.description}</p>

          {specEntries.length > 0 && (
            <>
              <h2 className="font-display text-xl font-semibold mb-4">Specifications</h2>
              <table className="w-full text-sm mb-10">
                <tbody>
                  {specEntries.map(([label, value]) => (
                    <tr key={label} className="border-b border-line">
                      <td className="py-2 pr-4 text-muted">{label}</td>
                      <td className="py-2">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <h2 className="font-display text-xl font-semibold mb-4">Customer Reviews</h2>
          <div className="surface p-6 text-center text-muted text-sm">
            Amazon buyer reviews will be imported here in a future update. This section is reserved and ready for that integration.
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-semibold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewedRail excludeId={product.id} />
    </div>
  );
}
