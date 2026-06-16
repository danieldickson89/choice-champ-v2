/*
 * Self-destroying service worker.
 *
 * The create-react-app version of this app shipped a Workbox precaching
 * service worker (commit 811419e). After migrating to Vite (commit 4bd2487)
 * the app no longer registers or ships a service worker — but browsers that
 * installed the PWA during the CRA era still have that old worker registered
 * and *controlling* the page, so they keep being served a stale, precached
 * bundle no matter how many times we deploy.
 *
 * This file replaces that old worker at the same URL (/service-worker.js).
 * The stale worker periodically re-fetches this script to check for updates;
 * when it sees this new content it installs it, and the activate handler below
 * unregisters the worker, deletes every cache, and reloads open windows so the
 * client lands on the live network build. Afterward no service worker controls
 * the app at all — which is the current intended state.
 *
 * Safe for current users: nothing in the app registers a service worker
 * anymore, so only already-stuck (old) installs ever fetch this file.
 */

self.addEventListener('install', () => {
    // Take over immediately instead of waiting for the old worker to release.
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        // Wipe every cache this origin holds — the Workbox precache plus the
        // old 'images' and 'glitch-cdn' runtime caches.
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));

        // Remove this (and therefore any) service worker from the page.
        await self.registration.unregister();

        // Force every open tab/window to reload from the network so the user
        // immediately gets the current build instead of the stale shell.
        const clients = await self.clients.matchAll({ type: 'window' });
        for (const client of clients) {
            client.navigate(client.url);
        }
    })());
});
