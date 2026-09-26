/* Chess Club Kit service worker.
 * On install it caches the whole site (the list in precache.json, written at
 * build time), so every lesson works offline after one visit. Pages are
 * network-first so a new deploy shows up; everything falls back to the cache. */
const VERSION = "chessclub-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      try {
        const res = await fetch(new URL("precache.json", self.registration.scope), { cache: "no-store" });
        const { urls } = await res.json();
        // Cache in small batches; one failure shouldn't abort the rest.
        for (let i = 0; i < urls.length; i += 20) {
          await Promise.all(urls.slice(i, i + 20).map((u) => cache.add(new URL(u, self.registration.scope)).catch(() => {})));
        }
      } catch {
        /* offline during install: pages still get cached as they're visited */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Hashed build assets never change: cache first.
  if (url.pathname.includes("/_next/static/")) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // Everything else: network first, cache fallback. Query strings (?key=1,
  // ?kid=…) are ignored when matching, since the page is the same file.
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        const hit = (await cache.match(req, { ignoreSearch: true })) ?? (await cache.match(url.pathname.endsWith("/") ? url.pathname : url.pathname + "/", { ignoreSearch: true }));
        if (hit) return hit;
        if (req.mode === "navigate") {
          const home = await cache.match(new URL("./", self.registration.scope));
          if (home) return home;
        }
        return new Response("Offline", { status: 503 });
      }
    }),
  );
});
