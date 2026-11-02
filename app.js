/* Рыбалка Майорка — интерфейс */
(function () {
  'use strict';
  const C = window.FishCore;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Хранилище ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ryb_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ryb_' + k, JSON.stringify(v)); return true; } catch (e) { toast('Не удалось сохранить: память браузера недоступна'); return false; } }
  };
  // Фото в IndexedDB
  const photoDB = (() => {
    let dbp = null;
    function open() {
      if (dbp) return dbp;
      dbp = new Promise((res, rej) => {
        try {
          const r = indexedDB.open('rybalka', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('photos');
          r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
        } catch (e) { rej(e); }
      });
      return dbp;
    }
    const tx = (mode, fn) => open().then(db => new Promise((res, rej) => {
      const t = db.transaction('photos', mode), st = t.objectStore('photos'), q = fn(st);
      t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error);
    }));
    return {
      put: (id, data) => tx('readwrite', st => st.put(data, id)).catch(() => null),
      get: id => tx('readonly', st => st.get(id)).catch(() => null),
      del: id => tx('readwrite', st => st.delete(id)).catch(() => null),
      all: () => open().then(db => new Promise(res => {
        const out = {}, t = db.transaction('photos', 'readonly'), st = t.objectStore('photos'), c = st.openCursor();
        c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); };
        c.onerror = () => res(out);
      })).catch(() => ({}))
    };
  })();

  // ---------- Состояние ----------
  const S = {
    tab: store.get('tab', 'best'),
    day: 0,
    custom: store.get('custom', []),          // свои точки
    edits: store.get('edits', {}),            // правки координат встроенных точек
    hidden: store.get('hidden', []),
    journal: store.get('journal', []),
    settings: store.get('settings', { home: { lat: 39.7016, lon: 3.1037, name: 'Santa Margalida' }, filter: 'all', notif: false }),
    parks: store.get('parks', {}),          // свои отметки парковки {id:{lat,lon}}
    fishView: 'fish',
    wx: store.get('wx', null),                // { at, ids:[], data:[...] }
    loading: false, err: null
  };

  function allSpots() {
    const base = C.SPOTS.map(s => Object.assign({}, s, S.edits[s.id] || {}));
    return base.concat(S.custom).filter(s => !S.hidden.includes(s.id));
  }
  const spotById = id => allSpots().find(s => s.id === id) || C.SPOTS.find(s => s.id === id) || S.custom.find(s => s.id === id);
  const weatherSpots = () => allSpots().filter(s => s.lat != null && s.lon != null && !s.noFish);

  function wxFor(id) {
    if (!S.wx) return null;
    const k = S.wx.ids.indexOf(id);
    return k >= 0 ? S.wx.data[k] : null;
  }
  function dayKey(off) { const d = new Date(); d.setDate(d.getDate() + off); return C.ymd(d); }
  function km(a, b) {
    const R = 6371, r = x => x * Math.PI / 180, dLa = r(b.lat - a.lat), dLo = r(b.lon - a.lon);
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
  }
  const hhmm = iso => iso ? iso.slice(11, 16) : '';
  function addH(iso, h) { const d = new Date(iso); d.setHours(d.getHours() + h); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  const scoreClass = s => s >= 70 ? 'good' : s >= 50 ? 'ok' : s > 0 ? 'bad' : 'no';
  const dirArrow = d => '<span class="arr" style="transform:rotate(' + ((d + 180) % 360) + 'deg)">↑</span>';
  const compass = d => ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'][Math.round(d / 45) % 8];
  const mapsLink = s => s.lat != null
    ? 'https://www.google.com/maps/dir/?api=1&destination=' + s.lat + ',' + s.lon
    : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.q || s.name);
  const searchLink = s => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.q || s.name);

  // ---------- Погода ----------
  async function loadWeather(force) {
    const spots = weatherSpots(), ids = spots.map(s => s.id).join('|');
    const fresh = S.wx && (Date.now() - S.wx.at < 60 * 60 * 1000) && S.wx.ids.join('|') === ids;
    if (fresh && !force) return;
    S.loading = true; S.err = null; render();
    try {
      const u = C.weatherUrls(spots);
      const [fc, mar] = await Promise.all([fetch(u.fc).then(r => { if (!r.ok) throw new Error('погода ' + r.status); return r.json(); }),
        fetch(u.mar).then(r => r.ok ? r.json() : null).catch(() => null)]);
      const data = C.parseWeather(fc, mar || (Array.isArray(fc) ? fc.map(() => ({})) : {}));
      S.wx = { at: Date.now(), ids: spots.map(s => s.id), data };
      store.set('wx', S.wx);
      saveSpotsForSW();
    } catch (e) {
      S.err = 'Нет связи с сервисом погоды' + (S.wx ? ', показан прогноз от ' + new Date(S.wx.at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '') + '.';
    }
    S.loading = false; render(); maybeNotify();
  }

  // ---------- Рейтинг ----------
  function ranking(off) {
    const key = dayKey(off);
    return weatherSpots().map(s => {
      const wx = wxFor(s.id); if (!wx) return { s, b: null };
      return { s, b: C.bestWindow(s, wx, key, off === 0 ? Date.now() : 0, curTech()), wx };
    }).sort((a, b) => ((b.b && !b.b.closed ? b.b.score : -1) - (a.b && !a.b.closed ? a.b.score : -1)));
  }

  const curTech = () => (S.settings.tech && S.settings.tech !== 'all') ? S.settings.tech : null;
  const spotTech = s => s.tech || [];

  // ---------- Рендер ----------
  const app = () => $('#app');
  function render() {
    document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === S.tab));
    const v = { best: viewBest, map: viewMap, fish: viewFish, log: viewLog, more: viewMore }[S.tab] || viewBest;
    if (S.tab !== 'map') { destroyMap(); app().innerHTML = v(); bindView(); }
    else viewMap();
  }

  function filterSpots(list) {
    const f = S.settings.filter, t = curTech();
    return list.filter(x => !t || spotTech(x.s).includes(t)).filter(x => f === 'all' || (f === 'beach' && x.s.type === 'beach') || (f === 'rock' && x.s.type === 'rock') ||
      (f === 'near' && km(S.settings.home, x.s) <= 30) || f === x.s.depth);
  }

  function viewBest() {
    const now = new Date(), r = filterSpots(ranking(S.day));
    const moon = C.moonPhase(new Date(Date.now() + S.day * 86400000));
    let h = '<header class="top"><h1>Где лучше ловить</h1><div class="seg">' +
      ['Сегодня', 'Завтра', 'Послезавтра'].map((t, i) => '<button data-day="' + i + '" class="' + (S.day === i ? 'on' : '') + '">' + t + '</button>').join('') +
      '</div><div class="chips">' +
      [['all', 'Все'], ['near', 'До 30 км'], ['beach', 'Пляж'], ['rock', 'Скалы'], ['shallow', '0–5 м'], ['mid', '5–15 м'], ['deep', '15+ м']]
        .map(([k, t]) => '<button data-filter="' + k + '" class="chip ' + (S.settings.filter === k ? 'on' : '') + '">' + t + '</button>').join('') +
      '</div><div class="chips">' +
      [['all', 'Любая ловля']].concat(Object.entries(C.TECH).map(([k, v]) => [k, v.icon + ' ' + v.name]))
        .map(([k, t]) => '<button data-tech="' + k + '" class="chip ' + ((S.settings.tech || 'all') === k ? 'on' : '') + '">' + t + '</button>').join('') +
      '</div><div class="sub">Луна: ' + C.moonName(moon) + ' · ' + C.DOW[new Date(Date.now() + S.day * 86400000).getDay()] +
      (S.wx ? ' · прогноз ' + new Date(S.wx.at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '') +
      ' <button class="link" data-act="refresh">обновить</button></div></header>';
    if (S.loading) h += '<p class="note">Загружаю погоду…</p>';
    if (S.err) h += '<p class="warn">' + esc(S.err) + '</p>';
    if (!S.wx && !S.loading) h += '<p class="note">Погоды пока нет. Нажмите «обновить», нужен интернет.</p>';
    h += '<div class="list">';
    r.forEach(({ s, b, wx }) => {
      const dist = km(S.settings.home, s);
      if (!b) { h += card(s, '<span class="badge no">—</span>', '<div class="muted">нет прогноза</div>', dist); return; }
      if (b.closed) { h += card(s, '<span class="badge no">✕</span>', '<div class="muted">' + esc(b.why) + '</div>', dist); return; }
      const t = wx.t[b.i], k = b.i;
      const info = '<div class="win">' + hhmm(t) + '–' + addH(t, 2) + '</div>' +
        '<div class="wxline">' + dirArrow(wx.dir[k]) + ' ' + Math.round(wx.wind[k]) + ' км/ч ' + compass(wx.dir[k]) +
        (wx.wave[k] != null ? ' · волна ' + wx.wave[k].toFixed(1) + ' м' : '') + (wx.sst[k] != null ? ' · вода ' + Math.round(wx.sst[k]) + '°' : '') + '</div>' +
        (b.tags.length ? '<div class="tags">' + b.tags.slice(0, 4).map(x => '<span>' + esc(x) + '</span>').join('') + '</div>' : '') +
        (b.danger ? '<div class="danger">⚠ Опасно на скалах: волна или порывы</div>' : '');
      h += card(s, '<span class="badge ' + scoreClass(b.score) + '">' + b.score + '</span>', info, dist);
    });
    h += '</div><p class="foot">Оценка 0–100 по ветру, волне, давлению, времени суток, луне и мутности. Это подсказка, а не гарантия клёва.</p>';
    return h;
  }
  function card(s, badge, info, dist) {
    return '<button class="card" data-spot="' + esc(s.id) + '">' + badge + '<div class="cbody"><div class="cname">' + esc(s.name) +
      (s.src === 'mine' ? ' <small>моя</small>' : '') + '</div><div class="cmeta">' + esc(s.area || '') + ' · ' + (s.type === 'beach' ? 'пляж' : 'скалы') + ' · ' +
      ({ shallow: '0–5 м', mid: '5–15 м', deep: '15+ м' }[s.depth] || '') + ' · ' + dist + ' км' +
      (spotTech(s).length ? ' · ' + spotTech(s).map(k => C.TECH[k] ? C.TECH[k].icon : '').join('') : '') + '</div>' + info + '</div></button>';
  }

  // ---------- Карточка точки ----------
  function openSpot(id) {
    const s = spotById(id); if (!s) return;
    const wx = wxFor(id), key = dayKey(S.day), res = C.RESERVES[s.reserve] || C.RESERVES.none;
    let h = '<div class="sheet"><button class="close" data-act="close">✕</button><h2>' + esc(s.name) + '</h2>' +
      '<div class="cmeta">' + esc(s.area || '') + ' · ' + (s.type === 'beach' ? 'пляж' : 'скалы') + ' · ' + ({ shallow: '0–5 м', mid: '5–15 м', deep: '15+ м' }[s.depth] || '') +
      ' · ' + km(S.settings.home, s) + ' км от дома</div>';
    if (s.warn) h += '<p class="warn">' + esc(s.warn) + '</p>';
    h += '<div class="btns"><a class="btn pri" target="_blank" rel="noopener" href="' + parkRoute(s) + '">🚗 Маршрут к парковке</a>' +
      (s.lat != null ? '<a class="btn" target="_blank" rel="noopener" href="' + mapsLink(s) + '&travelmode=walking">🚶 К месту ловли</a>' : '') +
      '<button class="btn" data-act="addcatch" data-spot="' + esc(s.id) + '">Записать улов</button>' +
      (s.lat == null ? '<a class="btn" target="_blank" rel="noopener" href="' + searchLink(s) + '">Найти на карте</a>' : '') + '</div>';
    h += '<h3>Режим</h3><p><b>' + esc(res.name) + '.</b> ' + esc(res.note) + (res.url ? ' <a target="_blank" rel="noopener" href="' + res.url + '">Правила</a>' : '') + '</p>';
    const L = C.legal(s, new Date(key + 'T12:00'));
    if (!L.ok) h += '<p class="warn">' + esc(L.why) + '</p>';
    h += '<h3>Парковка</h3><p>' + esc(s.parking || '—') + (parkOf(s) ? ' <b>· отмечена вами на карте</b>' : ' <span class="muted">(поиск по названию)</span>') +
      '</p><div class="btns"><button class="btn" data-act="setpark" data-spot="' + esc(s.id) + '">📍 ' + (parkOf(s) ? 'Изменить' : 'Отметить') + ' мою парковку</button></div>';
    h += '<h3>Рыба</h3><p>' + esc(s.fish) + '</p>';
    const techs = spotTech(s);
    if (techs.length) {
      h += '<h3>Чем ловить здесь</h3>';
      techs.forEach((k, n) => { h += techCard(k, n === 0 || k === curTech()); });
    }
    const seas = C.tackle(s, new Date(key + 'T12:00'), true);
    if (seas.length) h += '<h3>Сейчас в сезоне</h3><ul class="tips">' + C.tackle(s, new Date(key + 'T12:00'), true).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
    if (wx) {
      const di = wx.days.indexOf(key);
      h += '<h3>Прогноз по часам · ' + (['сегодня', 'завтра', 'послезавтра'][S.day]) + '</h3>';
      if (di >= 0) h += '<p class="muted">Восход ' + hhmm(wx.sunrise[di]) + ' · закат ' + hhmm(wx.sunset[di]) + ' · луна: ' + C.moonName(C.moonPhase(new Date(key + 'T12:00'))) + '</p>';
      h += '<div class="hours">';
      wx.t.forEach((t, i) => {
        if (t.slice(0, 10) !== key) return;
        const r = C.hourScore(s, wx, i, curTech() && spotTech(s).includes(curTech()) ? curTech() : null);
        h += '<div class="hr ' + (r.legal.ok ? '' : 'off') + '"><div class="bar ' + scoreClass(r.score) + '" style="height:' + Math.max(4, r.score) + '%"></div><div class="hl">' + t.slice(11, 13) + '</div></div>';
      });
      h += '</div><table class="wx"><tr><th>Час</th><th>Ветер</th><th>Порыв</th><th>Волна</th><th>Вода</th><th>Давл.</th><th>Оценка</th></tr>';
      wx.t.forEach((t, i) => {
        if (t.slice(0, 10) !== key || (+t.slice(11, 13)) % 3) return;
        const r = C.hourScore(s, wx, i, curTech() && spotTech(s).includes(curTech()) ? curTech() : null);
        h += '<tr><td>' + t.slice(11, 16) + '</td><td>' + dirArrow(wx.dir[i]) + Math.round(wx.wind[i]) + '</td><td>' + Math.round(wx.gust[i]) + '</td><td>' +
          (wx.wave[i] != null ? wx.wave[i].toFixed(1) : '—') + '</td><td>' + (wx.sst[i] != null ? Math.round(wx.sst[i]) + '°' : '—') + '</td><td>' +
          Math.round(wx.press[i]) + '</td><td><span class="badge sm ' + scoreClass(r.score) + '">' + (r.legal.ok ? r.score : '✕') + '</span></td></tr>';
      });
      h += '</table><p class="muted">Ветер км/ч, стрелка — куда дует. Волна м. Давление гПа.</p>';
    }
    const catches = S.journal.filter(j => j.spot === id);
    if (catches.length) h += '<h3>Мои уловы здесь</h3><p>' + catches.length + ' записей, лучшие часы: ' + topHours(catches) + '</p>';
    h += '<div class="btns">' +
      (s.src === 'mine' ? '<button class="btn" data-act="editspot" data-spot="' + esc(s.id) + '">Изменить</button><button class="btn danger" data-act="delspot" data-spot="' + esc(s.id) + '">Удалить</button>'
        : '<button class="btn" data-act="movespot" data-spot="' + esc(s.id) + '">Уточнить место на карте</button><button class="btn" data-act="hidespot" data-spot="' + esc(s.id) + '">Скрыть точку</button>') +
      '</div><p class="muted">Координаты встроенных точек примерные. Уточните точное место стояния на карте.</p></div>';
    modal(h);
  }
  function topHours(list) {
    const c = {}; list.forEach(j => { const hh = (j.time || '').slice(11, 13); if (hh) c[hh] = (c[hh] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0] + ':00').join(', ') || '—';
  }

  function parkOf(s) { return S.parks[s.id] || null; }
  function parkRoute(s) {
    const p = parkOf(s);
    if (p) return 'https://www.google.com/maps/dir/?api=1&destination=' + p.lat + ',' + p.lon + '&travelmode=driving';
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(s.parkQ || ('parking ' + (s.q || s.name))) + '&travelmode=driving';
  }
  function techCard(k, open) {
    const t = C.TECH[k]; if (!t) return '';
    return '<details class="fishcard"' + (open ? ' open' : '') + '><summary><b>' + t.icon + ' ' + esc(t.name) + '</b></summary><div class="fbody">' +
      '<p class="lbl">Снасть</p><ul>' + t.gear.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
      '<p class="lbl">Приманка / наживка</p><ul>' + t.bait.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
      '<p><b>Когда:</b> ' + esc(t.when) + '</p><p><b>Сезон:</b> ' + esc(t.season) + '</p><p class="muted"><b>Правила:</b> ' + esc(t.rules) + '</p></div></details>';
  }

  // ---------- Модальное окно ----------
  function modal(html) {
    let m = $('#modal'); m.innerHTML = '<div class="backdrop" data-act="close"></div>' + html; m.hidden = false;
    document.body.classList.add('noscroll');
  }
  function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; document.body.classList.remove('noscroll'); }

  // ---------- Карта ----------
  let map = null, pickMode = null;
  function destroyMap() { if (map) { map.remove(); map = null; } }
  function viewMap() {
    app().innerHTML = '<header class="top"><h1>Карта точек</h1><div class="btns">' +
      '<button class="btn pri" data-act="pickadd">+ Точка касанием</button><button class="btn" data-act="geoadd">+ Где я стою</button></div>' +
      '<div class="chips">' + [['all', 'Любая ловля']].concat(Object.entries(C.TECH).map(([k, v]) => [k, v.icon + ' ' + v.name]))
        .map(([k, t]) => '<button data-tech="' + k + '" class="chip ' + ((S.settings.tech || 'all') === k ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
      (pickMode ? '<p class="note">' + (pickMode.type === 'add' ? 'Коснитесь карты, где новая точка.' : pickMode.type === 'park' ? 'Коснитесь карты, где вы ставите машину для «' + esc(spotById(pickMode.id).name) + '».' : 'Коснитесь точного места для «' + esc(spotById(pickMode.id).name) + '».') +
        ' <button class="link" data-act="cancelpick">отмена</button></p>' : '') + '</header><div id="map"></div>' +
      '<p class="foot">Цвет: оценка на ' + ['сегодня', 'завтра', 'послезавтра'][S.day] + '. Серые — нет прогноза или нельзя.</p>';
    bindView();
    if (typeof L === 'undefined') { $('#map').innerHTML = '<p class="warn">Карта не загрузилась (нет интернета). Список точек — во вкладке «Где лучше».</p>'; return; }
    destroyMap();
    map = L.map('map', { zoomControl: true }).setView([39.62, 2.95], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
    const key = dayKey(S.day);
    allSpots().filter(s => s.lat != null).forEach(s => {
      const wx = wxFor(s.id), b = wx ? C.bestWindow(s, wx, key, S.day === 0 ? Date.now() : 0, curTech() && spotTech(s).includes(curTech()) ? curTech() : null) : null;
      if (curTech() && !spotTech(s).includes(curTech())) return;
      const pk = parkOf(s);
      if (pk) L.marker([pk.lat, pk.lon], { icon: L.divIcon({ className: 'pk', html: 'P', iconSize: [20, 20] }) }).addTo(map).bindTooltip('Парковка: ' + s.name);
      const sc = b && !b.closed ? b.score : 0;
      const col = s.noFish ? '#8a8f98' : { good: '#1fb36b', ok: '#e0a400', bad: '#e0533d', no: '#8a8f98' }[scoreClass(sc)];
      const mk = L.circleMarker([s.lat, s.lon], { radius: 10, color: '#fff', weight: 2, fillColor: col, fillOpacity: 1 }).addTo(map);
      mk.bindTooltip(s.name + (sc ? ' · ' + sc : ''), { direction: 'top' });
      mk.on('click', () => { if (!pickMode) openSpot(s.id); });
    });
    const home = S.settings.home;
    L.circleMarker([home.lat, home.lon], { radius: 6, color: '#2b6cff', fillColor: '#2b6cff', fillOpacity: 1 }).addTo(map).bindTooltip('Дом');
    map.on('click', e => {
      if (!pickMode) return;
      const p = { lat: +e.latlng.lat.toFixed(5), lon: +e.latlng.lng.toFixed(5) };
      if (pickMode.type === 'add') { pickMode = null; spotForm(null, p); }
      else if (pickMode.type === 'park') {
        const id = pickMode.id; pickMode = null;
        S.parks[id] = p; store.set('parks', S.parks); toast('Парковка сохранена'); viewMap(); openSpot(id);
      }
      else if (pickMode.type === 'move') {
        const id = pickMode.id; pickMode = null;
        const s = S.custom.find(x => x.id === id);
        if (s) { s.lat = p.lat; s.lon = p.lon; store.set('custom', S.custom); }
        else { S.edits[id] = Object.assign({}, S.edits[id], p); store.set('edits', S.edits); }
        toast('Место уточнено'); viewMap(); loadWeather(true);
      }
    });
  }

  // ---------- Форма своей точки ----------
  function spotForm(id, pos) {
    const s = id ? S.custom.find(x => x.id === id) : { name: '', type: 'rock', depth: 'mid', face: 0, reserve: 'none', fish: '', methods: '', parking: '', lat: pos.lat, lon: pos.lon };
    const opt = (v, list) => list.map(([k, t]) => '<option value="' + k + '"' + (v === k ? ' selected' : '') + '>' + t + '</option>').join('');
    modal('<form class="sheet" id="spotform"><button type="button" class="close" data-act="close">✕</button><h2>' + (id ? 'Изменить точку' : 'Новая точка') + '</h2>' +
      '<label>Название<input name="name" required value="' + esc(s.name) + '"></label>' +
      '<div class="row"><label>Берег<select name="type">' + opt(s.type, [['rock', 'Скалы'], ['beach', 'Пляж']]) + '</select></label>' +
      '<label>Глубина<select name="depth">' + opt(s.depth, [['shallow', '0–5 м'], ['mid', '5–15 м'], ['deep', '15+ м']]) + '</select></label></div>' +
      '<label>Куда смотрит берег (море)<select name="face">' + opt(String(s.face), [['0', 'Север'], ['45', 'Северо-восток'], ['90', 'Восток'], ['135', 'Юго-восток'], ['180', 'Юг'], ['225', 'Юго-запад'], ['270', 'Запад'], ['315', 'Северо-запад']]) + '</select></label>' +
      '<label>Заповедник<select name="reserve">' + opt(s.reserve, Object.entries(C.RESERVES).map(([k, r]) => [k, r.name])) + '</select></label>' +
      '<label>Рыба<input name="fish" value="' + esc(s.fish) + '"></label><label>Способы ловли<input name="methods" value="' + esc(s.methods) + '"></label>' +
      '<label>Парковка<input name="parking" value="' + esc(s.parking) + '"></label>' +
      '<p class="lbl">Виды ловли</p><div class="checks">' + Object.entries(C.TECH).map(([k, v]) => '<label class="ck"><input type="checkbox" name="tech" value="' + k + '"' + ((s.tech || []).includes(k) ? ' checked' : '') + '> ' + v.icon + ' ' + v.name + '</label>').join('') + '</div>' +
      '<p class="muted">Координаты: ' + s.lat + ', ' + s.lon + '</p><button class="btn pri wide">Сохранить</button></form>');
    $('#spotform').onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target), f = Object.fromEntries(fd);
      f.face = +f.face; f.tech = fd.getAll('tech');
      if (id) Object.assign(s, f);
      else S.custom.push(Object.assign({ id: 'my_' + Date.now(), src: 'mine', area: 'Мои', lat: s.lat, lon: s.lon, q: s.lat + ',' + s.lon }, f));
      store.set('custom', S.custom); closeModal(); toast('Точка сохранена'); render(); loadWeather(true);
    };
  }

  // ---------- Рыбы ----------
  function viewFish() {
    const spots = allSpots().filter(s => !s.noFish), today = new Date();
    if (S.fishView === 'tech') {
      return '<header class="top"><h1>Рыбы и снасти</h1><div class="seg"><button data-fv="fish">Рыбы и правила</button><button data-fv="tech" class="on">Снасти по технике</button></div></header>' +
        '<div class="list">' + Object.keys(C.TECH).map(k => techCard(k, false)).join('') + '</div>' +
        '<p class="foot">Снасти — практические рекомендации, а не закон. Правила — по Cuaderno de pesca recreativa 2026.</p>';
    }
    let h = '<header class="top"><h1>Рыбы и снасти</h1><div class="seg"><button data-fv="fish" class="on">Рыбы и правила</button><button data-fv="tech">Снасти по технике</button></div></header>' +
      '<form class="panel" id="checkform"><h3>Проверить улов</h3><div class="row"><label>Вид<select name="fish">' +
      C.FISH.map(f => '<option value="' + f.id + '">' + esc(f.ru) + '</option>').join('') + '</select></label>' +
      '<label>Точка<select name="spot"><option value="">— вне заповедника —</option>' + spots.map(s => '<option value="' + esc(s.id) + '">' + esc(s.name) + '</option>').join('') + '</select></label></div>' +
      '<div class="row"><label>Длина, см<input name="len" type="number" inputmode="decimal" step="0.5"></label><label>Вес, кг<input name="kg" type="number" inputmode="decimal" step="0.05"></label></div>' +
      '<button class="btn pri wide">Можно оставить?</button><div id="verdict"></div></form>' +
      '<p class="sub">Длина — от кончика рта до конца хвоста. <a target="_blank" rel="noopener" href="' + C.TALLAS_URL + '">Официальная таблица талий</a></p><div class="list">';
    C.FISH.forEach(f => {
      const open = C.fishOpen(f, today);
      h += '<details class="fishcard"><summary><b>' + esc(f.ru) + '</b> <span class="muted">' + esc(f.es) + ' / ' + esc(f.ca) + '</span>' +
        '<span class="pill ' + (open ? 'okp' : 'nop') + '">' + (open ? 'сезон открыт' : 'запрет') + '</span></summary>' +
        '<div class="fbody"><i class="muted">' + esc(f.lat) + '</i><ul>' +
        (f.min ? '<li>Мин. размер: <b>' + f.min + ' см</b>' + (f.minRes ? ', в заповеднике ' + f.minRes + ' см' : '') + '</li>' : '') +
        (f.minKg ? '<li>Мин. вес: <b>' + f.minKg + ' кг</b></li>' : '') +
        (f.check ? '<li>Мин. размер: проверить в таблице талий</li>' : '') +
        (f.limit ? '<li>Лимит: <b>' + f.limit + ' шт в день</b></li>' : '') +
        (f.limitKg ? '<li>Лимит: <b>' + f.limitKg + ' кг в день</b></li>' : '') + (f.dayOnly ? '<li>Только днём</li>' : '') +
        (f.open ? '<li>Можно: ' + (f.openFrom ? f.openFrom : '1.' + String(f.open[0]).padStart(2, '0')) + ' – ' + ({ 12: '31.12', 3: '31.03' }[f.open[1]] || f.open[1]) + '</li>' : '') +
        (f.closed ? '<li>Запрет на Майорке: ' + f.closed.map(m => ['', 'янв', 'фев', 'мар', 'апр', 'май', 'июнь', 'июль', 'авг', 'сен', 'окт', 'ноя', 'дек'][m]).join(', ') + '</li>' : '') +
        (f.mark ? '<li>Пометить: подрезать нижнюю лопасть хвоста</li>' : '') +
        (f.pescarec ? '<li>Записать в PescaREC</li>' : '') +
        '</ul><p>' + esc(f.tips) + '</p></div></details>';
    });
    h += '</div><p class="foot">По «Cuaderno de pesca recreativa» 27.07.2026. Справочник не заменяет закон: при сомнении отпустите рыбу. <a target="_blank" rel="noopener" href="' + C.RULES_URL + '">Полный текст</a></p>';
    return h;
  }

  // ---------- Журнал ----------
  function viewLog() {
    const j = S.journal.slice().sort((a, b) => (b.time || '').localeCompare(a.time || ''));
    let h = '<header class="top"><h1>Журнал</h1><div class="btns"><button class="btn pri" data-act="addcatch">+ Улов / выход</button>' +
      '<button class="btn" data-act="stats">Статистика</button></div></header>';
    if (!j.length) h += '<p class="note">Пока пусто. Записывайте и уловы, и пустые выходы — так статистика честнее.</p>';
    h += '<div class="list">';
    j.forEach(e => {
      const s = spotById(e.spot), f = C.FISH.find(x => x.id === e.fish);
      h += '<div class="entry" data-entry="' + e.id + '">' + (e.photo ? '<img data-photo="' + e.id + '" alt="">' : '') +
        '<div><b>' + (f ? esc(f.ru) : 'Без улова') + (e.len ? ' · ' + e.len + ' см' : '') + (e.kg ? ' · ' + e.kg + ' кг' : '') + '</b>' +
        '<div class="cmeta">' + new Date(e.time).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' · ' + esc(s ? s.name : '?') + '</div>' +
        '<div class="muted">' + [e.method, e.bait, e.kept === 'kept' ? 'оставил' : e.kept === 'released' ? 'отпустил' : '', e.wx].filter(Boolean).map(esc).join(' · ') + '</div>' +
        (e.note ? '<div>' + esc(e.note) + '</div>' : '') + '<button class="link danger" data-act="delentry" data-id="' + e.id + '">удалить</button></div></div>';
    });
    return h + '</div>';
  }
  function catchForm(spotId) {
    const spots = allSpots().filter(s => !s.noFish), now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    modal('<form class="sheet" id="catchform"><button type="button" class="close" data-act="close">✕</button><h2>Запись в журнал</h2>' +
      '<label>Когда<input name="time" type="datetime-local" value="' + now.toISOString().slice(0, 16) + '"></label>' +
      '<label>Точка<select name="spot">' + spots.map(s => '<option value="' + esc(s.id) + '"' + (s.id === spotId ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('') + '</select></label>' +
      '<label>Рыба<select name="fish"><option value="">Без улова</option>' + C.FISH.map(f => '<option value="' + f.id + '">' + esc(f.ru) + '</option>').join('') + '<option value="other">Другая</option></select></label>' +
      '<div class="row"><label>Длина, см<input name="len" type="number" inputmode="decimal" step="0.5"></label><label>Вес, кг<input name="kg" type="number" inputmode="decimal" step="0.05"></label></div>' +
      '<div class="row"><label>Способ<select name="method"><option></option><option>Сёрфкастинг</option><option>Донка</option><option>Поплавок</option><option>Спиннинг</option><option>Эги</option><option>Живец</option></select></label>' +
      '<label>Наживка<input name="bait" placeholder="креветка, воблер…"></label></div>' +
      '<label>Улов<select name="kept"><option value="">—</option><option value="released">Отпустил</option><option value="kept">Оставил</option></select></label>' +
      '<label>Фото<input name="photo" type="file" accept="image/*" capture="environment"></label>' +
      '<label>Заметка<textarea name="note" rows="2"></textarea></label><div id="cverdict"></div>' +
      '<button class="btn pri wide">Сохранить</button></form>');
    const form = $('#catchform');
    const upd = () => {
      const fd = new FormData(form), fid = fd.get('fish');
      if (!fid || fid === 'other') { $('#cverdict').innerHTML = ''; return; }
      const t = new Date(fd.get('time')), cnt = S.journal.filter(e => e.fish === fid && e.kept === 'kept' && (e.time || '').slice(0, 10) === C.ymd(t)).length;
      $('#cverdict').innerHTML = verdictHtml(C.checkCatch(fid, +fd.get('len') || 0, +fd.get('kg') || 0, spotById(fd.get('spot')), t, cnt));
    };
    form.oninput = upd;
    form.onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(form), id = 'c' + Date.now(), file = fd.get('photo');
      const entry = { id, time: fd.get('time'), spot: fd.get('spot'), fish: fd.get('fish') || null, len: +fd.get('len') || null, kg: +fd.get('kg') || null,
        method: fd.get('method'), bait: fd.get('bait'), kept: fd.get('kept'), note: fd.get('note') };
      entry.wx = wxSnapshot(entry.spot, entry.time);
      if (file && file.size) { const data = await shrink(file); if (data) { await photoDB.put(id, data); entry.photo = true; } }
      S.journal.push(entry); store.set('journal', S.journal); closeModal(); S.tab = 'log'; store.set('tab', 'log'); render(); toast('Записано');
    };
  }
  function wxSnapshot(spotId, time) {
    const wx = wxFor(spotId); if (!wx || !time) return '';
    const k = wx.t.indexOf(time.slice(0, 13) + ':00'); if (k < 0) return '';
    return 'ветер ' + Math.round(wx.wind[k]) + ' ' + compass(wx.dir[k]) + (wx.wave[k] != null ? ', волна ' + wx.wave[k].toFixed(1) : '') + ', ' + Math.round(wx.press[k]) + ' гПа';
  }
  function shrink(file) {
    return new Promise(res => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 1000 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => res(null); img.src = url;
    });
  }
  function verdictHtml(v) {
    const t = { keep: ['okv', 'Можно оставить'], release: ['nov', 'Отпустить'], check: ['chv', 'Проверьте'] }[v.verdict] || ['chv', '?'];
    return '<div class="verdict ' + t[0] + '"><b>' + t[1] + '</b><ul>' + v.lines.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
  }

  function statsView() {
    const j = S.journal, withFish = j.filter(e => e.fish);
    const group = (arr, fn) => { const m = {}; arr.forEach(e => { const k = fn(e); if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
    const bars = (title, rows) => {
      if (!rows.length) return '';
      const mx = rows[0][1];
      return '<h3>' + title + '</h3>' + rows.slice(0, 8).map(([k, v]) => '<div class="sbar"><span>' + esc(k) + '</span><i style="width:' + (v / mx * 100) + '%"></i><b>' + v + '</b></div>').join('');
    };
    const outings = j.length, success = withFish.length;
    modal('<div class="sheet"><button class="close" data-act="close">✕</button><h2>Статистика</h2>' +
      '<p>Записей: <b>' + outings + '</b>, с уловом: <b>' + success + '</b>' + (outings ? ' (' + Math.round(success / outings * 100) + '%)' : '') + '</p>' +
      bars('Лучшие точки', group(withFish, e => (spotById(e.spot) || {}).name)) +
      bars('Виды', group(withFish, e => (C.FISH.find(f => f.id === e.fish) || { ru: 'Другая' }).ru)) +
      bars('Часы клёва', group(withFish, e => (e.time || '').slice(11, 13) + ':00')) +
      bars('Наживка', group(withFish, e => e.bait)) + bars('Способ', group(withFish, e => e.method)) +
      (outings ? '' : '<p class="note">Статистика появится после первых записей.</p>') + '</div>');
  }

  // ---------- Ещё ----------
  function viewMore() {
    const st = S.settings;
    return '<header class="top"><h1>Ещё</h1></header><div class="panel"><h3>Уведомления</h3>' +
      '<p>Вечером (после 18:00) приложение напомнит, где завтра лучший шанс. Работает, когда приложение установлено на главный экран.</p>' +
      '<button class="btn ' + (st.notif ? '' : 'pri') + '" data-act="notif">' + (st.notif ? 'Выключить' : 'Включить уведомления') + '</button></div>' +
      '<div class="panel"><h3>Дом</h3><p>' + esc(st.home.name) + ' (' + st.home.lat.toFixed(3) + ', ' + st.home.lon.toFixed(3) + ')</p>' +
      '<button class="btn" data-act="sethome">Мой дом — там, где я сейчас</button></div>' +
      '<div class="panel"><h3>Резервная копия</h3><p>Точки, журнал и фото в одном файле. Делайте копию раз в месяц.</p>' +
      '<div class="btns"><button class="btn" data-act="export">Сохранить файл</button><label class="btn">Загрузить файл<input type="file" accept=".json,application/json" id="importfile" hidden></label></div></div>' +
      '<div class="panel"><h3>Скрытые точки</h3><p>' + (S.hidden.length ? S.hidden.length + ' скрыто. <button class="link" data-act="unhide">Показать все</button>' : 'Нет') + '</p></div>' +
      '<div class="panel"><h3>Правила и источники</h3><ul class="tips">' +
      '<li>Лицензия обязательна с 14 лет: 26,21 € на 3 года. <a target="_blank" rel="noopener" href="https://www.caib.es/seucaib/es/200/personas/tramites/tramite/96401">Оформить</a></li>' +
      '<li>До 2 удочек, до 6 крючков, 5 кг + 1 рыба в день, продажа запрещена.</li>' +
      '<li>Пляжи 1 мая – 30 сен: нельзя с 7:00 до 22:00. Не ближе 100 м к купающимся и 250 м к сетям. Не в портах.</li>' +
      '<li><a target="_blank" rel="noopener" href="' + C.RULES_URL + '">Cuaderno de pesca recreativa 2026</a> · <a target="_blank" rel="noopener" href="https://www.caib.es/sites/reservesmarines/es/mapa/">Карта заповедников</a></li>' +
      '<li>Погода: Open-Meteo. Карта: OpenStreetMap.</li><li>Сомнения по заповедникам: 971 176 100.</li></ul></div>' +
      '<p class="foot">Рыбалка Майорка · версия 1.1 · данные хранятся только в этом телефоне.</p>';
  }

  async function doExport() {
    const photos = await photoDB.all();
    const data = JSON.stringify({ v: 1, at: new Date().toISOString(), custom: S.custom, edits: S.edits, hidden: S.hidden, journal: S.journal, settings: S.settings, parks: S.parks, photos });
    const name = 'rybalka-' + C.ymd(new Date()) + '.json';
    // Внутри claude.ai файл отдаётся через платформу
    if (window.claude && typeof window.claude.use === 'function') {
      try {
        const dl = await window.claude.use('downloads');
        if (dl) { await dl.save({ filename: name, data }); toast('Файл сохранён'); return; }
      } catch (e) { if (e && e.code === 'declined') return; }
    }
    try {
      const file = new File([data], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Файл сохранён в «Загрузки»');
  }
  async function doImport(file) {
    try {
      const d = JSON.parse(await file.text());
      if (!d || d.v !== 1) throw new Error();
      if (!confirm('Заменить текущие точки и журнал данными из файла?')) return;
      S.custom = d.custom || []; S.edits = d.edits || {}; S.hidden = d.hidden || []; S.journal = d.journal || []; S.parks = d.parks || {}; S.settings = Object.assign(S.settings, d.settings || {});
      ['custom', 'edits', 'hidden', 'journal', 'settings', 'parks'].forEach(k => store.set(k, S[k]));
      for (const [k, v] of Object.entries(d.photos || {})) await photoDB.put(k, v);
      toast('Данные загружены'); render(); loadWeather(true);
    } catch (e) { toast('Файл не подошёл'); }
  }

  // ---------- Уведомления ----------
  async function saveSpotsForSW() {
    try { const c = await caches.open('ryb-data'); await c.put('/__spots', new Response(JSON.stringify({ spots: weatherSpots(), notif: S.settings.notif }))); } catch (e) { }
  }
  function bestTomorrowText() {
    const r = ranking(1).filter(x => x.b && !x.b.closed);
    if (!r.length) return null;
    const { s, b, wx } = r[0];
    return 'Завтра лучше всего: ' + s.name + ', ' + hhmm(wx.t[b.i]) + '–' + addH(wx.t[b.i], 2) + ' (оценка ' + b.score + ')';
  }
  async function maybeNotify() {
    if (!S.settings.notif || !('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date(); if (now.getHours() < 18) return;
    const k = C.ymd(now); if (store.get('notified', '') === k) return;
    const text = bestTomorrowText(); if (!text) return;
    try { const reg = await navigator.serviceWorker.ready; reg.showNotification('Рыбалка Майорка', { body: text, icon: 'icon-192.png', tag: 'tomorrow' }); store.set('notified', k); } catch (e) { }
  }
  async function toggleNotif() {
    if (S.settings.notif) { S.settings.notif = false; store.set('settings', S.settings); render(); saveSpotsForSW(); return; }
    if (!('Notification' in window) || !('serviceWorker' in navigator)) { toast('Уведомления доступны только в установленном приложении'); return; }
    const p = await Notification.requestPermission();
    if (p !== 'granted') { toast('Разрешение не дано'); return; }
    S.settings.notif = true; store.set('settings', S.settings); saveSpotsForSW();
    try { const reg = await navigator.serviceWorker.ready; if (reg.periodicSync) await reg.periodicSync.register('tomorrow', { minInterval: 12 * 60 * 60 * 1000 }); } catch (e) { }
    toast('Уведомления включены'); render(); maybeNotify();
  }

  // ---------- События ----------
  function bindView() {
    const imp = $('#importfile'); if (imp) imp.onchange = e => e.target.files[0] && doImport(e.target.files[0]);
    const cf = $('#checkform');
    if (cf) {
      const run = e => {
        if (e) e.preventDefault();
        const fd = new FormData(cf), fid = fd.get('fish'), today = new Date();
        const cnt = S.journal.filter(x => x.fish === fid && x.kept === 'kept' && (x.time || '').slice(0, 10) === C.ymd(today)).length;
        $('#verdict').innerHTML = verdictHtml(C.checkCatch(fid, +fd.get('len') || 0, +fd.get('kg') || 0, spotById(fd.get('spot')) || { reserve: 'none' }, today, cnt));
      };
      cf.onsubmit = run;
    }
    document.querySelectorAll('img[data-photo]').forEach(async img => { const d = await photoDB.get(img.dataset.photo); if (d) img.src = d; else img.remove(); });
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-tab],[data-day],[data-filter],[data-tech],[data-fv],[data-act],[data-spot]');
    if (!t) return;
    if (t.dataset.tab) { S.tab = t.dataset.tab; store.set('tab', S.tab); pickMode = null; render(); window.scrollTo(0, 0); return; }
    if (t.dataset.day) { S.day = +t.dataset.day; render(); return; }
    if (t.dataset.tech) { S.settings.tech = t.dataset.tech; store.set('settings', S.settings); render(); return; }
    if (t.dataset.fv) { S.fishView = t.dataset.fv; render(); return; }
    if (t.dataset.filter) { S.settings.filter = t.dataset.filter; store.set('settings', S.settings); render(); return; }
    const act = t.dataset.act, id = t.dataset.spot;
    if (!act && id) { openSpot(id); return; }
    switch (act) {
      case 'close': closeModal(); break;
      case 'refresh': loadWeather(true); break;
      case 'addcatch': catchForm(id); break;
      case 'stats': statsView(); break;
      case 'pickadd': pickMode = { type: 'add' }; viewMap(); break;
      case 'cancelpick': pickMode = null; viewMap(); break;
      case 'setpark': closeModal(); pickMode = { type: 'park', id }; S.tab = 'map'; store.set('tab', 'map'); render(); toast('Коснитесь карты там, где ставите машину'); break;
      case 'movespot': closeModal(); pickMode = { type: 'move', id }; S.tab = 'map'; render(); break;
      case 'geoadd': geo(p => spotForm(null, p)); break;
      case 'editspot': spotForm(id); break;
      case 'delspot': if (confirm('Удалить точку?')) { S.custom = S.custom.filter(s => s.id !== id); store.set('custom', S.custom); closeModal(); render(); } break;
      case 'hidespot': S.hidden.push(id); store.set('hidden', S.hidden); closeModal(); render(); toast('Точка скрыта (вернуть: «Ещё»)'); break;
      case 'unhide': S.hidden = []; store.set('hidden', S.hidden); render(); break;
      case 'delentry': if (confirm('Удалить запись?')) { const eid = t.dataset.id; S.journal = S.journal.filter(x => x.id !== eid); store.set('journal', S.journal); photoDB.del(eid); render(); } break;
      case 'notif': toggleNotif(); break;
      case 'export': doExport(); break;
      case 'sethome': geo(p => { S.settings.home = { lat: p.lat, lon: p.lon, name: 'Мой дом' }; store.set('settings', S.settings); render(); toast('Дом сохранён'); }); break;
    }
  });
  function geo(cb) {
    if (!navigator.geolocation) { toast('Геолокация недоступна'); return; }
    toast('Определяю место…');
    navigator.geolocation.getCurrentPosition(p => cb({ lat: +p.coords.latitude.toFixed(5), lon: +p.coords.longitude.toFixed(5) }),
      () => toast('Не удалось определить место. Включите GPS и разрешите доступ.'), { enableHighAccuracy: true, timeout: 15000 });
  }
  let tt;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(tt); tt = setTimeout(() => el.hidden = true, 2800); }

  // ---------- Старт ----------
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  render();
  loadWeather(false);
})();
