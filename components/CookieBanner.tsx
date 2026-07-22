"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCookieConsent, setCookieConsent } from "@/lib/browsing-history";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 bottom-0 z-[60] bg-surface border-t border-line shadow-[0_-8px_30px_rgba(0,0,0,0.35)]">
      <div className="container-page py-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-muted flex-1">
          We use cookies to remember your browsing history and improve your experience. Read our{" "}
          <Link href="/privacy" className="text-accent underline">
            Privacy Policy
          </Link>
          . We only start tracking after you accept.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            className="btn-outline text-sm"
            onClick={() => {
              setCookieConsent("declined");
              setVisible(false);
            }}
          >
            Decline
          </button>
          <button
            className="btn-primary text-sm"
            onClick={() => {
              setCookieConsent("accepted");
              setVisible(false);
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
