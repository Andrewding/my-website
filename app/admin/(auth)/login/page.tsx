"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Login failed. Check your username and password.");
        return;
      }
      const redirectTo = searchParams.get("redirectTo") || "/admin/products";
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface p-8 w-full max-w-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <img src="/logo.svg" alt="ThermalWear logo" width={28} height={28} />
        <span className="font-display font-semibold">ThermalWear Admin</span>
      </div>

      {error && (
        <div className="text-sm text-accent mb-4 border border-accent/40 bg-accent/10 rounded-sm px-3 py-2">
          {error}
        </div>
      )}

      <label className="block text-xs text-muted mb-1.5" htmlFor="username">Username</label>
      <input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoComplete="username"
        className="field mb-4"
      />

      <label className="block text-xs text-muted mb-1.5" htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        className="field mb-6"
      />

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

// useSearchParams() requires a Suspense boundary in Next.js App Router,
// otherwise the page can't be statically analyzed during build.
export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
