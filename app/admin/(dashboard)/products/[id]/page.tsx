import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Product } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await supabaseAdmin.from("products").select("*").eq("id", id).maybeSingle();
  return (data as Product) || null;
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-8">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}
