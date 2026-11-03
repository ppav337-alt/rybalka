/* Рыбалка Майорка — переводы (en, ro, es). Ключ — русский текст. */
(function (root) {
  var LANGS = { ru: 'ru-RU', en: 'en-GB', ro: 'ro-RO', es: 'es-ES' }, IDX = { en: 0, ro: 1, es: 2 };
  var lang = 'ru';
  try { lang = root.localStorage && root.localStorage.getItem('ryb_lang') || 'ru'; } catch (e) {}
  if (!LANGS[lang]) lang = 'ru';
  var D = {
"штиль":["calm", "calm", "calma"],
"слабая":["light", "slab", "débil"],
"умеренная":["moderate", "moderat", "moderada"],
"сильная":["strong", "puternic", "fuerte"],
"тёплая":["warm", "caldă", "cálida"],
"комфортная":["pleasant", "plăcută", "agradable"],
"прохладная":["cool", "răcoroasă", "fresca"],
"Вне заповедника": [
"Outside reserve",
"În afara rezervației",
"Fuera de reserva"
],
"Общие правила Балеар.": [
"General Balearic rules.",
"Reguli generale ale Balearelor.",
"Normas generales de Baleares."
],
"Заповедник Llevant / Cala Rajada": [
"Llevant / Cala Rajada reserve",
"Rezervația Llevant / Cala Rajada",
"Reserva Llevant / Cala Rajada"
],
"1 снасть на человека, до 6 крючков (у Cala Rajada до 4). Запретная зона Cap Ferrutx – Penya del Llamp.": [
"1 rod per person, up to 6 hooks (up to 4 near Cala Rajada). No-take zone Cap Ferrutx – Penya del Llamp.",
"1 lansetă de persoană, până la 6 cârlige (lângă Cala Rajada până la 4). Zonă interzisă Cap Ferrutx – Penya del Llamp.",
"1 aparejo por persona, hasta 6 anzuelos (en Cala Rajada hasta 4). Zona de veda Cap Ferrutx – Penya del Llamp."
],
"Заповедник Badia de Palma": [
"Badia de Palma reserve",
"Rezervația Badia de Palma",
"Reserva Badia de Palma"
],
"Удочка, спиннинг, 1 эги. По 1 рыбе в день из охраняемых видов. Зона особой охраны у Cap Enderrocat.": [
"Rod, spinning, 1 egi. 1 fish per day of protected species. Special protection zone at Cap Enderrocat.",
"Undiță, spinning, 1 egi. 1 pește pe zi din speciile protejate. Zonă de protecție specială la Cap Enderrocat.",
"Caña, spinning, 1 egi. 1 pez al día de especies protegidas. Zona de especial protección en Cap Enderrocat."
],
"Заповедник Migjorn": [
"Migjorn reserve",
"Rezervația Migjorn",
"Reserva Migjorn"
],
"Дни и снасти для ловли с берега не подтверждены. Уточнить: 971 176 100.": [
"Days and gear for shore fishing not confirmed. Check: 971 176 100.",
"Zilele și echipamentul pentru pescuit de pe mal nu sunt confirmate. Verificați: 971 176 100.",
"Días y aparejos para pesca desde costa sin confirmar. Consultar: 971 176 100."
],
"Заповедник Illes del Ponent (2025)": [
"Illes del Ponent reserve (2025)",
"Rezervația Illes del Ponent (2025)",
"Reserva Illes del Ponent (2025)"
],
"Новый заповедник, правила не проверены. Уточнить: 971 176 100.": [
"New reserve, rules not verified. Check: 971 176 100.",
"Rezervație nouă, reguli neverificate. Verificați: 971 176 100.",
"Reserva nueva, normas sin verificar. Consultar: 971 176 100."
],
"Север": [
"North",
"Nord",
"Norte"
],
"Дорада, мабре, сарг; сибас у устья окт–мар": [
"Gilthead bream, striped bream, white bream; sea bass at the river mouth Oct–Mar",
"Dorada, mabre, sargo; biban de mare la gura canalului oct–mar",
"Dorada, herrera, sargo; lubina en la desembocadura oct–mar"
],
"Сурф-кастинг, донка": [
"Surfcasting, bottom fishing",
"Surfcasting, pescuit la fund",
"Surfcasting, fondo"
],
"Улицы посёлка у пляжа": [
"Village streets by the beach",
"Străzile satului lângă plajă",
"Calles del pueblo junto a la playa"
],
"Мабре, дорада, сарг, облада": [
"Striped bream, gilthead bream, white bream, saddled bream",
"Mabre, dorada, sargo, oblada",
"Herrera, dorada, sargo, oblada"
],
"Ночной сурф-кастинг": [
"Night surfcasting",
"Surfcasting nocturn",
"Surfcasting nocturno"
],
"Набережная, зона Son Bauló": [
"Promenade, Son Bauló area",
"Faleza, zona Son Bauló",
"Paseo marítimo, zona Son Bauló"
],
"Облада, сарг, кальмар окт–янв": [
"Saddled bream, white bream, squid Oct–Jan",
"Oblada, sargo, calmar oct–ian",
"Oblada, sargo, calamar oct–ene"
],
"Поплавок, эги на закате": [
"Float, egi at sunset",
"Plută, egi la apus",
"Boya, egi al atardecer"
],
"У Platja d'Alcanada": [
"By Platja d'Alcanada",
"Lângă Platja d'Alcanada",
"Junto a Platja d'Alcanada"
],
"Северо-восток": [
"North-east",
"Nord-est",
"Noreste"
],
"Лампуга авг–дек, кальмар, сарг": [
"Dolphinfish Aug–Dec, squid, white bream",
"Lampuga aug–dec, calmar, sargo",
"Llampuga ago–dic, calamar, sargo"
],
"Лёгкий спиннинг, эги, поплавок": [
"Light spinning, egi, float",
"Spinning ușor, egi, plută",
"Spinning ligero, egi, boya"
],
"Конец дороги в Betlem": [
"End of the road in Betlem",
"Capătul drumului în Betlem",
"Final de la carretera en Betlem"
],
"Восточнее Cap Ferrutx — запретная зона заповедника.": [
"East of Cap Ferrutx is the reserve's no-take zone.",
"La est de Cap Ferrutx este zona interzisă a rezervației.",
"Al este de Cap Ferrutx está la zona de veda de la reserva."
],
"Юг": [
"South",
"Sud",
"Sur"
],
"Дорада, мабре, сибас в шторм": [
"Gilthead bream, striped bream, sea bass in storms",
"Dorada, mabre, biban de mare pe furtună",
"Dorada, herrera, lubina con temporal"
],
"Сурф-кастинг": [
"Surfcasting",
"Surfcasting",
"Surfcasting"
],
"Платные парковки Ses Covetes / Sa Ràpita": [
"Paid car parks Ses Covetes / Sa Ràpita",
"Parcări cu plată Ses Covetes / Sa Ràpita",
"Aparcamientos de pago Ses Covetes / Sa Ràpita"
],
"Сарг, луфарь сен–ноя, кальмар": [
"White bream, bluefish Sep–Nov, squid",
"Sargo, lufar sep–noi, calmar",
"Sargo, anjova sep–nov, calamar"
],
"Спиннинг, эги, поплавок": [
"Spinning, egi, float",
"Spinning, egi, plută",
"Spinning, egi, boya"
],
"Вдоль дороги Mal Pas": [
"Along the Mal Pas road",
"De-a lungul drumului Mal Pas",
"A lo largo de la carretera de Mal Pas"
],
"Восток": [
"East",
"Est",
"Este"
],
"Сарг, облада, кальмар, лампуга осенью": [
"White bream, saddled bream, squid, dolphinfish in autumn",
"Sargo, oblada, calmar, lampuga toamna",
"Sargo, oblada, calamar, llampuga en otoño"
],
"Поплавок, эги, спиннинг": [
"Float, egi, spinning",
"Plută, egi, spinning",
"Boya, egi, spinning"
],
"Въезд со стороны Sa Coma": [
"Entrance from Sa Coma",
"Intrare dinspre Sa Coma",
"Entrada desde Sa Coma"
],
"Portocolom – маяк": [
"Portocolom – lighthouse",
"Portocolom – farul",
"Portocolom – faro"
],
"Кальмар ноя–фев, сарг, дорада": [
"Squid Nov–Feb, white bream, gilthead bream",
"Calmar noi–feb, sargo, dorada",
"Calamar nov–feb, sargo, dorada"
],
"Эги, поплавок, донка": [
"Egi, float, bottom fishing",
"Egi, plută, pescuit la fund",
"Egi, boya, fondo"
],
"У маяка": [
"By the lighthouse",
"Lângă far",
"Junto al faro"
],
"Не с причалов порта.": [
"Not from the harbour piers.",
"Nu de pe cheiurile portului.",
"No desde los muelles del puerto."
],
"Сарг, кальмар, зубан": [
"White bream, squid, dentex",
"Sargo, calmar, dentex",
"Sargo, calamar, dentón"
],
"Спиннинг, эги": [
"Spinning, egi",
"Spinning, egi",
"Spinning, egi"
],
"В посёлке": [
"In the village",
"În sat",
"En el pueblo"
],
"Юг (Пальма)": [
"South (Palma)",
"Sud (Palma)",
"Sur (Palma)"
],
"Сарг, дорада (от 35 см), кальмар": [
"White bream, gilthead bream (from 35 cm), squid",
"Sargo, dorada (de la 35 cm), calmar",
"Sargo, dorada (desde 35 cm), calamar"
],
"Улицы Cala Blava": [
"Cala Blava streets",
"Străzile din Cala Blava",
"Calles de Cala Blava"
],
"Лича, зубан, луфарь, кальмар; сен–дек": [
"Amberjack, dentex, bluefish, squid; Sep–Dec",
"Seriola, dentex, lufar, calmar; sep–dec",
"Serviola, dentón, anjova, calamar; sep–dic"
],
"Спиннинг, тяжёлая донка": [
"Spinning, heavy bottom rig",
"Spinning, pescuit greu la fund",
"Spinning, fondo pesado"
],
"Запад": [
"West",
"Vest",
"Oeste"
],
"Кальмар ноя–фев, зубан, сарг, лича": [
"Squid Nov–Feb, dentex, white bream, amberjack",
"Calmar noi–feb, dentex, sargo, seriola",
"Calamar nov–feb, dentón, sargo, serviola"
],
"Эги, спиннинг, живец": [
"Egi, spinning, live bait",
"Egi, spinning, momeală vie",
"Egi, spinning, vivo"
],
"За Platja d'en Repic": [
"Past Platja d'en Repic",
"După Platja d'en Repic",
"Pasada Platja d'en Repic"
],
"Не в порту.": [
"Not in the harbour.",
"Nu în port.",
"No en el puerto."
],
"Лича, зубан, луфарь, кальмар": [
"Amberjack, dentex, bluefish, squid",
"Seriola, dentex, lufar, calmar",
"Serviola, dentón, anjova, calamar"
],
"Спиннинг, живец": [
"Spinning, live bait",
"Spinning, momeală vie",
"Spinning, vivo"
],
"Вдоль дороги Formentor": [
"Along the Formentor road",
"De-a lungul drumului Formentor",
"A lo largo de la carretera de Formentor"
],
"Летом дорога для частных авто обычно закрыта.": [
"In summer the road is usually closed to private cars.",
"Vara drumul e de obicei închis pentru mașini private.",
"En verano la carretera suele estar cerrada a coches privados."
],
"Raor сен–мар, сарг, дорада": [
"Razorfish Sep–Mar, white bream, gilthead bream",
"Raor sep–mar, sargo, dorada",
"Raor sep–mar, sargo, dorada"
],
"Ловля raor, донка": [
"Razorfish fishing, bottom fishing",
"Pescuit de raor, la fund",
"Pesca de raor, fondo"
],
"Юго-восток": [
"South-east",
"Sud-est",
"Sureste"
],
"Сарг, кальмар, луфарь": [
"White bream, squid, bluefish",
"Sargo, calmar, lufar",
"Sargo, calamar, anjova"
],
"Остров Dragonera с берега не облавливать.": [
"Do not fish Dragonera island from the shore.",
"Nu pescuiți pe insula Dragonera de pe mal.",
"No pescar en la isla Dragonera desde costa."
],
"Сарг, сибас": [
"White bream, sea bass",
"Sargo, biban de mare",
"Sargo, lubina"
],
"Донка, поплавок, спиннинг": [
"Bottom, float, spinning",
"Fund, plută, spinning",
"Fondo, boya, spinning"
],
"До посёлка на машине, дальше пешком": [
"Drive to the village, then walk",
"Cu mașina până în sat, apoi pe jos",
"En coche hasta el pueblo, luego a pie"
],
"Крутая дорога, мало мест": [
"Steep road, few spaces",
"Drum abrupt, puține locuri",
"Carretera empinada, pocas plazas"
],
"Сибас, сарг": [
"Sea bass, white bream",
"Biban de mare, sargo",
"Lubina, sargo"
],
"Спиннинг, донка": [
"Spinning, bottom",
"Spinning, fund",
"Spinning, fondo"
],
"Мало мест, неровный спуск": [
"Few spaces, rough path down",
"Puține locuri, coborâre accidentată",
"Pocas plazas, bajada irregular"
],
"Только днём, в тихую погоду.": [
"Daytime only, in calm weather.",
"Doar ziua, pe vreme calmă.",
"Solo de día, con mar en calma."
],
"Северо-запад": [
"North-west",
"Nord-vest",
"Noroeste"
],
"Донка, спиннинг": [
"Bottom, spinning",
"Fund, spinning",
"Fondo, spinning"
],
"Платная парковка наверху": [
"Paid parking at the top",
"Parcare cu plată sus",
"Aparcamiento de pago arriba"
],
"Летом толпы туристов.": [
"Crowds of tourists in summer.",
"Vara sunt mulți turiști.",
"En verano, multitud de turistas."
],
"Донка, поплавок": [
"Bottom, float",
"Fund, plută",
"Fondo, boya"
],
"С дороги Formentor пешком": [
"Walk from the Formentor road",
"Pe jos de pe drumul Formentor",
"A pie desde la carretera de Formentor"
],
"Летом дорога закрыта для частных авто.": [
"In summer the road is closed to private cars.",
"Vara drumul e închis pentru mașini private.",
"En verano la carretera está cerrada a coches privados."
],
"Сарг, сибас, дорада": [
"White bream, sea bass, gilthead bream",
"Sargo, biban de mare, dorada",
"Sargo, lubina, dorada"
],
"Пешком по скалам": [
"On foot over the rocks",
"Pe jos peste stânci",
"A pie por las rocas"
],
"Рядом зона особой охраны — проверить границу.": [
"Special protection zone nearby — check the boundary.",
"Zonă de protecție specială în apropiere — verificați limita.",
"Zona de especial protección cerca — comprobar el límite."
],
"Лёгкий спиннинг, донка": [
"Light spinning, bottom",
"Spinning ușor, fund",
"Spinning ligero, fondo"
],
"Дорада, сарг": [
"Gilthead bream, white bream",
"Dorada, sargo",
"Dorada, sargo"
],
"Донка, сурф-кастинг": [
"Bottom, surfcasting",
"Fund, surfcasting",
"Fondo, surfcasting"
],
"Пешком из Sa Ràpita": [
"Walk from Sa Ràpita",
"Pe jos din Sa Ràpita",
"A pie desde Sa Ràpita"
],
"Крутой спуск": [
"Steep descent",
"Coborâre abruptă",
"Bajada empinada"
],
"Сезонная, мало мест": [
"Seasonal, few spaces",
"Sezonieră, puține locuri",
"De temporada, pocas plazas"
],
"Es Pontàs (ориентир)": [
"Es Pontàs (landmark)",
"Es Pontàs (reper)",
"Es Pontàs (referencia)"
],
"Не место для рыбалки": [
"Not a fishing spot",
"Nu e loc de pescuit",
"No es lugar de pesca"
],
"Смотровая площадка": [
"Viewpoint",
"Punct de belvedere",
"Mirador"
],
"Смотровая на обрыве, не рыболовная точка.": [
"Clifftop viewpoint, not a fishing spot.",
"Belvedere pe faleză, nu e loc de pescuit.",
"Mirador en acantilado, no es punto de pesca."
],
"Mirador des Balconet (ориентир)": [
"Mirador des Balconet (landmark)",
"Mirador des Balconet (reper)",
"Mirador des Balconet (referencia)"
],
"Смотровая на обрыве. Координаты не известны — откройте поиск на карте.": [
"Clifftop viewpoint. Coordinates unknown — use map search.",
"Belvedere pe faleză. Coordonate necunoscute — căutați pe hartă.",
"Mirador en acantilado. Coordenadas desconocidas — busque en el mapa."
],
"Устье канала s'Albufera (Platja de Muro)": [
"s'Albufera canal mouth (Platja de Muro)",
"Gura canalului s'Albufera (Platja de Muro)",
"Desembocadura del canal de s'Albufera (Platja de Muro)"
],
"Голубой краб; сибас у устья": [
"Blue crab; sea bass at the mouth",
"Crab albastru; biban de mare la gură",
"Cangrejo azul; lubina en la desembocadura"
],
"Сачок днём; сурф ночью": [
"Landing net by day; surfcasting at night",
"Minciog ziua; surfcasting noaptea",
"Salabre de día; surfcasting de noche"
],
"Парковка у Pont dels Anglesos": [
"Parking at Pont dels Anglesos",
"Parcare la Pont dels Anglesos",
"Aparcamiento en Pont dels Anglesos"
],
"Только со стороны моря: внутри s'Oberta и парка s'Albufera ловить нельзя.": [
"Sea side only: no fishing inside s'Oberta and s'Albufera park.",
"Doar dinspre mare: în s'Oberta și în parcul s'Albufera pescuitul e interzis.",
"Solo por el lado del mar: prohibido pescar dentro de s'Oberta y del parque de s'Albufera."
],
"Голубой краб": [
"Blue crab",
"Crab albastru",
"Cangrejo azul"
],
"Сачок днём": [
"Landing net by day",
"Minciog ziua",
"Salabre de día"
],
"Улицы Can Pastilla": [
"Can Pastilla streets",
"Străzile din Can Pastilla",
"Calles de Can Pastilla"
],
"Место по сообщениям о находках краба, не проверено на месте.": [
"Spot based on reports of crab sightings, not checked on site.",
"Loc bazat pe semnalări de crabi, neverificat pe teren.",
"Lugar según avistamientos de cangrejo, sin comprobar in situ."
],
"Albufereta (Pollença) — со стороны моря": [
"Albufereta (Pollença) — sea side",
"Albufereta (Pollença) — dinspre mare",
"Albufereta (Pollença) — lado del mar"
],
"У пляжа Albufereta": [
"By Albufereta beach",
"Lângă plaja Albufereta",
"Junto a la playa de la Albufereta"
],
"Сама лагуна — природный резерват: ловить только на морском берегу.": [
"The lagoon itself is a nature reserve: fish only on the sea shore.",
"Laguna este rezervație naturală: pescuiți doar pe țărmul mării.",
"La laguna es reserva natural: pescar solo en la orilla del mar."
],
"Спиннинг": [
"Spinning",
"Spinning",
"Spinning"
],
"Спин": [
"Spin",
"Spin",
"Spin"
],
"Удилище 2,7–3,0 м, тест 10–40 г": [
"Rod 2.7–3.0 m, casting weight 10–40 g",
"Lansetă 2,7–3,0 m, greutate de aruncare 10–40 g",
"Caña 2,7–3,0 m, acción 10–40 g"
],
"Катушка 3000–4000, шнур PE 0,8–1,2": [
"Reel 3000–4000, PE braid 0.8–1.2",
"Mulinetă 3000–4000, fir textil PE 0,8–1,2",
"Carrete 3000–4000, trenzado PE 0,8–1,2"
],
"Поводок флюорокарбон 0,28–0,35 мм, 1–1,5 м (на луфаря — стальной)": [
"Fluorocarbon leader 0.28–0.35 mm, 1–1.5 m (steel for bluefish)",
"Strună fluorocarbon 0,28–0,35 mm, 1–1,5 m (oțel pentru lufar)",
"Bajo de fluorocarbono 0,28–0,35 mm, 1–1,5 m (acero para anjova)"
],
"Воблеры-минноу 9–12 см (утро, мутная вода)": [
"Minnow lures 9–12 cm (morning, murky water)",
"Voblere minnow 9–12 cm (dimineața, apă tulbure)",
"Minnows 9–12 cm (mañana, agua turbia)"
],
"Стикбейты и попперы 10–14 см (лампуга, луфарь, лича)": [
"Stickbaits and poppers 10–14 cm (dolphinfish, bluefish, amberjack)",
"Stickbait și popper 10–14 cm (lampuga, lufar, seriola)",
"Stickbaits y poppers 10–14 cm (llampuga, anjova, serviola)"
],
"Металл/кастмастер 20–40 г для дальнего заброса": [
"Metal jigs/casting spoons 20–40 g for long casts",
"Jiguri metalice 20–40 g pentru aruncări lungi",
"Metal/cucharilla 20–40 g para lances largos"
],
"Силикон 10–12 см на джиг-головке 10–20 г": [
"Soft plastics 10–12 cm on 10–20 g jig heads",
"Shad-uri 10–12 cm pe jig de 10–20 g",
"Vinilos 10–12 cm en cabeza plomada 10–20 g"
],
"Рассвет и первые 2 часа, закат. Лучше лёгкая рябь и ветер в берег.": [
"Dawn and the first 2 hours, dusk. Best with a light chop and onshore wind.",
"Zorii și primele 2 ore, apusul. Mai bine cu valuri mici și vânt spre mal.",
"Amanecer y las 2 primeras horas, atardecer. Mejor con algo de rizo y viento hacia la costa."
],
"Лампуга 15 авг – 31 дек, луфарь сен–ноя, сибас окт–мар, лича лето–осень.": [
"Dolphinfish 15 Aug – 31 Dec, bluefish Sep–Nov, sea bass Oct–Mar, amberjack summer–autumn.",
"Lampuga 15 aug – 31 dec, lufar sep–noi, biban oct–mar, seriola vara–toamna.",
"Llampuga 15 ago – 31 dic, anjova sep–nov, lubina oct–mar, serviola verano–otoño."
],
"В заповедниках — 1 снасть на человека; живец обычно запрещён.": [
"In reserves: 1 rod per person; live bait is usually banned.",
"În rezervații: 1 lansetă de persoană; momeala vie e de obicei interzisă.",
"En reservas: 1 aparejo por persona; el vivo suele estar prohibido."
],
"Рокфишинг": [
"Rockfishing",
"Rockfishing",
"Rockfishing"
],
"Рок": [
"Rock",
"Rock",
"Rock"
],
"Лёгкий спиннинг 2,1–2,4 м, тест 1–10 г (LRF) или 5–25 г": [
"Light spinning rod 2.1–2.4 m, 1–10 g (LRF) or 5–25 g",
"Lansetă ușoară 2,1–2,4 m, 1–10 g (LRF) sau 5–25 g",
"Caña ligera 2,1–2,4 m, 1–10 g (LRF) o 5–25 g"
],
"Катушка 1000–2500, шнур PE 0,4–0,6": [
"Reel 1000–2500, PE braid 0.4–0.6",
"Mulinetă 1000–2500, fir textil PE 0,4–0,6",
"Carrete 1000–2500, trenzado PE 0,4–0,6"
],
"Поводок флюр 0,18–0,25 мм": [
"Fluoro leader 0.18–0.25 mm",
"Strună fluoro 0,18–0,25 mm",
"Bajo de fluoro 0,18–0,25 mm"
],
"Силикон 2–3\" на джиг-головке 3–7 г (сарг, скорпена, морской окунь)": [
"2–3\" soft plastics on 3–7 g jig heads (white bream, scorpionfish, comber)",
"Shad-uri 2–3\" pe jig de 3–7 g (sargo, scorpie, biban de stâncă)",
"Vinilos 2–3\" en cabeza plomada 3–7 g (sargo, cabracho, serrano)"
],
"Микроколебалки и микровоблеры 3–5 см": [
"Micro spoons and micro crankbaits 3–5 cm",
"Micro linguri și micro voblere 3–5 cm",
"Microcucharillas y micropeces 3–5 cm"
],
"Техника «дроп-шот» и «техас» между камнями": [
"Drop-shot and Texas rigs between rocks",
"Montură drop-shot și texas printre pietre",
"Montajes drop-shot y texas entre piedras"
],
"Без спиннинга: поплавок 1–3 г, креветка или мидия из магазина": [
"Without spinning: 1–3 g float, prawn or mussel from the shop",
"Fără spinning: plută 1–3 g, crevete sau midie din magazin",
"Sin spinning: boya 1–3 g, gamba o mejillón de tienda"
],
"Утро и вечер, пасмурно. Ловить вдоль стенки и в белой воде у камней.": [
"Morning and evening, overcast. Fish along the wall and in white water by the rocks.",
"Dimineața și seara, înnorat. Pescuiți de-a lungul peretelui și în spuma de lângă pietre.",
"Mañana y tarde, nublado. Pescar junto a la pared y en el agua blanca entre piedras."
],
"Круглый год; сарг лучше осень–весна.": [
"All year; white bream best autumn–spring.",
"Tot anul; sargo mai bine toamna–primăvara.",
"Todo el año; sargo mejor otoño–primavera."
],
"Минимальные размеры сарга 23 см, дорады 20 см (35 см в заповеднике).": [
"Minimum sizes: white bream 23 cm, gilthead bream 20 cm (35 cm in the reserve).",
"Dimensiuni minime: sargo 23 cm, dorada 20 cm (35 cm în rezervație).",
"Tallas mínimas: sargo 23 cm, dorada 20 cm (35 cm en la reserva)."
],
"Сурф": [
"Surf",
"Surf",
"Surf"
],
"Удилище 4,2–4,5 м, тест 100–200 г, 2 удилища максимум": [
"Rod 4.2–4.5 m, 100–200 g, 2 rods maximum",
"Lansetă 4,2–4,5 m, 100–200 g, maximum 2 lansete",
"Caña 4,2–4,5 m, 100–200 g, máximo 2 cañas"
],
"Катушка 6000–8000 с длинной шпулей, леска 0,25–0,30 или шнур + шок-лидер 0,50": [
"Reel 6000–8000 with long spool, 0.25–0.30 mono or braid + 0.50 shock leader",
"Mulinetă 6000–8000 cu tambur lung, fir 0,25–0,30 sau textil + shock leader 0,50",
"Carrete 6000–8000 de bobina larga, nailon 0,25–0,30 o trenzado + puente 0,50"
],
"Груз 80–150 г (пирамида или с якорями при течении)": [
"Sinker 80–150 g (pyramid, or grip lead in current)",
"Plumb 80–150 g (piramidă sau cu ancore la curent)",
"Plomo 80–150 g (pirámide o de garras con corriente)"
],
"Монтаж «падаюший» или 2 поводка, крючок №2–6": [
"Running rig or 2 snoods, hook #2–6",
"Montură culisantă sau 2 struni, cârlig nr. 2–6",
"Montaje corredizo o 2 bajos, anzuelo n.º 2–6"
],
"Наживка: покупные черви (корея, американа, тита), креветка, сардина, кальмар": [
"Bait: shop-bought worms (korean, americana, tita), prawn, sardine, squid",
"Momeală: viermi din magazin (coreeană, americana, tita), crevete, sardină, calmar",
"Cebo: gusanos de tienda (coreana, americana, tita), gamba, sardina, calamar"
],
"Ночью и после шторма — сардина/кальмар на сибаса и дораду": [
"At night and after a storm — sardine/squid for sea bass and gilthead bream",
"Noaptea și după furtună — sardină/calmar pentru biban și dorada",
"De noche y tras temporal — sardina/calamar para lubina y dorada"
],
"Ночь, рассвет, мутная вода после шторма, волна 0,3–1,0 м.": [
"Night, dawn, murky water after a storm, waves 0.3–1.0 m.",
"Noaptea, zorii, apă tulbure după furtună, val 0,3–1,0 m.",
"Noche, amanecer, agua turbia tras temporal, ola 0,3–1,0 m."
],
"Лучше всего октябрь–апрель. Летом пляжи открыты только с 22:00 до 7:00.": [
"Best October–April. In summer beaches are open only 22:00–7:00.",
"Cel mai bine octombrie–aprilie. Vara plajele sunt deschise doar între 22:00 și 7:00.",
"Mejor de octubre a abril. En verano las playas solo de 22:00 a 7:00."
],
"Пляж 1 мая – 30 сен: нельзя с 7:00 до 22:00, не ближе 100 м к купающимся.": [
"Beach 1 May – 30 Sep: not from 7:00 to 22:00, no closer than 100 m to swimmers.",
"Plajă 1 mai – 30 sep: interzis între 7:00 și 22:00, nu mai aproape de 100 m de înotători.",
"Playa 1 may – 30 sep: prohibido de 7:00 a 22:00, no a menos de 100 m de bañistas."
],
"Кальмар (эгинг)": [
"Squid (eging)",
"Calmar (eging)",
"Calamar (eging)"
],
"Кальмар": [
"Squid",
"Calmar",
"Calamar"
],
"Удилище для эгинга 2,4–2,6 м, тест под эги 2.5–3.5": [
"Eging rod 2.4–2.6 m, for egi size 2.5–3.5",
"Lansetă de eging 2,4–2,6 m, pentru egi 2.5–3.5",
"Caña de eging 2,4–2,6 m, para egi 2.5–3.5"
],
"Катушка 2500–3000, шнур PE 0,6–0,8": [
"Reel 2500–3000, PE braid 0.6–0.8",
"Mulinetă 2500–3000, fir textil PE 0,6–0,8",
"Carrete 2500–3000, trenzado PE 0,6–0,8"
],
"Поводок флюр 0,22–0,28 мм, 1,5–2 м": [
"Fluoro leader 0.22–0.28 mm, 1.5–2 m",
"Strună fluoro 0,22–0,28 mm, 1,5–2 m",
"Bajo de fluoro 0,22–0,28 mm, 1,5–2 m"
],
"Эги 2.5 (мелко, спокойно), 3.0 (стандарт), 3.5 (глубина/ветер)": [
"Egi 2.5 (shallow, calm), 3.0 (standard), 3.5 (deep/wind)",
"Egi 2.5 (apă mică, calm), 3.0 (standard), 3.5 (adânc/vânt)",
"Egi 2.5 (poco fondo, calma), 3.0 (estándar), 3.5 (fondo/viento)"
],
"Цвета: днём натуральные, на закате оранжевый/розовый, ночью светящиеся": [
"Colours: natural by day, orange/pink at sunset, glow at night",
"Culori: ziua naturale, la apus portocaliu/roz, noaptea fosforescente",
"Colores: de día naturales, al atardecer naranja/rosa, de noche luminiscentes"
],
"Проводка: 2–3 рывка вверх и пауза 5–10 с — поклёвка на паузе": [
"Retrieve: 2–3 jerks upward and a 5–10 s pause — the take comes on the pause",
"Recuperare: 2–3 smucituri în sus și pauză 5–10 s — trage în pauză",
"Recogida: 2–3 tirones hacia arriba y pausa de 5–10 s — la picada llega en la pausa"
],
"Закат и первые 2–3 часа темноты, тихая прозрачная вода, волна до 0,8 м.": [
"Sunset and the first 2–3 hours of darkness, calm clear water, waves up to 0.8 m.",
"Apusul și primele 2–3 ore de întuneric, apă calmă și limpede, val până la 0,8 m.",
"Atardecer y las 2–3 primeras horas de noche, agua tranquila y clara, ola hasta 0,8 m."
],
"Октябрь – февраль (пик ноябрь–январь). Каракатица — весна.": [
"October – February (peak November–January). Cuttlefish — spring.",
"Octombrie – februarie (vârf noiembrie–ianuarie). Sepia — primăvara.",
"Octubre – febrero (pico noviembre–enero). Sepia — primavera."
],
"До 10 кальмаров/каракатиц в день, 1 эги на снасть. Фонарь для привлечения запрещён.": [
"Up to 10 squid/cuttlefish per day, 1 egi per rod. Lights to attract are banned.",
"Până la 10 calmari/sepii pe zi, 1 egi pe lansetă. Lumina pentru atragere e interzisă.",
"Hasta 10 calamares/sepias al día, 1 egi por caña. Prohibida la luz para atraer."
],
"Краб": [
"Crab",
"Crab",
"Cangrejo"
],
"Разрешено: сачок (salabre) и острога (fisga), ловля с берега пешком или в апноэ": [
"Allowed: landing net (salabre) and spear (fisga), on foot from shore or freediving",
"Permis: minciog (salabre) și ostie (fisga), de pe mal pe jos sau în apnee",
"Permitido: salabre y fisga, desde costa a pie o en apnea"
],
"Запрещено: ловушки, верши (nasas), сети": [
"Banned: traps, pots (nasas), nets",
"Interzis: capcane, vârșe (nasas), plase",
"Prohibido: trampas, nasas, redes"
],
"Подманить: рыбьи головы, курица, сардина у кромки воды — брать сачком": [
"Lure them: fish heads, chicken, sardine at the water's edge — scoop with the net",
"Momeală: capete de pește, pui, sardină la marginea apei — prindeți cu minciogul",
"Atraer: cabezas de pescado, pollo, sardina en la orilla — coger con salabre"
],
"Ищите в солоноватой воде: устья торрентов и каналов, лагуны у моря, тихие бухты": [
"Look in brackish water: torrent and canal mouths, lagoons by the sea, quiet coves",
"Căutați în apă salmastră: gurile torentelor și canalelor, lagune lângă mare, golfuri liniștite",
"Buscar en agua salobre: desembocaduras de torrentes y canales, lagunas junto al mar, calas tranquilas"
],
"Только днём: сбор морепродуктов запрещён от заката до восхода. Лучше тёплые месяцы.": [
"Daytime only: shellfish gathering is banned from sunset to sunrise. Warm months are best.",
"Doar ziua: colectarea fructelor de mare e interzisă de la apus la răsărit. Mai bine în lunile calde.",
"Solo de día: prohibido marisquear de la puesta a la salida del sol. Mejor en meses cálidos."
],
"Июнь – октябрь, когда вода тёплая; зимой краб малоактивен.": [
"June – October, when the water is warm; in winter the crab is inactive.",
"Iunie – octombrie, când apa e caldă; iarna crabul e puțin activ.",
"Junio – octubre, con agua cálida; en invierno el cangrejo está poco activo."
],
"Лицензия обязательна. До 2 кг в день, не суммируется с рыбой. Продажа запрещена. Внутри s'Oberta (s'Albufera) и в парке Mondragó ловить нельзя.": [
"Licence required. Up to 2 kg per day, not combined with fish. Sale banned. No fishing inside s'Oberta (s'Albufera) or Mondragó park.",
"Licența e obligatorie. Până la 2 kg pe zi, nu se cumulează cu peștele. Vânzarea interzisă. În s'Oberta (s'Albufera) și parcul Mondragó pescuitul e interzis.",
"Licencia obligatoria. Hasta 2 kg al día, no acumulable con pescado. Prohibida la venta. Prohibido dentro de s'Oberta (s'Albufera) y del parque de Mondragó."
],
"Дорада": [
"Gilthead bream",
"Dorada",
"Dorada"
],
"Сурф-кастинг и донка с песка, ночь и рассвет. Наживка: краб из магазина, креветка, черви (покупные). Лучше осень–весна.": [
"Surfcasting and bottom fishing from sand, night and dawn. Bait: shop crab, prawn, worms (shop-bought). Best autumn–spring.",
"Surfcasting și pescuit la fund de pe nisip, noaptea și în zori. Momeală: crab din magazin, crevete, viermi (din magazin). Mai bine toamna–primăvara.",
"Surfcasting y fondo desde arena, noche y amanecer. Cebo: cangrejo de tienda, gamba, gusanos (de tienda). Mejor otoño–primavera."
],
"Сибас (лаврак)": [
"Sea bass",
"Biban de mare (lavrac)",
"Lubina"
],
"После шторма в мутной воде у пляжей и устьев. Воблеры 9–12 см, сурф-кастинг с сардиной. Окт–мар.": [
"After a storm in murky water by beaches and river mouths. Lures 9–12 cm, surfcasting with sardine. Oct–Mar.",
"După furtună în apă tulbure la plaje și guri de râu. Voblere 9–12 cm, surfcasting cu sardină. Oct–mar.",
"Tras temporal en agua turbia junto a playas y desembocaduras. Señuelos 9–12 cm, surfcasting con sardina. Oct–mar."
],
"Сарг": [
"White bream",
"Sargo",
"Sargo"
],
"Скалы, белая вода у камней. Поплавок или донка, креветка, мидия из магазина, хлеб с прикормкой.": [
"Rocks, white water by the stones. Float or bottom, prawn, shop mussel, bread with groundbait.",
"Stânci, spumă lângă pietre. Plută sau fund, crevete, midie din magazin, pâine cu nadă.",
"Rocas, agua blanca entre piedras. Boya o fondo, gamba, mejillón de tienda, pan con engodo."
],
"Зубан": [
"Dentex",
"Dentex",
"Dentón"
],
"Глубокие скалы, рассвет. Живец (если разрешён), воблеры, стикбейты. Пометить хвост сразу.": [
"Deep rocks, dawn. Live bait (if allowed), lures, stickbaits. Mark the tail immediately.",
"Stânci adânci, zori. Momeală vie (dacă e permisă), voblere, stickbait. Marcați coada imediat.",
"Rocas profundas, amanecer. Vivo (si está permitido), señuelos, stickbaits. Marcar la cola enseguida."
],
"Групер (мероу)": [
"Dusky grouper",
"Mero (cernă)",
"Mero"
],
"Редко с берега, глубокие камни. Почти всегда лучше отпустить.": [
"Rare from shore, deep rocks. Almost always better to release.",
"Rar de pe mal, pietre adânci. Aproape întotdeauna mai bine eliberat.",
"Raro desde costa, piedras profundas. Casi siempre mejor soltarlo."
],
"Гитано": [
"Mottled grouper (gitano)",
"Gitano",
"Gitano"
],
"Глубокие скалы. Пометить хвост.": [
"Deep rocks. Mark the tail.",
"Stânci adânci. Marcați coada.",
"Rocas profundas. Marcar la cola."
],
"Лампуга (корифена)": [
"Dolphinfish (mahi-mahi)",
"Lampuga (mahi-mahi)",
"Llampuga (dorado)"
],
"Только 15 авг – 31 дек. Спиннинг с мысов: металл 20–30 г, попперы. Не ближе 250 м к сетям и плотам.": [
"Only 15 Aug – 31 Dec. Spinning from headlands: 20–30 g metal, poppers. No closer than 250 m to nets and FADs.",
"Doar 15 aug – 31 dec. Spinning de pe capuri: metal 20–30 g, poppere. Nu mai aproape de 250 m de plase și plute.",
"Solo 15 ago – 31 dic. Spinning desde cabos: metal 20–30 g, poppers. No a menos de 250 m de redes y plantados."
],
"Раор (рыба-бритва)": [
"Pearly razorfish (raor)",
"Raor (pește-brici)",
"Raor"
],
"1 сен – 31 мар. Песчаное дно 5–20 м, крошечный крючок №12–14, кусочки креветки. Обычно с лодки, с берега редко.": [
"1 Sep – 31 Mar. Sandy bottom 5–20 m, tiny hook #12–14, bits of prawn. Usually from a boat, rarely from shore.",
"1 sep – 31 mar. Fund nisipos 5–20 m, cârlig mic nr. 12–14, bucăți de crevete. De obicei din barcă, rar de pe mal.",
"1 sep – 31 mar. Fondo de arena 5–20 m, anzuelo diminuto n.º 12–14, trocitos de gamba. Normalmente desde barca, rara vez desde costa."
],
"Кальмар / каракатица": [
"Squid / cuttlefish",
"Calmar / sepie",
"Calamar / sepia"
],
"Эги 2.5–3.0 на закате и ночью, окт–фев. Подсветка для привлечения запрещена. Одна потера на снасть.": [
"Egi 2.5–3.0 at sunset and night, Oct–Feb. Lights to attract are banned. One jig per rod.",
"Egi 2.5–3.0 la apus și noaptea, oct–feb. Lumina pentru atragere e interzisă. O poteră pe lansetă.",
"Egi 2.5–3.0 al atardecer y de noche, oct–feb. Prohibida la luz para atraer. Una potera por caña."
],
"Осьминог": [
"Octopus",
"Caracatiță",
"Pulpo"
],
"Только от 1 кг, до 3 шт. На Майорке запрет в июне и июле.": [
"Only from 1 kg, up to 3. Banned in June and July on Mallorca.",
"Doar de la 1 kg, până la 3 buc. În Mallorca interzis în iunie și iulie.",
"Solo desde 1 kg, hasta 3. En Mallorca veda en junio y julio."
],
"Морской ёж": [
"Sea urchin",
"Arici de mare",
"Erizo de mar"
],
"1 ноя – 31 мар, глубже 10 м нельзя. Проверить квоту в таблице талий.": [
"1 Nov – 31 Mar, not deeper than 10 m. Check the quota in the size table.",
"1 noi – 31 mar, nu mai adânc de 10 m. Verificați cota în tabelul de dimensiuni.",
"1 nov – 31 mar, no a más de 10 m. Comprobar el cupo en la tabla de tallas."
],
"Инвазивный вид, ловить можно во всех водах, где разрешена рекреационная рыбалка. Только днём, сачком или острогой, до 2 кг в день. Ловушки и сети запрещены.": [
"Invasive species, may be caught in all waters where recreational fishing is allowed. Daytime only, with a landing net or spear, up to 2 kg per day. Traps and nets banned.",
"Specie invazivă, se poate prinde în toate apele unde pescuitul recreativ e permis. Doar ziua, cu minciog sau ostie, până la 2 kg pe zi. Capcanele și plasele sunt interzise.",
"Especie invasora, se puede capturar en todas las aguas donde se permite la pesca recreativa. Solo de día, con salabre o fisga, hasta 2 kg al día. Prohibidas trampas y redes."
],
"Облада": [
"Saddled bream",
"Oblada",
"Oblada"
],
"Поплавок с хлебом у поверхности, прикормка. Мин. размер — проверить в таблице талий.": [
"Float with bread near the surface, groundbait. Min. size — check the size table.",
"Plută cu pâine la suprafață, nadă. Dimensiunea minimă — verificați tabelul.",
"Boya con pan en superficie, engodo. Talla mínima — comprobar en la tabla de tallas."
],
"Мабре (херрера)": [
"Striped bream (herrera)",
"Mabre (herrera)",
"Herrera (mabre)"
],
"Песок у берега, ночной сурф-кастинг, черви. Мин. размер — проверить.": [
"Sand near the shore, night surfcasting, worms. Min. size — check.",
"Nisip lângă mal, surfcasting nocturn, viermi. Dimensiunea minimă — verificați.",
"Arena junto a la orilla, surfcasting nocturno, gusanos. Talla mínima — comprobar."
],
"Лича (сериола)": [
"Amberjack (serviola)",
"Seriola",
"Serviola (cirviola)"
],
"Глубокие мысы, живец, тяжёлые воблеры. Мин. размер — проверить.": [
"Deep headlands, live bait, heavy lures. Min. size — check.",
"Capuri adânci, momeală vie, voblere grele. Dimensiunea minimă — verificați.",
"Cabos profundos, vivo, señuelos pesados. Talla mínima — comprobar."
],
"Луфарь": [
"Bluefish",
"Lufar",
"Anjova"
],
"Сен–ноя, стаи у мысов, металл и воблеры, нужен стальной поводок. Мин. размер — проверить.": [
"Sep–Nov, schools at headlands, metal and lures, steel leader needed. Min. size — check.",
"Sep–noi, bancuri la capuri, metal și voblere, e nevoie de strună de oțel. Dimensiunea minimă — verificați.",
"Sep–nov, bancos en los cabos, metal y señuelos, hace falta bajo de acero. Talla mínima — comprobar."
],
"вс": [
"Sun",
"Du",
"dom"
],
"пн": [
"Mon",
"Lu",
"lun"
],
"вт": [
"Tue",
"Ma",
"mar"
],
"ср": [
"Wed",
"Mi",
"mié"
],
"чт": [
"Thu",
"Jo",
"jue"
],
"пт": [
"Fri",
"Vi",
"vie"
],
"сб": [
"Sat",
"Sâ",
"sáb"
],
"Не рыболовная точка": [
"Not a fishing spot",
"Nu e loc de pescuit",
"No es punto de pesca"
],
": правила не подтверждены": [
": rules not confirmed",
": reguli neconfirmate",
": normas sin confirmar"
],
": сегодня (": [
": today (",
": azi (",
": hoy ("
],
") ловить нельзя. Можно: ": [
") fishing not allowed. Allowed: ",
") pescuitul e interzis. Permis: ",
") no se puede pescar. Permitido: "
],
" и праздники": [
" and holidays",
" și sărbătorile",
" y festivos"
],
"Голубой краб: ловить только днём (от восхода до заката)": [
"Blue crab: daytime only (sunrise to sunset)",
"Crab albastru: doar ziua (de la răsărit la apus)",
"Cangrejo azul: solo de día (de la salida a la puesta del sol)"
],
"Пляж: с 1 мая по 30 сентября нельзя с 7:00 до 22:00": [
"Beach: 1 May – 30 September not allowed from 7:00 to 22:00",
"Plajă: 1 mai – 30 septembrie interzis între 7:00 și 22:00",
"Playa: del 1 de mayo al 30 de septiembre prohibido de 7:00 a 22:00"
],
"Вид не найден": [
"Species not found",
"Specie negăsită",
"Especie no encontrada"
],
"Сейчас запретный сезон для этого вида.": [
"Closed season for this species now.",
"Acum e perioadă de prohibiție pentru această specie.",
"Ahora es época de veda para esta especie."
],
"Укажите длину: минимум ": [
"Enter the length: minimum ",
"Introduceți lungimea: minimum ",
"Indique la longitud: mínimo "
],
" см": [
" cm",
" cm",
" cm"
],
" (в заповеднике)": [
" (in the reserve)",
" (în rezervație)",
" (en la reserva)"
],
"Длина ": [
"Length ",
"Lungimea ",
"Longitud "
],
" см меньше минимума ": [
" cm is below the minimum ",
" cm e sub minimul de ",
" cm es menor que el mínimo "
],
"Длина в норме (минимум ": [
"Length OK (minimum ",
"Lungime în regulă (minimum ",
"Longitud correcta (mínimo "
],
" см).": [
" cm).",
" cm).",
" cm)."
],
"Укажите вес: минимум ": [
"Enter the weight: minimum ",
"Introduceți greutatea: minimum ",
"Indique el peso: mínimo "
],
" кг.": [
" kg.",
" kg.",
" kg."
],
"Вес меньше ": [
"Weight below ",
"Greutate sub ",
"Peso menor de "
],
"Дневной лимит ": [
"Daily limit ",
"Limita zilnică ",
"Límite diario "
],
" шт уже набран (": [
" already reached (",
" buc. deja atinsă (",
" ya alcanzado ("
],
"Лимит ": [
"Limit ",
"Limita ",
"Límite "
],
" шт в день, сегодня уже ": [
" per day, already today ",
" buc. pe zi, azi deja ",
" al día, hoy ya "
],
"Badia de Palma: из охраняемых видов — 1 рыба в день.": [
"Badia de Palma: 1 fish per day of protected species.",
"Badia de Palma: 1 pește pe zi din speciile protejate.",
"Badia de Palma: 1 pez al día de especies protegidas."
],
" кг в день (не суммируется с рыбой).": [
" kg per day (not combined with fish).",
" kg pe zi (nu se cumulează cu peștele).",
" kg al día (no acumulable con pescado)."
],
"Сбор только днём — проверьте время заката.": [
"Daytime gathering only — check the sunset time.",
"Colectare doar ziua — verificați ora apusului.",
"Solo de día — compruebe la hora de la puesta de sol."
],
"Минимальный размер этого вида не внесён — проверьте таблицу талий.": [
"Minimum size for this species not entered — check the size table.",
"Dimensiunea minimă a acestei specii nu e introdusă — verificați tabelul.",
"Talla mínima de esta especie sin datos — compruebe la tabla de tallas."
],
"Сразу пометить: подрезать нижнюю лопасть хвоста.": [
"Mark immediately: clip the lower lobe of the tail.",
"Marcați imediat: tăiați lobul inferior al cozii.",
"Marcar enseguida: cortar el lóbulo inferior de la cola."
],
"Записать в приложение PescaREC (даже если отпустили).": [
"Log it in the PescaREC app (even if released).",
"Înregistrați în aplicația PescaREC (chiar dacă l-ați eliberat).",
"Registrar en la app PescaREC (aunque se suelte)."
],
"Общий лимит: 5 кг + 1 рыба в день.": [
"Overall limit: 5 kg + 1 fish per day.",
"Limită generală: 5 kg + 1 pește pe zi.",
"Límite general: 5 kg + 1 pieza al día."
],
"новолуние": [
"new moon",
"lună nouă",
"luna nueva"
],
"растущий серп": [
"waxing crescent",
"semilună crescătoare",
"creciente"
],
"первая четверть": [
"first quarter",
"primul pătrar",
"cuarto creciente"
],
"растущая": [
"waxing gibbous",
"lună crescătoare",
"gibosa creciente"
],
"полнолуние": [
"full moon",
"lună plină",
"luna llena"
],
"убывающая": [
"waning gibbous",
"lună descrescătoare",
"gibosa menguante"
],
"последняя четверть": [
"last quarter",
"ultimul pătrar",
"cuarto menguante"
],
"убывающий серп": [
"waning crescent",
"semilună descrescătoare",
"menguante"
],
"сильный прибой": [
"heavy surf",
"valuri puternice",
"fuerte oleaje"
],
"лёгкий ветер с моря": [
"light onshore wind",
"vânt ușor dinspre mare",
"viento suave del mar"
],
"сильный отжим": [
"strong offshore wind",
"vânt puternic dinspre uscat",
"fuerte terral"
],
"порывы ": [
"gusts ",
"rafale ",
"rachas "
],
" км/ч": [
" km/h",
" km/h",
" km/h"
],
"давление плавно падает": [
"pressure falling gently",
"presiunea scade lent",
"presión bajando suave"
],
"давление резко растёт": [
"pressure rising fast",
"presiunea crește brusc",
"presión subiendo rápido"
],
"давление резко падает": [
"pressure falling fast",
"presiunea scade brusc",
"presión bajando rápido"
],
"рассвет": [
"dawn",
"zori",
"amanecer"
],
"закат": [
"dusk",
"apus",
"atardecer"
],
"жаркий полдень": [
"hot midday",
"amiază caniculară",
"mediodía caluroso"
],
"ливень": [
"downpour",
"ploaie torențială",
"chubasco"
],
"мутная вода: шанс на сибаса": [
"murky water: sea bass chance",
"apă tulbure: șansă la biban",
"agua turbia: opción de lubina"
],
"мутная вода": [
"murky water",
"apă tulbure",
"agua turbia"
],
"время кальмара": [
"squid time",
"ora calmarului",
"hora del calamar"
],
"тёплая вода — краб активен": [
"warm water — crab active",
"apă caldă — crabul e activ",
"agua cálida — cangrejo activo"
],
"правила не подтверждены": [
"rules not confirmed",
"reguli neconfirmate",
"normas sin confirmar"
],
"Нет данных": [
"No data",
"Fără date",
"Sin datos"
],
"Сегодня подходящих часов больше нет": [
"No more suitable hours today",
"Azi nu mai sunt ore potrivite",
"Hoy ya no quedan horas adecuadas"
],
"Весь день нельзя": [
"Not allowed all day",
"Interzis toată ziua",
"Prohibido todo el día"
],
"Не место для рыбалки.": [
"Not a fishing spot.",
"Nu e loc de pescuit.",
"No es lugar de pesca."
],
"Сурф-кастинг 4–4,5 м, груз 80–150 г, поводок 0,25–0,30, крючок №4–6.": [
"Surfcasting 4–4.5 m, 80–150 g sinker, 0.25–0.30 snood, hook #4–6.",
"Surfcasting 4–4,5 m, plumb 80–150 g, strună 0,25–0,30, cârlig nr. 4–6.",
"Surfcasting 4–4,5 m, plomo 80–150 g, bajo 0,25–0,30, anzuelo n.º 4–6."
],
"Наживка: покупные черви (корея, американа), креветка; ночью сардина.": [
"Bait: shop-bought worms (korean, americana), prawn; sardine at night.",
"Momeală: viermi din magazin (coreeană, americana), crevete; noaptea sardină.",
"Cebo: gusanos de tienda (coreana, americana), gamba; de noche sardina."
],
"После шторма в мутной воде — сибас на сардину или воблер 12 см.": [
"After a storm in murky water — sea bass on sardine or a 12 cm lure.",
"După furtună în apă tulbure — biban pe sardină sau vobler de 12 cm.",
"Tras temporal con agua turbia — lubina con sardina o señuelo de 12 cm."
],
"Поплавок 1–3 г, леска 0,18–0,22, крючок №8–10.": [
"Float 1–3 g, line 0.18–0.22, hook #8–10.",
"Plută 1–3 g, fir 0,18–0,22, cârlig nr. 8–10.",
"Boya 1–3 g, hilo 0,18–0,22, anzuelo n.º 8–10."
],
"Наживка: креветка, мидия из магазина, хлеб; прикормка с сардиной.": [
"Bait: prawn, shop mussel, bread; groundbait with sardine.",
"Momeală: crevete, midie din magazin, pâine; nadă cu sardină.",
"Cebo: gamba, mejillón de tienda, pan; engodo con sardina."
],
"Спиннинг 2,7–3 м, тест 10–40 г, шнур PE 1, флюр 0,30.": [
"Spinning rod 2.7–3 m, 10–40 g, PE 1 braid, 0.30 fluoro.",
"Spinning 2,7–3 m, 10–40 g, fir textil PE 1, fluoro 0,30.",
"Spinning 2,7–3 m, 10–40 g, trenzado PE 1, fluoro 0,30."
],
"Приманки: воблеры 9–12 см, стикбейт, джиг 20–30 г.": [
"Lures: 9–12 cm minnows, stickbait, 20–30 g jig.",
"Năluci: voblere 9–12 cm, stickbait, jig 20–30 g.",
"Señuelos: minnows 9–12 cm, stickbait, jig 20–30 g."
],
"Голубой краб активен: днём, сачком, до 2 кг.": [
"Blue crab active: by day, landing net, up to 2 kg.",
"Crabul albastru e activ: ziua, cu minciogul, până la 2 kg.",
"Cangrejo azul activo: de día, con salabre, hasta 2 kg."
],
"Кальмар: эги 2.5–3.0 на закате и первые 2 часа темноты.": [
"Squid: egi 2.5–3.0 at sunset and the first 2 hours of darkness.",
"Calmar: egi 2.5–3.0 la apus și primele 2 ore de întuneric.",
"Calamar: egi 2.5–3.0 al atardecer y las 2 primeras horas de noche."
],
"Лампуга: металл 20–30 г, поппер, с мысов утром.": [
"Dolphinfish: 20–30 g metal, popper, from headlands in the morning.",
"Lampuga: metal 20–30 g, popper, de pe capuri dimineața.",
"Llampuga: metal 20–30 g, popper, desde cabos por la mañana."
],
"Луфарь: стальной поводок, металл, быстрая проводка.": [
"Bluefish: steel leader, metal, fast retrieve.",
"Lufar: strună de oțel, metal, recuperare rapidă.",
"Anjova: bajo de acero, metal, recogida rápida."
],
"В заповеднике: 1 снасть, живая рыба на наживку обычно запрещена.": [
"In the reserve: 1 rod, live fish as bait usually banned.",
"În rezervație: 1 lansetă, peștele viu ca momeală e de obicei interzis.",
"En la reserva: 1 aparejo, el pez vivo como cebo suele estar prohibido."
],
"Не удалось сохранить: память браузера недоступна": [
"Could not save: browser storage unavailable",
"Nu s-a putut salva: memoria browserului indisponibilă",
"No se pudo guardar: almacenamiento del navegador no disponible"
],
"С": [
"N",
"N",
"N"
],
"СВ": [
"NE",
"NE",
"NE"
],
"В": [
"E",
"E",
"E"
],
"ЮВ": [
"SE",
"SE",
"SE"
],
"Ю": [
"S",
"S",
"S"
],
"ЮЗ": [
"SW",
"SV",
"SO"
],
"З": [
"W",
"V",
"O"
],
"СЗ": [
"NW",
"NV",
"NO"
],
"погода ": [
"weather ",
"vreme ",
"tiempo "
],
"Нет связи с сервисом погоды": [
"No connection to the weather service",
"Nu există conexiune cu serviciul meteo",
"Sin conexión con el servicio meteorológico"
],
", показан прогноз от ": [
", showing forecast from ",
", se afișează prognoza din ",
", se muestra la previsión de "
],
"<header class=\"top\"><h1>Где лучше ловить</h1><div class=\"seg\">": [
"<header class=\"top\"><h1>Where to fish</h1><div class=\"seg\">",
"<header class=\"top\"><h1>Unde să pescuiești</h1><div class=\"seg\">",
"<header class=\"top\"><h1>Dónde pescar</h1><div class=\"seg\">"
],
"Сегодня": [
"Today",
"Azi",
"Hoy"
],
"Завтра": [
"Tomorrow",
"Mâine",
"Mañana"
],
"Послезавтра": [
"Day after",
"Poimâine",
"Pasado"
],
"Все": [
"All",
"Toate",
"Todo"
],
"До 30 км": [
"Within 30 km",
"Până la 30 km",
"Hasta 30 km"
],
"Пляж": [
"Beach",
"Plajă",
"Playa"
],
"Скалы": [
"Rocks",
"Stânci",
"Rocas"
],
"0–5 м": [
"0–5 m",
"0–5 m",
"0–5 m"
],
"5–15 м": [
"5–15 m",
"5–15 m",
"5–15 m"
],
"15+ м": [
"15+ m",
"15+ m",
"15+ m"
],
"Любая ловля": [
"Any method",
"Orice metodă",
"Cualquier pesca"
],
"</div><div class=\"sub\">Луна: ": [
"</div><div class=\"sub\">Moon: ",
"</div><div class=\"sub\">Luna: ",
"</div><div class=\"sub\">Luna: "
],
" · прогноз ": [
" · forecast ",
" · prognoză ",
" · previsión "
],
" <button class=\"link\" data-act=\"refresh\">обновить</button></div></header>": [
" <button class=\"link\" data-act=\"refresh\">refresh</button></div></header>",
" <button class=\"link\" data-act=\"refresh\">actualizează</button></div></header>",
" <button class=\"link\" data-act=\"refresh\">actualizar</button></div></header>"
],
"<p class=\"note\">Загружаю погоду…</p>": [
"<p class=\"note\">Loading weather…</p>",
"<p class=\"note\">Se încarcă vremea…</p>",
"<p class=\"note\">Cargando el tiempo…</p>"
],
" <button class=\"link\" data-act=\"licshow\">Открыть</button></p>": [
" <button class=\"link\" data-act=\"licshow\">Open</button></p>",
" <button class=\"link\" data-act=\"licshow\">Deschide</button></p>",
" <button class=\"link\" data-act=\"licshow\">Abrir</button></p>"
],
"<p class=\"note\">Погоды пока нет. Нажмите «обновить», нужен интернет.</p>": [
"<p class=\"note\">No weather yet. Tap “refresh”, internet needed.</p>",
"<p class=\"note\">Încă nu există vreme. Apăsați „actualizează”, e nevoie de internet.</p>",
"<p class=\"note\">Aún no hay previsión. Pulse «actualizar», hace falta internet.</p>"
],
"<div class=\"muted\">нет прогноза</div>": [
"<div class=\"muted\">no forecast</div>",
"<div class=\"muted\">fără prognoză</div>",
"<div class=\"muted\">sin previsión</div>"
],
" км/ч ": [
" km/h ",
" km/h ",
" km/h "
],
" · волна ": [
" · waves ",
" · val ",
" · ola "
],
" м": [
" m",
" m",
" m"
],
" · вода ": [
" · water ",
" · apă ",
" · agua "
],
"<div class=\"danger\">⚠ Опасно на скалах: волна или порывы</div>": [
"<div class=\"danger\">⚠ Dangerous on rocks: waves or gusts</div>",
"<div class=\"danger\">⚠ Periculos pe stânci: valuri sau rafale</div>",
"<div class=\"danger\">⚠ Peligroso en las rocas: ola o rachas</div>"
],
"</div><p class=\"foot\">Оценка 0–100 по ветру, волне, давлению, времени суток, луне и мутности. Это подсказка, а не гарантия клёва.</p>": [
"</div><p class=\"foot\">Score 0–100 based on wind, waves, pressure, time of day, moon and turbidity. It is a hint, not a guarantee of bites.</p>",
"</div><p class=\"foot\">Scor 0–100 după vânt, valuri, presiune, ora zilei, lună și turbiditate. E un indiciu, nu o garanție.</p>",
"</div><p class=\"foot\">Puntuación 0–100 según viento, ola, presión, hora, luna y turbidez. Es una orientación, no una garantía de picada.</p>"
],
" <small>моя</small>": [
" <small>mine</small>",
" <small>al meu</small>",
" <small>mío</small>"
],
"пляж": [
"beach",
"plajă",
"playa"
],
"скалы": [
"rocks",
"stânci",
"rocas"
],
" км": [
" km",
" km",
" km"
],
" км от дома</div>": [
" km from home</div>",
" km de casă</div>",
" km de casa</div>"
],
"\">🚗 Маршрут к парковке</a>": [
"\">🚗 Route to parking</a>",
"\">🚗 Traseu spre parcare</a>",
"\">🚗 Ruta al aparcamiento</a>"
],
"&travelmode=walking\">🚶 К месту ловли</a>": [
"&travelmode=walking\">🚶 To the fishing spot</a>",
"&travelmode=walking\">🚶 Spre locul de pescuit</a>",
"&travelmode=walking\">🚶 Al punto de pesca</a>"
],
"\">Записать улов</button>": [
"\">Log a catch</button>",
"\">Notează captura</button>",
"\">Anotar captura</button>"
],
"\">Найти на карте</a>": [
"\">Find on map</a>",
"\">Caută pe hartă</a>",
"\">Buscar en el mapa</a>"
],
"<h3>Режим</h3><p><b>": [
"<h3>Regime</h3><p><b>",
"<h3>Regim</h3><p><b>",
"<h3>Régimen</h3><p><b>"
],
"\">Правила</a>": [
"\">Rules</a>",
"\">Reguli</a>",
"\">Normas</a>"
],
"<h3>Парковка</h3><p>": [
"<h3>Parking</h3><p>",
"<h3>Parcare</h3><p>",
"<h3>Aparcamiento</h3><p>"
],
" <b>· отмечена вами на карте</b>": [
" <b>· marked by you on the map</b>",
" <b>· marcată de dvs. pe hartă</b>",
" <b>· marcado por usted en el mapa</b>"
],
" <span class=\"muted\">(поиск по названию)</span>": [
" <span class=\"muted\">(search by name)</span>",
" <span class=\"muted\">(căutare după nume)</span>",
" <span class=\"muted\">(búsqueda por nombre)</span>"
],
"Изменить": [
"Change",
"Modifică",
"Cambiar"
],
"Отметить": [
"Mark",
"Marchează",
"Marcar"
],
" мою парковку</button></div>": [
" my parking</button></div>",
" parcarea mea</button></div>",
" mi aparcamiento</button></div>"
],
"<h3>Рыба</h3><p>": [
"<h3>Fish</h3><p>",
"<h3>Pește</h3><p>",
"<h3>Peces</h3><p>"
],
"<h3>Чем ловить здесь</h3>": [
"<h3>What to fish with here</h3>",
"<h3>Cu ce să pescuiești aici</h3>",
"<h3>Con qué pescar aquí</h3>"
],
"<h3>Сейчас в сезоне</h3><ul class=\"tips\">": [
"<h3>In season now</h3><ul class=\"tips\">",
"<h3>Acum în sezon</h3><ul class=\"tips\">",
"<h3>Ahora en temporada</h3><ul class=\"tips\">"
],
"<h3>Прогноз по часам · ": [
"<h3>Hourly forecast · ",
"<h3>Prognoză pe ore · ",
"<h3>Previsión por horas · "
],
"сегодня": [
"today",
"azi",
"hoy"
],
"завтра": [
"tomorrow",
"mâine",
"mañana"
],
"послезавтра": [
"day after tomorrow",
"poimâine",
"pasado mañana"
],
"<p class=\"muted\">Восход ": [
"<p class=\"muted\">Sunrise ",
"<p class=\"muted\">Răsărit ",
"<p class=\"muted\">Salida del sol "
],
" · закат ": [
" · sunset ",
" · apus ",
" · puesta "
],
" · луна: ": [
" · moon: ",
" · lună: ",
" · luna: "
],
"</div><table class=\"wx\"><tr><th>Час</th><th>Ветер</th><th>Порыв</th><th>Волна</th><th>Вода</th><th>Давл.</th><th>Оценка</th></tr>": [
"</div><table class=\"wx\"><tr><th>Hour</th><th>Wind</th><th>Gust</th><th>Wave</th><th>Water</th><th>Press.</th><th>Score</th></tr>",
"</div><table class=\"wx\"><tr><th>Ora</th><th>Vânt</th><th>Rafală</th><th>Val</th><th>Apă</th><th>Pres.</th><th>Scor</th></tr>",
"</div><table class=\"wx\"><tr><th>Hora</th><th>Viento</th><th>Racha</th><th>Ola</th><th>Agua</th><th>Pres.</th><th>Nota</th></tr>"
],
"</table><p class=\"muted\">Ветер км/ч, стрелка — куда дует. Волна м. Давление гПа.</p>": [
"</table><p class=\"muted\">Wind km/h, arrow shows where it blows. Waves in m. Pressure hPa.</p>",
"</table><p class=\"muted\">Vânt km/h, săgeata arată încotro bate. Val în m. Presiune hPa.</p>",
"</table><p class=\"muted\">Viento km/h, la flecha indica hacia dónde sopla. Ola en m. Presión hPa.</p>"
],
"<h3>Мои уловы здесь</h3><p>": [
"<h3>My catches here</h3><p>",
"<h3>Capturile mele aici</h3><p>",
"<h3>Mis capturas aquí</h3><p>"
],
" записей, лучшие часы: ": [
" entries, best hours: ",
" înregistrări, cele mai bune ore: ",
" registros, mejores horas: "
],
"\">Изменить</button><button class=\"btn danger\" data-act=\"delspot\" data-spot=\"": [
"\">Edit</button><button class=\"btn danger\" data-act=\"delspot\" data-spot=\"",
"\">Modifică</button><button class=\"btn danger\" data-act=\"delspot\" data-spot=\"",
"\">Editar</button><button class=\"btn danger\" data-act=\"delspot\" data-spot=\""
],
"\">Удалить</button>": [
"\">Delete</button>",
"\">Șterge</button>",
"\">Eliminar</button>"
],
"\">Уточнить место на карте</button><button class=\"btn\" data-act=\"hidespot\" data-spot=\"": [
"\">Refine spot on map</button><button class=\"btn\" data-act=\"hidespot\" data-spot=\"",
"\">Precizează locul pe hartă</button><button class=\"btn\" data-act=\"hidespot\" data-spot=\"",
"\">Precisar en el mapa</button><button class=\"btn\" data-act=\"hidespot\" data-spot=\""
],
"\">Скрыть точку</button>": [
"\">Hide spot</button>",
"\">Ascunde locul</button>",
"\">Ocultar punto</button>"
],
"</div><p class=\"muted\">Координаты встроенных точек примерные. Уточните точное место стояния на карте.</p></div>": [
"</div><p class=\"muted\">Built-in spot coordinates are approximate. Refine your exact standing spot on the map.</p></div>",
"</div><p class=\"muted\">Coordonatele locurilor incluse sunt aproximative. Precizați locul exact pe hartă.</p></div>",
"</div><p class=\"muted\">Las coordenadas de los puntos incluidos son aproximadas. Precise el sitio exacto en el mapa.</p></div>"
],
"<p class=\"lbl\">Снасть</p><ul>": [
"<p class=\"lbl\">Tackle</p><ul>",
"<p class=\"lbl\">Echipament</p><ul>",
"<p class=\"lbl\">Aparejo</p><ul>"
],
"<p class=\"lbl\">Приманка / наживка</p><ul>": [
"<p class=\"lbl\">Lure / bait</p><ul>",
"<p class=\"lbl\">Năluci / momeală</p><ul>",
"<p class=\"lbl\">Señuelo / cebo</p><ul>"
],
"<p><b>Когда:</b> ": [
"<p><b>When:</b> ",
"<p><b>Când:</b> ",
"<p><b>Cuándo:</b> "
],
"</p><p><b>Сезон:</b> ": [
"</p><p><b>Season:</b> ",
"</p><p><b>Sezon:</b> ",
"</p><p><b>Temporada:</b> "
],
"</p><p class=\"muted\"><b>Правила:</b> ": [
"</p><p class=\"muted\"><b>Rules:</b> ",
"</p><p class=\"muted\"><b>Reguli:</b> ",
"</p><p class=\"muted\"><b>Normas:</b> "
],
"<header class=\"top\"><h1>Карта точек</h1><div class=\"btns\">": [
"<header class=\"top\"><h1>Spots map</h1><div class=\"btns\">",
"<header class=\"top\"><h1>Harta locurilor</h1><div class=\"btns\">",
"<header class=\"top\"><h1>Mapa de puntos</h1><div class=\"btns\">"
],
"<button class=\"btn pri\" data-act=\"pickadd\">+ Точка касанием</button><button class=\"btn\" data-act=\"geoadd\">+ Где я стою</button></div>": [
"<button class=\"btn pri\" data-act=\"pickadd\">+ Tap to add</button><button class=\"btn\" data-act=\"geoadd\">+ Where I stand</button></div>",
"<button class=\"btn pri\" data-act=\"pickadd\">+ Loc prin atingere</button><button class=\"btn\" data-act=\"geoadd\">+ Unde sunt acum</button></div>",
"<button class=\"btn pri\" data-act=\"pickadd\">+ Punto tocando</button><button class=\"btn\" data-act=\"geoadd\">+ Donde estoy</button></div>"
],
"Коснитесь карты, где новая точка.": [
"Tap the map where the new spot is.",
"Atingeți harta unde e noul loc.",
"Toque el mapa donde está el nuevo punto."
],
"Коснитесь карты, где вы ставите машину для «": [
"Tap the map where you park for “",
"Atingeți harta unde parcați pentru „",
"Toque el mapa donde aparca para «"
],
"Коснитесь точного места для «": [
"Tap the exact spot for “",
"Atingeți locul exact pentru „",
"Toque el sitio exacto de «"
],
" <button class=\"link\" data-act=\"cancelpick\">отмена</button></p>": [
" <button class=\"link\" data-act=\"cancelpick\">cancel</button></p>",
" <button class=\"link\" data-act=\"cancelpick\">anulează</button></p>",
" <button class=\"link\" data-act=\"cancelpick\">cancelar</button></p>"
],
"<p class=\"foot\">Цвет: оценка на ": [
"<p class=\"foot\">Colour: score for ",
"<p class=\"foot\">Culoare: scorul pentru ",
"<p class=\"foot\">Color: nota para "
],
". Серые — нет прогноза или нельзя.</p>": [
". Grey — no forecast or not allowed.</p>",
". Gri — fără prognoză sau interzis.</p>",
". Gris — sin previsión o prohibido.</p>"
],
"<p class=\"warn\">Карта не загрузилась (нет интернета). Список точек — во вкладке «Где лучше».</p>": [
"<p class=\"warn\">Map did not load (no internet). The spot list is in the “Where to fish” tab.</p>",
"<p class=\"warn\">Harta nu s-a încărcat (fără internet). Lista locurilor e în fila „Unde”.</p>",
"<p class=\"warn\">El mapa no se cargó (sin internet). La lista de puntos está en la pestaña «Dónde».</p>"
],
"Парковка: ": [
"Parking: ",
"Parcare: ",
"Aparcamiento: "
],
"Дом": [
"Home",
"Acasă",
"Casa"
],
"Парковка сохранена": [
"Parking saved",
"Parcare salvată",
"Aparcamiento guardado"
],
"Место уточнено": [
"Spot refined",
"Loc precizat",
"Punto precisado"
],
"Изменить точку": [
"Edit spot",
"Modifică locul",
"Editar punto"
],
"Новая точка": [
"New spot",
"Loc nou",
"Punto nuevo"
],
"<label>Название<input name=\"name\" required value=\"": [
"<label>Name<input name=\"name\" required value=\"",
"<label>Nume<input name=\"name\" required value=\"",
"<label>Nombre<input name=\"name\" required value=\""
],
"<div class=\"row\"><label>Берег<select name=\"type\">": [
"<div class=\"row\"><label>Shore<select name=\"type\">",
"<div class=\"row\"><label>Mal<select name=\"type\">",
"<div class=\"row\"><label>Costa<select name=\"type\">"
],
"<label>Глубина<select name=\"depth\">": [
"<label>Depth<select name=\"depth\">",
"<label>Adâncime<select name=\"depth\">",
"<label>Profundidad<select name=\"depth\">"
],
"<label>Куда смотрит берег (море)<select name=\"face\">": [
"<label>Which way the shore faces (sea)<select name=\"face\">",
"<label>Încotro privește malul (marea)<select name=\"face\">",
"<label>Hacia dónde mira la costa (mar)<select name=\"face\">"
],
"Юго-запад": [
"South-west",
"Sud-vest",
"Suroeste"
],
"<label>Заповедник<select name=\"reserve\">": [
"<label>Reserve<select name=\"reserve\">",
"<label>Rezervație<select name=\"reserve\">",
"<label>Reserva<select name=\"reserve\">"
],
"<label>Рыба<input name=\"fish\" value=\"": [
"<label>Fish<input name=\"fish\" value=\"",
"<label>Pește<input name=\"fish\" value=\"",
"<label>Peces<input name=\"fish\" value=\""
],
"\"></label><label>Способы ловли<input name=\"methods\" value=\"": [
"\"></label><label>Methods<input name=\"methods\" value=\"",
"\"></label><label>Metode<input name=\"methods\" value=\"",
"\"></label><label>Modalidades<input name=\"methods\" value=\""
],
"<label>Парковка<input name=\"parking\" value=\"": [
"<label>Parking<input name=\"parking\" value=\"",
"<label>Parcare<input name=\"parking\" value=\"",
"<label>Aparcamiento<input name=\"parking\" value=\""
],
"<p class=\"lbl\">Виды ловли</p><div class=\"checks\">": [
"<p class=\"lbl\">Fishing types</p><div class=\"checks\">",
"<p class=\"lbl\">Tipuri de pescuit</p><div class=\"checks\">",
"<p class=\"lbl\">Tipos de pesca</p><div class=\"checks\">"
],
"<p class=\"muted\">Координаты: ": [
"<p class=\"muted\">Coordinates: ",
"<p class=\"muted\">Coordonate: ",
"<p class=\"muted\">Coordenadas: "
],
"</p><button class=\"btn pri wide\">Сохранить</button></form>": [
"</p><button class=\"btn pri wide\">Save</button></form>",
"</p><button class=\"btn pri wide\">Salvează</button></form>",
"</p><button class=\"btn pri wide\">Guardar</button></form>"
],
"Мои": [
"Mine",
"Ale mele",
"Míos"
],
"Точка сохранена": [
"Spot saved",
"Loc salvat",
"Punto guardado"
],
"<header class=\"top\"><h1>Рыбы и снасти</h1><div class=\"seg\"><button data-fv=\"fish\">Рыбы и правила</button><button data-fv=\"tech\" class=\"on\">Снасти по технике</button></div></header>": [
"<header class=\"top\"><h1>Fish and tackle</h1><div class=\"seg\"><button data-fv=\"fish\">Fish and rules</button><button data-fv=\"tech\" class=\"on\">Tackle by method</button></div></header>",
"<header class=\"top\"><h1>Pești și echipament</h1><div class=\"seg\"><button data-fv=\"fish\">Pești și reguli</button><button data-fv=\"tech\" class=\"on\">Echipament pe metode</button></div></header>",
"<header class=\"top\"><h1>Peces y aparejos</h1><div class=\"seg\"><button data-fv=\"fish\">Peces y normas</button><button data-fv=\"tech\" class=\"on\">Aparejos por técnica</button></div></header>"
],
"<p class=\"foot\">Снасти — практические рекомендации, а не закон. Правила — по Cuaderno de pesca recreativa 2026.</p>": [
"<p class=\"foot\">Tackle is practical advice, not law. Rules follow the Cuaderno de pesca recreativa 2026.</p>",
"<p class=\"foot\">Echipamentul e o recomandare practică, nu lege. Regulile — după Cuaderno de pesca recreativa 2026.</p>",
"<p class=\"foot\">Los aparejos son consejos prácticos, no ley. Normas según el Cuaderno de pesca recreativa 2026.</p>"
],
"<header class=\"top\"><h1>Рыбы и снасти</h1><div class=\"seg\"><button data-fv=\"fish\" class=\"on\">Рыбы и правила</button><button data-fv=\"tech\">Снасти по технике</button></div></header>": [
"<header class=\"top\"><h1>Fish and tackle</h1><div class=\"seg\"><button data-fv=\"fish\" class=\"on\">Fish and rules</button><button data-fv=\"tech\">Tackle by method</button></div></header>",
"<header class=\"top\"><h1>Pești și echipament</h1><div class=\"seg\"><button data-fv=\"fish\" class=\"on\">Pești și reguli</button><button data-fv=\"tech\">Echipament pe metode</button></div></header>",
"<header class=\"top\"><h1>Peces y aparejos</h1><div class=\"seg\"><button data-fv=\"fish\" class=\"on\">Peces y normas</button><button data-fv=\"tech\">Aparejos por técnica</button></div></header>"
],
"<form class=\"panel\" id=\"checkform\"><h3>Проверить улов</h3><div class=\"row\"><label>Вид<select name=\"fish\">": [
"<form class=\"panel\" id=\"checkform\"><h3>Check a catch</h3><div class=\"row\"><label>Species<select name=\"fish\">",
"<form class=\"panel\" id=\"checkform\"><h3>Verifică captura</h3><div class=\"row\"><label>Specie<select name=\"fish\">",
"<form class=\"panel\" id=\"checkform\"><h3>Comprobar captura</h3><div class=\"row\"><label>Especie<select name=\"fish\">"
],
"<label>Точка<select name=\"spot\"><option value=\"\">— вне заповедника —</option>": [
"<label>Spot<select name=\"spot\"><option value=\"\">— outside reserve —</option>",
"<label>Loc<select name=\"spot\"><option value=\"\">— în afara rezervației —</option>",
"<label>Punto<select name=\"spot\"><option value=\"\">— fuera de reserva —</option>"
],
"<div class=\"row\"><label>Длина, см<input name=\"len\" type=\"number\" inputmode=\"decimal\" step=\"0.5\"></label><label>Вес, кг<input name=\"kg\" type=\"number\" inputmode=\"decimal\" step=\"0.05\"></label></div>": [
"<div class=\"row\"><label>Length, cm<input name=\"len\" type=\"number\" inputmode=\"decimal\" step=\"0.5\"></label><label>Weight, kg<input name=\"kg\" type=\"number\" inputmode=\"decimal\" step=\"0.05\"></label></div>",
"<div class=\"row\"><label>Lungime, cm<input name=\"len\" type=\"number\" inputmode=\"decimal\" step=\"0.5\"></label><label>Greutate, kg<input name=\"kg\" type=\"number\" inputmode=\"decimal\" step=\"0.05\"></label></div>",
"<div class=\"row\"><label>Longitud, cm<input name=\"len\" type=\"number\" inputmode=\"decimal\" step=\"0.5\"></label><label>Peso, kg<input name=\"kg\" type=\"number\" inputmode=\"decimal\" step=\"0.05\"></label></div>"
],
"<button class=\"btn pri wide\">Можно оставить?</button><div id=\"verdict\"></div></form>": [
"<button class=\"btn pri wide\">Can I keep it?</button><div id=\"verdict\"></div></form>",
"<button class=\"btn pri wide\">Pot să-l păstrez?</button><div id=\"verdict\"></div></form>",
"<button class=\"btn pri wide\">¿Me lo puedo quedar?</button><div id=\"verdict\"></div></form>"
],
"<p class=\"sub\">Длина — от кончика рта до конца хвоста. <a target=\"_blank\" rel=\"noopener\" href=\"": [
"<p class=\"sub\">Length — from the tip of the mouth to the end of the tail. <a target=\"_blank\" rel=\"noopener\" href=\"",
"<p class=\"sub\">Lungimea — de la vârful gurii la capătul cozii. <a target=\"_blank\" rel=\"noopener\" href=\"",
"<p class=\"sub\">Longitud — de la punta de la boca al final de la cola. <a target=\"_blank\" rel=\"noopener\" href=\""
],
"\">Официальная таблица талий</a></p><div class=\"list\">": [
"\">Official size table</a></p><div class=\"list\">",
"\">Tabelul oficial de dimensiuni</a></p><div class=\"list\">",
"\">Tabla oficial de tallas</a></p><div class=\"list\">"
],
"сезон открыт": [
"season open",
"sezon deschis",
"temporada abierta"
],
"запрет": [
"closed",
"interzis",
"veda"
],
"<li>Мин. размер: <b>": [
"<li>Min. size: <b>",
"<li>Dimensiune min.: <b>",
"<li>Talla mín.: <b>"
],
" см</b>": [
" cm</b>",
" cm</b>",
" cm</b>"
],
", в заповеднике ": [
", in reserve ",
", în rezervație ",
", en reserva "
],
"<li>Мин. вес: <b>": [
"<li>Min. weight: <b>",
"<li>Greutate min.: <b>",
"<li>Peso mín.: <b>"
],
" кг</b></li>": [
" kg</b></li>",
" kg</b></li>",
" kg</b></li>"
],
"<li>Мин. размер: проверить в таблице талий</li>": [
"<li>Min. size: check the size table</li>",
"<li>Dimensiune min.: verificați tabelul</li>",
"<li>Talla mín.: comprobar en la tabla de tallas</li>"
],
"<li>Лимит: <b>": [
"<li>Limit: <b>",
"<li>Limită: <b>",
"<li>Límite: <b>"
],
" шт в день</b></li>": [
" per day</b></li>",
" buc. pe zi</b></li>",
" al día</b></li>"
],
" кг в день</b></li>": [
" kg per day</b></li>",
" kg pe zi</b></li>",
" kg al día</b></li>"
],
"<li>Только днём</li>": [
"<li>Daytime only</li>",
"<li>Doar ziua</li>",
"<li>Solo de día</li>"
],
"<li>Можно: ": [
"<li>Allowed: ",
"<li>Permis: ",
"<li>Permitido: "
],
"<li>Запрет на Майорке: ": [
"<li>Closed on Mallorca: ",
"<li>Interzis în Mallorca: ",
"<li>Veda en Mallorca: "
],
"янв": [
"Jan",
"ian",
"ene"
],
"фев": [
"Feb",
"feb",
"feb"
],
"мар": [
"Mar",
"mar",
"mar"
],
"апр": [
"Apr",
"apr",
"abr"
],
"май": [
"May",
"mai",
"may"
],
"июнь": [
"Jun",
"iun",
"jun"
],
"июль": [
"Jul",
"iul",
"jul"
],
"авг": [
"Aug",
"aug",
"ago"
],
"сен": [
"Sep",
"sep",
"sep"
],
"окт": [
"Oct",
"oct",
"oct"
],
"ноя": [
"Nov",
"noi",
"nov"
],
"дек": [
"Dec",
"dec",
"dic"
],
"<li>Пометить: подрезать нижнюю лопасть хвоста</li>": [
"<li>Mark: clip the lower lobe of the tail</li>",
"<li>Marcare: tăiați lobul inferior al cozii</li>",
"<li>Marcar: cortar el lóbulo inferior de la cola</li>"
],
"<li>Записать в PescaREC</li>": [
"<li>Log in PescaREC</li>",
"<li>Înregistrați în PescaREC</li>",
"<li>Registrar en PescaREC</li>"
],
"</div><p class=\"foot\">По «Cuaderno de pesca recreativa» 27.07.2026. Справочник не заменяет закон: при сомнении отпустите рыбу. <a target=\"_blank\" rel=\"noopener\" href=\"": [
"</div><p class=\"foot\">Per the “Cuaderno de pesca recreativa” of 27.07.2026. This guide does not replace the law: if in doubt, release the fish. <a target=\"_blank\" rel=\"noopener\" href=\"",
"</div><p class=\"foot\">După „Cuaderno de pesca recreativa” din 27.07.2026. Ghidul nu înlocuiește legea: dacă aveți dubii, eliberați peștele. <a target=\"_blank\" rel=\"noopener\" href=\"",
"</div><p class=\"foot\">Según el «Cuaderno de pesca recreativa» del 27.07.2026. Esta guía no sustituye a la ley: ante la duda, suelte el pez. <a target=\"_blank\" rel=\"noopener\" href=\""
],
"\">Полный текст</a></p>": [
"\">Full text</a></p>",
"\">Textul complet</a></p>",
"\">Texto completo</a></p>"
],
"<header class=\"top\"><h1>Журнал</h1><div class=\"btns\"><button class=\"btn pri\" data-act=\"addcatch\">+ Улов / выход</button>": [
"<header class=\"top\"><h1>Logbook</h1><div class=\"btns\"><button class=\"btn pri\" data-act=\"addcatch\">+ Catch / trip</button>",
"<header class=\"top\"><h1>Jurnal</h1><div class=\"btns\"><button class=\"btn pri\" data-act=\"addcatch\">+ Captură / ieșire</button>",
"<header class=\"top\"><h1>Diario</h1><div class=\"btns\"><button class=\"btn pri\" data-act=\"addcatch\">+ Captura / salida</button>"
],
"<button class=\"btn\" data-act=\"stats\">Статистика</button></div></header>": [
"<button class=\"btn\" data-act=\"stats\">Statistics</button></div></header>",
"<button class=\"btn\" data-act=\"stats\">Statistici</button></div></header>",
"<button class=\"btn\" data-act=\"stats\">Estadísticas</button></div></header>"
],
"<p class=\"note\">Пока пусто. Записывайте и уловы, и пустые выходы — так статистика честнее.</p>": [
"<p class=\"note\">Empty so far. Log both catches and blank trips — it makes the statistics more honest.</p>",
"<p class=\"note\">Deocamdată gol. Notați și capturile, și ieșirile fără pește — statistica va fi mai corectă.</p>",
"<p class=\"note\">Vacío por ahora. Anote capturas y también salidas sin pesca: la estadística será más fiable.</p>"
],
"Без улова": [
"No catch",
"Fără captură",
"Sin captura"
],
" кг": [
" kg",
" kg",
" kg"
],
"оставил": [
"kept",
"păstrat",
"me lo quedé"
],
"отпустил": [
"released",
"eliberat",
"soltado"
],
"\">удалить</button></div></div>": [
"\">delete</button></div></div>",
"\">șterge</button></div></div>",
"\">eliminar</button></div></div>"
],
"<form class=\"sheet\" id=\"catchform\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>Запись в журнал</h2>": [
"<form class=\"sheet\" id=\"catchform\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>Logbook entry</h2>",
"<form class=\"sheet\" id=\"catchform\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>Înregistrare în jurnal</h2>",
"<form class=\"sheet\" id=\"catchform\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>Anotación en el diario</h2>"
],
"<label>Когда<input name=\"time\" type=\"datetime-local\" value=\"": [
"<label>When<input name=\"time\" type=\"datetime-local\" value=\"",
"<label>Când<input name=\"time\" type=\"datetime-local\" value=\"",
"<label>Cuándo<input name=\"time\" type=\"datetime-local\" value=\""
],
"<label>Точка<select name=\"spot\">": [
"<label>Spot<select name=\"spot\">",
"<label>Loc<select name=\"spot\">",
"<label>Punto<select name=\"spot\">"
],
"<label>Рыба<select name=\"fish\"><option value=\"\">Без улова</option>": [
"<label>Fish<select name=\"fish\"><option value=\"\">No catch</option>",
"<label>Pește<select name=\"fish\"><option value=\"\">Fără captură</option>",
"<label>Pez<select name=\"fish\"><option value=\"\">Sin captura</option>"
],
"<option value=\"other\">Другая</option></select></label>": [
"<option value=\"other\">Other</option></select></label>",
"<option value=\"other\">Altul</option></select></label>",
"<option value=\"other\">Otro</option></select></label>"
],
"<div class=\"row\"><label>Способ<select name=\"method\"><option></option><option>Сурф-кастинг</option><option>Донка</option><option>Поплавок</option><option>Спиннинг</option><option>Эги</option><option>Живец</option></select></label>": [
"<div class=\"row\"><label>Method<select name=\"method\"><option></option><option>Surfcasting</option><option>Bottom</option><option>Float</option><option>Spinning</option><option>Egi</option><option>Live bait</option></select></label>",
"<div class=\"row\"><label>Metodă<select name=\"method\"><option></option><option>Surfcasting</option><option>La fund</option><option>Plută</option><option>Spinning</option><option>Egi</option><option>Momeală vie</option></select></label>",
"<div class=\"row\"><label>Modalidad<select name=\"method\"><option></option><option>Surfcasting</option><option>Fondo</option><option>Boya</option><option>Spinning</option><option>Egi</option><option>Vivo</option></select></label>"
],
"<label>Наживка<input name=\"bait\" placeholder=\"креветка, воблер…\"></label></div>": [
"<label>Bait<input name=\"bait\" placeholder=\"prawn, lure…\"></label></div>",
"<label>Momeală<input name=\"bait\" placeholder=\"crevete, vobler…\"></label></div>",
"<label>Cebo<input name=\"bait\" placeholder=\"gamba, señuelo…\"></label></div>"
],
"<label>Улов<select name=\"kept\"><option value=\"\">—</option><option value=\"released\">Отпустил</option><option value=\"kept\">Оставил</option></select></label>": [
"<label>Catch<select name=\"kept\"><option value=\"\">—</option><option value=\"released\">Released</option><option value=\"kept\">Kept</option></select></label>",
"<label>Captură<select name=\"kept\"><option value=\"\">—</option><option value=\"released\">Eliberat</option><option value=\"kept\">Păstrat</option></select></label>",
"<label>Captura<select name=\"kept\"><option value=\"\">—</option><option value=\"released\">Soltado</option><option value=\"kept\">Me lo quedé</option></select></label>"
],
"<label>Фото<input name=\"photo\" type=\"file\" accept=\"image/*\" capture=\"environment\"></label>": [
"<label>Photo<input name=\"photo\" type=\"file\" accept=\"image/*\" capture=\"environment\"></label>",
"<label>Foto<input name=\"photo\" type=\"file\" accept=\"image/*\" capture=\"environment\"></label>",
"<label>Foto<input name=\"photo\" type=\"file\" accept=\"image/*\" capture=\"environment\"></label>"
],
"<label>Заметка<textarea name=\"note\" rows=\"2\"></textarea></label><div id=\"cverdict\"></div>": [
"<label>Note<textarea name=\"note\" rows=\"2\"></textarea></label><div id=\"cverdict\"></div>",
"<label>Notă<textarea name=\"note\" rows=\"2\"></textarea></label><div id=\"cverdict\"></div>",
"<label>Nota<textarea name=\"note\" rows=\"2\"></textarea></label><div id=\"cverdict\"></div>"
],
"<button class=\"btn pri wide\">Сохранить</button></form>": [
"<button class=\"btn pri wide\">Save</button></form>",
"<button class=\"btn pri wide\">Salvează</button></form>",
"<button class=\"btn pri wide\">Guardar</button></form>"
],
"Записано": [
"Saved",
"Salvat",
"Guardado"
],
"ветер ": [
"wind ",
"vânt ",
"viento "
],
", волна ": [
", waves ",
", val ",
", ola "
],
" гПа": [
" hPa",
" hPa",
" hPa"
],
"Можно оставить": [
"Can be kept",
"Se poate păstra",
"Se puede quedar"
],
"Отпустить": [
"Release",
"Eliberați",
"Soltar"
],
"Проверьте": [
"Check",
"Verificați",
"Compruebe"
],
"<div class=\"sheet\"><button class=\"close\" data-act=\"close\">✕</button><h2>Статистика</h2>": [
"<div class=\"sheet\"><button class=\"close\" data-act=\"close\">✕</button><h2>Statistics</h2>",
"<div class=\"sheet\"><button class=\"close\" data-act=\"close\">✕</button><h2>Statistici</h2>",
"<div class=\"sheet\"><button class=\"close\" data-act=\"close\">✕</button><h2>Estadísticas</h2>"
],
"<p>Записей: <b>": [
"<p>Entries: <b>",
"<p>Înregistrări: <b>",
"<p>Registros: <b>"
],
"</b>, с уловом: <b>": [
"</b>, with a catch: <b>",
"</b>, cu captură: <b>",
"</b>, con captura: <b>"
],
"Лучшие точки": [
"Best spots",
"Cele mai bune locuri",
"Mejores puntos"
],
"Виды": [
"Species",
"Specii",
"Especies"
],
"Другая": [
"Other",
"Altul",
"Otro"
],
"Часы клёва": [
"Bite hours",
"Orele de mușcătură",
"Horas de picada"
],
"Наживка": [
"Bait",
"Momeală",
"Cebo"
],
"Способ": [
"Method",
"Metodă",
"Modalidad"
],
"<p class=\"note\">Статистика появится после первых записей.</p>": [
"<p class=\"note\">Statistics will appear after your first entries.</p>",
"<p class=\"note\">Statistica va apărea după primele înregistrări.</p>",
"<p class=\"note\">Las estadísticas aparecerán tras las primeras anotaciones.</p>"
],
"Лицензия просрочена (": [
"Licence expired (",
"Licența a expirat (",
"Licencia caducada ("
],
"). Ловить без неё нельзя.": [
"). Fishing without it is not allowed.",
"). Fără ea pescuitul e interzis.",
"). Sin ella no se puede pescar."
],
"Лицензия заканчивается через ": [
"Licence expires in ",
"Licența expiră în ",
"La licencia caduca en "
],
" дн. (": [
" days (",
" zile (",
" días ("
],
"). Продлите заранее.": [
"). Renew in advance.",
"). Reînnoiți din timp.",
"). Renuévela con antelación."
],
"Действует до ": [
"Valid until ",
"Valabilă până la ",
"Válida hasta "
],
"<div class=\"panel\"><h3>Моя лицензия</h3><p>Сохраните фото и срок лицензии: её можно быстро показать при проверке, а приложение напомнит о продлении.</p>": [
"<div class=\"panel\"><h3>My licence</h3><p>Save a photo and the expiry date of your licence: you can show it quickly at an inspection, and the app will remind you to renew.</p>",
"<div class=\"panel\"><h3>Licența mea</h3><p>Salvați o fotografie și data expirării licenței: o puteți arăta rapid la control, iar aplicația vă va aminti de reînnoire.</p>",
"<div class=\"panel\"><h3>Mi licencia</h3><p>Guarde la foto y la caducidad de su licencia: podrá mostrarla rápido en una inspección y la app le recordará renovarla.</p>"
],
"<button class=\"btn pri\" data-act=\"licedit\">Добавить лицензию</button></div>": [
"<button class=\"btn pri\" data-act=\"licedit\">Add licence</button></div>",
"<button class=\"btn pri\" data-act=\"licedit\">Adaugă licența</button></div>",
"<button class=\"btn pri\" data-act=\"licedit\">Añadir licencia</button></div>"
],
"<div class=\"panel\"><h3>Моя лицензия</h3>": [
"<div class=\"panel\"><h3>My licence</h3>",
"<div class=\"panel\"><h3>Licența mea</h3>",
"<div class=\"panel\"><h3>Mi licencia</h3>"
],
"<div class=\"btns\"><button class=\"btn pri\" data-act=\"licshow\">Показать лицензию</button><button class=\"btn\" data-act=\"licedit\">Изменить</button></div></div>": [
"<div class=\"btns\"><button class=\"btn pri\" data-act=\"licshow\">Show licence</button><button class=\"btn\" data-act=\"licedit\">Edit</button></div></div>",
"<div class=\"btns\"><button class=\"btn pri\" data-act=\"licshow\">Arată licența</button><button class=\"btn\" data-act=\"licedit\">Modifică</button></div></div>",
"<div class=\"btns\"><button class=\"btn pri\" data-act=\"licshow\">Mostrar licencia</button><button class=\"btn\" data-act=\"licedit\">Editar</button></div></div>"
],
"<div class=\"sheet\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>Лицензия на рыбалку</h2>": [
"<div class=\"sheet\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>Fishing licence</h2>",
"<div class=\"sheet\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>Licență de pescuit</h2>",
"<div class=\"sheet\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>Licencia de pesca</h2>"
],
"<img class=\"licimg\" data-photo=\"lic1\" alt=\"Лицензия, лицевая сторона\">": [
"<img class=\"licimg\" data-photo=\"lic1\" alt=\"Licence, front\">",
"<img class=\"licimg\" data-photo=\"lic1\" alt=\"Licența, fața\">",
"<img class=\"licimg\" data-photo=\"lic1\" alt=\"Licencia, anverso\">"
],
"<img class=\"licimg\" data-photo=\"lic2\" alt=\"Лицензия, обратная сторона\">": [
"<img class=\"licimg\" data-photo=\"lic2\" alt=\"Licence, back\">",
"<img class=\"licimg\" data-photo=\"lic2\" alt=\"Licența, verso\">",
"<img class=\"licimg\" data-photo=\"lic2\" alt=\"Licencia, reverso\">"
],
"<p class=\"note\">Фото не добавлено. Нажмите «Изменить», чтобы его добавить.</p>": [
"<p class=\"note\">No photo added. Tap “Edit” to add one.</p>",
"<p class=\"note\">Nicio fotografie. Apăsați „Modifică” pentru a o adăuga.</p>",
"<p class=\"note\">Sin foto. Pulse «Editar» para añadirla.</p>"
],
"<p class=\"muted\">Носите с собой и документ с фото (NIE или паспорт).</p></div>": [
"<p class=\"muted\">Also carry a photo ID (NIE or passport).</p></div>",
"<p class=\"muted\">Purtați la dvs. și un act cu fotografie (NIE sau pașaport).</p></div>",
"<p class=\"muted\">Lleve también un documento con foto (NIE o pasaporte).</p></div>"
],
"<form class=\"sheet\" id=\"licform\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>Моя лицензия</h2>": [
"<form class=\"sheet\" id=\"licform\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>My licence</h2>",
"<form class=\"sheet\" id=\"licform\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>Licența mea</h2>",
"<form class=\"sheet\" id=\"licform\"><button type=\"button\" class=\"close\" data-act=\"close\">✕</button><h2>Mi licencia</h2>"
],
"<label>Номер лицензии<input name=\"num\" value=\"": [
"<label>Licence number<input name=\"num\" value=\"",
"<label>Numărul licenței<input name=\"num\" value=\"",
"<label>Número de licencia<input name=\"num\" value=\""
],
"<label>На чьё имя<input name=\"holder\" value=\"": [
"<label>Holder's name<input name=\"holder\" value=\"",
"<label>Pe numele cui<input name=\"holder\" value=\"",
"<label>Titular<input name=\"holder\" value=\""
],
"<label>Действует до<input name=\"until\" type=\"date\" value=\"": [
"<label>Valid until<input name=\"until\" type=\"date\" value=\"",
"<label>Valabilă până la<input name=\"until\" type=\"date\" value=\"",
"<label>Válida hasta<input name=\"until\" type=\"date\" value=\""
],
"<label>Фото лицевой стороны": [
"<label>Photo of the front",
"<label>Fotografia feței",
"<label>Foto del anverso"
],
" (сохранено, можно заменить)": [
" (saved, can be replaced)",
" (salvată, se poate înlocui)",
" (guardada, se puede cambiar)"
],
"<label>Фото обратной стороны (если есть)": [
"<label>Photo of the back (if any)",
"<label>Fotografia versoului (dacă există)",
"<label>Foto del reverso (si lo hay)"
],
" (сохранено)": [
" (saved)",
" (salvată)",
" (guardada)"
],
"<p class=\"muted\" style=\"font-size:13px\">Можно сделать скриншот лицензии из письма или PDF и выбрать его здесь.</p>": [
"<p class=\"muted\" style=\"font-size:13px\">You can take a screenshot of the licence from an email or PDF and pick it here.</p>",
"<p class=\"muted\" style=\"font-size:13px\">Puteți face o captură de ecran a licenței din e-mail sau PDF și s-o alegeți aici.</p>",
"<p class=\"muted\" style=\"font-size:13px\">Puede hacer una captura de la licencia desde el correo o el PDF y elegirla aquí.</p>"
],
"<button class=\"btn pri wide\">Сохранить</button>": [
"<button class=\"btn pri wide\">Save</button>",
"<button class=\"btn pri wide\">Salvează</button>",
"<button class=\"btn pri wide\">Guardar</button>"
],
"<button type=\"button\" class=\"link danger\" data-act=\"licdel\">Удалить лицензию</button>": [
"<button type=\"button\" class=\"link danger\" data-act=\"licdel\">Delete licence</button>",
"<button type=\"button\" class=\"link danger\" data-act=\"licdel\">Șterge licența</button>",
"<button type=\"button\" class=\"link danger\" data-act=\"licdel\">Eliminar licencia</button>"
],
"Выберите фото или скриншот, PDF не подходит": [
"Choose a photo or screenshot, PDF won't work",
"Alegeți o fotografie sau o captură de ecran, PDF nu merge",
"Elija una foto o captura, el PDF no sirve"
],
"Лицензия сохранена": [
"Licence saved",
"Licență salvată",
"Licencia guardada"
],
"<header class=\"top\"><h1>Ещё</h1></header>": [
"<header class=\"top\"><h1>More</h1></header>",
"<header class=\"top\"><h1>Mai mult</h1></header>",
"<header class=\"top\"><h1>Más</h1></header>"
],
"<div class=\"panel\"><h3>Уведомления</h3>": [
"<div class=\"panel\"><h3>Notifications</h3>",
"<div class=\"panel\"><h3>Notificări</h3>",
"<div class=\"panel\"><h3>Notificaciones</h3>"
],
"<p>Вечером (после 18:00) приложение напомнит, где завтра лучший шанс. Работает, когда приложение установлено на главный экран.</p>": [
"<p>In the evening (after 18:00) the app will tell you where tomorrow's best chance is. Works when the app is installed on the home screen.</p>",
"<p>Seara (după 18:00) aplicația vă spune unde e cea mai bună șansă mâine. Funcționează când aplicația e instalată pe ecranul principal.</p>",
"<p>Por la tarde (después de las 18:00) la app le dirá dónde hay más opciones mañana. Funciona con la app instalada en la pantalla de inicio.</p>"
],
"Выключить": [
"Turn off",
"Dezactivează",
"Desactivar"
],
"Включить уведомления": [
"Turn on notifications",
"Activează notificările",
"Activar notificaciones"
],
"<div class=\"panel\"><h3>Дом</h3><p>": [
"<div class=\"panel\"><h3>Home</h3><p>",
"<div class=\"panel\"><h3>Acasă</h3><p>",
"<div class=\"panel\"><h3>Casa</h3><p>"
],
"<button class=\"btn\" data-act=\"sethome\">Мой дом — там, где я сейчас</button></div>": [
"<button class=\"btn\" data-act=\"sethome\">My home is where I am now</button></div>",
"<button class=\"btn\" data-act=\"sethome\">Casa mea e unde sunt acum</button></div>",
"<button class=\"btn\" data-act=\"sethome\">Mi casa es donde estoy ahora</button></div>"
],
"<div class=\"panel\"><h3>Резервная копия</h3><p>Точки, журнал и фото в одном файле. Делайте копию раз в месяц.</p>": [
"<div class=\"panel\"><h3>Backup</h3><p>Spots, logbook and photos in one file. Make a copy once a month.</p>",
"<div class=\"panel\"><h3>Copie de rezervă</h3><p>Locuri, jurnal și fotografii într-un singur fișier. Faceți o copie o dată pe lună.</p>",
"<div class=\"panel\"><h3>Copia de seguridad</h3><p>Puntos, diario y fotos en un solo archivo. Haga una copia una vez al mes.</p>"
],
"<div class=\"btns\"><button class=\"btn\" data-act=\"export\">Сохранить файл</button><label class=\"btn\">Загрузить файл<input type=\"file\" accept=\".json,application/json\" id=\"importfile\" hidden></label></div></div>": [
"<div class=\"btns\"><button class=\"btn\" data-act=\"export\">Save file</button><label class=\"btn\">Load file<input type=\"file\" accept=\".json,application/json\" id=\"importfile\" hidden></label></div></div>",
"<div class=\"btns\"><button class=\"btn\" data-act=\"export\">Salvează fișierul</button><label class=\"btn\">Încarcă fișier<input type=\"file\" accept=\".json,application/json\" id=\"importfile\" hidden></label></div></div>",
"<div class=\"btns\"><button class=\"btn\" data-act=\"export\">Guardar archivo</button><label class=\"btn\">Cargar archivo<input type=\"file\" accept=\".json,application/json\" id=\"importfile\" hidden></label></div></div>"
],
"<div class=\"panel\"><h3>Скрытые точки</h3><p>": [
"<div class=\"panel\"><h3>Hidden spots</h3><p>",
"<div class=\"panel\"><h3>Locuri ascunse</h3><p>",
"<div class=\"panel\"><h3>Puntos ocultos</h3><p>"
],
" скрыто. <button class=\"link\" data-act=\"unhide\">Показать все</button>": [
" hidden. <button class=\"link\" data-act=\"unhide\">Show all</button>",
" ascunse. <button class=\"link\" data-act=\"unhide\">Arată toate</button>",
" ocultos. <button class=\"link\" data-act=\"unhide\">Mostrar todos</button>"
],
"Нет": [
"None",
"Niciunul",
"Ninguno"
],
"<div class=\"panel\"><h3>Правила и источники</h3><ul class=\"tips\">": [
"<div class=\"panel\"><h3>Rules and sources</h3><ul class=\"tips\">",
"<div class=\"panel\"><h3>Reguli și surse</h3><ul class=\"tips\">",
"<div class=\"panel\"><h3>Normas y fuentes</h3><ul class=\"tips\">"
],
"<li>Лицензия обязательна с 14 лет: 26,21 € на 3 года. <a target=\"_blank\" rel=\"noopener\" href=\"https://www.caib.es/seucaib/es/200/personas/tramites/tramite/96401\">Оформить</a></li>": [
"<li>Licence required from age 14: €26.21 for 3 years. <a target=\"_blank\" rel=\"noopener\" href=\"https://www.caib.es/seucaib/es/200/personas/tramites/tramite/96401\">Apply</a></li>",
"<li>Licența e obligatorie de la 14 ani: 26,21 € pentru 3 ani. <a target=\"_blank\" rel=\"noopener\" href=\"https://www.caib.es/seucaib/es/200/personas/tramites/tramite/96401\">Solicită</a></li>",
"<li>Licencia obligatoria desde los 14 años: 26,21 € por 3 años. <a target=\"_blank\" rel=\"noopener\" href=\"https://www.caib.es/seucaib/es/200/personas/tramites/tramite/96401\">Tramitar</a></li>"
],
"<li>До 2 удочек, до 6 крючков, 5 кг + 1 рыба в день, продажа запрещена.</li>": [
"<li>Up to 2 rods, up to 6 hooks, 5 kg + 1 fish per day, sale banned.</li>",
"<li>Până la 2 lansete, până la 6 cârlige, 5 kg + 1 pește pe zi, vânzarea interzisă.</li>",
"<li>Hasta 2 cañas, hasta 6 anzuelos, 5 kg + 1 pieza al día, prohibida la venta.</li>"
],
"<li>Пляжи 1 мая – 30 сен: нельзя с 7:00 до 22:00. Не ближе 100 м к купающимся и 250 м к сетям. Не в портах.</li>": [
"<li>Beaches 1 May – 30 Sep: not from 7:00 to 22:00. No closer than 100 m to swimmers and 250 m to nets. Not in harbours.</li>",
"<li>Plaje 1 mai – 30 sep: interzis între 7:00 și 22:00. Nu mai aproape de 100 m de înotători și 250 m de plase. Nu în porturi.</li>",
"<li>Playas 1 may – 30 sep: prohibido de 7:00 a 22:00. No a menos de 100 m de bañistas ni de 250 m de redes. No en puertos.</li>"
],
"\">Cuaderno de pesca recreativa 2026</a> · <a target=\"_blank\" rel=\"noopener\" href=\"https://www.caib.es/sites/reservesmarines/es/mapa/\">Карта заповедников</a></li>": [
"\">Cuaderno de pesca recreativa 2026</a> · <a target=\"_blank\" rel=\"noopener\" href=\"https://www.caib.es/sites/reservesmarines/es/mapa/\">Reserves map</a></li>",
"\">Cuaderno de pesca recreativa 2026</a> · <a target=\"_blank\" rel=\"noopener\" href=\"https://www.caib.es/sites/reservesmarines/es/mapa/\">Harta rezervațiilor</a></li>",
"\">Cuaderno de pesca recreativa 2026</a> · <a target=\"_blank\" rel=\"noopener\" href=\"https://www.caib.es/sites/reservesmarines/es/mapa/\">Mapa de reservas</a></li>"
],
"<li>Погода: Open-Meteo. Карта: OpenStreetMap.</li><li>Сомнения по заповедникам: 971 176 100.</li></ul></div>": [
"<li>Weather: Open-Meteo. Map: OpenStreetMap.</li><li>Reserve questions: 971 176 100.</li></ul></div>",
"<li>Vremea: Open-Meteo. Harta: OpenStreetMap.</li><li>Întrebări despre rezervații: 971 176 100.</li></ul></div>",
"<li>Tiempo: Open-Meteo. Mapa: OpenStreetMap.</li><li>Dudas sobre reservas: 971 176 100.</li></ul></div>"
],
"<p class=\"foot\">Рыбалка Майорка · версия 1.4 · данные хранятся только в этом телефоне.</p>": [
"<p class=\"foot\">Mallorca Fishing · version 1.4 · data is stored only on this phone.</p>",
"<p class=\"foot\">Pescuit Mallorca · versiunea 1.4 · datele sunt stocate doar pe acest telefon.</p>",
"<p class=\"foot\">Pesca Mallorca · versión 1.4 · los datos se guardan solo en este teléfono.</p>"
],
"Файл сохранён": [
"File saved",
"Fișier salvat",
"Archivo guardado"
],
"Файл сохранён в «Загрузки»": [
"File saved to “Downloads”",
"Fișier salvat în „Descărcări”",
"Archivo guardado en «Descargas»"
],
"Заменить текущие точки и журнал данными из файла?": [
"Replace current spots and logbook with data from the file?",
"Înlocuiți locurile și jurnalul actual cu datele din fișier?",
"¿Sustituir los puntos y el diario actuales por los datos del archivo?"
],
"Данные загружены": [
"Data loaded",
"Date încărcate",
"Datos cargados"
],
"Файл не подошёл": [
"File not suitable",
"Fișierul nu e potrivit",
"El archivo no es válido"
],
"Завтра лучше всего: ": [
"Best tomorrow: ",
"Mâine cel mai bine: ",
"Mañana lo mejor: "
],
" (оценка ": [
" (score ",
" (scor ",
" (nota "
],
"Рыбалка Майорка": [
"Mallorca Fishing",
"Pescuit Mallorca",
"Pesca Mallorca"
],
"Уведомления доступны только в установленном приложении": [
"Notifications only work in the installed app",
"Notificările funcționează doar în aplicația instalată",
"Las notificaciones solo funcionan en la app instalada"
],
"Разрешение не дано": [
"Permission not granted",
"Permisiune refuzată",
"Permiso no concedido"
],
"Уведомления включены": [
"Notifications on",
"Notificări activate",
"Notificaciones activadas"
],
"Коснитесь карты там, где ставите машину": [
"Tap the map where you park",
"Atingeți harta unde parcați",
"Toque el mapa donde aparca"
],
"Удалить точку?": [
"Delete spot?",
"Ștergeți locul?",
"¿Eliminar punto?"
],
"Точка скрыта (вернуть: «Ещё»)": [
"Spot hidden (restore: “More”)",
"Loc ascuns (restaurare: „Mai mult”)",
"Punto oculto (recuperar: «Más»)"
],
"Удалить запись?": [
"Delete entry?",
"Ștergeți înregistrarea?",
"¿Eliminar anotación?"
],
"Удалить лицензию из приложения?": [
"Delete licence from the app?",
"Ștergeți licența din aplicație?",
"¿Eliminar la licencia de la app?"
],
"Мой дом": [
"My home",
"Casa mea",
"Mi casa"
],
"Дом сохранён": [
"Home saved",
"Casă salvată",
"Casa guardada"
],
"Геолокация недоступна": [
"Geolocation unavailable",
"Geolocalizare indisponibilă",
"Geolocalización no disponible"
],
"Определяю место…": [
"Finding location…",
"Se determină locația…",
"Buscando ubicación…"
],
"Не удалось определить место. Включите GPS и разрешите доступ.": [
"Could not find location. Turn on GPS and allow access.",
"Locația nu a putut fi determinată. Porniți GPS-ul și permiteți accesul.",
"No se pudo obtener la ubicación. Active el GPS y permita el acceso."
],
" с ": [
" from ",
" de la ",
" desde "
],
"Где лучше": [
"Where",
"Unde",
"Dónde"
],
"Карта": [
"Map",
"Hartă",
"Mapa"
],
"Рыбы": [
"Fish",
"Pești",
"Peces"
],
"Журнал": [
"Log",
"Jurnal",
"Diario"
],
"Ещё": [
"More",
"Mai mult",
"Más"
]
};
  var I = {
    LANGS: LANGS,
    get lang() { return lang; }, set lang(v) { if (LANGS[v]) lang = v; },
    get locale() { return LANGS[lang]; },
    T: function (s) { if (lang === 'ru') return s; var v = D[s]; return v ? v[IDX[lang]] : s; }
  };
  root.I18N = I;
})(typeof self !== 'undefined' ? self : this);
