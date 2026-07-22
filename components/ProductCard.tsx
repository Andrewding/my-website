import Link from "next/link";
import type { Product } from "@/lib/types";

// Using a plain <img> here on purpose instead of next/image: product photos
// come from Supabase Storage (a dynamic, arbitrary URL) and this avoids
// having to keep next.config.mjs remotePatterns / SVG allow-list in sync
// every time you point at a different bucket or add placeholder art.
export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="product-card">
      <img
        src={product.main_image || "/placeholder-product.svg"}
        alt={product.name}
        className="product-card__media"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="text-sm font-medium leading-snug mb-1 font-display">{product.name}</h3>
        <p className="text-sm text-accent font-semibold">${Number(product.price).toFixed(2)}</p>
      </div>
    </Link>
  );
}
