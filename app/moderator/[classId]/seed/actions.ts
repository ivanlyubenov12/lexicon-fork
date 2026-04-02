'use server'

import fs from 'fs'
import path from 'path'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { seedDefaultClass, buildLayoutFromQuestions, DEFAULT_POLLS } from '@/lib/templates/defaultSeed'

// ─── Avatar configuration ──────────────────────────────────────────────────────
// Set AVATARS_DIR to an absolute path on your machine that contains portrait
// images (jpg / jpeg / png / webp). Each seeded student gets one image assigned
// in round-robin order. Leave as '' to skip photo upload.
const AVATARS_DIR = '/Users/andreylyubenov/Desktop/lexicon_project/avatars'
// Name of the public Supabase Storage bucket where the images will be uploaded.
const SEED_PHOTOS_BUCKET = 'photos'

// ─── Student names pool ───────────────────────────────────────────────────────
// First and last names are combined randomly every seed run → unique names each time.

const FIRST_NAMES = [
  'Мария', 'Иван', 'София', 'Александър', 'Виктория', 'Никола', 'Елена',
  'Борис', 'Андреа', 'Константин', 'Калина', 'Мартин', 'Цветелина', 'Стефан',
  'Ралица', 'Димитър', 'Нора', 'Филип', 'Михаила', 'Валентин', 'Теодора',
  'Кристиян', 'Петя', 'Георги', 'Ива', 'Йордан', 'Симона', 'Емил', 'Деница',
  'Антон', 'Яна', 'Николай', 'Лора', 'Веселин', 'Радина', 'Момчил', 'Биляна',
  'Светослав', 'Габриела', 'Пламен', 'Камелия', 'Тихомир', 'Станислава',
]

const LAST_NAMES = [
  'Иванов', 'Петров', 'Димитров', 'Стоянов', 'Христов', 'Георгиев', 'Тодоров',
  'Маринов', 'Симеонов', 'Николов', 'Василев', 'Атанасов', 'Попов', 'Колев',
  'Митев', 'Йорданов', 'Стефанов', 'Кирилов', 'Петков', 'Бойчев', 'Минчев',
  'Лазаров', 'Ангелов', 'Ненов', 'Добрев', 'Манчев', 'Ковачев', 'Тончев',
  'Радев', 'Цветков', 'Панов', 'Борисов', 'Илиев', 'Тодоров', 'Христозов',
]

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomNames(count: number): { first: string; last: string }[] {
  const firsts = shuffled(FIRST_NAMES)
  const lasts  = shuffled(LAST_NAMES)
  return Array.from({ length: count }, (_, i) => ({
    first: firsts[i % firsts.length],
    last:  lasts[i  % lasts.length],
  }))
}

// ─── Generic fallback pool ────────────────────────────────────────────────────
// Used when no specific pool matches — still sounds like a real student answer.

const GENERIC_ANSWER_POOL: string[] = [
  'Мисля, че всичко е въпрос на гледна точка.',
  'Трудно е да избера само един отговор на това.',
  'Харесва ми да мисля за такива неща.',
  'Тази тема ме кара да се замисля много.',
  'Определено бих могъл/а да говоря часове по тази тема.',
  'За мен е важно да подходя с уважение и отвореност.',
  'Вярвам, че малките неща правят голяма разлика.',
  'Обичам да откривам нови неща — тук е същото.',
  'Ако трябва да избера, ще кажа: всичко зависи от ситуацията.',
  'Отговорът ми се е менял с времето — сега виждам нещата различно.',
  'Мисля, че най-важното е да бъдем честни.',
  'Едно от нещата, за които съм благодарен/на, е именно това.',
  'Смятам, че всеки трябва сам да открие отговора на това.',
  'За мен лично значи много.',
  'Правим грешки, но се учим — точно за това е животът.',
  'Когато помислям по-задълбочено, отговорът ми е ясен.',
  'Понякога мълчанието е по-красноречиво от думите.',
  'Ако мога да бъда откровен/а — много.',
  'Животът е твърде кратък за скучни отговори.',
  'Отговорът е прост: обичам и ценя.',
]

// ─── Superhero question pool ──────────────────────────────────────────────────

