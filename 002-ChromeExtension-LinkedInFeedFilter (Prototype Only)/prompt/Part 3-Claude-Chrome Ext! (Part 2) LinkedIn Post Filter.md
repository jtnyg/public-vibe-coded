# Chrome Ext! (Part 2) LinkedIn Post Filter

**Created:** 2/25/2026 10:31:07  
**Updated:** 2/25/2026 18:07:20  
**Exported:** 2/26/2026 16:28:41  

## Prompt:
2/25/2026, 6:01:05 PM

> File: linkedin-filter-jty.zip

I'm building Chrome Extension to Filter out undesired Linkedin posts. Need help continuing to troubleshoot technical issues, improve UI usability, and be a thought partner.
* This new chat is because the earlier chat was getting too long. 
* Please review the attached zip file contains the latest code generated.
* Let me know when done.



## Response:
2/25/2026, 6:02:10 PM

I'll review the full codebase from your uploaded zip file to get up to speed.

````plaintext
Bash Tool: List contents of the zip file
````

````plaintext
Bash Tool: Extract the zip for review
````

````plaintext
View: Review manifest
````

````plaintext
View: Review default settings
````

````plaintext
View: Review content.js
````

````plaintext
View: Review content.css
````

````plaintext
View: Review popup.html
````

````plaintext
View: Review truncated section of popup.html
````

````plaintext
View: Review popup.js - first half
````

````plaintext
View: Review popup.js - second portion
````

````plaintext
View: Review popup.js - rest of file
````

I've also pulled context from our previous conversations to stay in sync.

````plaintext
Tool: Looking for relevant chats in this project...
````

All reviewed. Here's where things stand:

**The codebase is clean and well-structured.** You've got a solid Manifest v3 extension with a clear separation: `default-settings.js` for config, `content.js` for feed scanning/filtering, `popup.js`/`popup.html` for the UI, and `content.css` for the CSS `!important` hide rule. The privacy-first principles are consistent throughout — zero network requests, `chrome.storage.local` only, minimal permissions.

Here's my assessment of the current state, organized by what's working well and what needs attention:

**What's solid:**
- MECE category cascade with first-match-wins priority logic
- MutationObserver + `requestAnimationFrame` debounce for feed watching
- Settings sync between popup and content script via both `chrome.storage.onChanged` and direct messaging
- Export/import settings, add custom categories, tag-based keyword input
- Clean stat tracking with session vs. all-time separation

**Issues & areas to address:**

1. **Security: External Google Fonts request** (line 6 of popup.html) — `@import url('https://fonts.googleapis.com/...')`. This violates your zero-network-requests principle. Needs bundling or removal, same pattern we fixed in Privacy Sentinel.

2. **Drag-and-drop reorder isn't wired up** — The `.drag-handle` elements render but there's no actual drag logic in `popup.js`. Category priority order is a core feature (first-match-wins) but users can't reorder categories yet.

3. **"Restore All" logic mismatch** — It sends `REPROCESS` to content script (which re-runs filters and will re-hide posts) while also clearing `sessionStats.hidden`. The intent seems to be "unhide everything," but reprocessing will just hide them again.

4. **"Show Post" by index is fragile** — The filtered tab sends an index into `[data-jty-hidden="true"]` elements, but that NodeList order doesn't necessarily match the `filteredPosts` array order (which is newest-first via `unshift`).

5. **Double-firing on settings changes** — Both `chrome.storage.onChanged` listener AND `SETTINGS_UPDATED` message trigger `reprocessAllPosts()` in content.js, causing duplicate work every time settings are saved.

6. **No category editing** — You can add/delete keywords and toggle categories, but can't rename a category or change its color after creation.

What do you want to tackle first?



## Prompt:
2/25/2026, 6:07:15 PM

> File: 

Pause. higher priority: no posts are getting picked up. Attached is the HTML snippet of a post. Update code to recognize posts?



## Response:
2/25/2026, 6:07:16 PM

Looking





---
Powered by [Claude Exporter](https://www.ai-chat-exporter.net)