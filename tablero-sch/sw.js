/* Tablero SCH — shell offline, JSON siempre de red. */
var CACHE = "tablero-sch-v3";
var SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(SHELL.map(function (url) {
        return cache.add(url).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isDayJson(url) {
  return /\/acciones\.json$/.test(url.pathname) || /\/sourcing\.json$/.test(url.pathname) || /\/leads\.json$/.test(url.pathname);
}

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  if (isDayJson(url)) {
    event.respondWith(fetch(req, { cache: "no-store" }));
    return;
  }

  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && res.type === "basic" && !isDayJson(url)) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(req, copy).catch(function () {});
        });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match("./index.html");
      });
    })
  );
});
