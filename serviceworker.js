async function deleteAllCaches() {
    console.log('Deleting all caches');
    const cacheNames = await caches.keys();
    cacheNames.forEach(async cacheName => {
        await caches.delete(cacheName);
    })
}

self.addEventListener('install', async () => {
    await deleteAllCaches();
    console.log('Service worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activated');
    event.waitUntil(clients.claim());
});

async function handleFetch(event) {
    const request = event.request;
    console.log(`Request URL" ${request.url}`)
    const urlTokens = request.url.split('/');
    const versionToken = urlTokens[3];
    console.log(`URL Version: ${versionToken}`);

    const isCurrentVersion = await caches.has(versionToken);
    if (!isCurrentVersion) {
        await deleteAllCaches();
    }

    const responseFromCache = await caches.match(request);

    if (responseFromCache) {
        console.log('Responding from cache');
        return responseFromCache;
    }

    try {

        const responseFromNetwork = await fetch(request.clone());
        const cache = await caches.open(versionToken)
        cache.put(request, responseFromNetwork.clone());
        console.log('Responding from network');
        return responseFromNetwork;

    } catch (error) {
        
        return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}
self.addEventListener('fetch', async (event) => {
    if (event.request.url.includes('response')) {
        event.respondWith(handleFetch(event));
    }
});