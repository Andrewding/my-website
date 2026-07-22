/* =========================================================
   main.js — global site behaviour
   Runs on every page: nav, cookie consent, browsing history store
   No external dependencies, no frameworks.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Config ---------- */
  const STORAGE_KEYS = {
    history: "twh_browsing_history",     // ThermalWear Heat browsing history
    cookieConsent: "twh_cookie_consent",
    userMode: "twh_user_mode"            // "guest" | "registered" (simulated, no backend)
  };
  const MAX_HISTORY_ITEMS = 24;

  /* ---------- Mobile nav toggle ---------- */
  function initNav() {
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      const isOpen = menu.classList.toggle("hidden");
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });

    // Mark active link
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("active");
      }
    });
  }

  /* ---------- Cookie consent (EU compliance) ---------- */
  function getCookieConsent() {
    try {
      return localStorage.getItem(STORAGE_KEYS.cookieConsent);
    } catch (e) {
      return null;
    }
  }

  function setCookieConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEYS.cookieConsent, value);
    } catch (e) {
      /* localStorage unavailable — consent banner will simply reappear */
    }
    document.dispatchEvent(new CustomEvent("twh:consent-changed", { detail: { value: value } }));
  }

  function hasTrackingConsent() {
    return getCookieConsent() === "accepted";
  }

  function initCookieBanner() {
    const banner = document.getElementById("cookie-banner");
    if (!banner) return;
    const consent = getCookieConsent();

    if (!consent) {
      banner.classList.remove("hidden");
    }

    const acceptBtn = document.getElementById("cookie-accept");
    const declineBtn = document.getElementById("cookie-decline");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        setCookieConsent("accepted");
        banner.classList.add("hidden");
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener("click", function () {
        setCookieConsent("declined");
        banner.classList.add("hidden");
      });
    }
  }

  /* ---------- Browsing history (guest = localStorage; "registered" also
     uses localStorage in this static, no-backend version — see README) ---------- */
  function getHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.history);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(list) {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(list));
    } catch (e) {
      /* storage full or unavailable: fail silently, feature degrades gracefully */
    }
  }

  function recordView(product) {
    if (!hasTrackingConsent()) return; // EU compliance: no tracking before consent
    if (!product || !product.id) return;

    let history = getHistory();
    history = history.filter(function (item) { return item.id !== product.id; });
    history.unshift({
      id: product.id,
      title: product.title,
      image: product.image,
      category: product.category,
      price: product.price,
      currency: product.currency,
      viewedAt: new Date().toISOString()
    });
    if (history.length > MAX_HISTORY_ITEMS) history = history.slice(0, MAX_HISTORY_ITEMS);
    saveHistory(history);
  }

  function clearHistory() {
    saveHistory([]);
    document.dispatchEvent(new CustomEvent("twh:history-cleared"));
  }

  /* ---------- Formatting helpers ---------- */
  function formatPrice(price, currency) {
    const c = currency || "USD";
    const symbol = c === "USD" ? "$" : c + " ";
    return symbol + Number(price).toFixed(2);
  }

  function timeAgo(isoString) {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + " min ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + " hr ago";
    const days = Math.floor(hrs / 24);
    return days + " day" + (days > 1 ? "s" : "") + " ago";
  }

  function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ---------- Contact form (static — no backend, shows confirmation only) ---------- */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const status = document.getElementById("contact-status");
      if (status) {
        status.textContent = "Thanks — your message has been captured locally in this demo. Connect a form backend (e.g. Formspree) before going live.";
        status.classList.remove("hidden");
      }
      form.reset();
    });
  }

  /* ---------- Init on DOM ready ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initCookieBanner();
    initContactForm();
    // Footer year
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  });

  /* ---------- Expose shared API ---------- */
  window.TWH = {
    STORAGE_KEYS: STORAGE_KEYS,
    hasTrackingConsent: hasTrackingConsent,
    getCookieConsent: getCookieConsent,
    setCookieConsent: setCookieConsent,
    getHistory: getHistory,
    recordView: recordView,
    clearHistory: clearHistory,
    formatPrice: formatPrice,
    timeAgo: timeAgo,
    escapeHtml: escapeHtml
  };
})();
