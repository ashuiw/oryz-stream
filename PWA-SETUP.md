# Oryz PWA setup

Oryz now includes:
- `app/manifest.ts` for the Chrome/Android installable web app manifest.
- `public/sw.js` for service-worker registration and installability/offline fallback.
- `public/icons/icon-192.png` and `icon-512.png`, generated from the existing Oryz navbar/favicon logo.
- `public/icons/apple-touch-icon.png` for iOS home-screen support.
- `components/ServiceWorkerRegistration.tsx` to register the service worker.

For Chrome/Android install:
1. Deploy Oryz over HTTPS.
2. Open the site in Chrome on Android.
3. Chrome should expose "Install app" from the browser menu when installability criteria are met.
4. The installed app opens at `/` in standalone mode.

Do not cache `/api/*`, Supabase, or VidKing requests. The service worker intentionally leaves those requests on the network so authentication and playback aren't broken.

After deploying a new service-worker version, `oryz-static-v1` can be bumped to `oryz-static-v2` if stale static assets need to be invalidated.
