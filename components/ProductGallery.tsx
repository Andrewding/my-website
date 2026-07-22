"use client";

import { useState } from "react";

export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const gallery = images.length > 0 ? images : ["/placeholder-product.svg"];
  const [active, setActive] = useState(gallery[0]);

  return (
    <div>
      <div className="surface overflow-hidden mb-3">
        <img src={active} alt={alt} className="w-full aspect-square object-cover block" />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(src)}
              className="rounded-md overflow-hidden border shrink-0"
              style={{ borderColor: active === src ? "#FF6B35" : "#2C333D", width: 64, height: 64 }}
            >
              <img src={src} alt={`${alt} view ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
