self.addEventListener('install', () => {
    console.log('[LIFECYCLE] Service worker installed');
});

self.addEventListener('activate', () => {
    console.log('[LIFECYCLE] Service worker activated');
});