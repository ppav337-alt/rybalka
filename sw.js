/* Рыбалка Майорка — офлайн и вечерние уведомления */
const VERSION = 'ryb-v13';
const SHELL = ['./', 'index.html', 'core.js', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'lib/leaflet.css',
  'lib/leaflet.js', 'i18n.js'];
importScripts('i18n.js', 'core.js');

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
  const c = await caches.open('ryb-data'); const r = await c.match('/__spots'); if (!r) return;
  const { spots, notif, lang, home } = await r.json(); if (lang) I18N.lang = lang; const T = I18N.T; if (!notif || !spots || !spots.length) return;
  const now = new Date(), h = now.getHours(), today = FishCore.ymd(now);
  const u = FishCore.weatherUrls(spots);
  const [fc, mar] = await Promise.all([fetch(u.fc).then(x => x.json()), fetch(u.mar).then(x => x.ok ? x.json() : Promise.reject()).catch(() => fetch(u.mar2).then(x => x.ok ? x.json() : null)).catch(() => null)]);
  const wx = FishCore.parseWeather(fc, mar || spots.map(() => ({})));
  // Днём: окно клёва рядом с домом в ближайшие 3 часа (оценка от 80, до 30 км)
  if (h >= 6 && h <= 21 && home) {
    const sentNear = await c.match('/__sentNear'); const sn = sentNear ? await sentNear.text() : '';
    const km = s => { const R = 6371, dLa = (s.lat - home.lat) * Math.PI / 180, dLo = (s.lon - home.lon) * Math.PI / 180;
      const q = Math.sin(dLa / 2) ** 2 + Math.cos(home.lat * Math.PI / 180) * Math.cos(s.lat * Math.PI / 180) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(q)); };
    let near = null;
    spots.forEach((s, k) => { if (km(s) > 30) return; const b = FishCore.bestWindow(s, wx[k], today, Date.now()); if (b.closed || b.score < 80) return;
      const at = new Date(wx[k].t[b.i]).getTime(); if (at - Date.now() > 3 * 3600000) return; if (!near || b.score > near.b.score) near = { s, b, t: wx[k].t[b.i], d: Math.round(km(s)) }; });
    if (near && sn !== today) {
      await self.registration.showNotification(T('Рыбалка Майорка'), { body: T('Скоро клёв рядом') + ': ' + near.s.name + ' ' + near.t.slice(11, 16) + ' · ' + T('оценка') + ' ' + near.b.score + ' · ' + near.d + T(' км'), icon: 'icon-192.png', tag: 'near' });
      await c.put('/__sentNear', new Response(today));
    }
  }
  // Вечером: лучшее место на завтра
  if (h < 17) return;
  const sent = await c.match('/__sent');
  if (sent && (await sent.text()) === today) return;
  const d = new Date(); d.setDate(d.getDate() + 1); const key = FishCore.ymd(d);
  let best = null;
  spots.forEach((s, k) => { const b = FishCore.bestWindow(s, wx[k], key); if (!b.closed && (!best || b.score > best.b.score)) best = { s, b, w: wx[k] }; });
  if (!best) return;
  const t = best.w.t[best.b.i].slice(11, 16);
  await self.registration.showNotification(T('Рыбалка Майорка'), { body: T('Завтра лучше всего: ') + best.s.name + T(' с ') + t + T(' (оценка ') + best.b.score + ')', icon: 'icon-192.png', tag: 'tomorrow' });
  await c.put('/__sent', new Response(today));
}
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(self.clients.openWindow('./')); });
