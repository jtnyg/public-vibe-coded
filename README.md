# Repository: public-vibe-coded (Summarized by Claude)

A portfolio of AI-assisted projects built iteratively with LLMs — from simple prototypes to functional tools. Each project includes the code, prompts, and reflections — tracking what I learned building with LLMs and how it makes me a sharper Product Manager.



## Why This Exists

I'm a Staff PM with 11+ years of experience building products. This repo is how I'm learning to build with AI. Every project starts with a real problem, gets scoped down to something shippable, and gets iterated on with LLMs until it works (or until I learn why it won't). The goal isn't perfect code. It's understanding what's possible, what breaks, and how to think like a builder.


## What I've Learned So Far
- **Scoping is everything.** LLMs are great at filling in implementation details, but they can't tell you what to build. The clearer the problem definition, the faster the build. Vague prompts lead to plausible-sounding code that doesn't actually solve anything.

- **Iteration beats perfection.** The first working version is never the right version. Getting something functional quickly — even if rough — creates a much better feedback loop than trying to spec everything upfront.

- **Understanding the output matters.** When I couldn't explain what the code was doing, I couldn't debug it, extend it, or know if it was safe to ship. LLMs accelerate the build, but you still need enough technical context to stay in the driver's seat.

- **Chrome Extensions are a great starting point.** They're self-contained, immediately testable, and live in the browser where real problems happen. Low overhead, fast feedback.


## How Each Project Is Documented

Every folder contains:
- **A README** — my retro/reflection: what I built, why, what broke, what worked, and what I'd do differently
- **The code in 'src'** — the working code (if applicable) to run the tool
- **Install Package in 'install'** — installation package in a zip
- **The prompts in 'prompt'** — my prompts to the LLM. Note: I'm less nuanced/detailed than usual as my primary goal here is learning.

## Projects

| # | Project | Type | Status |
|---|---------|------|--------|
| 001 | [ChromeExtension-GoogleViewImage](./001-ChromeExtension-GoogleViewImage/) | Chrome Extension | ✅ Functional |
| 002 | [ChromeExtension-LinkedInFeedFilter](./002-ChromeExtension-LinkedInFeedFilter%20(Prototype%20Only)/) | Chrome Extension | 🔬 Prototype Only |

### 001 — ChromeExtension-GoogleViewImage

Restores the "View Image" button that Google removed from image search results. Click it, get the direct image URL — no extra clicks.

**The build:** Straightforward DOM manipulation. Taught me the basics of Chrome Extension architecture (manifest, content scripts, permissions) and how to read and target dynamically rendered page elements.

**Key learning:** Start with the simplest version of the thing. A working one-button extension is more valuable than a half-built feature-rich one.


### 002 — ChromeExtension-LinkedInFeedFilter *(Prototype Only)*

Filters LinkedIn feed posts by keyword — surfaces what's relevant, hides the noise.

**The build:** More complex than 001. LinkedIn's feed is heavily dynamic (React-rendered), which makes reliable DOM targeting much harder. Got a working prototype but hit reliability issues with LinkedIn's frequent front-end changes.

**Key learning:** Dynamic, frequently-updated UIs are a real constraint for DOM-dependent extensions. A prototype is still worth shipping — it proves the concept and clarifies what a more robust version would require.
