const CACHE_VERSION = "dpms-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/decisions",
  "/offline",
];

// Install: cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first, network fallback, offline fallback for navigation
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Cache successful responses for same-origin requests
          if (response.ok && request.url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // For navigation requests, serve the offline page
          if (request.mode === "navigate") {
            return caches.match("/offline");
          }
          return new Response("Offline", { status: 503 });
        });
    })
  );
});
