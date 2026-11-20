/**
 * Ak Browser — Scramjet proxy layer
 * Same Wisp servers as YukiOS.
 *
 * IMPORTANT: Full Scramjet needs /scram + SW + Wisp.
 * Until those exist, we FALL BACK TO DIRECT so pages load
 * instead of Netlify 404 on /scramjet/...
 */

export const DEFAULT_WISP_URL =
  "wss://racialequityleadership.com/ws?reconnect=1";

export const WISP_SERVERS = [
  { name: "Primary (Yuki)", url: DEFAULT_WISP_URL },
  {
    name: "Reeyuki Wisp",
    url: "wss://hurt-agata-liventcord-api-7072e9a6.koyeb.app/",
  },
  { name: "Mercury Wisp", url: "wss://wisp.mercurywork.shop/" },
];

const EPOXY_ONLY = [DEFAULT_WISP_URL];

let mode = localStorage.getItem("ak_proxy_mode") || "direct";
let wispUrl = localStorage.getItem("ak_wisp") || DEFAULT_WISP_URL;
let scramjetReady = false;
let scramjetController = null;
let initPromise = null;

export function getProxyMode() {
  return mode;
}

export function setProxyMode(m) {
  mode = m === "scramjet" ? "scramjet" : "direct";
  localStorage.setItem("ak_proxy_mode", mode);
}

export function getWispUrl() {
  return wispUrl;
}

export function setWispUrl(url) {
  const cleaned = sanitizeWisp(url) || DEFAULT_WISP_URL;
  wispUrl = cleaned;
  localStorage.setItem("ak_wisp", cleaned);
}

function sanitizeWisp(url) {
  if (typeof url !== "string") return "";
  const t = url.trim();
  if (!t) return "";
  try {
    const p = new URL(t);
    if (p.protocol === "ws:" || p.protocol === "wss:") return t;
  } catch {}
  return "";
}

export function isEpoxyOnlyWisp(url) {
  return EPOXY_ONLY.includes(String(url || "").trim());
}

export function isProxied() {
  return mode === "scramjet" && scramjetReady;
}

export function isScramjetReady() {
  return scramjetReady;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

export async function initScramjet() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const localAll = "/scram/scramjet.all.js";
      let loaded = false;
      try {
        await loadScript(localAll);
        loaded = true;
      } catch {
        console.warn(
          "[Ak Proxy] No /scram/scramjet.all.js — using DIRECT until you add Scramjet assets."
        );
      }

      if (!loaded || typeof $scramjetLoadController !== "function") {
        scramjetReady = false;
        return false;
      }

      const { ScramjetController } = $scramjetLoadController();
      scramjetController = new ScramjetController({
        files: {
          wasm: "/scram/scramjet.wasm.wasm",
          all: "/scram/scramjet.all.js",
          sync: "/scram/scramjet.sync.js",
        },
      });

      try {
        await scramjetController.init();
      } catch (e) {
        console.warn("[Ak Proxy] controller.init:", e);
      }

      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          await navigator.serviceWorker.ready;
        } catch (e) {
          console.warn("[Ak Proxy] SW:", e);
        }
      }

      try {
        if (window.BareMux?.BareMuxConnection) {
          const connection = new BareMux.BareMuxConnection(
            "/baremux/worker.js"
          );
          const transportPath = isEpoxyOnlyWisp(wispUrl)
            ? "/epoxy/index.mjs"
            : "/libcurl/index.mjs";
          await connection.setTransport(transportPath, [{ wisp: wispUrl }]);
        }
      } catch (e) {
        console.warn("[Ak Proxy] transport:", e);
      }

      scramjetReady = true;
      window.__scramjet = {
        encodeUrl: (url) => encodeViaController(url),
        controller: scramjetController,
        wisp: wispUrl,
      };
      console.log("[Ak Proxy] Scramjet READY ·", wispUrl);
      return true;
    } catch (e) {
      console.error("[Ak Proxy] init failed:", e);
      scramjetReady = false;
      return false;
    }
  })();
  return initPromise;
}

function encodeViaController(url) {
  try {
    if (scramjetController?.encodeUrl) {
      return scramjetController.encodeUrl(url);
    }
    if (scramjetController?.prefix) {
      return scramjetController.prefix + encodeURIComponent(url);
    }
  } catch {}
  return "/scramjet/" + encodeURIComponent(url);
}

/**
 * Only rewrite through Scramjet when fully ready.
 * Otherwise return the real URL so the iframe loads (no Netlify 404).
 */
export function resolveUrl(url) {
  if (!url || url.startsWith("ak://") || url.startsWith("about:")) return url;

  // Not in scramjet mode, or assets missing → direct load
  if (mode !== "scramjet" || !scramjetReady) {
    return url;
  }

  try {
    if (window.__scramjet?.encodeUrl) {
      return window.__scramjet.encodeUrl(url);
    }
    return encodeViaController(url);
  } catch (e) {
    console.error("[Ak Proxy] resolveUrl:", e);
    return url;
  }
}

export function getWispServers() {
  return WISP_SERVERS.slice();
}
