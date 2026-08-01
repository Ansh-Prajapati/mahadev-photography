// ========================================
// SERVICE WORKER - Mahadev Photography
// VERSION: 3.0.1
// ========================================

const CACHE_NAME = 'mahadev-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/gallery.html',
    '/packages.html',
    '/contact.html',
    '/css/style.css',
    '/css/admin-style.css',
    '/js/script.js'
];

// Install
self.addEventListener('install', function(event) {
    console.log('📦 Service Worker installing...');
    event.waitUntil(
        caches.delete(CACHE_NAME)
        .then(function() {
            return caches.open(CACHE_NAME);
        })
        .then(function(cache) {
            console.log('📦 Caching files...');
            return cache.addAll(urlsToCache);
        })
        .then(function() {
            return self.skipWaiting();
        })
    );
});

// Activate
self.addEventListener('activate', function(event) {
    console.log('📦 Service Worker activating...');
    event.waitUntil(
        caches.keys()
        .then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('📦 Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(function() {
            return self.clients.claim();
        })
    );
});

// Fetch
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            if (response) {
                return response;
            }
            return fetch(event.request)
                .then(function(networkResponse) {
                    // Cache new files
                    if (networkResponse && networkResponse.status === 200) {
                        var responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseClone);
                            });
                    }
                    return networkResponse;
                });
        })
    );
});