/* Рыбалка Майорка — данные и расчёты (без DOM). Используется страницей и service worker. */
(function (root) {
  'use strict';

  // ---------- Заповедники ----------
  // days: 0=вс,1=пн,...6=сб. null = правила не подтверждены.
  const RESERVES = {
    none: { name: 'Вне заповедника', days: [0,1,2,3,4,5,6], note: 'Общие правила Балеар.' },
    llevant: { name: 'Заповедник Llevant / Cala Rajada', days: [2,4,6,0], holidays: true,
      note: '1 снасть на человека, до 6 крючков (у Cala Rajada до 4). Запретная зона Cap Ferrutx – Penya del Llamp.',
      url: 'https://www.caib.es/sites/reservesmarines/es/regulacian_de_actividades_0_0/' },
    palma: { name: 'Заповедник Badia de Palma', days: [2,5,6,0], holidays: true,
      note: 'Удочка, спиннинг, 1 эги. По 1 рыбе в день из охраняемых видов. Зона особой охраны у Cap Enderrocat.',
      url: 'https://www.caib.es/sites/reservesmarines/es/regulacio_dactivitats-854' },
    migjorn: { name: 'Заповедник Migjorn', days: null,
      note: 'Дни и снасти для ловли с берега не подтверждены. Уточнить: 971 176 100.',
      url: 'https://caib.es/sites/reservesmarines/es/normativa_basica_sobre_la_reserva-860/' },
    ponent: { name: 'Заповедник Illes del Ponent (2025)', days: null,
      note: 'Новый заповедник, правила не проверены. Уточнить: 971 176 100.',
      url: 'https://www.caib.es/sites/reservesmarines/es/' }
  };

  // ---------- Точки ----------
  // type: beach | rock ; depth: shallow (0–5) | mid (5–15) | deep (15+)
  // face: куда «смотрит» берег (азимут моря, градусы). Координаты примерные.
  const SPOTS = [
    { id:'sonserra', name:'Son Serra de Marina', area:'Север', lat:39.7339, lon:3.2300, type:'beach', depth:'shallow', face:20, reserve:'none',
      fish:'Дорада, мабре, сарг; сибас у устья окт–мар', methods:'Сёрфкастинг, донка', parking:'Улицы посёлка у пляжа', q:'Platja de Son Serra de Marina', src:'atlas' },
    { id:'picafort', name:'Can Picafort – Son Bauló', area:'Север', lat:39.7610, lon:3.1680, type:'beach', depth:'shallow', face:45, reserve:'none',
      fish:'Мабре, дорада, сарг, облада', methods:'Ночной сёрфкастинг', parking:'Набережная, зона Son Bauló', q:'Platja de Son Baulo Can Picafort', src:'atlas' },
    { id:'alcanada', name:'Alcanada (Alcúdia)', area:'Север', lat:39.8370, lon:3.1630, type:'rock', depth:'shallow', face:100, reserve:'none',
      fish:'Облада, сарг, кальмар окт–янв', methods:'Поплавок, эги на закате', parking:'У Platja d\'Alcanada', q:'Platja d\'Alcanada Alcudia', src:'atlas' },
    { id:'betlem', name:'Colònia de Sant Pere – Betlem', area:'Северо-восток', lat:39.7270, lon:3.3020, type:'rock', depth:'shallow', face:300, reserve:'none',
      fish:'Лампуга авг–дек, кальмар, сарг', methods:'Лёгкий спиннинг, эги, поплавок', parking:'Конец дороги в Betlem', q:'Betlem Arta Mallorca', src:'atlas',
      warn:'Восточнее Cap Ferrutx — запретная зона заповедника.' },
    { id:'estrenc', name:'Es Trenc – Colònia de Sant Jordi', area:'Юг', lat:39.3470, lon:2.9740, type:'beach', depth:'shallow', face:220, reserve:'migjorn',
      fish:'Дорада, мабре, сибас в шторм', methods:'Сёрфкастинг', parking:'Платные парковки Ses Covetes / Sa Ràpita', q:'Es Trenc parking Ses Covetes', src:'atlas' },
    { id:'malpas', name:'Mal Pas – Bonaire (Alcúdia)', area:'Север', lat:39.8680, lon:3.1650, type:'rock', depth:'mid', face:0, reserve:'none',
      fish:'Сарг, луфарь сен–ноя, кальмар', methods:'Спиннинг, эги, поплавок', parking:'Вдоль дороги Mal Pas', q:'Mal Pas Bonaire Alcudia', src:'atlas' },
    { id:'namer', name:'Punta de n\'Amer (Sa Coma)', area:'Восток', lat:39.5850, lon:3.3980, type:'rock', depth:'mid', face:90, reserve:'none',
      fish:'Сарг, облада, кальмар, лампуга осенью', methods:'Поплавок, эги, спиннинг', parking:'Въезд со стороны Sa Coma', q:'Punta de n\'Amer Sa Coma', src:'atlas' },
    { id:'portocolom', name:'Portocolom – маяк', area:'Восток', lat:39.4140, lon:3.2730, type:'rock', depth:'mid', face:100, reserve:'none',
      fish:'Кальмар ноя–фев, сарг, дорада', methods:'Эги, поплавок, донка', parking:'У маяка', q:'Far de Portocolom', src:'atlas', warn:'Не с причалов порта.' },
    { id:'santvicenc', name:'Cala Sant Vicenç', area:'Север', lat:39.9230, lon:3.0560, type:'rock', depth:'mid', face:40, reserve:'none',
      fish:'Сарг, кальмар, зубан', methods:'Спиннинг, эги', parking:'В посёлке', q:'Cala Sant Vicenc Pollenca', src:'atlas' },
    { id:'calablava', name:'S\'Arenal – Cala Blava', area:'Юг (Пальма)', lat:39.4800, lon:2.7450, type:'rock', depth:'mid', face:260, reserve:'palma',
      fish:'Сарг, дорада (от 35 см), кальмар', methods:'Поплавок, эги, спиннинг', parking:'Улицы Cala Blava', q:'Cala Blava Llucmajor', src:'atlas' },
    { id:'capdepera', name:'Far de Capdepera (Cala Rajada)', area:'Восток', lat:39.7150, lon:3.4780, type:'rock', depth:'deep', face:80, reserve:'llevant',
      fish:'Лича, зубан, луфарь, кальмар; сен–дек', methods:'Спиннинг, тяжёлая донка', parking:'У маяка', q:'Far de Capdepera', src:'atlas' },
    { id:'soller', name:'Port de Sóller – Punta de sa Creu', area:'Запад', lat:39.7985, lon:2.6905, type:'rock', depth:'deep', face:315, reserve:'none',
      fish:'Кальмар ноя–фев, зубан, сарг, лича', methods:'Эги, спиннинг, живец', parking:'За Platja d\'en Repic', q:'Far de sa Creu Port de Soller', src:'atlas', warn:'Не в порту.' },
    { id:'formentor', name:'Cap de Formentor', area:'Север', lat:39.9620, lon:3.2130, type:'rock', depth:'deep', face:45, reserve:'none',
      fish:'Лича, зубан, луфарь, кальмар', methods:'Спиннинг, живец', parking:'Вдоль дороги Formentor', q:'Cap de Formentor', src:'atlas',
      warn:'Летом дорога для частных авто обычно закрыта.' },
    { id:'salines', name:'Cap de ses Salines', area:'Юг', lat:39.2650, lon:3.0530, type:'rock', depth:'deep', face:180, reserve:'migjorn',
      fish:'Raor сен–мар, сарг, дорада', methods:'Ловля raor, донка', parking:'У маяка', q:'Far des Cap de ses Salines', src:'atlas' },
    { id:'figuera', name:'Cala Figuera (Santanyí)', area:'Юго-восток', lat:39.3290, lon:3.1710, type:'rock', depth:'deep', face:130, reserve:'migjorn',
      fish:'Сарг, кальмар, луфарь', methods:'Спиннинг, эги', parking:'В посёлке', q:'Cala Figuera Santanyi', src:'atlas' },
    { id:'santelm', name:'Sant Elm', area:'Запад', lat:39.5790, lon:2.3510, type:'rock', depth:'deep', face:260, reserve:'ponent',
      fish:'Сарг, кальмар, зубан', methods:'Спиннинг, эги', parking:'В посёлке', q:'Sant Elm Andratx', src:'atlas', warn:'Остров Dragonera с берега не облавливать.' },
    // из архива ChatGPT
    { id:'canonge', name:'Port des Canonge', area:'Запад', lat:39.6960, lon:2.5450, type:'rock', depth:'mid', face:320, reserve:'none',
      fish:'Сарг, сибас', methods:'Донка, поплавок, спиннинг', parking:'До посёлка на машине, дальше пешком', q:'Port des Canonge Mallorca', src:'chatgpt' },
    { id:'valldemossa', name:'Port de Valldemossa', area:'Запад', lat:39.7275, lon:2.6086, type:'rock', depth:'mid', face:320, reserve:'none',
      fish:'Сарг, сибас', methods:'Донка, поплавок, спиннинг', parking:'Крутая дорога, мало мест', q:'Port de Valldemossa Mallorca', src:'chatgpt' },
    { id:'banyalbufar', name:'Cala Banyalbufar', area:'Запад', lat:39.6880, lon:2.5120, type:'rock', depth:'mid', face:310, reserve:'none',
      fish:'Сибас, сарг', methods:'Спиннинг, донка', parking:'Мало мест, неровный спуск', q:'Cala Banyalbufar Mallorca', src:'chatgpt', warn:'Только днём, в тихую погоду.' },
    { id:'calobra', name:'Sa Calobra', area:'Северо-запад', lat:39.8530, lon:2.8030, type:'rock', depth:'mid', face:340, reserve:'none',
      fish:'Сарг, сибас', methods:'Донка, спиннинг', parking:'Платная парковка наверху', q:'Sa Calobra Mallorca', src:'chatgpt', warn:'Летом толпы туристов.' },
    { id:'figueraformentor', name:'Cala Figuera (Formentor)', area:'Север', lat:39.9470, lon:3.1720, type:'rock', depth:'mid', face:0, reserve:'none',
      fish:'Сарг, сибас', methods:'Донка, поплавок', parking:'С дороги Formentor пешком', q:'Cala Figuera Formentor Mallorca', src:'chatgpt',
      warn:'Летом дорога закрыта для частных авто.' },
    { id:'delta', name:'Cala Delta', area:'Юг (Пальма)', lat:39.4575, lon:2.7565, type:'rock', depth:'mid', face:240, reserve:'palma',
      fish:'Сарг, сибас, дорада', methods:'Донка, поплавок, спиннинг', parking:'Пешком по скалам', q:'Cala Delta Llucmajor Mallorca', src:'chatgpt',
      warn:'Рядом зона особой охраны — проверить границу.' },
    { id:'songranada', name:'Ses Olles de Son Granada', area:'Юг', lat:39.3550, lon:2.9050, type:'rock', depth:'mid', face:190, reserve:'migjorn',
      fish:'Сарг, сибас', methods:'Лёгкий спиннинг, донка', parking:'Пешком по скалам', q:'Ses Olles Son Granada de Baix Mallorca', src:'chatgpt' },
    { id:'clotsase', name:'Escar del Clot de s\'Ase', area:'Юг', lat:39.3620, lon:2.9550, type:'rock', depth:'shallow', face:200, reserve:'migjorn',
      fish:'Дорада, сарг', methods:'Донка, сёрфкастинг', parking:'Пешком из Sa Ràpita', q:'Escar del Clot de s\'Ase Mallorca', src:'chatgpt' },
    { id:'almunia', name:'Cala s\'Almunia', area:'Юго-восток', lat:39.2990, lon:3.1220, type:'rock', depth:'mid', face:150, reserve:'migjorn',
      fish:'Сарг, сибас, дорада', methods:'Донка, поплавок', parking:'Крутой спуск', q:'Cala s\'Almunia Mallorca', src:'chatgpt' },
    { id:'llombards', name:'Cala Llombards', area:'Юго-восток', lat:39.3270, lon:3.1440, type:'beach', depth:'shallow', face:140, reserve:'migjorn',
      fish:'Дорада, сарг', methods:'Сёрфкастинг', parking:'Сезонная, мало мест', q:'Cala Llombards Mallorca', src:'chatgpt' },
    { id:'pontas', name:'Es Pontàs (ориентир)', area:'Юго-восток', lat:39.3335, lon:3.1470, type:'rock', depth:'deep', face:130, reserve:'migjorn',
      fish:'—', methods:'Не место для рыбалки', parking:'Смотровая площадка', q:'Es Pontas Mallorca', src:'chatgpt', noFish:true,
      warn:'Смотровая на обрыве, не рыболовная точка.' },
    { id:'balconet', name:'Mirador des Balconet (ориентир)', area:'Юг', lat:null, lon:null, type:'rock', depth:'deep', face:180, reserve:'migjorn',
      fish:'—', methods:'Не место для рыбалки', parking:'Смотровая площадка', q:'Mirador des Balconet Mallorca', src:'chatgpt', noFish:true,
      warn:'Смотровая на обрыве. Координаты не известны — откройте поиск на карте.' },
    // голубой краб — вероятные места (солоноватая вода у моря)
    { id:'crab_muro', name:'Устье канала s\'Albufera (Platja de Muro)', area:'Север', lat:39.7990, lon:3.1170, type:'beach', depth:'shallow', face:45, reserve:'none',
      fish:'Голубой краб; сибас у устья', methods:'Сачок днём; сёрф ночью', parking:'Парковка у Pont dels Anglesos', q:'Pont dels Anglesos Platja de Muro', src:'atlas',
      warn:'Только со стороны моря: внутри s\'Oberta и парка s\'Albufera ловить нельзя.', crabOnly:false },
    { id:'crab_fontanelles', name:'Ses Fontanelles (Can Pastilla)', area:'Юг (Пальма)', lat:39.5345, lon:2.7175, type:'beach', depth:'shallow', face:200, reserve:'none',
      fish:'Голубой краб', methods:'Сачок днём', parking:'Улицы Can Pastilla', q:'Ses Fontanelles Can Pastilla', src:'atlas',
      warn:'Место по сообщениям о находках краба, не проверено на месте.' },
    { id:'crab_albufereta', name:'Albufereta (Pollença) — со стороны моря', area:'Север', lat:39.8565, lon:3.0920, type:'beach', depth:'shallow', face:90, reserve:'none',
      fish:'Голубой краб', methods:'Сачок днём', parking:'У пляжа Albufereta', q:'Platja de l\'Albufereta Pollença', src:'atlas',
      warn:'Сама лагуна — природный резерват: ловить только на морском берегу.' }
  ];


  // ---------- Техники ловли ----------
  const TECH = {
    spin: { name:'Спиннинг', short:'Спин', icon:'🎯',
      gear:['Удилище 2,7–3,0 м, тест 10–40 г','Катушка 3000–4000, шнур PE 0,8–1,2','Поводок флюорокарбон 0,28–0,35 мм, 1–1,5 м (на луфаря — стальной)'],
      bait:['Воблеры-минноу 9–12 см (утро, мутная вода)','Стикбейты и попперы 10–14 см (лампуга, луфарь, лича)','Металл/кастмастер 20–40 г для дальнего заброса','Силикон 10–12 см на джиг-головке 10–20 г'],
      when:'Рассвет и первые 2 часа, закат. Лучше лёгкая рябь и ветер в берег.',
      season:'Лампуга 15 авг – 31 дек, луфарь сен–ноя, сибас окт–мар, лича лето–осень.',
      rules:'В заповедниках — 1 снасть на человека; живец обычно запрещён.' },
    rock: { name:'Рокфишинг', short:'Рок', icon:'🪨',
      gear:['Лёгкий спиннинг 2,1–2,4 м, тест 1–10 г (LRF) или 5–25 г','Катушка 1000–2500, шнур PE 0,4–0,6','Поводок флюр 0,18–0,25 мм'],
      bait:['Силикон 2–3" на джиг-головке 3–7 г (сарг, скорпена, морской окунь)','Микроколебалки и микровоблеры 3–5 см','Техника «дроп-шот» и «техас» между камнями','Без спиннинга: поплавок 1–3 г, креветка или мидия из магазина'],
      when:'Утро и вечер, пасмурно. Ловить вдоль стенки и в белой воде у камней.',
      season:'Круглый год; сарг лучше осень–весна.',
      rules:'Минимальные размеры сарга 23 см, дорады 20 см (35 см в заповеднике).' },
    surf: { name:'Сёрфкастинг', short:'Сёрф', icon:'🏖',
      gear:['Удилище 4,2–4,5 м, тест 100–200 г, 2 удилища максимум','Катушка 6000–8000 с длинной шпулей, леска 0,25–0,30 или шнур + шок-лидер 0,50','Груз 80–150 г (пирамида или с якорями при течении)'],
      bait:['Монтаж «падаюший» или 2 поводка, крючок №2–6','Наживка: покупные черви (корея, американа, тита), креветка, сардина, кальмар','Ночью и после шторма — сардина/кальмар на сибаса и дораду'],
      when:'Ночь, рассвет, мутная вода после шторма, волна 0,3–1,0 м.',
      season:'Лучше всего октябрь–апрель. Летом пляжи открыты только с 22:00 до 7:00.',
      rules:'Пляж 1 мая – 30 сен: нельзя с 7:00 до 22:00, не ближе 100 м к купающимся.' },
    squid: { name:'Кальмар (эгинг)', short:'Кальмар', icon:'🦑',
      gear:['Удилище для эгинга 2,4–2,6 м, тест под эги 2.5–3.5','Катушка 2500–3000, шнур PE 0,6–0,8','Поводок флюр 0,22–0,28 мм, 1,5–2 м'],
      bait:['Эги 2.5 (мелко, спокойно), 3.0 (стандарт), 3.5 (глубина/ветер)','Цвета: днём натуральные, на закате оранжевый/розовый, ночью светящиеся','Проводка: 2–3 рывка вверх и пауза 5–10 с — поклёвка на паузе'],
      when:'Закат и первые 2–3 часа темноты, тихая прозрачная вода, волна до 0,8 м.',
      season:'Октябрь – февраль (пик ноябрь–январь). Каракатица — весна.',
      rules:'До 10 кальмаров/каракатиц в день, 1 эги на снасть. Фонарь для привлечения запрещён.' },
    crab: { name:'Голубой краб', short:'Краб', icon:'🦀',
      gear:['Разрешено: сачок (salabre) и острога (fisga), ловля с берега пешком или в апноэ','Запрещено: ловушки, верши (nasas), сети'],
      bait:['Подманить: рыбьи головы, курица, сардина у кромки воды — брать сачком','Ищите в солоноватой воде: устья торрентов и каналов, лагуны у моря, тихие бухты'],
      when:'Только днём: сбор морепродуктов запрещён от заката до восхода. Лучше тёплые месяцы.',
      season:'Июнь – октябрь, когда вода тёплая; зимой краб малоактивен.',
      rules:'Лицензия обязательна. До 2 кг в день, не суммируется с рыбой. Продажа запрещена. Внутри s\'Oberta (s\'Albufera) и в парке Mondragó ловить нельзя.' }
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
    delta:'Cala Delta Llucmajor', songranada:'Son Granada de Baix Llucmajor', clotsase:'Sa Ràpita aparcament',
    almunia:'Aparcament Caló des Moro Cala s\'Almunia', llombards:'Aparcament Cala Llombards',
    crab_muro:'Aparcament Pont dels Anglesos Platja de Muro', crab_fontanelles:'Ses Fontanelles Can Pastilla', crab_albufereta:'Platja de l\'Albufereta Pollença'
  };

  // ---------- Справочник рыб ----------
  // min: см (общ.), minRes: см в заповеднике, limit: шт/день, open: [мес_с, мес_по] когда МОЖНО (1–12), closed: [месяцы] когда нельзя
  const FISH = [
    { id:'dorada', ru:'Дорада', es:'Dorada', ca:'Orada', lat:'Sparus aurata', min:20, minRes:35, limit:2,
      tips:'Сёрфкастинг и донка с песка, ночь и рассвет. Наживка: краб из магазина, креветка, черви (покупные). Лучше осень–весна.' },
    { id:'lubina', ru:'Сибас (лаврак)', es:'Lubina', ca:'Llobarro', lat:'Dicentrarchus labrax', min:25, minRes:43, limit:1, pescarec:true,
      tips:'После шторма в мутной воде у пляжей и устьев. Воблеры 9–12 см, сёрфкастинг с сардиной. Окт–мар.' },
    { id:'sargo', ru:'Сарг', es:'Sargo', ca:'Sard', lat:'Diplodus sargus', min:23,
      tips:'Скалы, белая вода у камней. Поплавок или донка, креветка, мидия из магазина, хлеб с прикормкой.' },
    { id:'denton', ru:'Зубан', es:'Dentón', ca:'Déntol', lat:'Dentex dentex', min:35, limit:2, mark:true,
      tips:'Глубокие скалы, рассвет. Живец (если разрешён), воблеры, стикбейты. Пометить хвост сразу.' },
    { id:'mero', ru:'Групер (мероу)', es:'Mero', ca:'Anfós', lat:'Epinephelus marginatus', min:45, minRes:50, limit:1, mark:true,
      tips:'Редко с берега, глубокие камни. Почти всегда лучше отпустить.' },
    { id:'gitano', ru:'Гитано', es:'Gitano', ca:'Anfós bord', lat:'Mycteroperca rubra', min:45, minRes:53, limit:1, mark:true,
      tips:'Глубокие скалы. Пометить хвост.' },
    { id:'lampuga', ru:'Лампуга (корифена)', es:'Lampuga', ca:'Llampuga', lat:'Coryphaena hippurus', limit:5, open:[8,12], openFrom:'15.08', pescarec:true,
      tips:'Только 15 авг – 31 дек. Спиннинг с мысов: металл 20–30 г, попперы. Не ближе 250 м к сетям и плотам.' },
    { id:'raor', ru:'Раор (рыба-бритва)', es:'Raor', ca:'Raor', lat:'Xyrichtys novacula', limit:50, open:[9,3],
      tips:'1 сен – 31 мар. Песчаное дно 5–20 м, крошечный крючок №12–14, кусочки креветки. Обычно с лодки, с берега редко.' },
    { id:'calamar', ru:'Кальмар / каракатица', es:'Calamar / Sepia', ca:'Calamar / Sípia', lat:'Loligo vulgaris / Sepia officinalis', limit:10, perPiece:true,
      tips:'Эги 2.5–3.0 на закате и ночью, окт–фев. Подсветка для привлечения запрещена. Одна потера на снасть.' },
    { id:'pulpo', ru:'Осьминог', es:'Pulpo', ca:'Pop', lat:'Octopus vulgaris', limit:3, minKg:1, closed:[6,7],
      tips:'Только от 1 кг, до 3 шт. На Майорке запрет в июне и июле.' },
    { id:'erizo', ru:'Морской ёж', es:'Erizo de mar', ca:'Garota', lat:'Paracentrotus lividus', open:[11,3],
      tips:'1 ноя – 31 мар, глубже 10 м нельзя. Проверить квоту в таблице талий.' },
    { id:'cangrejo', ru:'Голубой краб', es:'Cangrejo azul', ca:'Cranc blau', lat:'Callinectes sapidus', limitKg:2, dayOnly:true,
      tips:'Инвазивный вид, ловить можно во всех водах, где разрешена рекреационная рыбалка. Только днём, сачком или острогой, до 2 кг в день. Ловушки и сети запрещены.' },
    { id:'oblada', ru:'Облада', es:'Oblada', ca:'Oblada', lat:'Oblada melanura', check:true,
      tips:'Поплавок с хлебом у поверхности, прикормка. Мин. размер — проверить в таблице талий.' },
    { id:'mabre', ru:'Мабре (херрера)', es:'Herrera', ca:'Mabre', lat:'Lithognathus mormyrus', check:true,
      tips:'Песок у берега, ночной сёрфкастинг, черви. Мин. размер — проверить.' },
    { id:'lecha', ru:'Лича (сериола)', es:'Serviola', ca:'Cirviola', lat:'Seriola dumerili', check:true,
      tips:'Глубокие мысы, живец, тяжёлые воблеры. Мин. размер — проверить.' },
    { id:'anjova', ru:'Луфарь', es:'Anjova', ca:'Anxova', lat:'Pomatomus saltatrix', check:true,
      tips:'Сен–ноя, стаи у мысов, металл и воблеры, нужен стальной поводок. Мин. размер — проверить.' }
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
  const DOW = ['вс','пн','вт','ср','чт','пт','сб'];

  // Можно ли ловить в эту дату/час в этой точке
  function legal(spot, date, tech, sun) {
    const r = RESERVES[spot.reserve] || RESERVES.none;
    if (spot.noFish) return { ok:false, why:'Не рыболовная точка' };
    if (r.days === null) return { ok:true, unsure:true, why:r.name+': правила не подтверждены' };
    const dow = date.getDay();
    if (!r.days.includes(dow) && !(r.holidays && isHoliday(date)))
      return { ok:false, why:r.name+': сегодня ('+DOW[dow]+') ловить нельзя. Можно: '+r.days.map(x=>DOW[x]).join(', ')+' и праздники' };
    if (tech==='crab' && sun && (date.getTime()<sun.sr || date.getTime()>sun.ss))
      return { ok:false, why:'Голубой краб: ловить только днём (от восхода до заката)' };
    if (spot.type==='beach' && tech!=='crab') {
      const m=date.getMonth()+1, h=date.getHours();
      if (m>=5 && m<=9 && h>=7 && h<22) return { ok:false, why:'Пляж: с 1 мая по 30 сентября нельзя с 7:00 до 22:00' };
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
    if (!f) return { verdict:'?', lines:['Вид не найден'] };
    const lines=[]; let keep=true; let unsure=false;
    const inRes = spot && spot.reserve!=='none';
    if (!fishOpen(f,date)) { keep=false; lines.push('Сейчас запретный сезон для этого вида.'); }
    const min = inRes && f.minRes ? f.minRes : f.min;
    if (min) {
      if (!lengthCm) { unsure=true; lines.push('Укажите длину: минимум '+min+' см'+(inRes&&f.minRes?' (в заповеднике)':'')+'.'); }
      else if (lengthCm < min) { keep=false; lines.push('Длина '+lengthCm+' см меньше минимума '+min+' см'+(inRes&&f.minRes?' (в заповеднике)':'')+'.'); }
      else lines.push('Длина в норме (минимум '+min+' см).');
    }
    if (f.minKg) {
      if (!weightKg) { unsure=true; lines.push('Укажите вес: минимум '+f.minKg+' кг.'); }
      else if (weightKg < f.minKg) { keep=false; lines.push('Вес меньше '+f.minKg+' кг.'); }
    }
    if (f.limit) {
      if (todayCount >= f.limit) { keep=false; lines.push('Дневной лимит '+f.limit+' шт уже набран ('+todayCount+').'); }
      else lines.push('Лимит '+f.limit+' шт в день, сегодня уже '+todayCount+'.');
    }
    if (inRes && spot.reserve==='palma') lines.push('Badia de Palma: из охраняемых видов — 1 рыба в день.');
    if (f.limitKg) lines.push('Лимит '+f.limitKg+' кг в день (не суммируется с рыбой).');
    if (f.dayOnly && (date.getHours()<7 || date.getHours()>=19)) lines.push('Сбор только днём — проверьте время заката.');
    if (f.check) { unsure=true; lines.push('Минимальный размер этого вида не внесён — проверьте таблицу талий.'); }
    if (keep && f.mark) lines.push('Сразу пометить: подрезать нижнюю лопасть хвоста.');
    if (f.pescarec) lines.push('Записать в приложение PescaREC (даже если отпустили).');
    lines.push('Общий лимит: 5 кг + 1 рыба в день.');
    return { verdict: keep ? (unsure?'check':'keep') : 'release', lines };
  }

  // ---------- Луна ----------
  function moonPhase(date) { // 0=новолуние, 0.5=полнолуние
    const syn = 29.530588853, ref = Date.UTC(2000,0,6,18,14);
    let p = ((date.getTime()-ref)/86400000) % syn; if (p<0) p+=syn;
    return p/syn;
  }
  function moonName(p) {
    if (p<0.03||p>0.97) return 'новолуние'; if (p<0.22) return 'растущий серп'; if (p<0.28) return 'первая четверть';
    if (p<0.47) return 'растущая'; if (p<0.53) return 'полнолуние'; if (p<0.72) return 'убывающая'; if (p<0.78) return 'последняя четверть'; return 'убывающий серп';
  }

  // ---------- Погода: разбор ответа Open-Meteo ----------
  // wx = { t:[iso], wind:[], gust:[], dir:[], press:[], cloud:[], rain:[], temp:[], wave:[], wper:[], sst:[], sunrise:[iso], sunset:[iso] }
  function angDiff(a,b){ let d=Math.abs(a-b)%360; return d>180?360-d:d; }

  function hourScore(spot, wx, i, tech) {
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
      if (!rock) { if (wave<0.3) s+=0; else if (wave<=1.0) s+=15; else if (wave<=1.5) s+=3; else if (wave<=2) { s-=20; r.tags.push('сильный прибой'); } else { s-=40; r.danger=true; } }
      else { if (wave<=1.0) s+=10; else if (wave<=1.5) s-=10; else { s-=40; r.danger=true; } }
    }
    // Ветер
    if (wind!=null) {
      if (wind<10) s+=5; else if (wind<=20) s+=5; else if (wind<=30) s-=10; else s-=25;
      const onshore = angDiff(dir, spot.face) < 60;   // ветер дует с моря на берег
      const offshore = angDiff(dir, spot.face) > 120;
      if (onshore && wind>=5 && wind<=20 && !rock) { s+=5; r.tags.push('лёгкий ветер с моря'); }
      if (onshore && wind>25 && rock) { s-=15; r.danger=true; }
      if (offshore && wind>25) { s-=5; r.tags.push('сильный отжим'); }
    }
    if (gust!=null && gust>45) { s-=15; if (rock) r.danger=true; r.tags.push('порывы '+Math.round(gust)+' км/ч'); }
    // Давление: тренд за 3 часа
    if (i>=3 && wx.press[i]!=null && wx.press[i-3]!=null) {
      const dp = wx.press[i]-wx.press[i-3];
      if (dp<=-0.5 && dp>=-2) { s+=8; r.tags.push('давление плавно падает'); }
      else if (Math.abs(dp)<0.5) s+=5;
      else if (dp>1.5) { s-=8; r.tags.push('давление резко растёт'); }
      else if (dp<-2) { s-=5; r.tags.push('давление резко падает'); }
    }
    // Время суток
    const t = date.getTime(), dayKey = wx.t[i].slice(0,10);
    const di = wx.days.indexOf(dayKey);
    if (di>=0) {
      const sr = new Date(wx.sunrise[di]).getTime(), ss = new Date(wx.sunset[di]).getTime();
      const near = Math.min(Math.abs(t-sr), Math.abs(t-ss))/3600000;
      if (near<=1.5) { s+=15; r.tags.push(Math.abs(t-sr)<Math.abs(t-ss)?'рассвет':'закат'); }
      const night = t<sr-3600000 || t>ss+3600000;
      if (night && (!rock || spot.depth!=='shallow')) s+=5;
      const m=date.getMonth()+1, h=date.getHours();
      if (!night && m>=5 && m<=9 && h>=11 && h<=17 && (wx.cloud[i]||0)<30) { s-=10; r.tags.push('жаркий полдень'); }
    }
    if ((wx.cloud[i]||0)>70) s+=3;
    if ((wx.rain[i]||0)>2) { s-=10; r.tags.push('ливень'); }
    // Мутность после шторма
    let maxW=0; for (let k=Math.max(0,i-24);k<i;k++) if (wx.wave[k]!=null) maxW=Math.max(maxW,wx.wave[k]);
    if (maxW>1.5 && wave!=null && wave<1.2) { if (!rock) { s+=8; r.tags.push('мутная вода: шанс на сибаса'); } else { s-=5; r.tags.push('мутная вода'); } }
    // Вода
    const sst = wx.sst[i];
    if (sst!=null) { if (sst<14) s-=5; else if (sst>=16 && sst<=24) s+=3; }
    // Луна
    const mp = moonPhase(date); if (mp<0.1||mp>0.9||Math.abs(mp-0.5)<0.1) s+=5;
    // Поправки под технику
    if (tech && sun) {
      const t2=date.getTime(), m2=date.getMonth()+1, dusk=Math.abs(t2-sun.ss)/3600000, dark=t2>sun.ss&&t2<sun.ss+3*3600000;
      if (tech==='squid') { if (dark||dusk<=1) { s+=10; r.tags.push('время кальмара'); } if (wave!=null&&wave>0.8) s-=10; if (!(m2>=10||m2<=2)) s-=10; }
      if (tech==='spin') { if (Math.abs(t2-sun.sr)/3600000<=1.5) s+=5; if (wind!=null && wind>25) s-=5; }
      if (tech==='rock') { if (wave!=null && wave>1.0) s-=10; }
      if (tech==='surf') { if (wave!=null && wave>=0.3 && wave<=1.0) s+=5; }
      if (tech==='crab') { s = 40 + (wave!=null && wave<0.5 ? 20 : 0) + ((wx.sst[i]||0)>=20 ? 20 : (wx.sst[i]||0)>=17 ? 10 : -10) + (wind!=null && wind<15 ? 10 : 0); r.tags=[]; if ((wx.sst[i]||0)>=20) r.tags.push('тёплая вода — краб активен'); }
    }
    if (L.unsure) r.tags.push('правила не подтверждены');
    r.score = Math.max(0, Math.min(100, Math.round(s)));
    return r;
  }

  // Лучшее окно (2 часа) на дату для точки
  function bestWindow(spot, wx, dayKey, fromMs, tech) {
    let best=null;
    for (let i=0;i<wx.t.length-1;i++) {
      if (wx.t[i].slice(0,10)!==dayKey) continue;
      if (fromMs && new Date(wx.t[i]).getTime() < fromMs - 3600000) continue;
      const a=hourScore(spot,wx,i,tech), b=hourScore(spot,wx,i+1,tech);
      if (!a.legal.ok || !b.legal.ok) continue;
      const avg=(a.score+b.score)/2;
      if (!best || avg>best.score) best={ score:Math.round(avg), i, tags:[...new Set([...a.tags,...b.tags])], danger:a.danger||b.danger, unsure:a.legal.unsure };
    }
    if (!best) {
      const i = wx.t.findIndex(x=>x.slice(0,10)===dayKey);
      const L = i>=0 ? legal(spot, new Date(wx.t[i].slice(0,10)+'T12:00')) : {ok:false, why:'Нет данных'};
      return { score:0, closed:true, why:(L.ok ? (fromMs ? 'Сегодня подходящих часов больше нет' : 'Весь день нельзя') : L.why) };
    }
    return best;
  }

  // Подсказка снасти и наживки
  function tackle(spot, date, seasonalOnly) {
    const m = date.getMonth()+1, out=[];
    if (spot.noFish) return ['Не место для рыбалки.'];
    if (seasonalOnly) {}
    else if (spot.type==='beach') {
      out.push('Сёрфкастинг 4–4,5 м, груз 80–150 г, поводок 0,25–0,30, крючок №4–6.');
      out.push('Наживка: покупные черви (корея, американа), креветка; ночью сардина.');
      if (m>=10||m<=3) out.push('После шторма в мутной воде — сибас на сардину или воблер 12 см.');
    } else if (spot.depth==='shallow') {
      out.push('Поплавок 1–3 г, леска 0,18–0,22, крючок №8–10.');
      out.push('Наживка: креветка, мидия из магазина, хлеб; прикормка с сардиной.');
    } else {
      out.push('Спиннинг 2,7–3 м, тест 10–40 г, шнур PE 1, флюр 0,30.');
      out.push('Приманки: воблеры 9–12 см, стикбейт, джиг 20–30 г.');
    }
    if (seasonalOnly && spot.type==='beach' && (m>=10||m<=3)) out.push('После шторма в мутной воде — сибас на сардину или воблер 12 см.');
    if (seasonalOnly && (spot.tech||[]).includes('crab') && m>=6 && m<=10) out.push('Голубой краб активен: днём, сачком, до 2 кг.');
    if (m>=10 || m<=2) out.push('Кальмар: эги 2.5–3.0 на закате и первые 2 часа темноты.');
    if ((m===8 && date.getDate()>=15) || (m>=9 && m<=12)) out.push('Лампуга: металл 20–30 г, поппер, с мысов утром.');
    if (m>=9 && m<=11 && spot.type==='rock') out.push('Луфарь: стальной поводок, металл, быстрая проводка.');
    if (spot.reserve!=='none') out.push('В заповеднике: 1 снасть, живая рыба на наживку обычно запрещена.');
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
        '&hourly=wave_height,wave_period,sea_surface_temperature&timezone=Europe%2FMadrid&past_days=1&forecast_days=3'
    };
  }

  SPOTS.forEach(sp => { sp.tech = SPOT_TECH[sp.id] || []; sp.parkQ = PARK_Q[sp.id] || ''; });

  root.FishCore = { RESERVES, SPOTS, FISH, TALLAS_URL, RULES_URL, legal, fishOpen, checkCatch, moonPhase, moonName,
    hourScore, bestWindow, tackle, TECH, parseWeather, weatherUrls, isHoliday, ymd, DOW, angDiff };
})(typeof self !== 'undefined' ? self : this);
