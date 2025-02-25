async function deleteAllCaches() {
    console.log('[CACHES] Deleting all caches');
    const cacheNames = await caches.keys();
    cacheNames.forEach(async cacheName => {
        await caches.delete(cacheName);
    })
}

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

async function handleFetch(event) {
    const request = event.request;
    console.log(`[CACHES] Request URL ${request.url}`)
    const urlTokens = request.url.split('/');
    const versionToken = urlTokens[3];
    console.log(`[CACHES] URL Version: ${versionToken}`);
    let replacedUrl;

    const isCurrentVersion = await caches.has(versionToken);
    if (!isCurrentVersion) {
        console.log("[CACHES] Cache version discrepency detected")
        const cacheKeys = await caches.keys();
        const currentCacheName = cacheKeys[0];
        const currentVersion = Number(currentCacheName[1]);
        console.log(`[CACHES] Current version ${currentVersion}`);
        const newVersion = Number(versionToken[1]);
        console.log(`[CACHES] New version: ${newVersion}`);
        if (newVersion > currentVersion) {
            await deleteAllCaches();
        } else if (newVersion < currentVersion) {
            console.log('[CACHES] Detected different version is outdated, redirecting to updated request');
            replacedUrl = request.url.replace(/v./, currentCacheName);
            console.log(`[CACHES] Replaced URL: ${replacedUrl}`);
        }
    }

    const valueToCheck = replacedUrl ? replacedUrl : request;
    const responseFromCache = await caches.match(valueToCheck);

    if (responseFromCache) {
        console.log('[CACHES] Responding from cache');
        return responseFromCache;
    }

    try {

        const cache = await caches.open(versionToken)
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
self.addEventListener('fetch', async (event) => {
    if (event.request.url.includes('response')) {
        event.respondWith(handleFetch(event));
    }
});