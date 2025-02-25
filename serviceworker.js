self.addEventListener('install', async () => {
    await deleteAllCaches();
    await caches.open('v1');
    console.log('[LIFECYCLE] Service worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[LIFECYCLE] Service worker activated');
    event.waitUntil(clients.claim());
});