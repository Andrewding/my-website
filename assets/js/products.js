/* =========================================================
   products.js — catalog loading + rendering
   Reads data/products.json (single source of truth, edit that
   file to add/update/remove products — no code changes needed).
   ========================================================= */
(function () {
  "use strict";

  const DATA_URL = "data/products.json";
  let catalogPromise = null;

  function loadCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch(DATA_URL)
        .then(function (res) {
          if (!res.ok) throw new Error("Failed to load product data: " + res.status);
          return res.json();
        })
        .catch(function (err) {
          console.error(err);
          return { categories: [], products: [] };
        });
    }
    return catalogPromise;
  }

  function categoryName(catalog, catId) {
    const cat = catalog.categories.find(function (c) { return c.id === catId; });
    return cat ? cat.name : catId;
  }

  /* ---------- Card markup (used on homepage, products list, related, history) ---------- */
  function functionTags(p) {
    const t = [];
    if (p.functions && p.functions.temperature) t.push('<span class="tag-pill heat">Heat</span>');
    if (p.functions && p.functions.vibration) t.push('<span class="tag-pill vibe">Vibration</span>');
    return t.join("");
  }

  function productCardHTML(p) {
    const price = TWH.formatPrice(p.price, p.currency);
    const badge = p.bestSeller
      ? '<span class="tag-pill heat" style="position:absolute;top:0.75rem;left:0.75rem;">Best Seller</span>'
      : (p.newArrival ? '<span class="tag-pill vibe" style="position:absolute;top:0.75rem;left:0.75rem;">New</span>' : "");
    return (
      '<a href="product-detail.html?id=' + encodeURIComponent(p.id) + '" class="product-card block" data-id="' + p.id + '">' +
        '<div style="position:relative;">' + badge +
          '<img class="product-card__media" src="' + p.image + '" alt="' + TWH.escapeHtml(p.title) + '" loading="lazy">' +
        "</div>" +
        '<div class="p-4">' +
          '<div class="flex gap-1.5 mb-2 flex-wrap">' + functionTags(p) + "</div>" +
          '<h3 class="text-sm font-medium leading-snug mb-1" style="font-family:var(--font-display);">' + TWH.escapeHtml(p.title) + "</h3>" +
          '<p class="text-sm accent font-semibold">' + price + "</p>" +
        "</div>" +
      "</a>"
    );
  }

  function skeletonCardHTML() {
    return '<div class="product-card"><div class="product-card__media skeleton"></div><div class="p-4"><div class="skeleton" style="height:14px;width:80%;border-radius:4px;margin-bottom:8px;"></div><div class="skeleton" style="height:14px;width:40%;border-radius:4px;"></div></div></div>';
  }

  function renderGrid(container, products, emptyMessage) {
    if (!container) return;
    if (!products.length) {
      container.innerHTML = '<p class="text-muted col-span-full text-center py-16">' + (emptyMessage || "No products found.") + "</p>";
      return;
    }
    container.innerHTML = products.map(productCardHTML).join("");
  }

  /* ================= Homepage ================= */
  function initHomepage(catalog) {
    const bestSellersEl = document.getElementById("best-sellers-grid");
    if (bestSellersEl) {
      const best = catalog.products.filter(function (p) { return p.bestSeller; }).slice(0, 8);
      renderGrid(bestSellersEl, best);
    }

    const newArrivalsEl = document.getElementById("new-arrivals-grid");
    if (newArrivalsEl) {
      const news = catalog.products.filter(function (p) { return p.newArrival; }).slice(0, 8);
      renderGrid(newArrivalsEl, news);
    }

    initRecentlyViewedRail("recently-viewed-rail", null);
    initSiteSearch(catalog);
  }

  /* ================= Products listing page ================= */
  function initProductsPage(catalog) {
    const grid = document.getElementById("products-grid");
    const countEl = document.getElementById("results-count");
    const searchInput = document.getElementById("filter-search");
    const categorySelect = document.getElementById("filter-category");
    const heatCheckbox = document.getElementById("filter-heat");
    const vibeCheckbox = document.getElementById("filter-vibration");
    const priceSelect = document.getElementById("filter-price");
    const sortSelect = document.getElementById("filter-sort");
    const clearBtn = document.getElementById("filter-clear");

    // Populate category dropdown
    if (categorySelect) {
      catalog.categories.forEach(function (c) {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        categorySelect.appendChild(opt);
      });
    }

    // Read initial state from URL query params
    const params = new URLSearchParams(window.location.search);
    if (params.get("category") && categorySelect) categorySelect.value = params.get("category");
    if (params.get("q") && searchInput) searchInput.value = params.get("q");

    function applyFilters() {
      let items = catalog.products.slice();

      const q = (searchInput && searchInput.value || "").trim().toLowerCase();
      if (q) {
        items = items.filter(function (p) {
          return (
            p.title.toLowerCase().indexOf(q) !== -1 ||
            (p.shortDescription || "").toLowerCase().indexOf(q) !== -1 ||
            (p.tags || []).join(" ").toLowerCase().indexOf(q) !== -1
          );
        });
      }

      const cat = categorySelect && categorySelect.value;
      if (cat) items = items.filter(function (p) { return p.category === cat; });

      if (heatCheckbox && heatCheckbox.checked) {
        items = items.filter(function (p) { return p.functions && p.functions.temperature; });
      }
      if (vibeCheckbox && vibeCheckbox.checked) {
        items = items.filter(function (p) { return p.functions && p.functions.vibration; });
      }

      const priceRange = priceSelect && priceSelect.value;
      if (priceRange) {
        items = items.filter(function (p) {
          if (priceRange === "under30") return p.price < 30;
          if (priceRange === "30to40") return p.price >= 30 && p.price <= 40;
          if (priceRange === "over40") return p.price > 40;
          return true;
        });
      }

      const sortVal = sortSelect && sortSelect.value;
      if (sortVal === "price-asc") items.sort(function (a, b) { return a.price - b.price; });
      else if (sortVal === "price-desc") items.sort(function (a, b) { return b.price - a.price; });
      else if (sortVal === "newest") items.sort(function (a, b) { return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0); });

      renderGrid(grid, items, "No products match your filters. Try clearing a filter.");
      if (countEl) countEl.textContent = items.length + (items.length === 1 ? " product" : " products");
    }

    [searchInput, categorySelect, heatCheckbox, vibeCheckbox, priceSelect, sortSelect].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", applyFilters);
      el.addEventListener("change", applyFilters);
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        if (categorySelect) categorySelect.value = "";
        if (heatCheckbox) heatCheckbox.checked = false;
        if (vibeCheckbox) vibeCheckbox.checked = false;
        if (priceSelect) priceSelect.value = "";
        if (sortSelect) sortSelect.value = "";
        applyFilters();
      });
    }

    applyFilters();
  }

  /* ================= Product detail page ================= */
  function initProductDetail(catalog) {
    const root = document.getElementById("product-detail-root");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const product = catalog.products.find(function (p) { return p.id === id; }) || catalog.products[0];

    if (!product) {
      root.innerHTML = '<p class="text-muted py-24 text-center">Product not found. <a href="products.html" class="accent underline">Back to all products</a></p>';
      return;
    }

    document.title = product.title + " — ThermalWear";

    // Breadcrumb + title + price
    setText("pd-category", categoryName(catalog, product.category));
    setText("pd-title", product.title);
    setText("pd-price", TWH.formatPrice(product.price, product.currency));
    setText("pd-sku", product.sku);
    setText("pd-description", product.description);

    // Function tags
    const fnWrap = document.getElementById("pd-function-tags");
    if (fnWrap) fnWrap.innerHTML = functionTags(product) +
      (product.functions && product.functions.heatingDisplay ? '<span class="tag-pill">Heat / Vibration Display</span>' : "");

    // Gallery
    const mainImg = document.getElementById("pd-main-image");
    const thumbWrap = document.getElementById("pd-thumbnails");
    if (mainImg) mainImg.src = product.image;
    if (mainImg) mainImg.alt = product.title;
    if (thumbWrap) {
      thumbWrap.innerHTML = product.gallery.map(function (src, i) {
        return '<button type="button" class="pd-thumb border rounded-md overflow-hidden" data-src="' + src + '" style="border-color:var(--color-line);width:64px;height:64px;flex-shrink:0;">' +
          '<img src="' + src + '" alt="' + TWH.escapeHtml(product.title) + ' view ' + (i + 1) + '" style="width:100%;height:100%;object-fit:cover;">' +
        "</button>";
      }).join("");
      thumbWrap.querySelectorAll(".pd-thumb").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (mainImg) mainImg.src = btn.getAttribute("data-src");
        });
      });
    }

    // Video area
    const videoWrap = document.getElementById("pd-video");
    if (videoWrap) {
      if (product.video) {
        videoWrap.innerHTML = '<video controls style="width:100%;border-radius:var(--radius-md);" src="' + product.video + '"></video>';
      } else {
        videoWrap.innerHTML = '<div class="surface flex items-center justify-center text-muted text-sm" style="aspect-ratio:16/9;">Product video placeholder — add an .mp4 path in data/products.json</div>';
      }
    }

    // Features (bullets)
    const featuresEl = document.getElementById("pd-features");
    if (featuresEl) {
      featuresEl.innerHTML = product.features.map(function (f) {
        return '<li class="flex gap-2 items-start"><span class="dial" style="--dial-size:18px;margin-top:2px;"></span><span>' + TWH.escapeHtml(f) + "</span></li>";
      }).join("");
    }

    // Specs table
    const specsEl = document.getElementById("pd-specs");
    if (specsEl && product.specs) {
      const rows = [
        ["Material", product.specs.material],
        ["Voltage", product.specs.voltage],
        ["Battery / Gear", product.specs.batteryGear],
        ["Size", product.specs.size],
        ["Weight", product.specs.weight]
      ];
      specsEl.innerHTML = rows.map(function (r) {
        return '<tr class="border-b" style="border-color:var(--color-line);"><td class="py-2 pr-4 text-muted">' + r[0] + '</td><td class="py-2">' + TWH.escapeHtml(r[1]) + "</td></tr>";
      }).join("");
    }

    // Variants: colors / sizes / models
    renderVariantGroup("pd-colors", product.colors);
    renderVariantGroup("pd-sizes", product.sizes);
    renderVariantGroup("pd-models", product.models);

    // FAQ accordion
    const faqEl = document.getElementById("pd-faqs");
    if (faqEl && product.faqs) {
      faqEl.innerHTML = product.faqs.map(function (f, i) {
        return (
          '<div class="surface p-4">' +
            '<button type="button" class="faq-toggle w-full flex justify-between items-center text-left gap-4" aria-expanded="false" data-target="faq-a-' + i + '">' +
              '<span class="font-medium">' + TWH.escapeHtml(f.q) + '</span>' +
              '<span class="accent" aria-hidden="true">+</span>' +
            '</button>' +
            '<p id="faq-a-' + i + '" class="text-muted text-sm mt-3 hidden">' + TWH.escapeHtml(f.a) + "</p>" +
          "</div>"
        );
      }).join("");
      faqEl.querySelectorAll(".faq-toggle").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const target = document.getElementById(btn.getAttribute("data-target"));
          const expanded = btn.getAttribute("aria-expanded") === "true";
          btn.setAttribute("aria-expanded", String(!expanded));
          if (target) target.classList.toggle("hidden");
        });
      });
    }

    // Reviews placeholder
    const reviewsEl = document.getElementById("pd-reviews");
    if (reviewsEl) {
      reviewsEl.innerHTML = '<div class="surface p-6 text-center text-muted text-sm">Amazon buyer reviews will be imported here in a future update. This section is reserved and ready for that integration.</div>';
    }

    // Related products (same category, excluding current)
    const relatedEl = document.getElementById("pd-related-grid");
    if (relatedEl) {
      const related = catalog.products
        .filter(function (p) { return p.category === product.category && p.id !== product.id; })
        .slice(0, 4);
      renderGrid(relatedEl, related, "No related products yet.");
    }

    // Record browsing history
    TWH.recordView(product);
    initRecentlyViewedRail("recently-viewed-rail", product.id);
  }

  function renderVariantGroup(elId, values) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (!values || !values.length) { el.closest(".pd-variant-row") && el.closest(".pd-variant-row").classList.add("hidden"); return; }
    el.innerHTML = values.map(function (v, i) {
      return '<button type="button" class="pd-variant-btn btn btn-outline' + (i === 0 ? " is-selected" : "") + '" style="padding:0.4rem 0.9rem;font-size:0.82rem;">' + TWH.escapeHtml(v) + "</button>";
    }).join("");
    el.querySelectorAll(".pd-variant-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        el.querySelectorAll(".pd-variant-btn").forEach(function (b) {
          b.classList.remove("is-selected");
          b.style.borderColor = "";
          b.style.color = "";
        });
        btn.classList.add("is-selected");
        btn.style.borderColor = "var(--color-accent)";
        btn.style.color = "var(--color-accent)";
      });
    });
    // style first as selected
    const first = el.querySelector(".pd-variant-btn.is-selected");
    if (first) { first.style.borderColor = "var(--color-accent)"; first.style.color = "var(--color-accent)"; }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  }

  /* ================= Recently viewed (rail + full history page) ================= */
  function initRecentlyViewedRail(containerId, excludeId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    function render() {
      let history = TWH.getHistory();
      if (excludeId) history = history.filter(function (h) { return h.id !== excludeId; });
      const wrapper = el.closest("[data-history-section]");

      if (!TWH.hasTrackingConsent()) {
        if (wrapper) wrapper.classList.add("hidden");
        return;
      }
      if (!history.length) {
        if (wrapper) wrapper.classList.add("hidden");
        return;
      }
      if (wrapper) wrapper.classList.remove("hidden");

      el.innerHTML = history.slice(0, 12).map(function (h) {
        return (
          '<a href="product-detail.html?id=' + encodeURIComponent(h.id) + '" class="product-card block" style="min-width:180px;max-width:180px;">' +
            '<img class="product-card__media" src="' + h.image + '" alt="' + TWH.escapeHtml(h.title) + '" loading="lazy">' +
            '<div class="p-3">' +
              '<h4 class="text-xs leading-snug mb-1 line-clamp-2">' + TWH.escapeHtml(h.title) + "</h4>" +
              '<p class="text-xs accent font-semibold">' + TWH.formatPrice(h.price, h.currency) + "</p>" +
              '<p class="text-xs text-muted mt-1">' + TWH.timeAgo(h.viewedAt) + "</p>" +
            "</div>" +
          "</a>"
        );
      }).join("");
    }

    render();
    document.addEventListener("twh:history-cleared", render);
    document.addEventListener("twh:consent-changed", render);
  }

  function initHistoryPage() {
    const el = document.getElementById("history-full-list");
    if (!el) return;

    function render() {
      const history = TWH.getHistory();
      const consentNotice = document.getElementById("history-consent-notice");
      if (!TWH.hasTrackingConsent()) {
        if (consentNotice) consentNotice.classList.remove("hidden");
        el.innerHTML = "";
        return;
      }
      if (consentNotice) consentNotice.classList.add("hidden");

      if (!history.length) {
        el.innerHTML = '<p class="text-muted text-center py-16">No browsing history yet. Products you view will appear here.</p>';
        return;
      }
      el.innerHTML = history.map(function (h) {
        return (
          '<a href="product-detail.html?id=' + encodeURIComponent(h.id) + '" class="product-card block">' +
            '<img class="product-card__media" src="' + h.image + '" alt="' + TWH.escapeHtml(h.title) + '" loading="lazy">' +
            '<div class="p-3">' +
              '<h4 class="text-xs leading-snug mb-1">' + TWH.escapeHtml(h.title) + "</h4>" +
              '<p class="text-xs accent font-semibold">' + TWH.formatPrice(h.price, h.currency) + "</p>" +
              '<p class="text-xs text-muted mt-1">Viewed ' + TWH.timeAgo(h.viewedAt) + "</p>" +
            "</div>" +
          "</a>"
        );
      }).join("");
    }

    render();

    const clearBtn = document.getElementById("history-clear-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        TWH.clearHistory();
        render();
      });
    }
    document.addEventListener("twh:consent-changed", render);
  }

  /* ================= Global search (header search box, homepage) ================= */
  function initSiteSearch(catalog) {
    const forms = document.querySelectorAll("[data-site-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const input = form.querySelector("input[type=search], input[type=text]");
        const q = input ? input.value.trim() : "";
        window.location.href = "products.html" + (q ? "?q=" + encodeURIComponent(q) : "");
      });
    });
  }

  /* ================= Category quick-entry links (homepage) ================= */
  function initCategoryLinks() {
    document.querySelectorAll("[data-category-link]").forEach(function (el) {
      const cat = el.getAttribute("data-category-link");
      el.setAttribute("href", "products.html?category=" + encodeURIComponent(cat));
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    loadCatalog().then(function (catalog) {
      initCategoryLinks();
      initHomepage(catalog);
      initProductsPage(catalog);
      initProductDetail(catalog);
      initHistoryPage();
      initSiteSearch(catalog);
    });
  });

  window.TWHProducts = { loadCatalog: loadCatalog, productCardHTML: productCardHTML };
})();
