/* Рыбалка Майорка — данные и расчёты (без DOM). Используется страницей и service worker. */
(function (root) {
  'use strict';
  const T = (root.I18N && root.I18N.T) || (s => s);

  // ---------- Заповедники ----------
  // days: 0=вс,1=пн,...6=сб. null = правила не подтверждены.
  const RESERVES = {
    none: { name: T('Вне заповедника'), days: [0,1,2,3,4,5,6], note: T('Общие правила Балеар.') },
    llevant: { name: T('Заповедник Llevant / Cala Rajada'), days: [2,4,6,0], holidays: true,
      note: T('Вт, чт, сб, вс и праздники. 1 удочка на человека, до 6 крючков шире 7 мм (в государственной зоне у Cala Rajada до 4). Запретная зона Cap Ferrutx – Penya del Llamp.'),
      url: 'https://www.caib.es/sites/reservesmarines/es/regulacian_de_actividades_0_0/' },
    palma: { name: T('Заповедник Badia de Palma'), days: [2,5,6,0], holidays: true,
      note: T('Вт, пт, сб, вс и праздники. Удочка, спиннинг, 1 потера (эги), до 6 крючков шире 7 мм. Живец запрещён. Из охраняемых видов — 1 рыба в день. В зоне особой охраны нельзя.'),
      url: 'https://www.caib.es/sites/reservesmarines/es/regulacio_dactivitats-854' },
    migjorn: { name: T('Заповедник Migjorn'), days: [0,1,2,3,4,5,6],
      note: T('С берега можно каждый день, кроме зоны особой охраны (304 га, см. карту). Удочка, до 6 крючков шире 7 мм, 1 потера, сачок. Живец запрещён. Из охраняемых видов — 1 рыба в день.'),
      url: 'https://www.caib.es/sites/reservesmarines/es/regulacion_de_actividades-862/' },
    dragonera: { name: T('Заповедник Freu de sa Dragonera'), days: [0,1,2,3,4,5,6],
      note: T('С берега Мальорки можно каждый день. С острова Dragonera и островков Pantaleu и Sa Mitjana — нельзя. Удочка до 2 линий, до 6 крючков шире 7 мм, 1 потера, спиннинг. Соревнования запрещены.'),
      url: 'https://www.caib.es/sites/reservesmarines/es/regulacian_de_actividades/' },
    ponent: { name: T('Заповедник Ponent (Toro, Malgrats, Sec)'), days: [0,1,2,3,4,5,6],
      note: T('Calvià. Удочка до 2 линий, до 6 крючков шире 7 мм, 1 потера, спиннинг. Нельзя: зоны особой охраны Toro и Sec, полоса Cala de s\'Art – Morro d\'en Feliu, с островков Malgrats.'),
      url: 'https://www.caib.es/sites/reservesmarines/es/regulacian_de_actividades_0/' }
  };

  // ---------- Точки ----------
  // type: beach | rock ; depth: shallow (0–5) | mid (5–15) | deep (15+)
  // face: куда «смотрит» берег (азимут моря, градусы). Координаты примерные;
  // almunia, llombards, canonge, valldemossa, banyalbufar, calobra, figueraformentor, calablava, estrenc, songranada сверены 03.11.2026.
  const SPOTS = [
    { id:'sonserra', name:'Son Serra de Marina', area:T('Север'), lat:39.7339, lon:3.2300, type:'beach', depth:'shallow', face:20, reserve:'none',
      fish:T('Дорада, мабре, сарг; сибас у устья окт–мар'), methods:T('Сурф-кастинг, донка'), parking:T('Улицы посёлка у пляжа'), q:'Platja de Son Serra de Marina', src:'atlas' },
    { id:'picafort', name:'Can Picafort – Son Bauló', area:T('Север'), lat:39.7610, lon:3.1680, type:'beach', depth:'shallow', face:45, reserve:'none',
      fish:T('Мабре, дорада, сарг, облада'), methods:T('Ночной сурф-кастинг'), parking:T('Набережная, зона Son Bauló'), q:'Platja de Son Baulo Can Picafort', src:'atlas' },
    { id:'alcanada', name:'Alcanada (Alcúdia)', area:T('Север'), lat:39.8370, lon:3.1630, type:'rock', depth:'shallow', face:100, reserve:'none',
      fish:T('Облада, сарг, кальмар окт–янв'), methods:T('Поплавок, эги на закате'), parking:T('У Platja d\'Alcanada'), q:'Platja d\'Alcanada Alcudia', src:'atlas' },
    { id:'betlem', name:'Colònia de Sant Pere – Betlem', area:T('Северо-восток'), lat:39.7270, lon:3.3020, type:'rock', depth:'shallow', face:300, reserve:'none',
      fish:T('Лампуга авг–дек, кальмар, сарг'), methods:T('Лёгкий спиннинг, эги, поплавок'), parking:T('Конец дороги в Betlem'), q:'Betlem Arta Mallorca', src:'atlas',
      warn:T('Северо-восточнее Cala Mata — заповедник Llevant (вт, чт, сб, вс). От Cap Ferrutx до Penya del Llamp ловить нельзя.') },
    { id:'estrenc', name:'Es Trenc – Colònia de Sant Jordi', area:T('Юг'), lat:39.3433, lon:2.9839, type:'beach', depth:'shallow', face:220, reserve:'migjorn',
      fish:T('Дорада, мабре, сибас в шторм'), methods:T('Сурф-кастинг'), parking:T('Платные парковки Ses Covetes / Sa Ràpita'), q:'Es Trenc parking Ses Covetes', src:'atlas' },
    { id:'malpas', name:'Mal Pas – Bonaire (Alcúdia)', area:T('Север'), lat:39.8680, lon:3.1650, type:'rock', depth:'mid', face:0, reserve:'none',
      fish:T('Сарг, луфарь сен–ноя, кальмар'), methods:T('Спиннинг, эги, поплавок'), parking:T('Вдоль дороги Mal Pas'), q:'Mal Pas Bonaire Alcudia', src:'atlas' },
    { id:'namer', name:'Punta de n\'Amer (Sa Coma)', area:T('Восток'), lat:39.5850, lon:3.3980, type:'rock', depth:'mid', face:90, reserve:'none',
      fish:T('Сарг, облада, кальмар, лампуга осенью'), methods:T('Поплавок, эги, спиннинг'), parking:T('Въезд со стороны Sa Coma'), q:'Punta de n\'Amer Sa Coma', src:'atlas' },
    { id:'portocolom', name:T('Portocolom – маяк'), area:T('Восток'), lat:39.4140, lon:3.2730, type:'rock', depth:'mid', face:100, reserve:'none',
      fish:T('Кальмар ноя–фев, сарг, дорада'), methods:T('Эги, поплавок, донка'), parking:T('У маяка'), q:'Far de Portocolom', src:'atlas', warn:T('Не с причалов порта.') },
    { id:'santvicenc', name:'Cala Sant Vicenç', area:T('Север'), lat:39.9230, lon:3.0560, type:'rock', depth:'mid', face:40, reserve:'none',
      fish:T('Сарг, кальмар, зубан'), methods:T('Спиннинг, эги'), parking:T('В посёлке'), q:'Cala Sant Vicenc Pollenca', src:'atlas' },
    { id:'calablava', name:'S\'Arenal – Cala Blava', area:T('Юг (Пальма)'), lat:39.4870, lon:2.7370, type:'rock', depth:'mid', face:260, reserve:'palma',
      fish:T('Сарг, дорада (от 35 см), кальмар'), methods:T('Поплавок, эги, спиннинг'), parking:T('Улицы Cala Blava'), q:'Cala Blava Llucmajor', src:'atlas' },
    { id:'capdepera', name:'Far de Capdepera (Cala Rajada)', area:T('Восток'), lat:39.7150, lon:3.4780, type:'rock', depth:'deep', face:80, reserve:'llevant',
      fish:T('Лича, зубан, луфарь, кальмар; сен–дек'), methods:T('Спиннинг, тяжёлая донка'), parking:T('У маяка'), q:'Far de Capdepera', src:'atlas' },
    { id:'soller', name:'Port de Sóller – Punta de sa Creu', area:T('Запад'), lat:39.7985, lon:2.6905, type:'rock', depth:'deep', face:315, reserve:'none',
      fish:T('Кальмар ноя–фев, зубан, сарг, лича'), methods:T('Эги, спиннинг, живец'), parking:T('За Platja d\'en Repic'), q:'Far de sa Creu Port de Soller', src:'atlas', warn:T('Не в порту.') },
    { id:'formentor', name:'Cap de Formentor', area:T('Север'), lat:39.9620, lon:3.2130, type:'rock', depth:'deep', face:45, reserve:'none',
      fish:T('Лича, зубан, луфарь, кальмар'), methods:T('Спиннинг, живец'), parking:T('Вдоль дороги Formentor'), q:'Cap de Formentor', src:'atlas',
      warn:T('Летом дорога для частных авто обычно закрыта.') },
    { id:'salines', name:'Cap de ses Salines', area:T('Юг'), lat:39.2650, lon:3.0530, type:'rock', depth:'deep', face:180, reserve:'migjorn',
      fish:T('Raor сен–мар, сарг, дорада'), methods:T('Ловля raor, донка'), parking:T('У маяка'), q:'Far des Cap de ses Salines', src:'atlas' },
    { id:'figuera', name:'Cala Figuera (Santanyí)', area:T('Юго-восток'), lat:39.3290, lon:3.1710, type:'rock', depth:'deep', face:130, reserve:'migjorn',
      fish:T('Сарг, кальмар, луфарь'), methods:T('Спиннинг, эги'), parking:T('В посёлке'), q:'Cala Figuera Santanyi', src:'atlas' },
    { id:'santelm', name:'Sant Elm', area:T('Запад'), lat:39.5790, lon:2.3510, type:'rock', depth:'deep', face:260, reserve:'dragonera',
      fish:T('Сарг, кальмар, зубан'), methods:T('Спиннинг, эги'), parking:T('В посёлке'), q:'Sant Elm Andratx', src:'atlas', warn:T('С острова Dragonera и островков Pantaleu, Sa Mitjana ловить нельзя.') },
    // из архива ChatGPT
    { id:'canonge', name:'Port des Canonge', area:T('Запад'), lat:39.6999, lon:2.5550, type:'rock', depth:'mid', face:320, reserve:'none',
      fish:T('Сарг, сибас'), methods:T('Донка, поплавок, спиннинг'), parking:T('До посёлка на машине, дальше пешком'), q:'Port des Canonge Mallorca', src:'chatgpt' },
    { id:'valldemossa', name:'Port de Valldemossa', area:T('Запад'), lat:39.7182, lon:2.5883, type:'rock', depth:'mid', face:320, reserve:'none',
      fish:T('Сарг, сибас'), methods:T('Донка, поплавок, спиннинг'), parking:T('Крутая дорога, мало мест'), q:'Port de Valldemossa Mallorca', src:'chatgpt' },
    { id:'banyalbufar', name:'Cala Banyalbufar', area:T('Запад'), lat:39.6905, lon:2.5160, type:'rock', depth:'mid', face:310, reserve:'none',
      fish:T('Сибас, сарг'), methods:T('Спиннинг, донка'), parking:T('Мало мест, неровный спуск'), q:'Cala Banyalbufar Mallorca', src:'chatgpt', warn:T('Только днём, в тихую погоду.') },
    { id:'calobra', name:'Sa Calobra', area:T('Северо-запад'), lat:39.8510, lon:2.7999, type:'rock', depth:'mid', face:340, reserve:'none',
      fish:T('Сарг, сибас'), methods:T('Донка, спиннинг'), parking:T('Платная парковка наверху'), q:'Sa Calobra Mallorca', src:'chatgpt', warn:T('Летом толпы туристов.') },
    { id:'figueraformentor', name:'Cala Figuera (Formentor)', area:T('Север'), lat:39.9521, lon:3.1729, type:'rock', depth:'mid', face:0, reserve:'none',
      fish:T('Сарг, сибас'), methods:T('Донка, поплавок'), parking:T('С дороги Formentor пешком'), q:'Cala Figuera Formentor Mallorca', src:'chatgpt',
      warn:T('Летом дорога закрыта для частных авто.') },
    { id:'delta', name:'Cala Delta', area:T('Юг (Пальма)'), lat:39.4575, lon:2.7565, type:'rock', depth:'mid', face:240, reserve:'palma',
      fish:T('Сарг, сибас, дорада'), methods:T('Донка, поплавок, спиннинг'), parking:T('Пешком по скалам'), q:'Cala Delta Llucmajor Mallorca', src:'chatgpt',
      warn:T('Рядом зона особой охраны — проверить границу.') },
    { id:'songranada', name:'Ses Olles de Son Granada (Maioris)', area:T('Юг (Пальма)'), lat:39.4498, lon:2.7430, type:'rock', depth:'mid', face:230, reserve:'palma',
      fish:T('Сарг, сибас'), methods:T('Лёгкий спиннинг, донка'), parking:T('Mirador de Maioris, дальше ~25 мин пешком по тропе'), q:'Ses Olles de Son Granada de Baix Llucmajor', src:'chatgpt' },
    { id:'clotsase', name:'Escar del Clot de s\'Ase', area:T('Юг'), lat:39.3620, lon:2.9550, type:'rock', depth:'shallow', face:200, reserve:'migjorn',
      fish:T('Дорада, сарг'), methods:T('Донка, сурф-кастинг'), parking:T('Пешком из Sa Ràpita'), q:'Escar del Clot de s\'Ase Mallorca', src:'chatgpt' },
    { id:'almunia', name:'Cala s\'Almunia', area:T('Юго-восток'), lat:39.3132, lon:3.1180, type:'rock', depth:'mid', face:150, reserve:'migjorn',
      fish:T('Сарг, сибас, дорада'), methods:T('Донка, поплавок'), parking:T('Крутой спуск'), q:'Cala s\'Almunia Mallorca', src:'chatgpt' },
    { id:'llombards', name:'Cala Llombards', area:T('Юго-восток'), lat:39.3236, lon:3.1382, type:'beach', depth:'shallow', face:140, reserve:'migjorn',
      fish:T('Дорада, сарг'), methods:T('Сурф-кастинг'), parking:T('Сезонная, мало мест'), q:'Cala Llombards Mallorca', src:'chatgpt' },
    { id:'pontas', name:T('Es Pontàs (ориентир)'), area:T('Юго-восток'), lat:39.3335, lon:3.1470, type:'rock', depth:'deep', face:130, reserve:'migjorn',
      fish:'—', methods:T('Не место для рыбалки'), parking:T('Смотровая площадка'), q:'Es Pontas Mallorca', src:'chatgpt', noFish:true,
      warn:T('Смотровая на обрыве, не рыболовная точка.') },
    { id:'balconet', name:T('Mirador des Balconet (ориентир)'), area:T('Юг'), lat:null, lon:null, type:'rock', depth:'deep', face:180, reserve:'migjorn',
      fish:'—', methods:T('Не место для рыбалки'), parking:T('Смотровая площадка'), q:'Mirador des Balconet Mallorca', src:'chatgpt', noFish:true,
      warn:T('Смотровая на обрыве. Координаты не известны — откройте поиск на карте.') },
    // голубой краб — вероятные места (солоноватая вода у моря)
    { id:'crab_muro', name:T('Устье канала s\'Albufera (Platja de Muro)'), area:T('Север'), lat:39.7990, lon:3.1170, type:'beach', depth:'shallow', face:45, reserve:'none',
      fish:T('Голубой краб; сибас у устья'), methods:T('Сачок днём; сурф ночью'), parking:T('Парковка у Pont dels Anglesos'), q:'Pont dels Anglesos Platja de Muro', src:'atlas',
      warn:T('Только со стороны моря: внутри s\'Oberta и парка s\'Albufera ловить нельзя.'), crabOnly:false },
    { id:'crab_fontanelles', name:'Ses Fontanelles (Can Pastilla)', area:T('Юг (Пальма)'), lat:39.5345, lon:2.7175, type:'beach', depth:'shallow', face:200, reserve:'none',
      fish:T('Голубой краб'), methods:T('Сачок днём'), parking:T('Улицы Can Pastilla'), q:'Ses Fontanelles Can Pastilla', src:'atlas',
      warn:T('Место по сообщениям о находках краба, не проверено на месте.') },
    { id:'crab_albufereta', name:T('Albufereta (Pollença) — со стороны моря'), area:T('Север'), lat:39.8565, lon:3.0920, type:'beach', depth:'shallow', face:90, reserve:'none',
      fish:T('Голубой краб'), methods:T('Сачок днём'), parking:T('У пляжа Albufereta'), q:'Platja de l\'Albufereta Pollença', src:'atlas',
      warn:T('Сама лагуна — природный резерват: ловить только на морском берегу.') }
  ];


  // ---------- Техники ловли ----------
  const TECH = {
    spin: { name:T('Спиннинг'), short:T('Спин'), icon:'🎯',
      gear:[T('Удилище 2,7–3,0 м, тест 10–40 г'),T('Катушка 3000–4000, шнур PE 0,8–1,2'),T('Поводок флюорокарбон 0,28–0,35 мм, 1–1,5 м (на луфаря — стальной)')],
      bait:[T('Воблеры-минноу 9–12 см (утро, мутная вода)'),T('Стикбейты и попперы 10–14 см (лампуга, луфарь, лича)'),T('Металл/кастмастер 20–40 г для дальнего заброса'),T('Силикон 10–12 см на джиг-головке 10–20 г')],
      when:T('Рассвет и первые 2 часа, закат. Лучше лёгкая рябь и ветер в берег.'),
      season:T('Лампуга 15 авг – 31 дек, луфарь сен–ноя, сибас окт–мар, лича лето–осень.'),
      rules:T('В заповедниках — 1 снасть на человека; живец обычно запрещён.') },
    rock: { name:T('Рокфишинг'), short:T('Рок'), icon:'🪨',
      gear:[T('Лёгкий спиннинг 2,1–2,4 м, тест 1–10 г (LRF) или 5–25 г'),T('Катушка 1000–2500, шнур PE 0,4–0,6'),T('Поводок флюр 0,18–0,25 мм')],
      bait:[T('Силикон 2–3" на джиг-головке 3–7 г (сарг, скорпена, морской окунь)'),T('Микроколебалки и микровоблеры 3–5 см'),T('Техника «дроп-шот» и «техас» между камнями'),T('Без спиннинга: поплавок 1–3 г, креветка или мидия из магазина')],
      when:T('Утро и вечер, пасмурно. Ловить вдоль стенки и в белой воде у камней.'),
      season:T('Круглый год; сарг лучше осень–весна.'),
      rules:T('Минимальные размеры сарга 23 см, дорады 20 см (35 см в заповеднике).') },
    surf: { name:T('Сурф-кастинг'), short:T('Сурф'), icon:'🏖',
      gear:[T('Удилище 4,2–4,5 м, тест 100–200 г, 2 удилища максимум'),T('Катушка 6000–8000 с длинной шпулей, леска 0,25–0,30 или шнур + шок-лидер 0,50'),T('Груз 80–150 г (пирамида или с якорями при течении)')],
      bait:[T('Монтаж «падаюший» или 2 поводка, крючок №2–6'),T('Наживка: покупные черви (корея, американа, тита), креветка, сардина, кальмар'),T('Ночью и после шторма — сардина/кальмар на сибаса и дораду')],
      when:T('Ночь, рассвет, мутная вода после шторма, волна 0,3–1,0 м.'),
      season:T('Лучше всего октябрь–апрель. Летом пляжи открыты только с 22:00 до 7:00.'),
      rules:T('Пляж 1 мая – 30 сен: нельзя с 7:00 до 22:00, не ближе 100 м к купающимся.') },
    squid: { name:T('Кальмар (эгинг)'), short:T('Кальмар'), icon:'🦑',
      gear:[T('Удилище для эгинга 2,4–2,6 м, тест под эги 2.5–3.5'),T('Катушка 2500–3000, шнур PE 0,6–0,8'),T('Поводок флюр 0,22–0,28 мм, 1,5–2 м')],
      bait:[T('Эги 2.5 (мелко, спокойно), 3.0 (стандарт), 3.5 (глубина/ветер)'),T('Цвета: днём натуральные, на закате оранжевый/розовый, ночью светящиеся'),T('Проводка: 2–3 рывка вверх и пауза 5–10 с — поклёвка на паузе')],
      when:T('Закат и первые 2–3 часа темноты, тихая прозрачная вода, волна до 0,8 м.'),
      season:T('Октябрь – февраль (пик ноябрь–январь). Каракатица — весна.'),
      rules:T('До 10 кальмаров/каракатиц в день, 1 эги на снасть. Фонарь для привлечения запрещён.') },
    crab: { name:T('Голубой краб'), short:T('Краб'), icon:'🦀',
      gear:[T('Разрешено: сачок (salabre) и острога (fisga), ловля с берега пешком или в апноэ'),T('Запрещено: ловушки, верши (nasas), сети')],
      bait:[T('Подманить: рыбьи головы, курица, сардина у кромки воды — брать сачком'),T('Ищите в солоноватой воде: устья торрентов и каналов, лагуны у моря, тихие бухты')],
      when:T('Только днём: сбор морепродуктов запрещён от заката до восхода. Лучше тёплые месяцы.'),
      season:T('Июнь – октябрь, когда вода тёплая; зимой краб малоактивен.'),
      rules:T('Лицензия обязательна. До 2 кг в день, не суммируется с рыбой. Продажа запрещена. Внутри s\'Oberta (s\'Albufera) и в парке Mondragó ловить нельзя.') }
  };
  const SPOT_TECH = {
    sonserra:['surf','crab'], picafort:['surf','crab'], alcanada:['rock','squid','spin'], betlem:['spin','rock','squid'],
    estrenc:['surf'], malpas:['spin','rock','squid'], namer:['rock','squid','spin'], portocolom:['squid','rock'],
    santvicenc:['spin','squid','rock'], calablava:['rock','squid','spin'], capdepera:['spin','rock'], soller:['squid','spin','rock'],
    formentor:['spin','rock'], salines:['rock'], figuera:['spin','squid','rock'], santelm:['spin','squid','rock'],
    canonge:['rock','spin'], valldemossa:['rock','spin'], banyalbufar:['rock','spin'], calobra:['rock','spin'],
    figueraformentor:['rock','squid'], delta:['rock','spin','squid'], songranada:['rock','spin'], clotsase:['surf','rock'],
    almunia:['rock'], llombards:['surf'], pontas:[], balconet:[],
    crab_muro:['crab','surf'], crab_fontanelles:['crab'], crab_albufereta:['crab']
  };
  const PARK_Q = {
    sonserra:'Aparcament Son Serra de Marina platja', picafort:'Aparcament Son Bauló Can Picafort', alcanada:'Aparcament Platja d\'Alcanada',
    betlem:'Betlem Artà aparcament', estrenc:'Aparcament Ses Covetes Es Trenc', malpas:'Aparcament Mal Pas Bonaire Alcúdia',
    namer:'Aparcament Punta de n\'Amer Sa Coma', portocolom:'Far de Portocolom', santvicenc:'Aparcament Cala Sant Vicenç',
    calablava:'Cala Blava Llucmajor', capdepera:'Far de Capdepera aparcament', soller:'Aparcament Far de sa Creu Port de Sóller',
    formentor:'Aparcament Far de Formentor', salines:'Aparcament Far de ses Salines', figuera:'Aparcament Cala Figuera Santanyí',
    santelm:'Aparcament Sant Elm', canonge:'Port des Canonge aparcament', valldemossa:'Port de Valldemossa aparcament',
    banyalbufar:'Banyalbufar aparcament', calobra:'Aparcament Sa Calobra', figueraformentor:'Cala Figuera Formentor aparcament',
    delta:'Cala Delta Llucmajor', songranada:'Mirador de Maioris Llucmajor', clotsase:'Sa Ràpita aparcament',
    almunia:'Aparcament Caló des Moro Cala s\'Almunia', llombards:'Aparcament Cala Llombards',
    crab_muro:'Aparcament Pont dels Anglesos Platja de Muro', crab_fontanelles:'Ses Fontanelles Can Pastilla', crab_albufereta:'Platja de l\'Albufereta Pollença'
  };

  // ---------- Справочник рыб ----------
  // min: см (общ.), minRes: см в заповеднике, limit: шт/день, open: [мес_с, мес_по] когда МОЖНО (1–12), closed: [месяцы] когда нельзя
  const FISH = [
    { id:'dorada', ru:T('Дорада'), es:'Dorada', ca:'Orada', lat:'Sparus aurata', min:20, minRes:35, limit:2,
      tips:T('Сурф-кастинг и донка с песка, ночь и рассвет. Наживка: краб из магазина, креветка, черви (покупные). Лучше осень–весна.') },
    { id:'lubina', ru:T('Сибас (лаврак)'), es:'Lubina', ca:'Llobarro', lat:'Dicentrarchus labrax', min:25, minRes:43, limit:1, pescarec:true,
      tips:T('После шторма в мутной воде у пляжей и устьев. Воблеры 9–12 см, сурф-кастинг с сардиной. Окт–мар.') },
    { id:'sargo', ru:T('Сарг'), es:'Sargo', ca:'Sard', lat:'Diplodus sargus', min:23,
      tips:T('Скалы, белая вода у камней. Поплавок или донка, креветка, мидия из магазина, хлеб с прикормкой.') },
    { id:'denton', ru:T('Зубан'), es:'Dentón', ca:'Déntol', lat:'Dentex dentex', min:35, limit:2, mark:true,
      tips:T('Глубокие скалы, рассвет. Живец (если разрешён), воблеры, стикбейты. Пометить хвост сразу.') },
    { id:'mero', ru:T('Групер (мероу)'), es:'Mero', ca:'Anfós', lat:'Epinephelus marginatus', min:45, minRes:50, limit:1, mark:true,
      tips:T('Редко с берега, глубокие камни. Почти всегда лучше отпустить.') },
    { id:'gitano', ru:T('Гитано'), es:'Gitano', ca:'Anfós bord', lat:'Mycteroperca rubra', min:45, minRes:53, limit:1, mark:true,
      tips:T('Глубокие скалы. Пометить хвост.') },
    { id:'lampuga', ru:T('Лампуга (корифена)'), es:'Lampuga', ca:'Llampuga', lat:'Coryphaena hippurus', limit:5, open:[8,12], openFrom:'15.08', pescarec:true,
      tips:T('Только 15 авг – 31 дек. Спиннинг с мысов: металл 20–30 г, попперы. Не ближе 250 м к сетям и плотам.') },
    { id:'raor', ru:T('Раор (рыба-бритва)'), es:'Raor', ca:'Raor', lat:'Xyrichtys novacula', limit:50, open:[9,3],
      tips:T('1 сен – 31 мар. Песчаное дно 5–20 м, крошечный крючок №12–14, кусочки креветки. Обычно с лодки, с берега редко.') },
    { id:'calamar', ru:T('Кальмар / каракатица'), es:'Calamar / Sepia', ca:'Calamar / Sípia', lat:'Loligo vulgaris / Sepia officinalis', limit:10, perPiece:true,
      tips:T('Эги 2.5–3.0 на закате и ночью, окт–фев. Подсветка для привлечения запрещена. Одна потера на снасть.') },
    { id:'pulpo', ru:T('Осьминог'), es:'Pulpo', ca:'Pop', lat:'Octopus vulgaris', limit:3, minKg:1, closed:[6,7],
      tips:T('Только от 1 кг, до 3 шт. На Майорке запрет в июне и июле.') },
    { id:'erizo', ru:T('Морской ёж'), es:'Erizo de mar', ca:'Garota', lat:'Paracentrotus lividus', open:[11,3],
      tips:T('1 ноя – 31 мар, глубже 10 м нельзя. Проверить квоту в таблице талий.') },
    { id:'cangrejo', ru:T('Голубой краб'), es:'Cangrejo azul', ca:'Cranc blau', lat:'Callinectes sapidus', limitKg:2, dayOnly:true,
      tips:T('Инвазивный вид, ловить можно во всех водах, где разрешена рекреационная рыбалка. Только днём, сачком или острогой, до 2 кг в день. Ловушки и сети запрещены.') },
    { id:'oblada', ru:T('Облада'), es:'Oblada', ca:'Oblada', lat:'Oblada melanura', check:true,
      tips:T('Поплавок с хлебом у поверхности, прикормка. Мин. размер — проверить в таблице талий.') },
    { id:'mabre', ru:T('Мабре (херрера)'), es:'Herrera', ca:'Mabre', lat:'Lithognathus mormyrus', check:true,
      tips:T('Песок у берега, ночной сурф-кастинг, черви. Мин. размер — проверить.') },
    { id:'lecha', ru:T('Лича (сериола)'), es:'Serviola', ca:'Cirviola', lat:'Seriola dumerili', check:true,
      tips:T('Глубокие мысы, живец, тяжёлые воблеры. Мин. размер — проверить.') },
    { id:'anjova', ru:T('Луфарь'), es:'Anjova', ca:'Anxova', lat:'Pomatomus saltatrix', check:true,
      tips:T('Сен–ноя, стаи у мысов, металл и воблеры, нужен стальной поводок. Мин. размер — проверить.') }
  ];

  const TALLAS_URL = 'https://caib.es/webgoib/documents/20121/0/Tallas+m%C3%ADnimas+para+la+pesca+y+marisqueo+recreativo_2025_es_3+%281%29.pdf/af23f821-437a-c6e7-1e6f-b3175c5ed49e?t=1756360126065';
  const RULES_URL = 'https://caib.es/webgoib/documents/81190/1416499/Cuaderno_pesca_recreativa_27_07_2026.pdf/7c06e51e-3ecb-3f71-06e0-d338aea1626f?t=1785137391783';

  // ---------- Даты и праздники ----------
  function easter(y) {
    const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
      h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
      mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;
    return new Date(y, mo-1, da);
  }
  function ymd(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function isHoliday(d) {
    const y=d.getFullYear(), md=(d.getMonth()+1)+'-'+d.getDate();
    if (['1-1','1-6','3-1','5-1','8-15','10-12','11-1','12-6','12-8','12-25','12-26'].includes(md)) return true;
    const e=easter(y), gf=new Date(e), em=new Date(e);
    gf.setDate(e.getDate()-2); em.setDate(e.getDate()+1);
    const th=new Date(e); th.setDate(e.getDate()-3);
    return [gf,em,th].some(x=>ymd(x)===ymd(d));
  }
  const DOW = [T('вс'),T('пн'),T('вт'),T('ср'),T('чт'),T('пт'),T('сб')];

  // Можно ли ловить в эту дату/час в этой точке
  function legal(spot, date, tech, sun) {
    const r = RESERVES[spot.reserve] || RESERVES.none;
    if (spot.noFish) return { ok:false, why:T('Не рыболовная точка') };
    if (r.days === null) return { ok:true, unsure:true, why:r.name+T(': правила не подтверждены') };
    const dow = date.getDay();
    if (!r.days.includes(dow) && !(r.holidays && isHoliday(date)))
      return { ok:false, why:r.name+T(': сегодня (')+DOW[dow]+T(') ловить нельзя. Можно: ')+r.days.map(x=>DOW[x]).join(', ')+T(' и праздники') };
    if (tech==='crab' && sun && (date.getTime()<sun.sr || date.getTime()>sun.ss))
      return { ok:false, why:T('Голубой краб: ловить только днём (от восхода до заката)') };
    if (spot.type==='beach' && tech!=='crab') {
      const m=date.getMonth()+1, h=date.getHours();
      if (m>=5 && m<=9 && h>=7 && h<22) return { ok:false, why:T('Пляж: с 1 мая по 30 сентября нельзя с 7:00 до 22:00') };
    }
    return { ok:true };
  }

  // Сезон вида: открыт ли в этом месяце
  function fishOpen(f, date) {
    const m = date.getMonth()+1, d = date.getDate();
    if (f.closed && f.closed.includes(m)) return false;
    if (f.open) {
      const [a,b] = f.open;
      let inRange = a<=b ? (m>=a && m<=b) : (m>=a || m<=b);
      if (f.id==='lampuga' && m===8 && d<15) inRange=false;
      return inRange;
    }
    return true;
  }

  // Проверка улова
  function checkCatch(fishId, lengthCm, weightKg, spot, date, todayCount) {
    const f = FISH.find(x=>x.id===fishId);
    if (!f) return { verdict:'?', lines:[T('Вид не найден')] };
    const lines=[]; let keep=true; let unsure=false;
    const inRes = spot && spot.reserve!=='none';
    if (!fishOpen(f,date)) { keep=false; lines.push(T('Сейчас запретный сезон для этого вида.')); }
    const min = inRes && f.minRes ? f.minRes : f.min;
    if (min) {
      if (!lengthCm) { unsure=true; lines.push(T('Укажите длину: минимум ')+min+T(' см')+(inRes&&f.minRes?T(' (в заповеднике)'):'')+'.'); }
      else if (lengthCm < min) { keep=false; lines.push(T('Длина ')+lengthCm+T(' см меньше минимума ')+min+T(' см')+(inRes&&f.minRes?T(' (в заповеднике)'):'')+'.'); }
      else lines.push(T('Длина в норме (минимум ')+min+T(' см).'));
    }
    if (f.minKg) {
      if (!weightKg) { unsure=true; lines.push(T('Укажите вес: минимум ')+f.minKg+T(' кг.')); }
      else if (weightKg < f.minKg) { keep=false; lines.push(T('Вес меньше ')+f.minKg+T(' кг.')); }
    }
    if (f.limit) {
      if (todayCount >= f.limit) { keep=false; lines.push(T('Дневной лимит ')+f.limit+T(' шт уже набран (')+todayCount+').'); }
      else lines.push(T('Лимит ')+f.limit+T(' шт в день, сегодня уже ')+todayCount+'.');
    }
    if (inRes && (spot.reserve==='palma' || spot.reserve==='migjorn')) lines.push(T('В этом заповеднике из охраняемых видов — 1 рыба в день.'));
    if (f.limitKg) lines.push(T('Лимит ')+f.limitKg+T(' кг в день (не суммируется с рыбой).'));
    if (f.dayOnly && (date.getHours()<7 || date.getHours()>=19)) lines.push(T('Сбор только днём — проверьте время заката.'));
    if (f.check) { unsure=true; lines.push(T('Минимальный размер этого вида не внесён — проверьте таблицу талий.')); }
    if (keep && f.mark) lines.push(T('Сразу пометить: подрезать нижнюю лопасть хвоста.'));
    if (f.pescarec) lines.push(T('Записать в приложение PescaREC (даже если отпустили).'));
    lines.push(T('Общий лимит: 5 кг + 1 рыба в день.'));
    return { verdict: keep ? (unsure?'check':'keep') : 'release', lines };
  }

  // ---------- Луна ----------
  function moonPhase(date) { // 0=новолуние, 0.5=полнолуние
    const syn = 29.530588853, ref = Date.UTC(2000,0,6,18,14);
    let p = ((date.getTime()-ref)/86400000) % syn; if (p<0) p+=syn;
    return p/syn;
  }
  function moonName(p) {
    if (p<0.03||p>0.97) return T('новолуние'); if (p<0.22) return T('растущий серп'); if (p<0.28) return T('первая четверть');
    if (p<0.47) return T('растущая'); if (p<0.53) return T('полнолуние'); if (p<0.72) return T('убывающая'); if (p<0.78) return T('последняя четверть'); return T('убывающий серп');
  }

  // ---------- Погода: разбор ответа Open-Meteo ----------
  // wx = { t:[iso], wind:[], gust:[], dir:[], press:[], cloud:[], rain:[], temp:[], wave:[], wper:[], sst:[], sunrise:[iso], sunset:[iso] }
  function angDiff(a,b){ let d=Math.abs(a-b)%360; return d>180?360-d:d; }

  // ---------- Солунар (положение луны, упрощённая формула) ----------
  const RAD = Math.PI/180;
  function moonAlt(ms, lat, lon) {
    const d = ms/864e5 - 0.5 + 2440588 - 2451545, e = RAD*23.4397;
    const L = RAD*(218.316+13.176396*d), M = RAD*(134.963+13.064993*d), F = RAD*(93.272+13.229350*d);
    const l = L + RAD*6.289*Math.sin(M), b = RAD*5.128*Math.sin(F);
    const ra = Math.atan2(Math.sin(l)*Math.cos(e) - Math.tan(b)*Math.sin(e), Math.cos(l));
    const dec = Math.asin(Math.sin(b)*Math.cos(e) + Math.cos(b)*Math.sin(e)*Math.sin(l));
    const H = RAD*(280.16+360.9856235*d) + RAD*lon - ra, phi = RAD*lat;
    return Math.asin(Math.sin(phi)*Math.sin(dec) + Math.cos(phi)*Math.cos(dec)*Math.cos(H));
  }
  const solCache = {};
  // Главные периоды: ±1 ч от верхней и нижней кульминации луны. Малые: ±30 мин от восхода и захода луны.
  function solunar(dayKey, lat, lon) {
    lat = lat || 39.6; lon = lon || 3.0;
    const key = dayKey + lat.toFixed(1) + lon.toFixed(1); if (solCache[key]) return solCache[key];
    const t0 = new Date(dayKey + 'T00:00').getTime() - 3*3600000, step = 600000, pts = [];
    for (let t = t0; t <= t0 + 30*3600000; t += step) pts.push([t, moonAlt(t, lat, lon)]);
    const major = [], minor = [], dayA = t0 + 3*3600000, dayB = dayA + 864e5;
    for (let k = 1; k < pts.length-1; k++) {
      const [t, a] = pts[k], p = pts[k-1][1], n = pts[k+1][1];
      if ((a > p && a >= n) || (a < p && a <= n)) { if (t >= dayA && t < dayB) major.push([t-3600000, t+3600000, t]); }
      if ((p < 0) !== (a < 0) && t >= dayA && t < dayB) minor.push([t-1800000, t+1800000, t]);
    }
    return solCache[key] = { major, minor };
  }
  function inSol(sol, ms) {
    if (sol.major.some(([a,b]) => ms >= a && ms <= b)) return 2;
    if (sol.minor.some(([a,b]) => ms >= a && ms <= b)) return 1;
    return 0;
  }
  // Подсказка веса груза по течению (км/ч)
  function sinker(cur) {
    if (cur == null) return null;
    return cur < 1 ? T('80–100 г') : cur < 2 ? T('120–150 г') : T('150 г и больше, груз с якорями');
  }
  // Лучшие месяцы для вида (по опыту рыбаков, не закон)
  const BEST = { dorada:[10,11,12,1,2,3,4], lubina:[10,11,12,1,2,3], sargo:[9,10,11,12,1,2,3,4,5], denton:[4,5,6,9,10], mero:[], gitano:[],
    lampuga:[8,9,10,11,12], raor:[9,10,11], calamar:[10,11,12,1,2], pulpo:[3,4,5,9,10], erizo:[12,1,2,3], cangrejo:[6,7,8,9,10],
    oblada:[4,5,6,7,8,9,10], mabre:[5,6,7,8,9,10], lecha:[6,7,8,9,10,11], anjova:[9,10,11] };

  function hourScore(spot, wx, i, tech, pers) {
    const date = new Date(wx.t[i]);
    const dk = wx.t[i].slice(0,10), dIdx = wx.days.indexOf(dk);
    const sun = dIdx>=0 ? { sr:new Date(wx.sunrise[dIdx]).getTime(), ss:new Date(wx.sunset[dIdx]).getTime() } : null;
    const L = legal(spot, date, tech, sun);
    const r = { score:0, legal:L, tags:[], danger:false };
    if (!L.ok) return r;
    let s = 40;
    const wave = wx.wave[i], wind = wx.wind[i], gust = wx.gust[i], dir = wx.dir[i];
    const rock = spot.type==='rock';
    // Волна
    if (wave!=null) {
      if (!rock) { if (wave<0.3) s+=0; else if (wave<=1.0) s+=15; else if (wave<=1.5) s+=3; else if (wave<=2) { s-=20; r.tags.push(T('сильный прибой')); } else { s-=40; r.danger=true; } }
      else { if (wave<=1.0) s+=10; else if (wave<=1.5) s-=10; else { s-=40; r.danger=true; } }
    }
    // Ветер
    if (wind!=null) {
      if (wind<10) s+=5; else if (wind<=20) s+=5; else if (wind<=30) s-=10; else s-=25;
      const onshore = angDiff(dir, spot.face) < 60;   // ветер дует с моря на берег
      const offshore = angDiff(dir, spot.face) > 120;
      if (onshore && wind>=5 && wind<=20 && !rock) { s+=5; r.tags.push(T('лёгкий ветер с моря')); }
      if (onshore && wind>25 && rock) { s-=15; r.danger=true; }
      if (offshore && wind>25) { s-=5; r.tags.push(T('сильный отжим')); }
    }
    if (gust!=null && gust>45) { s-=15; if (rock) r.danger=true; r.tags.push(T('порывы ')+Math.round(gust)+T(' км/ч')); }
    // Давление: тренд за 3 часа
    if (i>=3 && wx.press[i]!=null && wx.press[i-3]!=null) {
      const dp = wx.press[i]-wx.press[i-3];
      if (dp<=-0.5 && dp>=-2) { s+=8; r.tags.push(T('давление плавно падает')); }
      else if (Math.abs(dp)<0.5) s+=5;
      else if (dp>1.5) { s-=8; r.tags.push(T('давление резко растёт')); }
      else if (dp<-2) { s-=5; r.tags.push(T('давление резко падает')); }
    }
    // Время суток
    const t = date.getTime(), dayKey = wx.t[i].slice(0,10);
    const di = wx.days.indexOf(dayKey);
    if (di>=0) {
      const sr = new Date(wx.sunrise[di]).getTime(), ss = new Date(wx.sunset[di]).getTime();
      const near = Math.min(Math.abs(t-sr), Math.abs(t-ss))/3600000;
      if (near<=1.5) { s+=15; r.tags.push(Math.abs(t-sr)<Math.abs(t-ss)?T('рассвет'):T('закат')); }
      const night = t<sr-3600000 || t>ss+3600000;
      if (night && (!rock || spot.depth!=='shallow')) s+=5;
      const m=date.getMonth()+1, h=date.getHours();
      if (!night && m>=5 && m<=9 && h>=11 && h<=17 && (wx.cloud[i]||0)<30) { s-=10; r.tags.push(T('жаркий полдень')); }
    }
    if ((wx.cloud[i]||0)>70) s+=3;
    if ((wx.rain[i]||0)>2) { s-=10; r.tags.push(T('ливень')); }
    // Мутность после шторма
    let maxW=0; for (let k=Math.max(0,i-24);k<i;k++) if (wx.wave[k]!=null) maxW=Math.max(maxW,wx.wave[k]);
    if (maxW>1.5 && wave!=null && wave<1.2) { if (!rock) { s+=8; r.tags.push(T('мутная вода: шанс на сибаса')); } else { s-=5; r.tags.push(T('мутная вода')); } }
    // Вода
    const sst = wx.sst[i];
    if (sst!=null) { if (sst<14) s-=5; else if (sst>=16 && sst<=24) s+=3; }
    // Луна
    const mp = moonPhase(date); if (mp<0.1||mp>0.9||Math.abs(mp-0.5)<0.1) s+=5;
    // Солунар
    const sl = inSol(solunar(wx.t[i].slice(0,10), spot.lat, spot.lon), date.getTime());
    if (sl===2) { s+=6; r.tags.push(T('солунар: главный период')); } else if (sl===1) { s+=3; r.tags.push(T('солунар: малый период')); }
    // Длинная зыбь опасна на скалах
    const wper = wx.wper ? wx.wper[i] : null;
    if (rock && wave!=null && wave>=1.0 && wper!=null && wper>=8) { r.danger=true; s-=10; r.tags.push(T('длинная зыбь')); }
    // Резкое похолодание воды за 2 дня
    if (sst!=null) { let mx=sst; for (let k=Math.max(0,i-48);k<i;k++) if (wx.sst[k]!=null) mx=Math.max(mx,wx.sst[k]); if (mx-sst>=2) { s-=6; r.tags.push(T('вода холодает')); } }
    // Ваши удачные часы по журналу
    if (pers && pers.hours && pers.hours.has(date.getHours())) { s+=4; r.tags.push(T('ваши часы')); }
    // Поправки под технику
    if (tech && sun) {
      const t2=date.getTime(), m2=date.getMonth()+1, dusk=Math.abs(t2-sun.ss)/3600000, dark=t2>sun.ss&&t2<sun.ss+3*3600000;
      if (tech==='squid') { if (dark||dusk<=1) { s+=10; r.tags.push(T('время кальмара')); } if (wave!=null&&wave>0.8) s-=10; if (!(m2>=10||m2<=2)) s-=10; }
      if (tech==='spin') { if (Math.abs(t2-sun.sr)/3600000<=1.5) s+=5; if (wind!=null && wind>25) s-=5; }
      if (tech==='rock') { if (wave!=null && wave>1.0) s-=10; }
      if (tech==='surf') { if (wave!=null && wave>=0.3 && wave<=1.0) s+=5; }
      if (tech==='crab') { s = 40 + (wave!=null && wave<0.5 ? 20 : 0) + ((wx.sst[i]||0)>=20 ? 20 : (wx.sst[i]||0)>=17 ? 10 : -10) + (wind!=null && wind<15 ? 10 : 0); r.tags=[]; if ((wx.sst[i]||0)>=20) r.tags.push(T('тёплая вода — краб активен')); }
    }
    if (L.unsure) r.tags.push(T('правила не подтверждены'));
    r.score = Math.max(0, Math.min(100, Math.round(s)));
    return r;
  }

  // Лучшее окно (2 часа) на дату для точки
  function bestWindow(spot, wx, dayKey, fromMs, tech, pers) {
    let best=null;
    for (let i=0;i<wx.t.length-1;i++) {
      if (wx.t[i].slice(0,10)!==dayKey) continue;
      if (fromMs && new Date(wx.t[i]).getTime() < fromMs - 3600000) continue;
      const a=hourScore(spot,wx,i,tech,pers), b=hourScore(spot,wx,i+1,tech,pers);
      if (!a.legal.ok || !b.legal.ok) continue;
      const avg=(a.score+b.score)/2;
      if (!best || avg>best.score) best={ score:Math.round(avg), i, tags:[...new Set([...a.tags,...b.tags])], danger:a.danger||b.danger, unsure:a.legal.unsure };
    }
    if (!best) {
      const i = wx.t.findIndex(x=>x.slice(0,10)===dayKey);
      const L = i>=0 ? legal(spot, new Date(wx.t[i].slice(0,10)+'T12:00')) : {ok:false, why:T('Нет данных')};
      return { score:0, closed:true, why:(L.ok ? (fromMs ? T('Сегодня подходящих часов больше нет') : T('Весь день нельзя')) : L.why) };
    }
    return best;
  }

  // Подсказка снасти и наживки
  function tackle(spot, date, seasonalOnly) {
    const m = date.getMonth()+1, out=[];
    if (spot.noFish) return [T('Не место для рыбалки.')];
    if (seasonalOnly) {}
    else if (spot.type==='beach') {
      out.push(T('Сурф-кастинг 4–4,5 м, груз 80–150 г, поводок 0,25–0,30, крючок №4–6.'));
      out.push(T('Наживка: покупные черви (корея, американа), креветка; ночью сардина.'));
      if (m>=10||m<=3) out.push(T('После шторма в мутной воде — сибас на сардину или воблер 12 см.'));
    } else if (spot.depth==='shallow') {
      out.push(T('Поплавок 1–3 г, леска 0,18–0,22, крючок №8–10.'));
      out.push(T('Наживка: креветка, мидия из магазина, хлеб; прикормка с сардиной.'));
    } else {
      out.push(T('Спиннинг 2,7–3 м, тест 10–40 г, шнур PE 1, флюр 0,30.'));
      out.push(T('Приманки: воблеры 9–12 см, стикбейт, джиг 20–30 г.'));
    }
    if (seasonalOnly && spot.type==='beach' && (m>=10||m<=3)) out.push(T('После шторма в мутной воде — сибас на сардину или воблер 12 см.'));
    if (seasonalOnly && (spot.tech||[]).includes('crab') && m>=6 && m<=10) out.push(T('Голубой краб активен: днём, сачком, до 2 кг.'));
    if (m>=10 || m<=2) out.push(T('Кальмар: эги 2.5–3.0 на закате и первые 2 часа темноты.'));
    if ((m===8 && date.getDate()>=15) || (m>=9 && m<=12)) out.push(T('Лампуга: металл 20–30 г, поппер, с мысов утром.'));
    if (m>=9 && m<=11 && spot.type==='rock') out.push(T('Луфарь: стальной поводок, металл, быстрая проводка.'));
    if (spot.reserve!=='none') out.push(T('В заповеднике: 1 снасть, живая рыба на наживку обычно запрещена.'));
    return out;
  }

  // Разбор ответов Open-Meteo для нескольких точек
  function parseWeather(fc, mar) {
    const one = (f, m) => {
      const h=f.hourly, mh=(m&&m.hourly)||{};
      const idx = {}; (mh.time||[]).forEach((t,k)=>idx[t]=k);
      const pick=(arr,t)=>{ const k=idx[t]; return (k==null||!arr)?null:arr[k]; };
      return {
        t:h.time, wind:h.wind_speed_10m, gust:h.wind_gusts_10m, dir:h.wind_direction_10m, press:h.pressure_msl,
        cloud:h.cloud_cover, rain:h.precipitation, temp:h.temperature_2m,
        wave:h.time.map(t=>pick(mh.wave_height,t)), wper:h.time.map(t=>pick(mh.wave_period,t)), sst:h.time.map(t=>pick(mh.sea_surface_temperature,t)),
        sea:h.time.map(t=>pick(mh.sea_level_height_msl,t)), cur:h.time.map(t=>pick(mh.ocean_current_velocity,t)), curDir:h.time.map(t=>pick(mh.ocean_current_direction,t)),
        days:f.daily.time, sunrise:f.daily.sunrise, sunset:f.daily.sunset
      };
    };
    const F = Array.isArray(fc)?fc:[fc], M = Array.isArray(mar)?mar:[mar];
    return F.map((f,k)=>one(f, M[k]));
  }

  function weatherUrls(spots) {
    const lat = spots.map(s=>s.lat.toFixed(3)).join(','), lon = spots.map(s=>s.lon.toFixed(3)).join(',');
    return {
      fc: 'https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+
        '&hourly=temperature_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,pressure_msl,cloud_cover,precipitation'+
        '&daily=sunrise,sunset&timezone=Europe%2FMadrid&past_days=1&forecast_days=3',
      mar: 'https://marine-api.open-meteo.com/v1/marine?latitude='+lat+'&longitude='+lon+
        '&hourly=wave_height,wave_period,sea_surface_temperature,sea_level_height_msl,ocean_current_velocity,ocean_current_direction&timezone=Europe%2FMadrid&past_days=1&forecast_days=3',
      // запасной запрос без уровня моря и течения
      mar2: 'https://marine-api.open-meteo.com/v1/marine?latitude='+lat+'&longitude='+lon+
        '&hourly=wave_height,wave_period,sea_surface_temperature&timezone=Europe%2FMadrid&past_days=1&forecast_days=3'
    };
  }

  SPOTS.forEach(sp => { sp.tech = SPOT_TECH[sp.id] || []; sp.parkQ = PARK_Q[sp.id] || ''; });

  root.FishCore = { RESERVES, SPOTS, FISH, TALLAS_URL, RULES_URL, legal, fishOpen, checkCatch, moonPhase, moonName,
    hourScore, bestWindow, tackle, TECH, solunar, inSol, sinker, BEST, parseWeather, weatherUrls, isHoliday, ymd, DOW, angDiff };
})(typeof self !== 'undefined' ? self : this);
