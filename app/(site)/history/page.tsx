"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHistory, hasTrackingConsent, clearHistory, formatPrice, timeAgo, setCookieConsent, HistoryItem } from "@/lib/browsing-history";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [consented, setConsented] = useState(true);

  useEffect(() => {
    function refresh() {
      setConsented(hasTrackingConsent());
      setItems(getHistory());
    }
    refresh();
    window.addEventListener("twh:history-changed", refresh);
    window.addEventListener("twh:consent-changed", refresh);
    return () => {
      window.removeEventListener("twh:history-changed", refresh);
      window.removeEventListener("twh:consent-changed", refresh);
    };
  }, []);

  return (
    <div className="container-page py-10">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="eyebrow mb-2">Your activity, stored on this device</p>
          <h1 className="font-display text-3xl font-semibold">Browsing History</h1>
          <p className="text-muted text-sm mt-2 max-w-xl">
            Saved locally in this browser only — it is never sent to a server.
          </p>
        </div>
        <button className="btn-outline text-sm" onClick={clearHistory}>
          Clear history
        </button>
      </div>

      {!consented ? (
        <div className="surface p-6 mb-6">
          <p className="text-sm text-muted">
            Browsing history tracking is off because you haven&apos;t accepted cookies yet.{" "}
            <button
              className="text-accent underline"
              onClick={() => {
                setCookieConsent("accepted");
                setConsented(true);
              }}
            >
              Accept cookies
            </button>{" "}
            to start saving your recently viewed products.
          </p>
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted text-center py-16">No browsing history yet. Products you view will appear here.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <Link key={item.id} href={`/products/${item.id}`} className="product-card">
              <img src={item.main_image || "/placeholder-product.svg"} alt={item.name} className="product-card__media" loading="lazy" />
              <div className="p-3">
                <h4 className="text-xs leading-snug mb-1">{item.name}</h4>
                <p className="text-xs text-accent font-semibold">{formatPrice(item.price)}</p>
                <p className="text-xs text-muted mt-1">Viewed {timeAgo(item.viewedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