const SUPERHERO_POOL: string[] = [
  'Суперсилата ми е умението да карам хората да се усмихват.',
  'Ако имах суперсила, тя щеше да е телепатия.',
  'Бих искал/а да летя — да вижда света от птичи поглед.',
  'Моята суперсила е способността да слушам хората наистина.',
  'Телепортацията — за да мога да бъда навсякъде наведнъж.',
  'Умението да спирам времето, за да се наслаждавам на хубавите моменти.',
  'Да чета мислите на хората около мен.',
  'Да лекувам всяка болест с докосване.',
  'Да говоря на всички езици на света — и на животните.',
  'Невидимостта — за да наблюдавам света тихо.',
  'Суперсилата ми е да намирам решение на всеки проблем.',
  'Да виждам бъдещето — и да помагам на близките.',
  'Да клонирам себе си и да правя всичко наведнъж.',
  'Да нямам нужда от сън — повече часове за нещата, което обичам.',
  'Да управлявам природата — дъжд, слънце, вятър.',
  'Да трансформирам всичко негативно в положително.',
  'Да изцелявам всяка болка — физическа и душевна.',
  'Да пътувам в миналото и да уча от историята.',
  'Свръхчовешка памет — да помня всяко красиво мигове.',
  'Да превръщам конфликтите в разбирателство.',
]

// ─── Better-together pool ─────────────────────────────────────────────────────

const BETTER_TOGETHER_POOL: string[] = [
  'Когато сме заедно, трудностите стават по-малки.',
  'Нашият клас е като семейство — различни, но близки.',
  'Научих от съучениците си повече, отколкото очаквах.',
  'Най-хубавото в класа е, че всеки допринася по свой начин.',
  'Когато помагаме един на друг, всички ставаме по-силни.',
  'Разнообразието в нашия клас е наша сила.',
  'Заедно постигаме неща, които сами не можем.',
  'Харесва ми, че можем да се доверяваме един на друг.',
  'Нашият клас ме научи да бъда по-търпелив/а.',
  'Работата в екип е трудна, но резултатът е невероятен.',
  'Всеки от нас носи нещо специално в класа.',
  'По-добри сме, когато слушаме различни гледни точки.',
  'Приятелствата, родени тук, ще ни съпровождат цял живот.',
  'Класът ни е доказателство, че заедно правим чудеса.',
  'Научих се да ценя различията — те ни правят по-интересни.',
  'Взаимната подкрепа е основата на всичко, което сме постигнали.',
  'Когато някой в класа успее, радвам се като за себе си.',
  'Срещнах хора тук, с които ще бъда приятел/ка за цял живот.',
  'По-добре е да направим нещо заедно, дори да е по-трудно.',
  'Учим се заедно — и от успехите, и от грешките.',
]

// ─── Answer pools per question text ──────────────────────────────────────────
// Each pool should have ≥20 items so every student gets a unique answer.

