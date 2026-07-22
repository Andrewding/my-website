"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/browsing-history";
import type { Product } from "@/lib/types";

export default function RecordView({ product }: { product: Product }) {
  useEffect(() => {
    recordView({
      id: product.id,
      name: product.name,
      main_image: product.main_image,
      category: product.category,
      price: product.price,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return null;
}
