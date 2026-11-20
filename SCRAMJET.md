# Scramjet setup for Ak Browser

Ak Browser is wired like **YukiOS**:

- Default mode: **Scramjet**
- Same public Wisp list as Yuki:
  - `wss://racialequityleadership.com/ws?reconnect=1`
  - `wss://hurt-agata-liventcord-api-7072e9a6.koyeb.app/`
  - `wss://wisp.mercurywork.shop/`

## What works on static Netlify alone

- UI, tabs, bookmarks, owner panel
- Proxy mode toggle + Wisp URL selection
- URL encoding path for Scramjet (`/scramjet/...`)

## Full proxy (real site loading through Scramjet)

You need the Scramjet **static bundles** on the same origin as the SW:

1. Install packages (Node):

```bash
pnpm add @mercuryworkshop/scramjet @mercuryworkshop/bare-mux @mercuryworkshop/epoxy-transport @mercuryworkshop/libcurl-transport @mercuryworkshop/wisp-js
```

2. Copy dist folders into the site:

```
/scram/     ← from @mercuryworkshop/scramjet
/baremux/   ← from @mercuryworkshop/bare-mux
/epoxy/     ← from @mercuryworkshop/epoxy-transport
/libcurl/   ← from @mercuryworkshop/libcurl-transport
```

3. Keep `sw.js` at site root (already in this repo).

4. Deploy on a host that can also run a **Wisp** endpoint, **or** keep using the public Wisp servers above (Yuki style).

Official reference app: https://github.com/MercuryWorkshop/Scramjet-App  
Scramjet source: https://github.com/MercuryWorkshop/scramjet

## Owner note

Client-side password / site gate only stops casual sharing. For real access control use Netlify password protection or auth.
