let versionNumber = 1;

function initServiceWorker() {
    console.log('[LIFECYCLE] Initializing main file');
    navigator.serviceWorker
        .register('./serviceworker.js')
        .then(() => console.log('[LIFECYCLE] Service worker registered'))
        .catch((error) => {
            console.log('[ERROR] Error during service worker registration');
            console.log(error);
        });
}

window.addEventListener('load', () => {
    initServiceWorker();
});

async function fetchResponse() {
    const response = await fetch(`./v${versionNumber}/response.json`);
    const json = await response.json();
    const targetText = document.getElementById('target-text');
    targetText.innerHTML = json.text;
}

document.getElementById('fetch-button').onclick = fetchResponse;

function setUrlVersion(newVersion) {
    versionNumber = newVersion;
}

document.getElementById('version1').onclick = () => setUrlVersion(1);
document.getElementById('version2').onclick = () => setUrlVersion(2);
document.getElementById('version3').onclick = () => setUrlVersion(3);