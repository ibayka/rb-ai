const CACHE_NAME = "rb-app-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/login.html",
  "/register.html",
  "/auth.css",
  "/login.js",
  "/register.js",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});