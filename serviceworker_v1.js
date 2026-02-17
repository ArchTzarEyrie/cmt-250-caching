// Basic caching behavior

self.addEventListener('install', async () => {
    console.log('[CACHES]: Cache v1 opening');
    await caches.open('v1');
    console.log('[LIFECYCLE] Service worker installed');
});

self.addEventListener('activate', () => {
    console.log('[LIFECYCLE] Service worker activated');
});

async function handleFetch(event) {
    const request = event.request;
    console.log(`[CACHES]: Request URL ${request.url}`);

    const responseFromCache = await caches.match(request);

    if (responseFromCache) {
        console.log('[CACHES] Responding from cache');
        return responseFromCache;
    }

    try {
        const cache = await caches.open('v1')
        await cache.add(request.clone());
        const responseFromNetwork = await cache.match(request);
        console.log('[CACHES] Responding from network');
        return responseFromNetwork;

    } catch (error) {
        
        return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('response')) {
        event.respondWith(handleFetch(event));
    }
});