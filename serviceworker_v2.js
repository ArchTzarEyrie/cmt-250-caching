// Only maintain one cache at a time

async function deleteAllCaches() {
    console.log('[CACHES]: Deleting all caches');
    const cacheNames = await caches.keys();
    cacheNames.forEach(async cacheName => {
        await caches.delete(cacheName);
    });
}

self.addEventListener('install', async () => {
    await deleteAllCaches();
    console.log('[CACHES]: opening Cache v1');
    await caches.open('v1');
    console.log('[LIFECYCLE]: Service worker installed');
});

self.addEventListener('activate', () => {
    console.log('[LIFECYCLE]: Service worker activated');
});

async function getUpdatedCacheName(url, currentCacheVersion) {
    const regex = /(?<version>v\d)\/response\.json/;
    const found = url.match(regex);
    const urlVersion = found.groups && found.groups.version;
    console.log(`[CACHES]: url version: ${urlVersion}`);

    const isSameVersion = urlVersion ? urlVersion === currentCacheVersion : false;

    if (!isSameVersion) {
        await deleteAllCaches();
        console.log(`[CACHES]: opening cache with name ${urlVersion}`);
        await caches.open(urlVersion);
        return urlVersion;
    } else {
        return currentCacheVersion;
    }
}

async function handleFetch(event) {
    const request = event.request;
    console.log(`[CACHES]: Request URL ${request.url}`);
    let currentCacheVersion = (await caches.keys())[0];
    console.log(`[CACHES]: current cache version: ${currentCacheVersion}`);

    const cacheToOpen = await getUpdatedCacheName(request.url, currentCacheVersion);

    const responseFromCache = await caches.match(request);

    if (responseFromCache) {
        console.log('[CACHES]: Responding from cache');
        return responseFromCache;
    }

    try {
        console.log('[CACHES]: Responding from network');
        const cache = await caches.open(cacheToOpen);
        await cache.add(request.clone());
        const responseFromNetwork = await cache.match(request);
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