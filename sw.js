/* Ak Browser — Scramjet service worker
 * Loads Scramjet SW handler when /scram/scramjet.all.js is available.
 * Without local Scramjet files this SW still registers and passes through.
 */

try {
  importScripts("/scram/scramjet.all.js");
  if (typeof $scramjetLoadWorker === "function") {
    const { ScramjetServiceWorker } = $scramjetLoadWorker();
    const scramjet = new ScramjetServiceWorker();

    self.addEventListener("fetch", (event) => {
      event.respondWith(
        (async () => {
          try {
            await scramjet.loadConfig();
            if (scramjet.route(event)) {
              return scramjet.fetch(event);
            }
          } catch (e) {
            console.warn("[Ak SW] scramjet route error", e);
          }
          return fetch(event.request);
        })()
      );
    });
  } else {
    self.addEventListener("fetch", (event) => {
      event.respondWith(fetch(event.request));
    });
  }
} catch (e) {
  // No local Scramjet bundle — pass-through SW
  self.addEventListener("fetch", (event) => {
    event.respondWith(fetch(event.request));
  });
  console.warn("[Ak SW] Scramjet not loaded:", e);
}
