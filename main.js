function initServiceWorker() {
    console.log('initializing main file');
    navigator.serviceWorker
        .register('./serviceworker.js')
        .then(() => console.log('Service worker registered'))
        .catch((error) => {
            console.log('Error during service worker registration');
            console.log(error);
        });
  }
  
  window.addEventListener('load', () => {
    initServiceWorker();
  });