const ANSWER_POOLS: Record<string, string[]> = {
  'Ако бях животно, щях да бъда:': [
    'Делфин — умен, игрив и обича да е с приятели.',
    'Орел — свободен и вижда всичко отгоре.',
    'Котка — независима, но пълна с любов за избраните.',
    'Куче — верен и винаги щастлив да вижда близките.',
    'Лисица — хитра и любопитна към всичко.',
    'Леопард — елегантен, бърз и тих.',
    'Папагал — обича да говори и да имитира.',
    'Вълк — силен и верен на своята глутница.',
    'Прилеп — нощна птица с особено чувство за ориентация.',
    'Слон — добра памет и грижа за семейството.',
    'Пингвин — малко несръчен, но много сладък.',
    'Хамелеон — умее да се приспособява навсякъде.',
    'Тигър — смел и самоуверен.',
    'Жираф — вижда надалеч и е над всички.',
    'Бухал — мъдър и наблюдателен.',
    'Катерица — енергична и пести всичко за по-късно.',
    'Кит — спокоен, дълбок и пътува далеч.',
    'Колибри — малък, но невероятно бърз.',
    'Лъв — роден лидер с голямо сърце.',
    'Медуза — мистериозна и светеща в тъмното.',
  ],
  'Ако имах вълшебна пръчка, щях да:': [
    'Направя да няма болести по света.',
    'Дам на всяко дете на планетата дом и храна.',
    'Спра замърсяването на океаните веднага.',
    'Науча всички езици на света за миг.',
    'Направя домашните да се пишат сами.',
    'Спра войните по целия свят.',
    'Дам способност на всеки човек да лети.',
    'Направя зоопарковете ненужни — животните свободни.',
    'Върна изчезналите животински видове.',
    'Направя дните по-дълги с още 4 часа.',
    'Дам дар на музика на всеки, който мечтае за него.',
    'Изградя библиотека с всяка книга, написана някога.',
    'Направя пластмасата да изчезне от природата.',
    'Преведа всички книги на всички езици.',
    'Дам на всеки човек по едно дърво да посади.',
    'Направя слънцето да грее и вали само когато е нужно.',
    'Създам приложение, което предотвратява лъжите.',
    'Съградя мост между всяка страна в света.',
    'Направя всяко дете да може да ходи на училище.',
    'Спра гладуването на всеки на Земята.',
  ],
  'Най-хубавото в приятелството е:': [
    'Да знаеш, че винаги има някой за теб.',
    'Смехът, който не можеш да обясниш на другите.',
    'Да можеш да бъдеш себе си без маски.',
    'Споделените тайни, които ви свързват завинаги.',
    'Да има кой да те подкрепи в лошите дни.',
    'Безусловното приемане — и хубавите, и лошите ти страни.',
    'Споделените спомени, за които се смеете и след години.',
    'Да знаеш, че грешките ти ще бъдат простени.',
    'Честността — истинският приятел ти казва и неудобното.',
    'Да имаш кой да те изслуша без да те осъжда.',
    'Дребните жестове — съобщение точно когато ти трябва.',
    'Заедно дори скучното да е забавно.',
    'Подкрепата, когато се съмняваш в себе си.',
    'Да расте заедно с теб и да те разбира.',
    'Да имаш кой да сподели пицата с теб в петък вечер.',
    'Тишината, която не е неудобна.',
    'Да те защити пред другите.',
    'Общите интереси, за които часове наред говорите.',
    'Доверието — можеш да му кажеш всичко.',
    'Чувството, че не си сам в нищо.',
  ],
  'Моята тайна суперсила е:': [
    'Умея да разсмивам всеки, дори когато е тъжен.',
    'Запомням абсолютно всичко, което прочета веднъж.',
    'Мога да успокоявам животни — те ме слушат!',
    'Намирам изгубени неща на всички около мен.',
    'Готвя страхотно и всички просят рецептите ми.',
    'Усещам кога някой е тъжен, преди да го е казал.',
    'Уча нови неща изключително бързо.',
    'Никога не се губя, дори в непознат град.',
    'Мога да рисувам портрет за под 5 минути.',
    'Имам страхотна памет за имена и лица.',
    'Разбирам животни — те ме следват навсякъде.',
    'Измислям смешни истории на момента.',
    'Успявам да помиря карещи се приятели.',
    'Свиря на всеки инструмент само с ухото.',
    'Мога да се събудя без будилник точно навреме.',
    'Решавам математически задачи в главата си.',
    'Правя перфектни снимки от пръв опит.',
    'Умея да разчитам хора само по погледа.',
    'Организирам всичко идеално — никога не закъснявам.',
    'Намирам четирилистна детелина навсякъде!',
  ],
  'Мечтая да отида:': [
    'в Япония', 'в Исландия', 'в Нова Зеландия', 'в Канада', 'в Норвегия',
    'в Австралия', 'в Бразилия', 'в Перу', 'в Египет', 'в Индия',
    'в Гърция', 'в Ирландия', 'в Шотландия', 'в Швейцария', 'в Португалия',
    'в Тайланд', 'в Аржентина', 'в Мароко', 'във Финландия', 'в Мексико',
  ],
  'Най-интересният ден тази година беше:': [
    'Денят на екскурзията — никога няма да го забравя.',
    'Когато направихме театрален спектакъл пред родителите.',
    'Ден на науката — правехме експерименти.',
    'Когато спечелихме математическото състезание.',
    'Денят, когато класът ни победи на спортния турнир.',
    'Когато гост-лектор ни разказа за Космоса.',
    'Денят на посещение в исторически музей.',
    'Когато изненадахме учителката за рождения й ден.',
    'Денят на четене на открито в парка.',
    'Когато заснехме наш кратък филм за конкурса.',
    'Посещението в планетариума.',
    'Когато направихме собствен журнал на класа.',
    'Денят на международната кухня — ядохме от всички страни.',
    'Когато организирахме благотворителен базар.',
    'Денят на лагера — палатки и звезди.',
    'Когато поканихме родители да ни разкажат за професиите си.',
    'Денят на дебата — говорихме за климата.',
    'Когато правихме биологична градина в двора.',
    'Посещението в съдебна зала за урок по право.',
    'Денят, когато спечелихме конкурс за рисунка.',
  ],
  'Представи си, че можеш да си учител за един ден. Какво щеше да направиш?': [
    'Проведа целия час навън в природата.',
    'Направя урока изцяло с игри и викторини.',
    'Позволя на децата да учат каквото искат.',
    'Донеса домашни любимци в клас.',
    'Направя кино-час с образователен филм.',
    'Замести урока с готвене на традиционно ястие.',
    'Организирам ролева игра с исторически личности.',
    'Проведа математика само с пъзели.',
    'Напиша послания на всяко дете за силните му страни.',
    'Изведа класа на посещение в интересно място.',
    'Позволя на децата да бъдат учителите.',
    'Направя ден без оценки — само учене от любопитство.',
    'Разкажа за нещо, за което никой не пита в учебника.',
    'Организирам STEM предизвикателство за целия час.',
    'Направя нещо артистично с цялата класна стая.',
    'Покажа как науката е навсякъде около нас.',
    'Проведа урок по медитация и концентрация.',
    'Нарисуваме заедно голяма картина на класа.',
    'Разкажа историята на нашия град.',
    'Организирам дебат за важна тема за децата.',
  ],
}

