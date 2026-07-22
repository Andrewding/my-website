"use client";

// Browsing history is still stored in the visitor's own browser via
// localStorage — this part is unrelated to the Supabase admin/backend work,
// it's just carried over as-is from the original static site.

export const HISTORY_KEY = "twh_browsing_history";
export const CONSENT_KEY = "twh_cookie_consent";
const MAX_HISTORY_ITEMS = 24;

export interface HistoryItem {
  id: string;
  name: string;
  main_image: string | null;
  category: string;
  price: number;
  viewedAt: string;
}

export function hasTrackingConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function getCookieConsent(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function setCookieConsent(value: "accepted" | "declined") {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("twh:consent-changed"));
}

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {
    /* storage full/unavailable — feature just degrades gracefully */
  }
}

export function recordView(item: Omit<HistoryItem, "viewedAt">) {
  if (!hasTrackingConsent()) return;
  let history = getHistory().filter((h) => h.id !== item.id);
  history.unshift({ ...item, viewedAt: new Date().toISOString() });
  if (history.length > MAX_HISTORY_ITEMS) history = history.slice(0, MAX_HISTORY_ITEMS);
  saveHistory(history);
  window.dispatchEvent(new CustomEvent("twh:history-changed"));
}

export function clearHistory() {
  saveHistory([]);
  window.dispatchEvent(new CustomEvent("twh:history-changed"));
}

export function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function formatPrice(price: number): string {
  return `$${Number(price).toFixed(2)}`;
}
