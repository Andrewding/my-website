"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/types";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : "/products");
  }

  const navLink = (href: string, label: string) => (
    <Link href={href} className={`nav-link ${pathname === href ? "active" : ""}`}>
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur border-b border-line">
      <div className="container-page flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="ThermalWear logo" width={32} height={32} />
          <span className="font-display font-semibold text-lg tracking-tight">ThermalWear</span>
        </Link>

        <nav className={`md:flex items-center gap-7 ${menuOpen ? "flex flex-col absolute top-full left-0 right-0 bg-bg border-b border-line p-5 gap-4" : "hidden"}`}>
          {navLink("/", "Home")}
          {navLink("/products", "All Products")}
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/products?category=${c.id}`} className="nav-link">
              {c.name}
            </Link>
          ))}
          {navLink("/about", "About Us")}
          {navLink("/contact", "Contact Us")}
        </nav>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="field"
              style={{ width: 180, padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
            />
          </form>
          <Link href="/history" className="btn-ghost hidden sm:inline-flex">
            History
          </Link>
          <button
            className="md:hidden btn-ghost"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
