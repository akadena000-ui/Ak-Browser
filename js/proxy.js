/**
 * Ak Browser — Proxy layer (Scramjet-ready)
 *
 * Wire your Scramjet / epoxy / wisp endpoint here.
 * When mode === "scramjet", navigate() will route through the proxy.
 */

const WISP_URL = localStorage.getItem("ak_wisp") || "";
let mode = localStorage.getItem("ak_proxy_mode") || "direct";

export function getProxyMode() {
  return mode;
}

export function setProxyMode(m) {
  mode = m === "scramjet" ? "scramjet" : "direct";
  localStorage.setItem("ak_proxy_mode", mode);
}

export function setWispUrl(url) {
  localStorage.setItem("ak_wisp", url || "");
}

/**
 * Resolve a navigation URL through the active proxy.
 * Scramjet: return the proxied URL that an iframe can load.
 * Direct: return the original URL.
 */
export function resolveUrl(url) {
  if (!url || url.startsWith("ak://") || url.startsWith("about:")) return url;
  if (mode !== "scramjet") return url;

  // Scramjet typically serves under a path like /scramjet/ or uses a service worker.
  // Adjust PREFIX to match your deployment.
  const PREFIX = "/scramjet/"; // e.g. location.origin + PREFIX + encodeURIComponent(url)
  try {
    // If you host Scramjet on the same origin:
    // return location.origin + PREFIX + encodeURIComponent(url);
    // For now, fall through to direct when not configured.
    if (!WISP_URL && !window.__scramjet) {
      console.warn("[Ak Proxy] Scramjet not configured — using direct.");
      return url;
    }
    // Placeholder: real Scramjet encodes via its client API
    if (window.__scramjet?.encodeUrl) {
      return window.__scramjet.encodeUrl(url);
    }
    return url;
  } catch (e) {
    console.error("[Ak Proxy]", e);
    return url;
  }
}

export function isProxied() {
  return mode === "scramjet";
}
