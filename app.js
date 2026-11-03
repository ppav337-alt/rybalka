/* Рыбалка Майорка — интерфейс */
(function () {
  'use strict';
  const C = window.FishCore;
  const I18N = window.I18N, T = I18N.T, LOC = I18N.locale;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Хранилище ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ryb_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ryb_' + k, JSON.stringify(v)); return true; } catch (e) { toast(T('Не удалось сохранить: память браузера недоступна')); return false; } }
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
    settings: store.get('settings', { home: { lat: 39.7646, lon: 3.1541, name: 'Can Picafort' }, filter: 'all', notif: false }),
    parks: store.get('parks', {}),
    lic: store.get('lic', null),            // лицензия {num, until, holder, p1, p2}          // свои отметки парковки {id:{lat,lon}}
    marks: store.get('marks', []),          // мои отметки на карте {id,lat,lon,kind,note,date}
    pack: store.get('pack', {}),            // сборы {day, done:[]}
    showF: false,
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
  const ICON = {
    wind: '<svg viewBox="0 0 24 24"><path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7"/></svg>',
    wave: '<svg viewBox="0 0 24 24"><path d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/></svg>',
    gauge: '<svg viewBox="0 0 24 24"><path d="M4 16a8 8 0 1 1 16 0M12 16l4-5"/><circle cx="12" cy="16" r="1.3"/></svg>',
    flow: '<svg viewBox="0 0 24 24"><path d="M3 8c3 0 3 2 6 2s3-2 6-2M3 14c3 0 3 2 6 2s3-2 6-2M17 6l4 3-4 3"/></svg>',
    tide: '<svg viewBox="0 0 24 24"><path d="M12 3v10M8 7l4-4 4 4M2 17c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 21h20"/></svg>',
    temp: '<svg viewBox="0 0 24 24"><path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0z"/></svg>'
  };
  const metric = (icon, val, sub, pre) => '<div class="m"><i>' + icon + '</i><div><b>' + val + '</b><span>' + (pre || '') + (pre ? ' ' : '') + esc(sub) + '</span></div></div>';
  const waveWord = w => w < 0.3 ? T('штиль') : w < 0.8 ? T('слабая') : w < 1.5 ? T('умеренная') : T('сильная');
  const waterWord = t => t >= 22 ? T('тёплая') : t >= 18 ? T('комфортная') : T('прохладная');
  const GOOD_TAGS = ['давление плавно падает', 'рассвет', 'закат', 'лёгкий ветер с моря', 'мутная вода: шанс на сибаса', 'время кальмара', 'тёплая вода — краб активен', 'солунар: главный период', 'солунар: малый период', 'ваши часы'].map(x => T(x));
  const TI = {
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7"/>',
    down: '<path d="M4 7l6 6 3-3 7 7M20 11v6h-6"/>', up: '<path d="M4 17l6-6 3 3 7-7M20 13V7h-6"/>',
    sun: '<path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 4v3M4.9 9.9l2 2M19.1 9.9l-2 2"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>', moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    warn: '<path d="M12 4l9 16H3zM12 10v4M12 17v.5"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>'
  };
  const tagIcon = x => {
    const k = x === T('лёгкий ветер с моря') ? 'leaf' : x === T('давление плавно падает') || x === T('давление резко падает') ? 'down' : x === T('давление резко растёт') ? 'up' :
      x === T('рассвет') || x === T('закат') ? 'sun' : x.indexOf(T('солунар')) === 0 ? 'moon' : x === T('ваши часы') ? 'star' : x.indexOf(T('мутная вода')) === 0 || x === T('ливень') ? 'drop' : x === T('время кальмара') ? 'moon' :
      x === T('правила не подтверждены') ? 'info' : GOOD_TAGS.includes(x) ? 'leaf' : 'warn';
    return '<svg viewBox="0 0 24 24">' + TI[k] + '</svg>';
  };
  const tagTone = x => GOOD_TAGS.includes(x) ? 'tg' : x === T('правила не подтверждены') ? 'tn' : 'tb';
  function ring(score, label) {
    const cls = score == null ? 'no' : scoreClass(score), p = score == null ? 0 : score / 100, L = 2 * Math.PI * 23;
    return '<span class="ring ' + cls + '"><svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="23" class="trk"/><circle cx="28" cy="28" r="23" class="val" stroke-dasharray="' +
      (L * p).toFixed(1) + ' ' + L.toFixed(1) + '"/></svg><b>' + (score == null ? label : score) + '</b></span>';
  }
  const scoreClass = s => s >= 70 ? 'good' : s >= 50 ? 'ok' : s > 0 ? 'bad' : 'no';
  const dirArrow = d => '<span class="arr" style="transform:rotate(' + ((d + 180) % 360) + 'deg)">↑</span>';
  const compass = d => [T('С'), T('СВ'), T('В'), T('ЮВ'), T('Ю'), T('ЮЗ'), T('З'), T('СЗ')][Math.round(d / 45) % 8];
  const mapsLink = s => s.lat != null
    ? 'https://www.google.com/maps/dir/?api=1&destination=' + s.lat + ',' + s.lon
    : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.q || s.name);
  const searchLink = s => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.q || s.name);

  if (S.settings.home && S.settings.home.name === 'Santa Margalida') { S.settings.home = { lat: 39.7646, lon: 3.1541, name: 'Can Picafort' }; store.set('settings', S.settings); }

  // ---------- Погода ----------
  async function loadWeather(force) {
    const spots = weatherSpots(), ids = spots.map(s => s.id).join('|');
    const fresh = S.wx && (Date.now() - S.wx.at < 60 * 60 * 1000) && S.wx.ids.join('|') === ids;
    if (fresh && !force) return;
    S.loading = true; S.err = null; render();
    try {
      const u = C.weatherUrls(spots);
      const [fc, mar] = await Promise.all([fetch(u.fc).then(r => { if (!r.ok) throw new Error(T('погода ') + r.status); return r.json(); }),
        fetch(u.mar).then(r => r.ok ? r.json() : Promise.reject()).catch(() => fetch(u.mar2).then(r => r.ok ? r.json() : null)).catch(() => null)]);
      const data = C.parseWeather(fc, mar || (Array.isArray(fc) ? fc.map(() => ({})) : {}));
      S.wx = { at: Date.now(), ids: spots.map(s => s.id), data };
      store.set('wx', S.wx);
      saveSpotsForSW();
    } catch (e) {
      S.err = T('Нет связи с сервисом погоды') + (S.wx ? T(', показан прогноз от ') + new Date(S.wx.at).toLocaleString(LOC, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '') + '.';
    }
    S.loading = false; render(); maybeNotify();
  }

  // ---------- Рейтинг ----------
  // Удачные часы по журналу: час, в который было 2+ улова
  function pers() {
    const c = {}; S.journal.filter(j => j.fish).forEach(j => { const h = +(j.time || '').slice(11, 13); if (!isNaN(h)) c[h] = (c[h] || 0) + 1; });
    return { hours: new Set(Object.keys(c).filter(h => c[h] >= 2).map(Number)) };
  }
  function ranking(off) {
    const key = dayKey(off), P = pers(), home = S.settings.home;
    const sc = x => x.b && !x.b.closed ? x.b.score : -1;
    return weatherSpots().map(s => {
      const wx = wxFor(s.id); if (!wx) return { s, b: null };
      return { s, b: C.bestWindow(s, wx, key, off === 0 ? Date.now() : 0, curTech(), P), wx };
    }).sort((a, b) => (sc(b) - sc(a)) || (km(home, a.s) - km(home, b.s)));
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

  const FILTERS = [['all', T('Все')], ['near', T('До 30 км')], ['beach', T('Пляж')], ['rock', T('Скалы')], ['shallow', T('0–5 м')], ['mid', T('5–15 м')], ['deep', T('15+ м')]];
  // Окно клёва рядом с домом в ближайшие 3 часа
  function nearWindow() {
    if (S.day !== 0) return null;
    const now = Date.now(), home = S.settings.home;
    return ranking(0).filter(x => x.b && !x.b.closed && x.b.score >= 80 && km(home, x.s) <= 30)
      .map(x => Object.assign(x, { at: new Date(x.wx.t[x.b.i]).getTime() })).filter(x => x.at - now <= 3 * 3600000)[0] || null;
  }
  function viewBest() {
    const now = new Date(), r = filterSpots(ranking(S.day));
    const moon = C.moonPhase(new Date(Date.now() + S.day * 86400000));
    let h = '<header class="top"><div class="toprow"><h1>' + T('Где лучше ловить') + '</h1><button class="nightbtn" data-act="night" aria-label="' + T('Ночной режим') + '">' + (S.settings.night ? '☀' : '☾') + '</button></div><div class="seg">' +
      [T('Сегодня'), T('Завтра'), T('Послезавтра')].map((t, i) => '<button data-day="' + i + '" class="' + (S.day === i ? 'on' : '') + '">' + t + '</button>').join('') +
      '</div><div class="chips">' +
      [['all', T('Любая ловля')]].concat(Object.entries(C.TECH).map(([k, v]) => [k, v.icon + ' ' + v.name]))
        .map(([k, t]) => '<button data-tech="' + k + '" class="chip ' + ((S.settings.tech || 'all') === k ? 'on' : '') + '">' + t + '</button>').join('') +
      '</div><div class="chips">' + '<button class="chip' + (S.settings.filter !== 'all' ? ' on' : '') + '" data-act="togglef">⚙ ' + (S.settings.filter !== 'all' ? FILTERS.find(x => x[0] === S.settings.filter)[1] : T('Фильтры')) + (S.showF ? ' ▴' : ' ▾') + '</button>' +
      (S.showF ? FILTERS.map(([k, t]) => '<button data-filter="' + k + '" class="chip ' + (S.settings.filter === k ? 'on' : '') + '">' + t + '</button>').join('') : '') +
      T('</div><div class="sub">Луна: ') + C.moonName(moon) + ' · ' + C.DOW[new Date(Date.now() + S.day * 86400000).getDay()] +
      (S.wx ? T(' · прогноз ') + new Date(S.wx.at).toLocaleTimeString(LOC, { hour: '2-digit', minute: '2-digit' }) : '') +
      T(' <button class="link" data-act="refresh">обновить</button></div></header>');
    if (S.loading) h += T('<p class="note">Загружаю погоду…</p>');
    if (S.err) h += '<p class="warn">' + esc(S.err) + '</p>';
    const ls = licState(); if (ls && ls.d <= 30) h += '<p class="warn">' + esc(ls.text) + T(' <button class="link" data-act="licshow">Открыть</button></p>');
    if (!S.wx && !S.loading) h += T('<p class="note">Погоды пока нет. Нажмите «обновить», нужен интернет.</p>');
    const nw = nearWindow();
    if (nw) h += '<button class="nearbar" data-spot="' + esc(nw.s.id) + '"><b>🎣 ' + T('Скоро клёв рядом') + '</b><span>' + esc(nw.s.name) + ' · ' + hhmm(nw.wx.t[nw.b.i]) + ' · ' + T('оценка') + ' ' + nw.b.score + ' · ' + km(S.settings.home, nw.s) + T(' км') + '</span></button>';
    if (S.settings.night) h += '<div class="quick"><button class="btn" data-act="addcatch">＋ ' + T('Улов') + '</button><button class="btn" data-act="share">📤 ' + T('Моё место') + '</button><a class="btn" target="_blank" rel="noopener" href="' + homeRoute() + '">🏠 ' + T('Домой') + '</a></div>';
    h += '<div class="list">';
    let heroDone = false;
    r.forEach(({ s, b, wx }) => {
      const dist = km(S.settings.home, s);
      if (!b) { h += card(s, ring(null, '—'), T('<div class="muted">нет прогноза</div>'), dist); return; }
      if (b.closed) { h += card(s, ring(null, '✕'), '<div class="muted">' + esc(b.why) + '</div>', dist); return; }
      const t = wx.t[b.i], k = b.i, wv = wx.wave[k], sst = wx.sst[k];
      const info = '<div class="metrics">' +
        metric(ICON.wind, Math.round(wx.wind[k]) + '<small>' + T(' км/ч') + '</small>', compass(wx.dir[k]), dirArrow(wx.dir[k])) +
        (wv != null ? metric(ICON.wave, wv.toFixed(1) + '<small>' + T(' м') + '</small>', waveWord(wv)) : '') +
        (sst != null ? metric(ICON.temp, Math.round(sst) + '°', waterWord(sst)) : '') + '</div>' +
        (b.tags.length ? '<div class="tags">' + b.tags.slice(0, 3).map(x => '<span class="' + tagTone(x) + '">' + tagIcon(x) + esc(x) + '</span>').join('') + '</div>' : '') +
        (b.danger ? T('<div class="danger">⚠ Опасно на скалах: волна или порывы</div>') : '');
      const hero = !heroDone && b.score >= 50; heroDone = true;
      h += card(s, ring(b.score), info, dist, (S.day ? '<small>' + [T('сегодня'), T('завтра'), T('послезавтра')][S.day] + '</small> ' : '') + hhmm(t) + '–' + addH(t, 2), hero);
    });
    h += T('</div><p class="foot">Оценка 0–100 по ветру, волне, давлению, времени суток, луне и мутности. Это подсказка, а не гарантия клёва.</p>');
    return h;
  }
  function card(s, badge, info, dist, win, hero) {
    return '<button class="card' + (hero ? ' hero' : '') + '" data-spot="' + esc(s.id) + '">' + (hero ? '<div class="herolbl">★ ' + T('Лучшее место') + '</div>' : '') + badge + '<div class="cbody"><div class="chead"><div class="cname">' + esc(s.name) +
      (s.src === 'mine' ? T(' <small>моя</small>') : '') + '</div>' + (win ? '<span class="wintime">' + win + '</span>' : '') + '</div><div class="cmeta">' + esc(s.area || '') + ' · ' + (s.type === 'beach' ? T('пляж') : T('скалы')) + ' · ' +
      ({ shallow: T('0–5 м'), mid: T('5–15 м'), deep: T('15+ м') }[s.depth] || '') + ' · ' + dist + T(' км') +
      (spotTech(s).length ? ' · ' + spotTech(s).map(k => C.TECH[k] ? C.TECH[k].icon : '').join('') : '') + '</div></div><div class="cinfo">' + info + '</div></button>';
  }

  // ---------- Карточка точки ----------
  function openSpot(id) {
    const s = spotById(id); if (!s) return;
    const wx = wxFor(id), key = dayKey(S.day), res = C.RESERVES[s.reserve] || C.RESERVES.none;
    let h = '<div class="sheet"><button class="close" data-act="close">✕</button><h2>' + esc(s.name) + '</h2>' +
      '<div class="cmeta">' + esc(s.area || '') + ' · ' + (s.type === 'beach' ? T('пляж') : T('скалы')) + ' · ' + ({ shallow: T('0–5 м'), mid: T('5–15 м'), deep: T('15+ м') }[s.depth] || '') +
      ' · ' + km(S.settings.home, s) + T(' км от дома</div>');
    if (s.warn) h += '<p class="warn">' + esc(s.warn) + '</p>';
    h += '<div class="btns"><a class="btn pri" target="_blank" rel="noopener" href="' + parkRoute(s) + T('">🚗 Маршрут к парковке</a>') +
      (s.lat != null ? '<a class="btn" target="_blank" rel="noopener" href="' + mapsLink(s) + T('&travelmode=walking">🚶 К месту ловли</a>') : '') +
      '<button class="btn" data-act="addcatch" data-spot="' + esc(s.id) + T('">Записать улов</button>') +
      (s.lat == null ? '<a class="btn" target="_blank" rel="noopener" href="' + searchLink(s) + T('">Найти на карте</a>') : '') +
      '<button class="btn" data-act="pack" data-spot="' + esc(s.id) + '">🎒 ' + T('Сборы') + '</button><button class="btn" data-act="share">📤 ' + T('Отправить моё место') + '</button></div>';
    if (wx) h += seaBlock(s, wx, key);
    h += T('<h3>Режим</h3><p><b>') + esc(res.name) + '.</b> ' + esc(res.note) + (res.url ? ' <a target="_blank" rel="noopener" href="' + res.url + T('">Правила</a>') : '') + '</p>';
    const L = C.legal(s, new Date(key + 'T12:00'));
    if (!L.ok) h += '<p class="warn">' + esc(L.why) + '</p>';
    h += T('<h3>Парковка</h3><p>') + esc(s.parking || '—') + (parkOf(s) ? T(' <b>· отмечена вами на карте</b>') : T(' <span class="muted">(поиск по названию)</span>')) +
      '</p><div class="btns"><button class="btn" data-act="setpark" data-spot="' + esc(s.id) + '">📍 ' + (parkOf(s) ? T('Изменить') : T('Отметить')) + T(' мою парковку</button></div>');
    h += T('<h3>Рыба</h3><p>') + esc(s.fish) + '</p>';
    const techs = spotTech(s);
    if (techs.length) {
      h += T('<h3>Чем ловить здесь</h3>');
      techs.forEach((k, n) => { h += techCard(k, n === 0 || k === curTech()); });
    }
    const seas = C.tackle(s, new Date(key + 'T12:00'), true);
    if (seas.length) h += T('<h3>Сейчас в сезоне</h3><ul class="tips">') + C.tackle(s, new Date(key + 'T12:00'), true).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
    if (wx) {
      const di = wx.days.indexOf(key);
      h += T('<h3>Прогноз по часам · ') + ([T('сегодня'), T('завтра'), T('послезавтра')][S.day]) + '</h3>';
      if (di >= 0) h += T('<p class="muted">Восход ') + hhmm(wx.sunrise[di]) + T(' · закат ') + hhmm(wx.sunset[di]) + T(' · луна: ') + C.moonName(C.moonPhase(new Date(key + 'T12:00'))) + '</p>';
      h += '<div class="hours">';
      wx.t.forEach((t, i) => {
        if (t.slice(0, 10) !== key) return;
        const r = C.hourScore(s, wx, i, curTech() && spotTech(s).includes(curTech()) ? curTech() : null, pers());
        h += '<div class="hr ' + (r.legal.ok ? '' : 'off') + '"><div class="bar ' + scoreClass(r.score) + '" style="height:' + Math.max(4, r.score) + '%"></div><div class="hl">' + t.slice(11, 13) + '</div></div>';
      });
      h += T('</div><table class="wx"><tr><th>Час</th><th>Ветер</th><th>Порыв</th><th>Волна</th><th>Вода</th><th>Давл.</th><th>Оценка</th></tr>');
      wx.t.forEach((t, i) => {
        if (t.slice(0, 10) !== key || (+t.slice(11, 13)) % 3) return;
        const r = C.hourScore(s, wx, i, curTech() && spotTech(s).includes(curTech()) ? curTech() : null);
        h += '<tr><td>' + t.slice(11, 16) + '</td><td>' + dirArrow(wx.dir[i]) + Math.round(wx.wind[i]) + '</td><td>' + Math.round(wx.gust[i]) + '</td><td>' +
          (wx.wave[i] != null ? wx.wave[i].toFixed(1) : '—') + '</td><td>' + (wx.sst[i] != null ? Math.round(wx.sst[i]) + '°' : '—') + '</td><td>' +
          Math.round(wx.press[i]) + '</td><td><span class="badge sm ' + scoreClass(r.score) + '">' + (r.legal.ok ? r.score : '✕') + '</span></td></tr>';
      });
      h += T('</table><p class="muted">Ветер км/ч, стрелка — куда дует. Волна м. Давление гПа.</p>');
    }
    const catches = S.journal.filter(j => j.spot === id);
    if (catches.length) h += T('<h3>Мои уловы здесь</h3><p>') + catches.length + T(' записей, лучшие часы: ') + topHours(catches) + '</p>';
    h += '<div class="btns">' +
      (s.src === 'mine' ? '<button class="btn" data-act="editspot" data-spot="' + esc(s.id) + T('">Изменить</button><button class="btn danger" data-act="delspot" data-spot="') + esc(s.id) + T('">Удалить</button>')
        : '<button class="btn" data-act="movespot" data-spot="' + esc(s.id) + T('">Уточнить место на карте</button><button class="btn" data-act="hidespot" data-spot="') + esc(s.id) + T('">Скрыть точку</button>')) +
      T('</div><p class="muted">Координаты встроенных точек примерные. Уточните точное место стояния на карте.</p></div>');
    modal(h);
  }
  // ---------- Море, полоска дня, графики ----------
  function homeRoute() { const h = S.settings.home; return 'https://www.google.com/maps/dir/?api=1&destination=' + h.lat + ',' + h.lon + '&travelmode=driving'; }
  function nowIdx(wx) { const k = C.ymd(new Date()) + 'T' + String(new Date().getHours()).padStart(2, '0') + ':00'; const i = wx.t.indexOf(k); return i < 0 ? 0 : i; }
  function spark(vals, i0, i1, nowI, color, fmt) {
    const pts = []; for (let i = i0; i <= i1; i++) if (vals[i] != null) pts.push([i, vals[i]]);
    if (pts.length < 3) return '';
    let lo = Math.min(...pts.map(p => p[1])), hi = Math.max(...pts.map(p => p[1])); if (hi - lo < 1e-6) { hi += 1; lo -= 1; }
    const W = 300, H = 64, X = i => 4 + (i - i0) / (i1 - i0) * (W - 8), Y = v => 8 + (1 - (v - lo) / (hi - lo)) * (H - 22);
    const d = pts.map((p, k) => (k ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(' ');
    const nv = vals[nowI];
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      (nowI >= i0 && nowI <= i1 ? '<line x1="' + X(nowI) + '" y1="4" x2="' + X(nowI) + '" y2="' + (H - 12) + '" class="nowl"/>' + (nv != null ? '<circle cx="' + X(nowI) + '" cy="' + Y(nv) + '" r="3.5" fill="' + color + '"/>' : '') : '') +
      '<text x="4" y="' + (H - 1) + '" class="ax">' + fmt(pts[0][1]) + '</text><text x="' + (W - 4) + '" y="' + (H - 1) + '" text-anchor="end" class="ax">' + fmt(pts[pts.length - 1][1]) + '</text></svg>';
  }
  function dayStrip(s, wx, key) {
    const di = wx.days.indexOf(key); if (di < 0) return '';
    const d0 = new Date(key + 'T00:00').getTime(), P = ms => ((ms - d0) / 864e5 * 100).toFixed(2) + '%';
    const sr = new Date(wx.sunrise[di]).getTime(), ss = new Date(wx.sunset[di]).getTime(), sol = C.solunar(key, s.lat, s.lon);
    const b = C.bestWindow(s, wx, key, 0, curTech() && spotTech(s).includes(curTech()) ? curTech() : null, pers());
    let h = '<div class="strip"><div class="sky" style="--sr:' + P(sr) + ';--ss:' + P(ss) + '"></div>';
    sol.major.forEach(([a, z]) => { h += '<i class="maj" style="left:' + P(a) + ';width:' + P(d0 + (z - a)) + '"></i>'; });
    sol.minor.forEach(([a, z]) => { h += '<i class="min" style="left:' + P(a) + ';width:' + P(d0 + (z - a)) + '"></i>'; });
    if (b && !b.closed) { const a = new Date(wx.t[b.i]).getTime(); h += '<i class="bw" style="left:' + P(a) + ';width:' + P(d0 + 2 * 3600000) + '"></i>'; }
    if (S.day === 0) h += '<i class="now" style="left:' + P(Date.now()) + '"></i>';
    h += '</div><div class="striplbl"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>' +
      '<div class="legend2"><span><i class="lg bwl"></i>' + T('лучшее окно') + '</span><span><i class="lg majl"></i>' + T('солунар: главный') + '</span><span><i class="lg minl"></i>' + T('солунар: малый') + '</span>' +
      '<span>☀ ' + hhmm(wx.sunrise[di]) + ' – ' + hhmm(wx.sunset[di]) + '</span></div>';
    return h;
  }
  function seaBlock(s, wx, key) {
    const i = S.day === 0 ? nowIdx(wx) : Math.max(0, wx.t.indexOf(key + 'T12:00'));
    let h = '<h3>' + T('День у воды') + '</h3>' + dayStrip(s, wx, key);
    const sea = wx.sea || [], cur = wx.cur || [], pr = wx.press;
    const seaNow = sea[i], seaPrev = sea[Math.max(0, i - 2)], prDelta = pr[i] != null && pr[Math.max(0, i - 24)] != null ? pr[i] - pr[Math.max(0, i - 24)] : null;
    h += '<div class="metrics sea">' +
      (seaNow != null ? metric(ICON.tide, (seaNow >= 0 ? '+' : '') + Math.round(seaNow * 100) + '<small> ' + T('см') + '</small>', seaNow - seaPrev > 0.005 ? T('↑ прибывает') : seaNow - seaPrev < -0.005 ? T('↓ убывает') : T('стоит')) : '') +
      (cur[i] != null ? metric(ICON.flow, cur[i].toFixed(1) + '<small>' + T(' км/ч') + '</small>', T('течение') + ' → ' + compass(wx.curDir[i] || 0)) : '') +
      (pr[i] != null ? metric(ICON.gauge, Math.round(pr[i]) + '<small> ' + T('гПа') + '</small>', prDelta == null ? '' : (prDelta > 0 ? '+' : '') + prDelta.toFixed(1) + ' ' + T('за 24 ч')) : '') + '</div>';
    if (s.type === 'beach' && cur[i] != null) h += '<p class="muted">' + T('Груз для сурф-кастинга при таком течении:') + ' <b>' + C.sinker(cur[i]) + '</b></p>';
    const i0 = Math.max(0, i - 24), i1 = Math.min(wx.t.length - 1, i + 24);
    if (sea.some(v => v != null)) h += '<p class="lbl">' + T('Уровень моря (прилив и отлив), ±24 ч') + '</p>' + spark(sea, i0, i1, i, 'var(--pri)', v => Math.round(v * 100) + ' ' + T('см'));
    h += '<p class="lbl">' + T('Давление, ±24 ч') + '</p>' + spark(pr, i0, i1, i, 'var(--ok)', v => Math.round(v) + ' ' + T('гПа'));
    // Безопасность и вода
    const wv = wx.wave[i], wp = wx.wper ? wx.wper[i] : null;
    if (s.type === 'rock' && wv != null && (wv >= 1.5 || (wv >= 1.0 && wp != null && wp >= 8)))
      h += '<p class="warn">⚠ ' + T('Опасно на скалах: волна') + ' ' + wv.toFixed(1) + ' ' + T('м') + (wp ? ', ' + T('период') + ' ' + Math.round(wp) + ' ' + T('с') : '') + '. ' + T('Длинная волна даёт отдельные валы выше прогноза. Держитесь в 5 м от кромки и не ловите в одиночку.') + '</p>';
    if (wx.sst[i] != null) { let mx = wx.sst[i]; for (let k = Math.max(0, i - 48); k < i; k++) if (wx.sst[k] != null) mx = Math.max(mx, wx.sst[k]);
      if (mx - wx.sst[i] >= 2) h += '<p class="warn">' + T('Вода остыла на') + ' ' + (mx - wx.sst[i]).toFixed(1) + '° ' + T('за 2 дня: рыба отходит глубже, ищите глубокие места.') + '</p>'; }
    return h;
  }
  // ---------- Сборы ----------
  const PACK_BASE = ['Лицензия и NIE', 'Фонарь (налобный)', 'Вода и перекус', 'Непромокаемая куртка', 'Заряженный телефон', 'Нож или ножницы', 'Пакет для мусора'];
  const PACK_TECH = {
    spin: ['Спиннинг и катушка', 'Воблеры и металл', 'Флюорокарбоновый поводок', 'Плоскогубцы'],
    rock: ['Лёгкий спиннинг', 'Силикон и джиг-головки', 'Обувь с протектором'],
    surf: ['2 удилища и держатели', 'Грузы 80–150 г', 'Черви или креветка', 'Светлячки на вершинки'],
    squid: ['Эги 2.5 и 3.0', 'Флюр 0,22–0,28', 'Подсак'],
    crab: ['Сачок (salabre)', 'Ведро с крышкой', 'Перчатки', 'Рыбьи головы для приманки']
  };
  function packView(id) {
    const s = spotById(id), techs = curTech() ? [curTech()] : spotTech(s || {});
    const today = C.ymd(new Date()); if (S.pack.day !== today) S.pack = { day: today, done: [] };
    const items = PACK_BASE.concat(...techs.map(k => PACK_TECH[k] || []));
    modal('<div class="sheet"><button class="close" data-act="close">✕</button><h2>🎒 ' + T('Сборы') + (s ? ' · ' + esc(s.name) : '') + '</h2>' +
      '<p class="muted">' + techs.map(k => C.TECH[k] ? C.TECH[k].icon + ' ' + C.TECH[k].name : '').join(' · ') + '</p><div class="packlist">' +
      items.map(x => '<label class="ck"><input type="checkbox" data-pack="' + esc(x) + '"' + (S.pack.done.includes(x) ? ' checked' : '') + '> ' + esc(T(x)) + '</label>').join('') +
      '</div><button class="btn wide" data-act="packreset">' + T('Снять все галочки') + '</button></div>');
    document.querySelectorAll('[data-pack]').forEach(c => c.onchange = () => {
      const k = c.dataset.pack; S.pack.done = S.pack.done.filter(x => x !== k); if (c.checked) S.pack.done.push(k); store.set('pack', S.pack);
    });
  }
  // ---------- Отправить место ----------
  function shareLoc() {
    geo(p => {
      const url = 'https://www.google.com/maps?q=' + p.lat + ',' + p.lon, text = T('Я на рыбалке здесь:') + ' ' + url;
      if (navigator.share) navigator.share({ text }).catch(() => { });
      else location.href = 'https://wa.me/?text=' + encodeURIComponent(text);
    });
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
      T('<p class="lbl">Снасть</p><ul>') + t.gear.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
      T('<p class="lbl">Приманка / наживка</p><ul>') + t.bait.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
      T('<p><b>Когда:</b> ') + esc(t.when) + T('</p><p><b>Сезон:</b> ') + esc(t.season) + T('</p><p class="muted"><b>Правила:</b> ') + esc(t.rules) + '</p></div></details>';
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
    app().innerHTML = T('<header class="top"><h1>Карта точек</h1><div class="btns">') +
      T('<button class="btn pri" data-act="pickadd">+ Точка касанием</button><button class="btn" data-act="geoadd">+ Где я стою</button></div>') +
      '<div class="btns" style="margin-top:8px"><button class="btn" data-act="pickmark">📌 ' + T('Моя отметка') + '</button></div>' +
      '<div class="chips">' + [['all', T('Любая ловля')]].concat(Object.entries(C.TECH).map(([k, v]) => [k, v.icon + ' ' + v.name]))
        .map(([k, t]) => '<button data-tech="' + k + '" class="chip ' + ((S.settings.tech || 'all') === k ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
      (pickMode ? '<p class="note">' + (pickMode.type === 'add' ? T('Коснитесь карты, где новая точка.') : pickMode.type === 'mark' ? T('Коснитесь места для отметки: клевало, зацеп или заметка.') : pickMode.type === 'park' ? T('Коснитесь карты, где вы ставите машину для «') + esc(spotById(pickMode.id).name) + '».' : T('Коснитесь точного места для «') + esc(spotById(pickMode.id).name) + '».') +
        T(' <button class="link" data-act="cancelpick">отмена</button></p>') : '') + '</header><div id="map"></div>' +
      T('<p class="foot">Цвет: оценка на ') + [T('сегодня'), T('завтра'), T('послезавтра')][S.day] + T('. Серые — нет прогноза или нельзя.</p>');
    bindView();
    if (typeof L === 'undefined') { $('#map').innerHTML = T('<p class="warn">Карта не загрузилась (нет интернета). Список точек — во вкладке «Где лучше».</p>'); return; }
    destroyMap();
    map = L.map('map', { zoomControl: true }).setView([39.62, 2.95], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
    const key = dayKey(S.day);
    allSpots().filter(s => s.lat != null).forEach(s => {
      const wx = wxFor(s.id), b = wx ? C.bestWindow(s, wx, key, S.day === 0 ? Date.now() : 0, curTech() && spotTech(s).includes(curTech()) ? curTech() : null) : null;
      if (curTech() && !spotTech(s).includes(curTech())) return;
      const pk = parkOf(s);
      if (pk) L.marker([pk.lat, pk.lon], { icon: L.divIcon({ className: 'pk', html: 'P', iconSize: [20, 20] }) }).addTo(map).bindTooltip(T('Парковка: ') + s.name);
      const sc = b && !b.closed ? b.score : 0;
      const col = s.noFish ? '#8a8f98' : { good: '#1fb36b', ok: '#e0a400', bad: '#e0533d', no: '#8a8f98' }[scoreClass(sc)];
      const mk = L.circleMarker([s.lat, s.lon], { radius: 10, color: '#fff', weight: 2, fillColor: col, fillOpacity: 1 }).addTo(map);
      mk.bindTooltip(s.name + (sc ? ' · ' + sc : ''), { direction: 'top' });
      mk.on('click', () => { if (!pickMode) openSpot(s.id); });
    });
    S.marks.forEach(m => {
      const k = MARKS[m.kind] || MARKS.note;
      L.marker([m.lat, m.lon], { icon: L.divIcon({ className: 'mk mk-' + m.kind, html: k[0], iconSize: [26, 26] }) }).addTo(map)
        .bindPopup('<b>' + k[0] + ' ' + esc(T(k[1])) + '</b><br>' + esc(m.note || '') + '<br><small>' + esc(m.date || '') + '</small><br><button class="link danger" data-act="delmark" data-id="' + m.id + '">' + T('Удалить отметку') + '</button>');
    });
    const home = S.settings.home;
    L.circleMarker([home.lat, home.lon], { radius: 6, color: '#2b6cff', fillColor: '#2b6cff', fillOpacity: 1 }).addTo(map).bindTooltip(T('Дом'));
    map.on('click', e => {
      if (!pickMode) return;
      const p = { lat: +e.latlng.lat.toFixed(5), lon: +e.latlng.lng.toFixed(5) };
      if (pickMode.type === 'add') { pickMode = null; spotForm(null, p); }
      else if (pickMode.type === 'mark') { pickMode = null; markForm(p); }
      else if (pickMode.type === 'park') {
        const id = pickMode.id; pickMode = null;
        S.parks[id] = p; store.set('parks', S.parks); toast(T('Парковка сохранена')); viewMap(); openSpot(id);
      }
      else if (pickMode.type === 'move') {
        const id = pickMode.id; pickMode = null;
        const s = S.custom.find(x => x.id === id);
        if (s) { s.lat = p.lat; s.lon = p.lon; store.set('custom', S.custom); }
        else { S.edits[id] = Object.assign({}, S.edits[id], p); store.set('edits', S.edits); }
        toast(T('Место уточнено')); viewMap(); loadWeather(true);
      }
    });
  }

  const MARKS = { bite: ['●', 'Клевало'], snag: ['✕', 'Зацеп'], note: ['◆', 'Заметка'] };
  function markForm(p) {
    modal('<form class="sheet" id="markform"><button type="button" class="close" data-act="close">✕</button><h2>📌 ' + T('Моя отметка') + '</h2>' +
      '<div class="checks">' + Object.entries(MARKS).map(([k, v], n) => '<label class="ck"><input type="radio" name="kind" value="' + k + '"' + (n ? '' : ' checked') + '> ' + v[0] + ' ' + T(v[1]) + '</label>').join('') + '</div>' +
      '<label>' + T('Заметка') + '<input name="note" placeholder="' + T('глубина, наживка, камень…') + '"></label>' +
      '<button class="btn pri wide">' + T('Сохранить') + '</button></form>');
    $('#markform').onsubmit = e => {
      e.preventDefault(); const fd = new FormData(e.target);
      S.marks.push({ id: 'm' + Date.now(), lat: p.lat, lon: p.lon, kind: fd.get('kind'), note: fd.get('note').trim(), date: new Date().toLocaleDateString(LOC) });
      store.set('marks', S.marks); closeModal(); viewMap(); toast(T('Отметка сохранена'));
    };
  }

  // ---------- Форма своей точки ----------
  function spotForm(id, pos) {
    const s = id ? S.custom.find(x => x.id === id) : { name: '', type: 'rock', depth: 'mid', face: 0, reserve: 'none', fish: '', methods: '', parking: '', lat: pos.lat, lon: pos.lon };
    const opt = (v, list) => list.map(([k, t]) => '<option value="' + k + '"' + (v === k ? ' selected' : '') + '>' + t + '</option>').join('');
    modal('<form class="sheet" id="spotform"><button type="button" class="close" data-act="close">✕</button><h2>' + (id ? T('Изменить точку') : T('Новая точка')) + '</h2>' +
      T('<label>Название<input name="name" required value="') + esc(s.name) + '"></label>' +
      T('<div class="row"><label>Берег<select name="type">') + opt(s.type, [['rock', T('Скалы')], ['beach', T('Пляж')]]) + '</select></label>' +
      T('<label>Глубина<select name="depth">') + opt(s.depth, [['shallow', T('0–5 м')], ['mid', T('5–15 м')], ['deep', T('15+ м')]]) + '</select></label></div>' +
      T('<label>Куда смотрит берег (море)<select name="face">') + opt(String(s.face), [['0', T('Север')], ['45', T('Северо-восток')], ['90', T('Восток')], ['135', T('Юго-восток')], ['180', T('Юг')], ['225', T('Юго-запад')], ['270', T('Запад')], ['315', T('Северо-запад')]]) + '</select></label>' +
      T('<label>Заповедник<select name="reserve">') + opt(s.reserve, Object.entries(C.RESERVES).map(([k, r]) => [k, r.name])) + '</select></label>' +
      T('<label>Рыба<input name="fish" value="') + esc(s.fish) + T('"></label><label>Способы ловли<input name="methods" value="') + esc(s.methods) + '"></label>' +
      T('<label>Парковка<input name="parking" value="') + esc(s.parking) + '"></label>' +
      T('<p class="lbl">Виды ловли</p><div class="checks">') + Object.entries(C.TECH).map(([k, v]) => '<label class="ck"><input type="checkbox" name="tech" value="' + k + '"' + ((s.tech || []).includes(k) ? ' checked' : '') + '> ' + v.icon + ' ' + v.name + '</label>').join('') + '</div>' +
      T('<p class="muted">Координаты: ') + s.lat + ', ' + s.lon + T('</p><button class="btn pri wide">Сохранить</button></form>'));
    $('#spotform').onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target), f = Object.fromEntries(fd);
      f.face = +f.face; f.tech = fd.getAll('tech');
      if (id) Object.assign(s, f);
      else S.custom.push(Object.assign({ id: 'my_' + Date.now(), src: 'mine', area: T('Мои'), lat: s.lat, lon: s.lon, q: s.lat + ',' + s.lon }, f));
      store.set('custom', S.custom); closeModal(); toast(T('Точка сохранена')); render(); loadWeather(true);
    };
  }

  // ---------- Рыбы ----------
  function fishSeg(on) {
    return '<header class="top"><h1>' + T('Рыбы и снасти') + '</h1><div class="seg">' +
      [['fish', T('Правила')], ['season', T('Сезоны')], ['tech', T('Снасти')]].map(([k, t]) => '<button data-fv="' + k + '"' + (on === k ? ' class="on"' : '') + '>' + t + '</button>').join('') + '</div></header>';
  }
  function seasonView() {
    const M = [T('янв'), T('фев'), T('мар'), T('апр'), T('май'), T('июнь'), T('июль'), T('авг'), T('сен'), T('окт'), T('ноя'), T('дек')], cm = new Date().getMonth() + 1, y = new Date().getFullYear();
    let h = '<div class="panel"><h3>' + T('Сезонный календарь') + '</h3><div class="cal"><table><tr><th></th>' + M.map((m, k) => '<th' + (k + 1 === cm ? ' class="cur"' : '') + '>' + m.slice(0, 3) + '</th>').join('') + '</tr>';
    C.FISH.forEach(f => {
      h += '<tr><td class="fn">' + esc(f.ru) + '</td>';
      for (let m = 1; m <= 12; m++) {
        const open = C.fishOpen(f, new Date(y, m - 1, 20)), best = (C.BEST[f.id] || []).includes(m);
        h += '<td class="' + (!open ? 'cx' : best ? 'cb' : 'co') + (m === cm ? ' cur' : '') + '"></td>';
      }
      h += '</tr>';
    });
    return h + '</table></div><div class="legend2"><span><i class="lg cbl"></i>' + T('лучшее время') + '</span><span><i class="lg col"></i>' + T('можно ловить') + '</span><span><i class="lg cxl"></i>' + T('запрет') + '</span></div>' +
      '<p class="muted">' + T('«Лучшее время» — опыт рыбаков, а запрет — по закону. Перед выездом проверьте правила вида во вкладке «Правила».') + '</p></div>';
  }
  function viewFish() {
    const spots = allSpots().filter(s => !s.noFish), today = new Date();
    if (S.fishView === 'tech') {
      return fishSeg('tech') +
        '<div class="list">' + Object.keys(C.TECH).map(k => techCard(k, false)).join('') + '</div>' +
        T('<p class="foot">Снасти — практические рекомендации, а не закон. Правила — по Cuaderno de pesca recreativa 2026.</p>');
    }
    if (S.fishView === 'season') return fishSeg('season') + seasonView();
    let h = fishSeg('fish') +
      T('<form class="panel" id="checkform"><h3>Проверить улов</h3><div class="row"><label>Вид<select name="fish">') +
      C.FISH.map(f => '<option value="' + f.id + '">' + esc(f.ru) + '</option>').join('') + '</select></label>' +
      T('<label>Точка<select name="spot"><option value="">— вне заповедника —</option>') + spots.map(s => '<option value="' + esc(s.id) + '">' + esc(s.name) + '</option>').join('') + '</select></label></div>' +
      T('<div class="row"><label>Длина, см<input name="len" type="number" inputmode="decimal" step="0.5"></label><label>Вес, кг<input name="kg" type="number" inputmode="decimal" step="0.05"></label></div>') +
      T('<button class="btn pri wide">Можно оставить?</button><div id="verdict"></div></form>') +
      T('<p class="sub">Длина — от кончика рта до конца хвоста. <a target="_blank" rel="noopener" href="') + C.TALLAS_URL + T('">Официальная таблица талий</a></p><div class="list">');
    C.FISH.forEach(f => {
      const open = C.fishOpen(f, today);
      h += '<details class="fishcard"><summary><b>' + esc(f.ru) + '</b> <span class="muted">' + esc(f.es) + ' / ' + esc(f.ca) + '</span>' +
        '<span class="pill ' + (open ? 'okp' : 'nop') + '">' + (open ? T('сезон открыт') : T('запрет')) + '</span></summary>' +
        '<div class="fbody"><i class="muted">' + esc(f.lat) + '</i><ul>' +
        (f.min ? T('<li>Мин. размер: <b>') + f.min + T(' см</b>') + (f.minRes ? T(', в заповеднике ') + f.minRes + T(' см') : '') + '</li>' : '') +
        (f.minKg ? T('<li>Мин. вес: <b>') + f.minKg + T(' кг</b></li>') : '') +
        (f.check ? T('<li>Мин. размер: проверить в таблице талий</li>') : '') +
        (f.limit ? T('<li>Лимит: <b>') + f.limit + T(' шт в день</b></li>') : '') +
        (f.limitKg ? T('<li>Лимит: <b>') + f.limitKg + T(' кг в день</b></li>') : '') + (f.dayOnly ? T('<li>Только днём</li>') : '') +
        (f.open ? T('<li>Можно: ') + (f.openFrom ? f.openFrom : '1.' + String(f.open[0]).padStart(2, '0')) + ' – ' + ({ 12: '31.12', 3: '31.03' }[f.open[1]] || f.open[1]) + '</li>' : '') +
        (f.closed ? T('<li>Запрет на Майорке: ') + f.closed.map(m => ['', T('янв'), T('фев'), T('мар'), T('апр'), T('май'), T('июнь'), T('июль'), T('авг'), T('сен'), T('окт'), T('ноя'), T('дек')][m]).join(', ') + '</li>' : '') +
        (f.mark ? T('<li>Пометить: подрезать нижнюю лопасть хвоста</li>') : '') +
        (f.pescarec ? T('<li>Записать в PescaREC</li>') : '') +
        '</ul><p>' + esc(f.tips) + '</p></div></details>';
    });
    h += T('</div><p class="foot">По «Cuaderno de pesca recreativa» 27.07.2026. Справочник не заменяет закон: при сомнении отпустите рыбу. <a target="_blank" rel="noopener" href="') + C.RULES_URL + T('">Полный текст</a></p>');
    return h;
  }

  // ---------- Журнал ----------
  function viewLog() {
    const j = S.journal.slice().sort((a, b) => (b.time || '').localeCompare(a.time || ''));
    let h = T('<header class="top"><h1>Журнал</h1><div class="btns"><button class="btn pri" data-act="addcatch">+ Улов / выход</button>') +
      T('<button class="btn" data-act="stats">Статистика</button></div></header>');
    if (!j.length) h += T('<p class="note">Пока пусто. Записывайте и уловы, и пустые выходы — так статистика честнее.</p>');
    h += '<div class="list">';
    j.forEach(e => {
      const s = spotById(e.spot), f = C.FISH.find(x => x.id === e.fish);
      h += '<div class="entry" data-entry="' + e.id + '">' + (e.photo ? '<img data-photo="' + e.id + '" alt="">' : '') +
        '<div><b>' + (f ? esc(f.ru) : T('Без улова')) + (e.len ? ' · ' + e.len + T(' см') : '') + (e.kg ? ' · ' + e.kg + T(' кг') : '') + '</b>' +
        '<div class="cmeta">' + new Date(e.time).toLocaleString(LOC, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' · ' + esc(s ? s.name : '?') + '</div>' +
        '<div class="muted">' + [e.method, e.bait, e.kept === 'kept' ? T('оставил') : e.kept === 'released' ? T('отпустил') : '', e.wx].filter(Boolean).map(esc).join(' · ') + '</div>' +
        (e.note ? '<div>' + esc(e.note) + '</div>' : '') + '<button class="link danger" data-act="delentry" data-id="' + e.id + T('">удалить</button></div></div>');
    });
    return h + '</div>';
  }
  function catchForm(spotId) {
    const spots = allSpots().filter(s => !s.noFish), now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    modal(T('<form class="sheet" id="catchform"><button type="button" class="close" data-act="close">✕</button><h2>Запись в журнал</h2>') +
      T('<label>Когда<input name="time" type="datetime-local" value="') + now.toISOString().slice(0, 16) + '"></label>' +
      T('<label>Точка<select name="spot">') + spots.map(s => '<option value="' + esc(s.id) + '"' + (s.id === spotId ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('') + '</select></label>' +
      T('<label>Рыба<select name="fish"><option value="">Без улова</option>') + C.FISH.map(f => '<option value="' + f.id + '">' + esc(f.ru) + '</option>').join('') + T('<option value="other">Другая</option></select></label>') +
      T('<div class="row"><label>Длина, см<input name="len" type="number" inputmode="decimal" step="0.5"></label><label>Вес, кг<input name="kg" type="number" inputmode="decimal" step="0.05"></label></div>') +
      T('<div class="row"><label>Способ<select name="method"><option></option><option>Сурф-кастинг</option><option>Донка</option><option>Поплавок</option><option>Спиннинг</option><option>Эги</option><option>Живец</option></select></label>') +
      T('<label>Наживка<input name="bait" placeholder="креветка, воблер…"></label></div>') +
      T('<label>Улов<select name="kept"><option value="">—</option><option value="released">Отпустил</option><option value="kept">Оставил</option></select></label>') +
      T('<label>Фото<input name="photo" type="file" accept="image/*" capture="environment"></label>') +
      T('<label>Заметка<textarea name="note" rows="2"></textarea></label><div id="cverdict"></div>') +
      T('<button class="btn pri wide">Сохранить</button></form>'));
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
      S.journal.push(entry); store.set('journal', S.journal); closeModal(); S.tab = 'log'; store.set('tab', 'log'); render(); toast(T('Записано'));
    };
  }
  function wxSnapshot(spotId, time) {
    const wx = wxFor(spotId); if (!wx || !time) return '';
    const k = wx.t.indexOf(time.slice(0, 13) + ':00'); if (k < 0) return '';
    return T('ветер ') + Math.round(wx.wind[k]) + ' ' + compass(wx.dir[k]) + (wx.wave[k] != null ? T(', волна ') + wx.wave[k].toFixed(1) : '') + ', ' + Math.round(wx.press[k]) + T(' гПа');
  }
  function shrink(file, max) {
    return new Promise(res => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, (max || 1000) / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => res(null); img.src = url;
    });
  }
  function verdictHtml(v) {
    const t = { keep: ['okv', T('Можно оставить')], release: ['nov', T('Отпустить')], check: ['chv', T('Проверьте')] }[v.verdict] || ['chv', '?'];
    return '<div class="verdict ' + t[0] + '"><b>' + t[1] + '</b><ul>' + v.lines.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
  }

  // Что сработало у меня: самый частый вид, наживка, часы и ветер
  function worked(list, group) {
    if (list.length < 3) return '<div class="worked"><b>' + T('Что сработало у меня') + '</b><p>' + T('Нужно хотя бы 3 записи с уловом, чтобы найти закономерности.') + '</p></div>';
    const top = rows => rows.length ? rows[0][0] : null;
    const fish = top(group(list, e => (C.FISH.find(f => f.id === e.fish) || {}).ru)), bait = top(group(list, e => e.bait)), method = top(group(list, e => e.method));
    const hrs = group(list, e => (e.time || '').slice(11, 13)).slice(0, 2).map(x => x[0] + ':00');
    const winds = list.map(e => +(String(e.wx || '').match(/\d+/) || [])[0]).filter(x => !isNaN(x));
    const wmax = winds.length ? Math.max(...winds) : null;
    const P = pers();
    return '<div class="worked"><b>' + T('Что сработало у меня') + '</b><p>' +
      (fish ? T('Чаще всего:') + ' <b>' + esc(fish) + '</b>. ' : '') + (bait ? T('Наживка:') + ' <b>' + esc(bait) + '</b>. ' : '') + (method ? T('Способ:') + ' <b>' + esc(method) + '</b>. ' : '') +
      (hrs.length ? T('Часы:') + ' <b>' + hrs.join(', ') + '</b>. ' : '') + (wmax != null ? T('Ветер до') + ' <b>' + wmax + T(' км/ч') + '</b>.' : '') + '</p>' +
      (P.hours.size ? '<p class="muted">' + T('В эти часы приложение добавляет +4 к оценке мест:') + ' ' + [...P.hours].sort((a, b) => a - b).map(h => String(h).padStart(2, '0') + ':00').join(', ') + '</p>' : '') + '</div>';
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
    modal(T('<div class="sheet"><button class="close" data-act="close">✕</button><h2>Статистика</h2>') +
      T('<p>Записей: <b>') + outings + T('</b>, с уловом: <b>') + success + '</b>' + (outings ? ' (' + Math.round(success / outings * 100) + '%)' : '') + '</p>' +
      worked(withFish, group) +
      bars(T('Лучшие точки'), group(withFish, e => (spotById(e.spot) || {}).name)) +
      bars(T('Виды'), group(withFish, e => (C.FISH.find(f => f.id === e.fish) || { ru: T('Другая') }).ru)) +
      bars(T('Часы клёва'), group(withFish, e => (e.time || '').slice(11, 13) + ':00')) +
      bars(T('Наживка'), group(withFish, e => e.bait)) + bars(T('Способ'), group(withFish, e => e.method)) +
      (outings ? '' : T('<p class="note">Статистика появится после первых записей.</p>')) + '</div>');
  }

  // ---------- Язык ----------
  function langPanel() {
    const L = [['ru', 'Русский'], ['ro', 'Română'], ['es', 'Español'], ['en', 'English']];
    return '<div class="panel"><h3>Язык · Limba · Idioma · Language</h3><div class="btns">' +
      L.map(([k, n]) => '<button class="btn' + (I18N.lang === k ? ' pri' : '') + '" data-lang="' + k + '">' + n + '</button>').join('') + '</div></div>';
  }

  // ---------- Лицензия ----------
  function licState() {
    const L = S.lic; if (!L || !L.until) return null;
    const d = Math.floor((new Date(L.until + 'T23:59:59') - Date.now()) / 86400000);
    const dt = new Date(L.until + 'T12:00').toLocaleDateString(LOC, { day: 'numeric', month: 'long', year: 'numeric' });
    if (d < 0) return { d, cls: 'nop', text: T('Лицензия просрочена (') + dt + T('). Ловить без неё нельзя.') };
    if (d <= 30) return { d, cls: 'chv', text: T('Лицензия заканчивается через ') + d + T(' дн. (') + dt + T('). Продлите заранее.') };
    return { d, cls: 'okp', text: T('Действует до ') + dt };
  }
  function licPanel() {
    const L = S.lic;
    if (!L) return T('<div class="panel"><h3>Моя лицензия</h3><p>Сохраните фото и срок лицензии: её можно быстро показать при проверке, а приложение напомнит о продлении.</p>') +
      T('<button class="btn pri" data-act="licedit">Добавить лицензию</button></div>');
    const ls = licState();
    return T('<div class="panel"><h3>Моя лицензия</h3>') +
      (L.num ? '<p>№ <b>' + esc(L.num) + '</b>' + (L.holder ? ' · ' + esc(L.holder) : '') + '</p>' : '') +
      (ls ? '<p class="verdict ' + (ls.d < 0 ? 'nov' : ls.d <= 30 ? 'chv' : 'okv') + '">' + esc(ls.text) + '</p>' : '') +
      T('<div class="btns"><button class="btn pri" data-act="licshow">Показать лицензию</button><button class="btn" data-act="licedit">Изменить</button></div></div>');
  }
  function licShow() {
    const L = S.lic || {}, ls = licState();
    modal(T('<div class="sheet"><button type="button" class="close" data-act="close">✕</button><h2>Лицензия на рыбалку</h2>') +
      '<p>' + (L.num ? '№ <b>' + esc(L.num) + '</b>' : '') + (L.holder ? ' · ' + esc(L.holder) : '') + '</p>' +
      (ls ? '<p class="verdict ' + (ls.d < 0 ? 'nov' : ls.d <= 30 ? 'chv' : 'okv') + '">' + esc(ls.text) + '</p>' : '') +
      (L.p1 ? T('<img class="licimg" data-photo="lic1" alt="Лицензия, лицевая сторона">') : '') +
      (L.p2 ? T('<img class="licimg" data-photo="lic2" alt="Лицензия, обратная сторона">') : '') +
      (!L.p1 && !L.p2 ? T('<p class="note">Фото не добавлено. Нажмите «Изменить», чтобы его добавить.</p>') : '') +
      T('<p class="muted">Носите с собой и документ с фото (NIE или паспорт).</p></div>'));
    loadPhotos();
  }
  function licEdit() {
    const L = S.lic || {};
    modal(T('<form class="sheet" id="licform"><button type="button" class="close" data-act="close">✕</button><h2>Моя лицензия</h2>') +
      T('<label>Номер лицензии<input name="num" value="') + esc(L.num || '') + '" autocomplete="off"></label>' +
      T('<label>На чьё имя<input name="holder" value="') + esc(L.holder || '') + '"></label>' +
      T('<label>Действует до<input name="until" type="date" value="') + esc(L.until || '') + '"></label>' +
      T('<label>Фото лицевой стороны') + (L.p1 ? T(' (сохранено, можно заменить)') : '') + '<input name="p1" type="file" accept="image/*,application/pdf"></label>' +
      T('<label>Фото обратной стороны (если есть)') + (L.p2 ? T(' (сохранено)') : '') + '<input name="p2" type="file" accept="image/*"></label>' +
      T('<p class="muted" style="font-size:13px">Можно сделать скриншот лицензии из письма или PDF и выбрать его здесь.</p>') +
      T('<button class="btn pri wide">Сохранить</button>') + (S.lic ? T('<button type="button" class="link danger" data-act="licdel">Удалить лицензию</button>') : '') + '</form>');
    const form = $('#licform');
    form.onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(form), lic = Object.assign({}, L, { num: fd.get('num').trim(), holder: fd.get('holder').trim(), until: fd.get('until') });
      for (const k of ['p1', 'p2']) {
        const f = fd.get(k);
        if (f && f.size) {
          if (!/^image\//.test(f.type)) { toast(T('Выберите фото или скриншот, PDF не подходит')); return; }
          const data = await shrink(f, 1800); if (data) { await photoDB.put(k === 'p1' ? 'lic1' : 'lic2', data); lic[k] = true; }
        }
      }
      S.lic = lic; store.set('lic', lic); closeModal(); render(); toast(T('Лицензия сохранена'));
    };
  }

  // ---------- Ещё ----------
  function viewMore() {
    const st = S.settings;
    return T('<header class="top"><h1>Ещё</h1></header>') + langPanel() + licPanel() + T('<div class="panel"><h3>Уведомления</h3>') +
      T('<p>Вечером (после 18:00) приложение напомнит, где завтра лучший шанс. Работает, когда приложение установлено на главный экран.</p>') +
      '<button class="btn ' + (st.notif ? '' : 'pri') + '" data-act="notif">' + (st.notif ? T('Выключить') : T('Включить уведомления')) + '</button></div>' +
      T('<div class="panel"><h3>Дом</h3><p>') + esc(st.home.name) + ' (' + st.home.lat.toFixed(3) + ', ' + st.home.lon.toFixed(3) + ')</p>' +
      T('<button class="btn" data-act="sethome">Мой дом — там, где я сейчас</button></div>') +
      T('<div class="panel"><h3>Резервная копия</h3><p>Точки, журнал и фото в одном файле. Делайте копию раз в месяц.</p>') +
      T('<div class="btns"><button class="btn" data-act="export">Сохранить файл</button><label class="btn">Загрузить файл<input type="file" accept=".json,application/json" id="importfile" hidden></label></div></div>') +
      T('<div class="panel"><h3>Скрытые точки</h3><p>') + (S.hidden.length ? S.hidden.length + T(' скрыто. <button class="link" data-act="unhide">Показать все</button>') : T('Нет')) + '</p></div>' +
      T('<div class="panel"><h3>Правила и источники</h3><ul class="tips">') +
      T('<li>Лицензия обязательна с 14 лет: 26,21 € на 3 года. <a target="_blank" rel="noopener" href="https://www.caib.es/seucaib/es/200/personas/tramites/tramite/96401">Оформить</a></li>') +
      T('<li>До 2 удочек, до 6 крючков, 5 кг + 1 рыба в день, продажа запрещена.</li>') +
      T('<li>Пляжи 1 мая – 30 сен: нельзя с 7:00 до 22:00. Не ближе 100 м к купающимся и 250 м к сетям. Не в портах.</li>') +
      '<li><a target="_blank" rel="noopener" href="' + C.RULES_URL + T('">Cuaderno de pesca recreativa 2026</a> · <a target="_blank" rel="noopener" href="https://www.caib.es/sites/reservesmarines/es/mapa/">Карта заповедников</a></li>') +
      T('<li>Погода: Open-Meteo. Карта: OpenStreetMap.</li><li>Сомнения по заповедникам: 971 176 100.</li></ul></div>') +
      T('<p class="foot">Рыбалка Майорка · версия 2.0 · данные хранятся только в этом телефоне.</p>');
  }

  async function doExport() {
    const photos = await photoDB.all();
    const data = JSON.stringify({ v: 1, at: new Date().toISOString(), custom: S.custom, edits: S.edits, hidden: S.hidden, journal: S.journal, settings: S.settings, parks: S.parks, lic: S.lic, marks: S.marks, photos });
    const name = 'rybalka-' + C.ymd(new Date()) + '.json';
    // Внутри claude.ai файл отдаётся через платформу
    if (window.claude && typeof window.claude.use === 'function') {
      try {
        const dl = await window.claude.use('downloads');
        if (dl) { await dl.save({ filename: name, data }); toast(T('Файл сохранён')); return; }
      } catch (e) { if (e && e.code === 'declined') return; }
    }
    try {
      const file = new File([data], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast(T('Файл сохранён в «Загрузки»'));
  }
  async function doImport(file) {
    try {
      const d = JSON.parse(await file.text());
      if (!d || d.v !== 1) throw new Error();
      if (!confirm(T('Заменить текущие точки и журнал данными из файла?'))) return;
      S.custom = d.custom || []; S.edits = d.edits || {}; S.hidden = d.hidden || []; S.journal = d.journal || []; S.parks = d.parks || {}; S.lic = d.lic || S.lic; S.marks = d.marks || S.marks; S.settings = Object.assign(S.settings, d.settings || {});
      ['custom', 'edits', 'hidden', 'journal', 'settings', 'parks', 'lic', 'marks'].forEach(k => store.set(k, S[k]));
      for (const [k, v] of Object.entries(d.photos || {})) await photoDB.put(k, v);
      toast(T('Данные загружены')); render(); loadWeather(true);
    } catch (e) { toast(T('Файл не подошёл')); }
  }

  // ---------- Уведомления ----------
  async function saveSpotsForSW() {
    try { const c = await caches.open('ryb-data'); await c.put('/__spots', new Response(JSON.stringify({ spots: weatherSpots(), notif: S.settings.notif, lang: I18N.lang, home: S.settings.home }))); } catch (e) { }
  }
  function bestTomorrowText() {
    const r = ranking(1).filter(x => x.b && !x.b.closed);
    if (!r.length) return null;
    const { s, b, wx } = r[0];
    return T('Завтра лучше всего: ') + s.name + ', ' + hhmm(wx.t[b.i]) + '–' + addH(wx.t[b.i], 2) + T(' (оценка ') + b.score + ')';
  }
  async function maybeNotify() {
    if (!S.settings.notif || !('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date(); if (now.getHours() < 18) return;
    const k = C.ymd(now); if (store.get('notified', '') === k) return;
    const text = bestTomorrowText(); if (!text) return;
    try { const reg = await navigator.serviceWorker.ready; reg.showNotification(T('Рыбалка Майорка'), { body: text, icon: 'icon-192.png', tag: 'tomorrow' }); store.set('notified', k); } catch (e) { }
  }
  async function toggleNotif() {
    if (S.settings.notif) { S.settings.notif = false; store.set('settings', S.settings); render(); saveSpotsForSW(); return; }
    if (!('Notification' in window) || !('serviceWorker' in navigator)) { toast(T('Уведомления доступны только в установленном приложении')); return; }
    const p = await Notification.requestPermission();
    if (p !== 'granted') { toast(T('Разрешение не дано')); return; }
    S.settings.notif = true; store.set('settings', S.settings); saveSpotsForSW();
    try { const reg = await navigator.serviceWorker.ready; if (reg.periodicSync) await reg.periodicSync.register('tomorrow', { minInterval: 3 * 60 * 60 * 1000 }); } catch (e) { }
    toast(T('Уведомления включены')); render(); maybeNotify();
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
    loadPhotos();
  }
  function loadPhotos() {
    document.querySelectorAll('img[data-photo]:not([src])').forEach(async img => { const d = await photoDB.get(img.dataset.photo); if (d) img.src = d; else img.remove(); });
  }

  // Подписи вкладок и заголовок на выбранном языке
  document.documentElement.lang = I18N.lang;
  document.title = T('Рыбалка Майорка');
  document.querySelectorAll('.tabbar button').forEach(b => { const n = b.lastChild; if (n && n.nodeType === 3) n.textContent = T(n.textContent.trim()); });

  document.addEventListener('click', e => {
    const lb = e.target.closest('[data-lang]');
    if (lb) { try { localStorage.setItem('ryb_lang', lb.dataset.lang); } catch (err) { } location.reload(); return; }
    const t = e.target.closest('[data-tab],[data-day],[data-filter],[data-tech],[data-fv],[data-act],[data-spot]');
    if (!t) return;
    if (t.dataset.tab) { S.tab = t.dataset.tab; store.set('tab', S.tab); pickMode = null; render(); window.scrollTo(0, 0); return; }
    if (t.dataset.day) { S.day = +t.dataset.day; render(); return; }
    if (t.dataset.tech) { S.settings.tech = t.dataset.tech; store.set('settings', S.settings); render(); return; }
    if (t.dataset.fv) { S.fishView = t.dataset.fv; render(); return; }
    if (t.dataset.act === 'delmark') { S.marks = S.marks.filter(m => m.id !== t.dataset.id); store.set('marks', S.marks); viewMap(); return; }
    if (t.dataset.filter) { S.settings.filter = t.dataset.filter; store.set('settings', S.settings); render(); return; }
    const act = t.dataset.act, id = t.dataset.spot;
    if (!act && id) { openSpot(id); return; }
    switch (act) {
      case 'close': closeModal(); break;
      case 'night': S.settings.night = !S.settings.night; store.set('settings', S.settings); applyNight(); render(); break;
      case 'togglef': S.showF = !S.showF; render(); break;
      case 'pack': packView(id); break;
      case 'packreset': S.pack = { day: C.ymd(new Date()), done: [] }; store.set('pack', S.pack); document.querySelectorAll('[data-pack]').forEach(c => c.checked = false); break;
      case 'share': shareLoc(); break;
      case 'pickmark': pickMode = { type: 'mark' }; viewMap(); break;
      case 'refresh': loadWeather(true); break;
      case 'addcatch': catchForm(id); break;
      case 'stats': statsView(); break;
      case 'pickadd': pickMode = { type: 'add' }; viewMap(); break;
      case 'cancelpick': pickMode = null; viewMap(); break;
      case 'setpark': closeModal(); pickMode = { type: 'park', id }; S.tab = 'map'; store.set('tab', 'map'); render(); toast(T('Коснитесь карты там, где ставите машину')); break;
      case 'movespot': closeModal(); pickMode = { type: 'move', id }; S.tab = 'map'; render(); break;
      case 'geoadd': geo(p => spotForm(null, p)); break;
      case 'editspot': spotForm(id); break;
      case 'delspot': if (confirm(T('Удалить точку?'))) { S.custom = S.custom.filter(s => s.id !== id); store.set('custom', S.custom); closeModal(); render(); } break;
      case 'hidespot': S.hidden.push(id); store.set('hidden', S.hidden); closeModal(); render(); toast(T('Точка скрыта (вернуть: «Ещё»)')); break;
      case 'unhide': S.hidden = []; store.set('hidden', S.hidden); render(); break;
      case 'delentry': if (confirm(T('Удалить запись?'))) { const eid = t.dataset.id; S.journal = S.journal.filter(x => x.id !== eid); store.set('journal', S.journal); photoDB.del(eid); render(); } break;
      case 'notif': toggleNotif(); break;
      case 'export': doExport(); break;
      case 'licedit': licEdit(); break;
      case 'licshow': licShow(); break;
      case 'licdel': if (confirm(T('Удалить лицензию из приложения?'))) { S.lic = null; store.set('lic', null); photoDB.del('lic1'); photoDB.del('lic2'); closeModal(); render(); } break;
      case 'sethome': geo(p => { S.settings.home = { lat: p.lat, lon: p.lon, name: T('Мой дом') }; store.set('settings', S.settings); render(); toast(T('Дом сохранён')); }); break;
    }
  });
  function geo(cb) {
    if (!navigator.geolocation) { toast(T('Геолокация недоступна')); return; }
    toast(T('Определяю место…'));
    navigator.geolocation.getCurrentPosition(p => cb({ lat: +p.coords.latitude.toFixed(5), lon: +p.coords.longitude.toFixed(5) }),
      () => toast(T('Не удалось определить место. Включите GPS и разрешите доступ.')), { enableHighAccuracy: true, timeout: 15000 });
  }
  let tt;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(tt); tt = setTimeout(() => el.hidden = true, 2800); }

  function applyNight() { document.body.classList.toggle('night', !!S.settings.night); const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = S.settings.night ? '#000000' : '#0b3b5c'; }
  applyNight();

  // ---------- Старт ----------
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  render();
  loadWeather(false);
})();
