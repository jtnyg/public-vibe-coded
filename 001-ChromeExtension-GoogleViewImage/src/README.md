# Google: View Image [JTY]

A privacy-first Chrome extension that adds a **"View image"** button to Google Images search results.

When you click on an image in Google Images and see the **"Visit"** button, this extension adds a **"View image"** button right next to it that takes you directly to the full-resolution image URL (the actual .jpg/.png file).

---

## Installation

1. Download and unzip this folder to your computer
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **"Load unpacked"**
5. Select the `view-image-button-jeff` folder
6. Navigate to [Google Images](https://images.google.com), search for something, and click any image result — you'll see the new "View image" button next to "Visit"

---

## How It Works

Google Images doesn't expose the original image URLs in obvious places. Instead, when you click a search result, Google renders a preview panel with the actual image loaded in an `<img>` tag — often with resize parameters appended (like `?w=1200`). This extension finds that image, strips the resize parameters, and gives you a direct link.

---

## Execution Flow (Step-by-Step)

This section is for security-focused users who want to understand exactly what the extension does before auditing the code themselves.

**On browser startup / extension load:**

1. Chrome reads `manifest.json` and registers a content script to inject on Google search pages only (14 specific `google.*/search*` domains). No background script runs. No permissions are requested.

**When you navigate to a Google Images page:**

2. Chrome injects `content.js` and `styles.css` into the page.
3. The script checks the URL for `tbm=isch` or `udm=2` (Google Images indicators). If neither is present, the script exits immediately and does nothing.
4. A `MutationObserver` is attached to `document.body`, watching for child element additions (this is necessary because Google Images is a Single Page Application that loads content dynamically).
5. An image `load` event listener is added (capture phase) to detect when preview images finish loading.

**When a DOM change or image load is detected:**

6. The observer/listener fires `scanForPanels()`, debounced to once per animation frame to avoid performance impact.
7. `scanForPanels()` queries the page for Google's preview panel containers (`.v6bUne`, `.hh1Ztf`, `.islsp`) or falls back to finding `a.umNKYc` (the Visit button class) and walking up the DOM.
8. For each panel found, `processPanel()` runs.

**Inside `processPanel()`:**

9. It searches for the "Visit" button — first by class `a.umNKYc`, then by scanning `<a>` tags for one with text matching "Visit" (or translations) that links to a non-Google external URL.
10. If no Visit button is found, it returns and does nothing.
11. If a "View image" button already exists next to Visit, it checks whether the URL needs updating (user clicked a different image) and returns.
12. `extractImageUrl()` runs to find the actual image URL from the panel DOM:
    - Looks inside `a.YsLeY` (the preview image link) for `<img>` tags whose `src` is not a Google proxy (`encrypted-tbn`, `gstatic.com`, etc.) and is not hidden via CSS
    - Falls back to finding `img.iPVvYb` (Google's visible preview image class)
    - Falls back to finding the largest non-proxy image in the panel
    - Falls back to accepting any non-proxy `http` image src
13. `stripResizeParams()` removes common CDN resize query parameters (`?w=`, `?width=`, `?quality=`, etc.) from the URL to yield the full-resolution version.
14. A standard `<a>` element is created with `target="_blank"` and `rel="noopener noreferrer"`, classed for styling, with the image URL as its `href`.
15. The button is inserted into the DOM next to the Visit button, wrapped in a flex row container.

**That's it.** No data leaves the page. No storage is written. No Chrome APIs are called. The entire extension is a DOM reader that creates one `<a>` link.

---

## Security & Privacy Design

This extension was built with a **zero-trust, minimal-privilege** philosophy.

### What This Extension Does NOT Do

| Risk Category               | Status |
| --------------------------- | ------ |
| Make external network requests | **None** — zero fetch, XHR, WebSocket, or beacon calls |
| Collect or transmit user data  | **None** — no analytics, no telemetry |
| Use browser storage            | **None** — no localStorage, cookies, IndexedDB, or chrome.storage |
| Run background scripts         | **None** — no service worker, no background page |
| Request broad permissions      | **None** — no `<all_urls>`, no `tabs`, no `webRequest` |
| Include third-party code       | **None** — zero external dependencies or CDN imports |
| Use remote code execution      | **None** — no `eval()`, no inline scripts, strict CSP |

### Permission Audit

```json
"permissions": []          // No special Chrome API permissions
"host_permissions": []     // No host permissions
"content_scripts.matches": // Only runs on google.com/search pages
```

### How to Audit This Extension

1. **`manifest.json`** — Confirm empty `permissions` and `host_permissions` arrays. Confirm the CSP blocks inline scripts and object embeds. Confirm no background script.
2. **`content.js`** (~344 lines) — Confirm zero `fetch()`, `XMLHttpRequest`, `eval()`, `chrome.*` API calls, `localStorage`, or `document.cookie` usage.
3. **`styles.css`** — Confirm no `@import` or external `url()` references.
4. **`icons/`** — Static PNG files only.

---

## File Structure

```
view-image-button-jeff/
├── manifest.json    # Extension manifest (Manifest V3, minimal permissions)
├── content.js       # Content script (image URL extraction + button injection)
├── styles.css       # Button styling (matches Google's native UI)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## Troubleshooting

**Button doesn't appear?**
Google frequently updates their Images UI. The extension re-scans on every DOM change, but if Google changes their panel class names, the selectors in `scanForPanels()` and `processPanel()` may need updating.

**Button appears but links to wrong URL?**
The `extractImageUrl()` function prioritizes the visible, non-Google-proxy image in the preview panel. If Google changes how they render the preview image, this function may need adjustment.

**Works for some images but not others?**
The preview image may not have loaded yet when the panel first appears. The extension listens for image `load` events and re-scans, but try clicking the image again after a moment.

---

## License

MIT — Use freely, modify freely, audit freely.