// ─── Class voice answer pools ─────────────────────────────────────────────────

const VOICE_POOLS: Record<string, string[]> = {
  // Matches DEFAULT_QUESTIONS order_index 0
  'Най-любимият ми предмет в училище е': [
    'математика', 'биология', 'литература', 'история', 'физика',
    'химия', 'изобразително', 'музика', 'физическо', 'информатика',
    'география', 'английски', 'немски', 'философия', 'психология',
    'астрономия', 'технологии', 'гражданско образование', 'природни науки', 'театрално изкуство',
  ],
  // Matches DEFAULT_QUESTIONS order_index 1
  'А най-трудният е': [
    'химия', 'физика', 'математика', 'граматика', 'история',
    'биология', 'немски', 'тригонометрия', 'алгебра', 'стереометрия',
    'органична химия', 'руски', 'география', 'философия', 'статистика',
    'латински', 'интеграли', 'физическо', 'теоретична физика', 'морфология',
  ],
  // Matches DEFAULT_QUESTIONS order_index 2
  'Какъв е нашият клас? Опиши го с две или три думи': [
    'весел и приятелски', 'шумен и забавен', 'сплотен', 'креативен', 'приятелски',
    'любопитен', 'енергичен', 'мили и дружни', 'спортен', 'интелигентен',
    'приключенски', 'задружен', 'вдъхновяващ', 'весел и смешен', 'отговорен',
    'уникален', 'добродушен', 'хумористичен', 'активен', 'топъл',
  ],
  // Matches DEFAULT_QUESTIONS order_index 3
  'В междучасията най-често:': [
    'си говорим', 'играем на телефона', 'ядем', 'тичаме из коридора', 'решаваме задачи',
    'слушаме музика', 'рисуваме', 'четем', 'играем карти', 'гледаме клипчета',
    'правим домашни', 'спорим за нещо', 'смеем се', 'пием вода', 'стоим на двора',
    'танцуваме', 'дремем', 'говорим с учителя', 'пишем си', 'правим снимки',
  ],
  // Matches DEFAULT_QUESTIONS order_index 4
  'Каква суперсила има класният/класната?': [
    'търпение', 'добра памет', 'усмивката й', 'справедливост', 'чувство за хумор',
    'умее да обяснява', 'строгост в точния момент', 'обича ни искрено', 'не се ядосва лесно', 'вдъхновява ни',
    'всезнание', 'усеща кога ни е лошо', 'умее да слуша', 'отдаденост', 'положителна енергия',
    'твърдост', 'мъдрост', 'организираност', 'креативност', 'безкрайно търпение',
  ],
}

