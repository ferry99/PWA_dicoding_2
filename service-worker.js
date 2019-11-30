const CACHE_NAME = "PWA-v1";
var urlsToCache = [
  "/",
  "pages/nav.html",
  "index.html",
  "pages/home.html",
  "pages/about.html",
  "pages/contact.html",
  "pages/article.html",
  "css/materialize.min.css",
  "css/custom.css",
  "js/jquery.js",
  "js/custom.js",
  "js/materialize.min.js",
  "images/js_logo.png",
  "images/pwa_logo.png",
  "images/logo_sidebar.jpg",
  "icon.png",
  "manifest.json"
];
 
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches
      .match(event.request, { cacheName: CACHE_NAME })
      .then(function(response) {
        if (response) {
          console.log("ServiceWorker: Load from cache: ", response.url);
          return response;
        }
 
        console.log(
          "ServiceWorker: Load from server: ",
          event.request.url
        );
        return fetch(event.request);
      })
  );
});


self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName != CACHE_NAME) {
            console.log("ServiceWorker: cache " + cacheName + " has been deleted");
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});