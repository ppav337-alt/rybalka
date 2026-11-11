/* Самопроверка «Рыбалка Майорка». Запуск: node tests/check.js
   Проверяет данные, расчёты и переводы без браузера. Падает с кодом 1 при ошибке. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
let fails = 0, warns = 0, passed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { fails++; console.log('  ✗ ' + name + '\n      ' + e.message); }
}
function ok(cond, msg) { if (!cond) throw new Error(msg); }

// Загружаем i18n.js и core.js так же, как в браузере (общий объект root)
function load(lang) {
  const root = { localStorage: { getItem: () => lang } };
  root.self = root;
  vm.createContext(root);
  vm.runInContext(read('i18n.js').replace('root.I18N = I;', 'root.I18N = I; root.__D = D;'), root, { filename: 'i18n.js' });
  vm.runInContext(read('core.js'), root, { filename: 'core.js' });
  return root;
}

// Синтетическая погода на 3 дня: спокойное море, лёгкий ветер
function fakeWeather(opts) {
  const o = Object.assign({ wave: 0.6, wind: 12, gust: 20, sst: 20 }, opts);
  const t = [], days = [], sunrise = [], sunset = [];
  const start = new Date(); start.setHours(0, 0, 0, 0);
  for (let d = 0; d < 3; d++) {
    const day = new Date(start.getTime() + d * 86400000), k = day.toISOString().slice(0, 10);
    days.push(k); sunrise.push(k + 'T07:45'); sunset.push(k + 'T17:40');
    for (let h = 0; h < 24; h++) t.push(k + 'T' + String(h).padStart(2, '0') + ':00');
  }
  const n = t.length, fill = v => Array(n).fill(v);
  return { t, days, sunrise, sunset, wave: fill(o.wave), wper: fill(5), sst: fill(o.sst), wind: fill(o.wind), gust: fill(o.gust),
    dir: fill(200), press: t.map((_, i) => 1015 - i * 0.2), cloud: fill(40), rain: fill(0), temp: fill(20),
    sea: fill(null), cur: fill(null), curDir: fill(null) };
}

console.log('Синтаксис');
['app.js', 'core.js', 'i18n.js', 'sw.js'].forEach(f => check(f + ' читается без ошибок', () => {
  new vm.Script(read(f), { filename: f });
}));

const R = load('ru'), C = R.FishCore;
console.log('Данные');
check('ядро загружается', () => ok(C && C.SPOTS && C.FISH, 'FishCore не найден'));
check('у мест уникальные id', () => {
  const ids = C.SPOTS.map(s => s.id), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  ok(!dup.length, 'повторяются: ' + dup.join(', '));
});
check('координаты мест на Майорке', () => {
  const bad = C.SPOTS.filter(s => s.lat != null && !(s.lat > 39.2 && s.lat < 40.0 && s.lon > 2.3 && s.lon < 3.5));
  ok(!bad.length, 'вне острова: ' + bad.map(s => s.id + ' ' + s.lat + ',' + s.lon).join('; '));
});
check('у каждого места известный заповедник', () => {
  const bad = C.SPOTS.filter(s => s.reserve && !C.RESERVES[s.reserve]);
  ok(!bad.length, 'неизвестный заповедник: ' + bad.map(s => s.id + ' → ' + s.reserve).join(', '));
});
check('у видов рыб уникальные id', () => {
  const ids = C.FISH.map(f => f.id), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  ok(!dup.length, 'повторяются: ' + dup.join(', '));
});

console.log('Проверка улова');
const out = { reserve: 'none' }, summer = new Date(new Date().getFullYear(), 6, 10, 10);
check('дорада 15 см — отпустить', () => ok(C.checkCatch('dorada', 15, 0, out, summer, 0).verdict === 'release', 'ожидали release'));
check('дорада 30 см — можно оставить', () => ok(C.checkCatch('dorada', 30, 0, out, summer, 0).verdict !== 'release', 'ожидали keep/check'));
check('дорада сверх дневного лимита — отпустить', () => ok(C.checkCatch('dorada', 30, 0, out, summer, 99).verdict === 'release', 'лимит не сработал'));
check('каждый вид даёт ответ', () => {
  const bad = C.FISH.filter(f => { const v = C.checkCatch(f.id, 50, 3, out, summer, 0); return !['keep', 'check', 'release'].includes(v.verdict) || !v.lines.length; });
  ok(!bad.length, 'нет ответа для: ' + bad.map(f => f.id).join(', '));
});

console.log('Оценка мест');
check('оценка 0–100 и без NaN у всех мест и техник', () => {
  const techs = [null].concat(Object.keys(C.TECH));
  for (const wxOpts of [{}, { wave: 2.5, wind: 40, gust: 60 }, { wave: 0.1, wind: 3, sst: 13 }]) {
    const wx = fakeWeather(wxOpts);
    for (const s of C.SPOTS) for (const tech of techs) for (let i = 0; i < wx.t.length; i += 5) {
      const r = C.hourScore(s, wx, i, tech, null);
      ok(Number.isFinite(r.score) && r.score >= 0 && r.score <= 100, s.id + ' ' + tech + ' ' + wx.t[i] + ': оценка ' + r.score);
      ok(Number.isFinite(r.raw), s.id + ': raw ' + r.raw);
      ok(Array.isArray(r.why) && Array.isArray(r.tags), s.id + ': нет why/tags');
    }
  }
});
check('шторм хуже штиля', () => {
  const s = C.SPOTS.find(x => x.type === 'beach' && x.reserve === 'none') || C.SPOTS[0];
  const calm = fakeWeather(), storm = fakeWeather({ wave: 3, wind: 45, gust: 70 }), i = 30;
  ok(C.hourScore(s, storm, i).score < C.hourScore(s, calm, i).score, 'шторм не снижает оценку');
});
check('лучшее окно находится для открытых мест', () => {
  const wx = fakeWeather(), key = wx.days[1];
  const open = C.SPOTS.filter(s => C.legal(s, new Date(key + 'T12:00')).ok);
  ok(open.length > 0, 'нет открытых мест');
  open.forEach(s => { const b = C.bestWindow(s, wx, key, 0, null, null); ok(b && (b.closed || (Number.isFinite(b.raw) && Array.isArray(b.why))), s.id + ': окно без оценки'); });
});
check('плавный потолок оценки: растёт и не выше 100', () => {
  let prev = -1; for (let s = -20; s <= 200; s += 1) { const v = C.cap(s); ok(v >= prev && v <= 100 && v >= 0, 'cap(' + s + ')=' + v); prev = v; }
});

console.log('«Хочу поймать» и журнал');
check('все рыбы в списке мест существуют', () => {
  const ids = C.FISH.map(f => f.id), bad = [];
  Object.entries(C.SPOT_FISH).forEach(([s, l]) => { if (!C.SPOTS.find(x => x.id === s)) bad.push('место ' + s); l.forEach(f => { if (!ids.includes(f)) bad.push(s + ':' + f); }); });
  ok(!bad.length, bad.join(', '));
});
check('кальмар: вечер лучше полудня', () => {
  const s = C.SPOTS.find(x => x.id === 'portocolom'), wx = fakeWeather({ wave: 0.3 }), noon = 24 + 12, eve = 24 + 18;
  const p = { fish: 'calamar' };
  ok(C.hourScore(s, wx, eve, null, p).score > C.hourScore(s, wx, noon, null, p).score, 'вечер не выше полудня');
});
check('похожая погода из журнала поднимает оценку', () => {
  const s = C.SPOTS.find(x => x.reserve === 'none'), wx = fakeWeather(), i = 30;
  const like = [{ spot: s.id, fish: 'sargo', hour: +wx.t[i].slice(11, 13), wind: 12, wave: 0.6, dir: 200 }];
  const a = C.hourScore(s, wx, i, null, { like }), b = C.hourScore(s, wx, i, null, null);
  ok(a.raw > b.raw && a.tags.length > b.tags.length, 'бонус не добавлен');
});

console.log('Снасть сейчас');
check('снасть подбирается для всех мест и часов', () => {
  const wx = fakeWeather();
  for (const s of C.SPOTS) for (let i = 0; i < wx.t.length; i += 3) {
    const r = C.rigNow(s, wx, i, null, null);
    ok(Array.isArray(r.lines) && r.lines.every(x => typeof x === 'string' && x && !/undefined|NaN/.test(x)), s.id + ' ' + wx.t[i] + ': ' + JSON.stringify(r.lines));
  }
});
check('краба не советуем ночью', () => {
  const wx = fakeWeather(), s = C.SPOTS.find(x => x.id === 'crab_fontanelles'), night = wx.t.indexOf(wx.days[1] + 'T22:00');
  const r = C.rigNow(s, wx, night, null, null); ok(!r.fish || r.fish.id !== 'cangrejo', 'ночью предложен краб');
});

console.log('Переводы');
const D = R.__D;
check('у каждой фразы 3 перевода (en, ro, es)', () => {
  const bad = Object.keys(D).filter(k => !Array.isArray(D[k]) || D[k].length !== 3 || D[k].some(v => typeof v !== 'string' || !v));
  ok(!bad.length, 'неполные: ' + bad.slice(0, 5).join(' | '));
});
check('ядро работает на всех языках', () => {
  ['en', 'ro', 'es'].forEach(l => { const X = load(l).FishCore; ok(X.hourScore(X.SPOTS[0], fakeWeather(), 30).score >= 0, l); });
});
check('версия в подвале переведена', () => {
  const m = read('app.js').match(/версия (\d+\.\d+)/); ok(m, 'не найдена версия в app.js');
  ok(Object.keys(D).some(k => k.includes('версия ' + m[1] + ' ')), 'нет перевода для версии ' + m[1]);
  console.log('      версия ' + m[1]);
});
{
  // Предупреждение (не ошибка): фразы в T('…') без перевода
  const src = read('app.js') + read('core.js');
  const keys = [...src.matchAll(/T\('((?:[^'\\]|\\.)*)'\)/g)].map(m => m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
  const miss = [...new Set(keys)].filter(k => /[а-яё]/i.test(k) && !D[k]);
  if (process.env.SHOW_MISSING) console.log(JSON.stringify(miss, null, 1));
  if (miss.length) { warns++; console.log('  ! без перевода (' + miss.length + '): ' + miss.slice(0, 5).map(x => '«' + x.slice(0, 40) + '»').join(', ') + (miss.length > 5 ? ' …' : '')); }
}

console.log('Офлайн');
check('все файлы оболочки service worker существуют', () => {
  const m = read('sw.js').match(/const SHELL = \[([\s\S]*?)\]/); ok(m, 'SHELL не найден');
  const files = [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]).filter(f => f !== './');
  const miss = files.filter(f => !fs.existsSync(path.join(ROOT, f))); ok(!miss.length, 'нет файлов: ' + miss.join(', '));
});
check('страница подключает только существующие файлы', () => {
  const refs = [...read('index.html').matchAll(/(?:src|href)="([^"#:]+)"/g)].map(m => m[1]).filter(f => !f.startsWith('//'));
  const miss = refs.filter(f => !fs.existsSync(path.join(ROOT, f))); ok(!miss.length, 'нет файлов: ' + miss.join(', '));
});
check('нет лишних тяжёлых файлов (больше 2 МБ)', () => {
  const big = [];
  (function walk(d) { for (const f of fs.readdirSync(d)) { if (f === '.git' || f === 'node_modules') continue; const p = path.join(d, f), st = fs.statSync(p);
    if (st.isDirectory()) walk(p); else if (st.size > 2 * 1024 * 1024) big.push(path.relative(ROOT, p) + ' ' + Math.round(st.size / 1048576) + ' МБ'); } })(ROOT);
  ok(!big.length, big.join(', '));
});

console.log('\n' + (fails ? '✗ Ошибок: ' + fails : '✓ Всё в порядке') + ' · проверок пройдено: ' + passed + (warns ? ' · предупреждений: ' + warns : ''));
process.exit(fails ? 1 : 0);
