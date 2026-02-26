/**
 * View Image for Google Images
 *
 * SECURITY & PRIVACY DESIGN:
 * - Zero external network requests
 * - Zero permissions beyond content script injection on Google search pages
 * - No data storage
 * - No background scripts or message passing
 * - All URLs extracted from existing page DOM
 * - Strict CSP via manifest
 *
 * HOW IT WORKS:
 * When you click an image in Google Images, a side panel opens. Inside that
 * panel, Google renders the preview image in an <img> tag (class "sFlh5c
 * FyHeAf iPVvYb") whose src is the actual image URL from the source website,
 * often with a resize parameter like ?w=1200. We grab that src, strip common
 * resize params to get the full-resolution URL, and inject a "View Image"
 * button next to the existing "Visit" button.
 */

(function () {
  "use strict";

  // Guard: only run on Google Images
  const url = window.location.href;
  const isGoogleImages =
    url.includes("tbm=isch") ||
    url.includes("udm=2") ||
    url.includes("/imgres");
  if (!isGoogleImages) return;

  // ── Constants ──────────────────────────────────────────────────────────
  const BUTTON_CLASS = "vi-ext-view-image-btn";
  const ROW_CLASS = "vi-ext-button-row";

  const IMAGE_ICON_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
  </svg>`;

  // ── URL Helpers ────────────────────────────────────────────────────────

  /**
   * Check if a URL is a Google proxy/thumbnail (NOT the real image)
   */
  function isGoogleProxyUrl(url) {
    if (!url) return true;
    if (url.startsWith("data:")) return true;
    if (url.includes("encrypted-tbn")) return true;
    if (url.includes("gstatic.com")) return true;
    if (url.includes("google.com/")) return true;
    if (url.includes("googleapis.com/")) return true;
    return false;
  }

  /**
   * Strip common resize/quality query parameters to get the true
   * full-resolution image URL.
   *
   * Examples:
   *   ?w=1200          → removed (common resize param)
   *   ?width=800       → removed
   *   ?resize=600,400  → removed
   *   ?quality=80&w=1200 → removed
   *
   * We preserve params that look like they're part of the image ID
   * (e.g., S3 signed URLs, CDN tokens).
   */
  function stripResizeParams(imageUrl) {
    try {
      const u = new URL(imageUrl);
      const resizeParams = [
        "w", "h", "width", "height", "resize", "size", "fit",
        "quality", "q", "auto", "format", "fm", "dpr",
        "crop", "ar",
      ];

      let changed = false;
      for (const param of resizeParams) {
        if (u.searchParams.has(param)) {
          u.searchParams.delete(param);
          changed = true;
        }
      }

      if (changed) {
        // If we removed all params, return clean URL without trailing ?
        const result = u.toString();
        return result.endsWith("?") ? result.slice(0, -1) : result;
      }
      return imageUrl;
    } catch (_) {
      return imageUrl;
    }
  }

  // ── Image URL Extraction from Panel ────────────────────────────────────

  /**
   * Find the actual full-resolution image URL from the preview panel.
   *
   * The panel contains an <img> with the real image URL. Google loads it
   * with classes like "sFlh5c FyHeAf iPVvYb". There's also a hidden
   * thumbnail <img> with class "sFlh5c FyHeAf" (without iPVvYb) that
   * has visibility:hidden — we skip that one.
   *
   * We use multiple strategies to find the right image:
   */
  function extractImageUrl(panel) {
    // Strategy 1: Find the visible, non-Google-proxy <img> in the image
    // preview area. The preview area is the <a> with class "YsLeY" that
    // also contains the "Visit" link destination.
    const previewLink = panel.querySelector("a.YsLeY");
    if (previewLink) {
      const imgs = previewLink.querySelectorAll("img");
      for (const img of imgs) {
        const src = img.src || "";
        // Skip hidden thumbnails and Google proxy URLs
        if (isGoogleProxyUrl(src)) continue;
        // Skip the hidden fallback thumbnail
        const style = window.getComputedStyle(img);
        if (style.visibility === "hidden" || style.display === "none") continue;
        // This is the real image
        return stripResizeParams(src);
      }
      // If all visible imgs were proxies, check if any non-proxy exists
      // (might be a timing issue where the real image hasn't loaded yet)
      for (const img of imgs) {
        const src = img.src || "";
        if (!isGoogleProxyUrl(src)) {
          return stripResizeParams(src);
        }
      }
    }

    // Strategy 2: Find any <img> with class containing "iPVvYb" (the
    // visible preview image class)
    const visiblePreview = panel.querySelector("img.iPVvYb");
    if (visiblePreview) {
      const src = visiblePreview.src || "";
      if (!isGoogleProxyUrl(src)) {
        return stripResizeParams(src);
      }
    }

    // Strategy 3: Look for the largest non-proxy <img> in the panel
    const allImgs = panel.querySelectorAll("img");
    let bestImg = null;
    let bestSize = 0;
    for (const img of allImgs) {
      const src = img.src || "";
      if (isGoogleProxyUrl(src)) continue;
      const size = (img.naturalWidth || img.width || 0) *
                   (img.naturalHeight || img.height || 0);
      if (size > bestSize) {
        bestSize = size;
        bestImg = src;
      }
    }
    if (bestImg) return stripResizeParams(bestImg);

    // Strategy 4: Find non-proxy img even if dimensions aren't available yet
    for (const img of allImgs) {
      const src = img.src || "";
      if (isGoogleProxyUrl(src) || src.startsWith("data:")) continue;
      // Accept it if it looks like a real URL
      if (src.startsWith("http")) {
        return stripResizeParams(src);
      }
    }

    return null;
  }

  // ── Button Creation ────────────────────────────────────────────────────

  function createViewImageButton(imageUrl) {
    const btn = document.createElement("a");
    btn.href = imageUrl;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.className = BUTTON_CLASS;
    btn.title = "Open full-resolution image in new tab";
    btn.setAttribute("role", "button");
    btn.innerHTML = IMAGE_ICON_SVG + " View image";

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    return btn;
  }

  // ── Visit Button Detection & Injection ─────────────────────────────────

  /**
   * Find "Visit" buttons and inject "View Image" next to them.
   *
   * The Visit button is an <a> with class "umNKYc" containing a <span>
   * with text "Visit". It's inside a div structure under the panel.
   */
  function processPanel(panel) {
    // Find the "Visit" button
    let visitButton = null;

    // Primary: find by the known class
    const visitByClass = panel.querySelector("a.umNKYc");
    if (visitByClass) {
      visitButton = visitByClass;
    }

    // Fallback: find by text content
    if (!visitButton) {
      const links = panel.querySelectorAll("a[href]");
      const visitTexts = new Set([
        "visit", "visitar", "visiter", "besuchen", "visitare",
        "visita", "アクセス", "방문", "访问", "造訪"
      ]);

      for (const link of links) {
        const text = (link.textContent || "").trim().toLowerCase();
        const href = link.href || "";
        if (visitTexts.has(text) && href.startsWith("http") && !href.includes("google.")) {
          visitButton = link;
          break;
        }
      }
    }

    if (!visitButton) return;

    const parent = visitButton.parentElement;
    if (!parent) return;

    // Get the image URL
    const imageUrl = extractImageUrl(panel);
    if (!imageUrl) return;

    // Check if button already exists
    const existingBtn = parent.querySelector("." + BUTTON_CLASS);
    if (existingBtn) {
      // Update URL if the user clicked a different image
      if (existingBtn.href !== imageUrl) {
        existingBtn.href = imageUrl;
      }
      return;
    }

    // Inject the button
    const viewImageBtn = createViewImageButton(imageUrl);

    if (!parent.classList.contains(ROW_CLASS)) {
      const row = document.createElement("div");
      row.className = ROW_CLASS;
      parent.insertBefore(row, visitButton);
      row.appendChild(visitButton);
      row.appendChild(viewImageBtn);
    } else {
      parent.appendChild(viewImageBtn);
    }
  }

  // ── Scanning ───────────────────────────────────────────────────────────

  /**
   * Scan the page for the image preview panel.
   *
   * The preview panel is the side panel or overlay that opens when you
   * click a Google Images result. It contains the Visit button, image
   * preview, and metadata.
   *
   * We find it by looking for:
   * 1. The container div with class "v6bUne" (the panel body)
   * 2. Or the outer container with class "hh1Ztf" (the full viewer)
   * 3. Fallback: any container with a Visit link
   */
  function scanForPanels() {
    // Primary: the known panel container class
    const panels = document.querySelectorAll(".v6bUne, .hh1Ztf, .islsp");
    for (const panel of panels) {
      processPanel(panel);
    }

    // Fallback: find Visit buttons and walk up to their container
    if (panels.length === 0) {
      const visitButtons = document.querySelectorAll("a.umNKYc");
      for (const btn of visitButtons) {
        const container =
          btn.closest(".v6bUne") ||
          btn.closest(".hh1Ztf") ||
          btn.closest("[jscontroller]") ||
          btn.parentElement?.parentElement?.parentElement;
        if (container) {
          processPanel(container);
        }
      }
    }
  }

  // ── Observer ───────────────────────────────────────────────────────────

  function startObserver() {
    scanForPanels();

    let scanScheduled = false;

    const observer = new MutationObserver(function () {
      if (!scanScheduled) {
        scanScheduled = true;
        requestAnimationFrame(function () {
          scanScheduled = false;
          scanForPanels();
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also listen for the preview image loading (it may load after the
    // panel DOM is already there, causing our initial scan to miss it)
    document.addEventListener("load", function (e) {
      if (e.target && e.target.tagName === "IMG") {
        // An image loaded — re-scan in case it's the preview image
        if (!scanScheduled) {
          scanScheduled = true;
          requestAnimationFrame(function () {
            scanScheduled = false;
            scanForPanels();
          });
        }
      }
    }, true); // capture phase to catch img load events
  }

  // ── Initialize ─────────────────────────────────────────────────────────

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }
})();