// ─── Events pool ──────────────────────────────────────────────────────────────

const EVENTS_POOL = [
  { title: 'Тържествено начало на учебната година',    event_date: '2024-09-16', note: 'Срещнахме се отново след лятото — нови лица, нови мечти, старо приятелство.' },
  { title: 'Есенна разходка в природата',              event_date: '2024-10-18', note: 'Берахме листа и правихме хербарий. Природата ни показа стотици цветове.' },
  { title: 'Хелоуин в клас',                           event_date: '2024-10-31', note: 'Маски, тиква и много смях — учителката също се маскира!' },
  { title: 'Коледен концерт',                          event_date: '2024-12-18', note: 'Изпяхме коледни песни пред родителите. Залата беше украсена с хиляди светлинки.' },
  { title: 'Нова година — класно парти',               event_date: '2024-12-20', note: 'Изпроводихме годината заедно — с торта, балони и списък с мечти за 2025.' },
  { title: 'Ден на влюбените — послания в клас',       event_date: '2025-02-14', note: 'Всеки написа тайно послание за класа. Прочетохме ги на глас и се разплакахме от смях.' },
  { title: 'Пролетна екскурзия',                       event_date: '2025-04-10', note: 'Посетихме природен парк. Вървяхме по екопътека и видяхме реален водопад.' },
  { title: 'Ден на Земята',                            event_date: '2025-04-22', note: 'Засадихме дръвчета в двора на училището. Нашата малка гора вече расте.' },
  { title: 'Ден на таланта',                           event_date: '2025-05-23', note: 'Рисуване, пеене, жонглиране, оригами — всеки показа по нещо своё. Незабравимо!' },
  { title: 'Последен учебен ден',                      event_date: '2025-06-13', note: 'Прегръдки, сълзи и смях. Обещахме си да се помним за цял живот.' },
]

// ─── Event comment pools (per event title) ────────────────────────────────────

const EVENT_COMMENT_POOL: string[] = [
  'Беше невероятно! Никога няма да го забравя.',
  'Толкова се смяхме — един от най-добрите дни в годината.',
  'Много се радвам, че бяхме заедно на това.',
  'Снимките не предават колко хубаво беше всъщност.',
  'Мечтая пак да се върнем тук!',
  'Класното беше в свои води тоя ден 😄',
  'Помня го сякаш беше вчера.',
  'Определено топ момент за мен тази година.',
  'Дори времето ни помогна — беше перфектен ден.',
  'Обичам нашия клас точно заради такива дни!',
  'Трябваше да останем още малко...',
  'Поне сто снимки направих — и пак малко.',
  'Тоя ден ме зареди с енергия за цял месец.',
  'Най-готиното беше, когато всички се смяхме заедно.',
  'Чакам следващия такъв момент с нетърпение.',
  'Беше по-хубаво отколкото очаквах.',
  'Не ми се вярва колко бързо мина.',
  'Благодаря на всички, че го направихме толкова специално.',
  'Ще ми липсва това, когато завършим.',
  'Едно от нещата, заради които обичам нашия клас.',
]

// ─── Peer messages pool ───────────────────────────────────────────────────────

