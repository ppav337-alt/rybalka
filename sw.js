/* Рыбалка Майорка — офлайн и вечерние уведомления */
const VERSION = 'ryb-v1';
const SHELL = ['./', 'index.html', 'core.js', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'lib/leaflet.css',
  'lib/leaflet.js'];
importScripts('core.js');

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'ryb-tiles' && k !== 'ryb-data').map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Погода: всегда из сети (страница сама кэширует последний прогноз)
  if (url.hostname.endsWith('open-meteo.com')) return;
  // Тайлы карты: кэш, затем сеть (просмотренные участки доступны без интернета)
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    e.respondWith(caches.open('ryb-tiles').then(async c => {
      const hit = await c.match(e.request); if (hit) return hit;
      try { const r = await fetch(e.request); if (r.ok) c.put(e.request, r.clone()); return r; } catch (err) { return new Response('', { status: 504 }); }
    }));
    return;
  }
  // Оболочка приложения: сеть, при отсутствии — кэш
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && (url.origin === location.origin)) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});

// Вечернее уведомление о лучшем месте на завтра (Chrome Android, установленное приложение)
self.addEventListener('periodicsync', e => { if (e.tag === 'tomorrow') e.waitUntil(notifyTomorrow()); });
async function notifyTomorrow() {
  const h = new Date().getHours(); if (h < 17) return;
  const c = await caches.open('ryb-data'); const r = await c.match('/__spots'); if (!r) return;
  const { spots, notif } = await r.json(); if (!notif || !spots || !spots.length) return;
  const sent = await c.match('/__sent'); const today = FishCore.ymd(new Date());
  if (sent && (await sent.text()) === today) return;
  const u = FishCore.weatherUrls(spots);
  const [fc, mar] = await Promise.all([fetch(u.fc).then(x => x.json()), fetch(u.mar).then(x => x.json()).catch(() => null)]);
  const wx = FishCore.parseWeather(fc, mar || spots.map(() => ({})));
  const d = new Date(); d.setDate(d.getDate() + 1); const key = FishCore.ymd(d);
  let best = null;
  spots.forEach((s, k) => { const b = FishCore.bestWindow(s, wx[k], key); if (!b.closed && (!best || b.score > best.b.score)) best = { s, b, w: wx[k] }; });
  if (!best) return;
  const t = best.w.t[best.b.i].slice(11, 16);
  await self.registration.showNotification('Рыбалка Майорка', { body: 'Завтра лучше всего: ' + best.s.name + ' с ' + t + ' (оценка ' + best.b.score + ')', icon: 'icon-192.png', tag: 'tomorrow' });
  await c.put('/__sent', new Response(today));
}
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(self.clients.openWindow('./')); });
