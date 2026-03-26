export function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
            console.log('MockPrep updated — refresh for latest version');
          }
        });
      });
    } catch (err) {
      console.warn('SW registration failed:', err.message);
    }
  });
}