const MESSAGES = [
  'Ти си страхотен/страхотна съученик! Винаги ни разсмиваш в точния момент.',
  'Благодаря ти, че винаги ми помагаш, когато имам нужда. Истински приятел/приятелка!',
  'Много ми харесва твоята усмивка — правиш класа по-светъл само с присъствието си.',
  'Ти си един от най-добрите хора, которе познавам. Радвам се, че сме в един клас.',
  'Много те уважавам — честен/честна и справедлив/справедлива с всички.',
  'Твоята енергия прави всяко занятие по-интересно. Не се променяй!',
  'Благодаря ти, че ме изслуша, когато ми беше трудно. Помогна ми много.',
  'С теб учението е по-лесно и по-забавно. Надявам се да продължим да сме приятели.',
  'Обичам твоето чувство за хумор — без теб класът щеше да е наполовина по-тъп.',
  'Винаги си там за хората около теб. Рядко срещан талант!',
  'Напомняш ми да не се отказвам. Благодаря за тихата подкрепа.',
  'С теб дори понеделникът изглежда поносим!',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickRoundRobin<T>(pool: T[], index: number): T {
  return pool[index % pool.length]
}

function getAnswerPool(q: { text: string; type: string }): string[] {
  if (ANSWER_POOLS[q.text]) return ANSWER_POOLS[q.text]
  if (q.type === 'superhero')      return SUPERHERO_POOL
  if (q.type === 'better_together') return BETTER_TOGETHER_POOL
  return GENERIC_ANSWER_POOL
}

// ─── seedDummyData ────────────────────────────────────────────────────────────

export async function seedDummyData(
  classId: string,
  studentCount: number,
): Promise<{ error: string | null }> {
  const admin = createServiceRoleClient()
  const count = Math.min(Math.max(studentCount, 1), 20)

  try {
    // 1. Ensure class has questions + polls + layout (idempotent via re-seed)
    //    Only re-seed if there are no questions yet.
    const { data: existingQs } = await admin
      .from('questions')
      .select('id, text, type, allows_text, voice_display, order_index')
      .eq('class_id', classId)
      .eq('is_system', false)

    let questions = existingQs ?? []

    if (questions.length === 0) {
      // Class was created without seedDefaultClass → seed it now
      const { blocks: newBlocks, error: seedErr } = await seedDefaultClass(classId, admin)
      if (seedErr) return { error: seedErr }
      if (newBlocks.length > 0) {
        await admin.from('classes').update({ layout: newBlocks }).eq('id', classId)
      }
      const { data: freshQs } = await admin
        .from('questions')
        .select('id, text, type, allows_text, voice_display, order_index')
        .eq('class_id', classId)
        .eq('is_system', false)
      questions = freshQs ?? []
    } else {
      // Questions exist — deduplicate by text (keep lowest order_index, delete rest + their answers)
      const seenTexts = new Map<string, string>() // text → kept id
      const toDelete: string[] = []
      for (const q of [...questions].sort((a, b) => a.order_index - b.order_index)) {
        if (seenTexts.has(q.text)) {
          toDelete.push(q.id)
        } else {
          seenTexts.set(q.text, q.id)
        }
      }
      if (toDelete.length > 0) {
        await admin.from('answers').delete().in('question_id', toDelete)
        await admin.from('class_voice_answers').delete().in('question_id', toDelete)
        await admin.from('questions').delete().in('id', toDelete)
        questions = questions.filter(q => !toDelete.includes(q.id))
      }

      // Ensure polls exist — create defaults if missing
      const { data: existingPolls } = await admin
        .from('class_polls')
        .select('id, order_index')
        .eq('class_id', classId)
        .order('order_index')
      let polls = existingPolls ?? []
      if (polls.length === 0) {
        const { data: newPolls } = await admin
          .from('class_polls')
          .insert(DEFAULT_POLLS.map(p => ({ ...p, class_id: classId })))
          .select('id, order_index')
        polls = newPolls ?? []
      }

      // Always rebuild layout from current (deduped) questions + polls
      const layout = buildLayoutFromQuestions(questions, polls)
      if (layout.length > 0) {
        await admin.from('classes').update({ layout }).eq('id', classId)
      }
    }

    // 1b. Ensure featured questions are marked is_featured (idempotent)
    const FEATURED_TEXTS = [
      'Ако бях животно, щях да бъда:',
      'Ако имах вълшебна пръчка, щях да:',
      'Моята тайна суперсила е:',
    ]
    const featuredIds = questions
      .filter(q => FEATURED_TEXTS.includes(q.text))
      .map(q => q.id)
    if (featuredIds.length > 0) {
      await admin.from('questions').update({ is_featured: true }).in('id', featuredIds)
    }

    // 2. Create students
    const studentRows = randomNames(count).map(({ first, last }) => ({
      class_id: classId,
      first_name: first,
      last_name: last,
      invite_accepted_at: new Date().toISOString(),
      is_seed: true,
    }))
    const { data: students, error: sErr } = await admin
      .from('students')
      .insert(studentRows)
      .select('id, first_name, last_name')
    if (sErr) return { error: sErr.message }

    const allStudents = students ?? []

    // 2a. Upload avatar images from local folder (round-robin per student)
    if (AVATARS_DIR) {
      const avatarFiles = fs.existsSync(AVATARS_DIR)
        ? fs.readdirSync(AVATARS_DIR)
            .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f))
            .sort()
        : []

      console.log(`[seed] avatars dir: ${AVATARS_DIR}, found ${avatarFiles.length} files:`, avatarFiles)

      if (avatarFiles.length > 0) {
        // Ensure bucket exists (create if missing)
        const { data: buckets } = await admin.storage.listBuckets()
        const bucketExists = (buckets ?? []).some(b => b.name === SEED_PHOTOS_BUCKET)
        if (!bucketExists) {
          const { error: createErr } = await admin.storage.createBucket(SEED_PHOTOS_BUCKET, { public: true })
          if (createErr) {
            console.error('[seed] Could not create bucket:', createErr.message)
          } else {
            console.log(`[seed] Created public bucket "${SEED_PHOTOS_BUCKET}"`)
          }
        }

        await Promise.all(allStudents.map(async (student, si) => {
          const file = avatarFiles[si % avatarFiles.length]
          const ext  = path.extname(file).toLowerCase()
          const mime = ext === '.png'  ? 'image/png'
                     : ext === '.webp' ? 'image/webp'
                     : ext === '.gif'  ? 'image/gif'
                     : 'image/jpeg'
          const buffer      = fs.readFileSync(path.join(AVATARS_DIR, file))
          const storagePath = `seed/${classId}/${student.id}${ext}`

          const { error: upErr } = await admin.storage
            .from(SEED_PHOTOS_BUCKET)
            .upload(storagePath, buffer, { contentType: mime, upsert: true })

          if (upErr) {
            console.error(`[seed] Upload failed for ${student.first_name} (${file}):`, upErr.message)
          } else {
            const { data: { publicUrl } } = admin.storage
              .from(SEED_PHOTOS_BUCKET)
              .getPublicUrl(storagePath)
            console.log(`[seed] Uploaded ${file} → ${publicUrl}`)
            await admin.from('students').update({ photo_url: publicUrl }).eq('id', student.id)
          }
        }))
      }
    }

    // 3. Answers for all questions
    const textQs  = questions.filter(q => q.allows_text && q.type !== 'survey')
    const videoQs = questions.filter(q => q.type === 'video')

    // Sample video URLs — round-robin per student
    const SAMPLE_VIDEOS = [
      'https://res.cloudinary.com/demo/video/upload/dog.mp4',
      'https://res.cloudinary.com/demo/video/upload/cat.mp4',
      'https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4',
    ]

    // Shuffle each question's pool independently so answers differ per question
    const textAnswerRows = textQs.flatMap(q => {
      const pool = shuffled(getAnswerPool(q))
      return allStudents.map((student, si) => ({
        student_id: student.id,
        question_id: q.id,
        text_content: pool[si % pool.length],
        status: 'approved',
      }))
    })
    const videoAnswerRows = videoQs.flatMap(q => {
      const pool = shuffled(SAMPLE_VIDEOS)
      return allStudents.map((student, si) => ({
        student_id: student.id,
        question_id: q.id,
        media_url: pool[si % pool.length],
        media_type: 'video',
        status: 'approved',
      }))
    })
    const answerRows = [...textAnswerRows, ...videoAnswerRows]
    if (answerRows.length > 0) {
      const { error: aErr } = await admin.from('answers').insert(answerRows)
      if (aErr) return { error: aErr.message }
    }

    // 4. Class voice answers
    // Determine which VOICE_POOLS key to use, falling back by voice_display type
    const BARCHART_FALLBACK_POOLS = [
      VOICE_POOLS['Най-любимият ми предмет в училище е'],
      VOICE_POOLS['А най-трудният е'],
    ]
    const WORDCLOUD_FALLBACK_POOLS = [
      VOICE_POOLS['Какъв е нашият клас? Опиши го с две или три думи'],
      VOICE_POOLS['В междучасията най-често:'],
      VOICE_POOLS['Каква суперсила има класният/класната?'],
    ]
    let barchartFallbackIdx = 0
    let wordcloudFallbackIdx = 0

    const voiceQs = questions.filter(q => q.type === 'survey' && q.voice_display != null)
    const voiceRows = voiceQs.flatMap(q => {
      let pool = VOICE_POOLS[q.text]
      if (!pool) {
        const display = (q.voice_display as string | null) ?? ((q.order_index ?? 99) <= 1 ? 'barchart' : 'wordcloud')
        if (display === 'barchart') {
          pool = BARCHART_FALLBACK_POOLS[barchartFallbackIdx++ % BARCHART_FALLBACK_POOLS.length]
        } else {
          pool = WORDCLOUD_FALLBACK_POOLS[wordcloudFallbackIdx++ % WORDCLOUD_FALLBACK_POOLS.length]
        }
      }
      const shuffledPool = shuffled(pool)
      return allStudents.map((_, si) => ({
        class_id: classId,
        question_id: q.id,
        content: shuffledPool[si % shuffledPool.length],
      }))
    })
    if (voiceRows.length > 0) {
      await admin.from('class_voice_answers').insert(voiceRows)
    }

    // 5. Event comments — each dummy student comments on every existing event
    const { data: allEvents } = await admin
      .from('events')
      .select('id')
      .eq('class_id', classId)

    if ((allEvents ?? []).length > 0 && allStudents.length > 0) {
      // Shuffle comment pool per event so students get different comments per event
      const commentRows = (allEvents ?? []).flatMap(event => {
        const pool = shuffled(EVENT_COMMENT_POOL)
        return allStudents.map((student, si) => ({
          event_id: event.id,
          student_id: student.id,
          comment_text: pool[si % pool.length],
        }))
      })
      const { error: ecErr } = await admin.from('event_comments').insert(commentRows)
      if (ecErr) return { error: `event_comments: ${ecErr.message}` }
    }

    // 6. Poll votes — use existing polls, fall back to none
    const { data: polls } = await admin
      .from('class_polls')
      .select('id')
      .eq('class_id', classId)

    if ((polls ?? []).length > 0 && allStudents.length > 1) {
      const voteRows = (polls ?? []).flatMap((poll, pi) =>
        allStudents.map((voter, vi) => {
          const offset = (pi + 1 + vi) % allStudents.length
          const nominee = allStudents[offset === vi ? (offset + 1) % allStudents.length : offset]
          return {
            poll_id: poll.id,
            voter_student_id: voter.id,
            nominee_student_id: nominee.id,
          }
        })
      )
      await admin.from('class_poll_votes').insert(voteRows)
    }

    // 7. Peer messages — 3 per student
    if (allStudents.length > 1) {
      const msgRows = allStudents.flatMap((recipient, ri) =>
        [0, 1, 2].map(j => {
          const authorIdx = (ri + j + 1) % allStudents.length
          return {
            recipient_student_id: recipient.id,
            author_student_id: allStudents[authorIdx].id,
            content: pickRoundRobin(MESSAGES, ri * 3 + j),
            status: 'approved',
          }
        })
      )
      await admin.from('peer_messages').insert(msgRows)
    }

    revalidatePath(`/moderator/${classId}`)
    revalidatePath(`/lexicon/${classId}`)
    return { error: null }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Неочаквана грешка' }
  }
}

// ─── clearClassData ───────────────────────────────────────────────────────────

export async function clearClassData(classId: string): Promise<{ error: string | null }> {
  const admin = createServiceRoleClient()
  try {
    // Only delete seed (dummy) students — real profiles, questionnaire, polls,
    // questions, events are all preserved.
    const { data: seedStudents } = await admin
      .from('students')
      .select('id')
      .eq('class_id', classId)
      .eq('is_seed', true)

    if (seedStudents && seedStudents.length > 0) {
      const ids = seedStudents.map(s => s.id)

      // Delete class_voice_answers submitted by seed students (not cascade-linked to student)
      await admin.from('class_voice_answers').delete().eq('class_id', classId).in('student_id', ids)

      // Delete seed student rows — cascade removes answers, poll votes, peer messages
      await admin.from('students').delete().eq('class_id', classId).eq('is_seed', true)
    }

    revalidatePath(`/moderator/${classId}`)
    revalidatePath(`/lexicon/${classId}`)
    return { error: null }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Неочаквана грешка' }
  }
}
