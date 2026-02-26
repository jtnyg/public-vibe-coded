# Project 001 Retro — Chrome Extension: Google View Image Button

**Date:** 2026-02-23
**Complexity:** ⭐
**Stack:** Claude Opus, 
**Time Spent:** 1 Day


## 💡 The Idea

For my first LLM vibe coding project, I wanted to build a chrome browser extension because (1) it was a simple 'hello world' like ecosystem, and (2) I had heard an INSANE story about bad actors stealing access credentials via site spoofing, so I was thinking I should reduce my reliance on chrome extensions by untrusted third parties that might modify my html redirects. The simplest extension to replace was my chrome extension to add a 'View image' CTA onto Google Images results.


 
## 🧠 What I Learned
### Impression / Vibes:
- Claude Opus 4.6 is an impressive, highly capable LLM model. That said, it's not perfect as version 1 did not work. It did take me three prompts to get the core functionality working -- all subsequent prompts were for cosmetic tweaks.
- Given my focus on security and reducing third party dependencies, I was impressed that Opus 4.6 kept with the security theme assuring me of areas where it checking the box (e.g., network activity, storage, background scripts).

### Best Practices:
- Trust but verify. LLM is confident it did good work, but did not pass scrutiny. Initially the 'View image' button would take me to the website and not the image. On the second pass, it said it fixed it but nope. Ultimately, I had to give Claude the html I was seeing and the exact URL I wanted it to pull. So, it's a great productivity tool but needs to be hand held and vetted to be sure it actually works.   
- It's best to vet the code to know what it's doing: I can figure out the sequence of what it's doing and with 80% confidence know it's not doing any fishy.

---

## 🏁 Outcome

### What Shipped
- I shipped a fully functional chrome extension that will open the image URL in Google images. This plugs one cybersecurity gaps I have -- Amazing!

### What's Next
- Onto the next! Something with a UI.

