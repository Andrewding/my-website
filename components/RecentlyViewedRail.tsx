"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHistory, hasTrackingConsent, timeAgo, formatPrice, HistoryItem } from "@/lib/browsing-history";

export default function RecentlyViewedRail({ excludeId, title = "You Recently Viewed" }: { excludeId?: string; title?: string }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    function refresh() {
      setConsented(hasTrackingConsent());
      const history = getHistory().filter((h) => h.id !== excludeId);
      setItems(history.slice(0, 12));
    }
    refresh();
    window.addEventListener("twh:history-changed", refresh);
    window.addEventListener("twh:consent-changed", refresh);
    return () => {
      window.removeEventListener("twh:history-changed", refresh);
      window.removeEventListener("twh:consent-changed", refresh);
    };
  }, [excludeId]);

  if (!consented || items.length === 0) return null;

  return (
    <section className="container-page py-10">
      <h3 className="font-display text-sm font-semibold mb-4">{title}</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link key={item.id} href={`/products/${item.id}`} className="product-card" style={{ minWidth: 180, maxWidth: 180 }}>
            <img src={item.main_image || "/placeholder-product.svg"} alt={item.name} className="product-card__media" loading="lazy" />
            <div className="p-3">
              <h4 className="text-xs leading-snug mb-1 line-clamp-2">{item.name}</h4>
              <p className="text-xs text-accent font-semibold">{formatPrice(item.price)}</p>
              <p className="text-xs text-muted mt-1">{timeAgo(item.viewedAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
