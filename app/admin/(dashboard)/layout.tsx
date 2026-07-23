"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg text-text flex">
      <aside className="w-56 shrink-0 border-r border-line p-5 hidden sm:flex flex-col">
        <div className="flex items-center gap-2.5 mb-8">
          <img src="/logo.svg" alt="ThermalWear logo" width={26} height={26} />
          <span className="font-display font-semibold text-sm">Admin</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          <Link
            href="/admin/products"
            className={`text-sm px-3 py-2 rounded-sm ${pathname?.startsWith("/admin/products") ? "bg-surface text-accent" : "text-muted hover:text-text"}`}
          >
            Products
          </Link>
          <Link
            href="/admin/pages"
            className={`text-sm px-3 py-2 rounded-sm ${pathname?.startsWith("/admin/pages") ? "bg-surface text-accent" : "text-muted hover:text-text"}`}
          >
            Site Pages
          </Link>
          <Link href="/" target="_blank" className="text-sm px-3 py-2 rounded-sm text-muted hover:text-text">
            View storefront ↗
          </Link>
        </nav>
        <button onClick={handleLogout} className="btn-outline text-sm w-full">
          Log out
        </button>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Mobile top bar (sidebar is desktop-only above for simplicity) */}
        <div className="sm:hidden flex items-center justify-between p-4 border-b border-line">
          <span className="font-display font-semibold text-sm">ThermalWear Admin</span>
          <button onClick={handleLogout} className="btn-ghost text-sm">Log out</button>
        </div>
        <div className="p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
