import Link from "next/link";
import { CATEGORIES } from "@/lib/types";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-page py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2.5 mb-3">
            <img src="/logo.svg" alt="ThermalWear logo" width={28} height={28} />
            <span className="font-display font-semibold">ThermalWear</span>
          </Link>
          <p className="text-muted text-sm">Heated massage wearables for everyday comfort.</p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-muted">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/products?category=${c.id}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/shipping">Shipping Policy</Link></li>
            <li><Link href="/return">Return &amp; Refund Policy</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Contact</h4>
          <p className="text-muted text-sm">vip@comeawm.com</p>
        </div>
      </div>
      <div className="container-page py-6 text-xs text-muted border-t border-line">
        © {new Date().getFullYear()} ThermalWear. All rights reserved.
      </div>
    </footer>
  );
}
