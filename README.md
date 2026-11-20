# Ak Browser

Galaxy purple web browser with tabs, bookmarks, history, private mode, and Scramjet proxy support.

**Live:** deploy this folder to Netlify / Vercel / GitHub Pages.

## Features
- Multi-tab browsing
- Address bar with search engines (Brave, DuckDuckGo, Google)
- Bookmarks bar
- History & downloads panels
- Private / incognito mode
- New Tab page with clock, shortcuts, search
- Galaxy purple theme + smooth animations
- Scramjet proxy hooks (ready to wire)
- Fully client-side — no backend required

## Quick start
```bash
npx serve .
# or open index.html
```

## Scramjet
The proxy layer is stubbed in `js/proxy.js`. Point `WISP_URL` / transport at your Scramjet / epoxy endpoint to enable full proxy browsing.

## Credits
UI structure inspired by YukiOS browser. Fully rebranded and restyled for Ak.
