-- ─────────────────────────────────────────────────────────────────────────────
-- TsStark Academy — seed.
--
-- Four published courses and one draft, with real Mongolian titles, decks and
-- lesson bodies at realistic lengths. The point of a seed is to let us judge
-- the layout honestly before anyone has written a word of content: long
-- compound headlines that stress a card's measure, a course with fewer lessons
-- than its grid has rows, a draft that only the admin can see, and one free
-- course so the self-enrolment path (000300) is exercised by something.
--
-- Idempotent: every insert upserts on the primary key, so re-running it over a
-- database that already holds this content updates it in place. Ids are fixed
-- and readable for exactly that reason.
--
--   1xxxxxxx  courses      2xxxxxxx  modules
--   3xxxxxxx  lessons      4xxxxxxx  quiz questions
--
-- No users here. Accounts come from Supabase Auth; SETUP.md step 6 is how the
-- first one becomes an admin.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Courses ──────────────────────────────────────────────────────────────────
insert into public.courses
  (id, slug, title_mn, title_en, summary_mn, summary_en, description_mn, description_en,
   level, topic, is_free, is_published, rank, cover_url)
values
  ('10000000-0000-4000-8000-000000000001', 'tanilcuulga',
   'Танилцуулга хичээл',
   'Getting started',
   'Код гэж юу вэ, юун дээр ажилладаг вэ, ард нь юу байдаг вэ — эхнээс нь.',
   'What code is, what it runs on, and what sits behind it — from the beginning.',
   $md$Код бичиж үзээгүй хүн хамгийн түрүүнд эндээс эхэлнэ. Долоон хичээл, төгсгөлд нь арван асуулттай шалгалт.

Эхний гурав нь кодын тухай: код гэж юу вэ, хэрхэн ажилладаг вэ, энэ сургуульд ямар хэрэгсэл ашиглаж сурах вэ.

Дараагийн дөрөв нь ард нь байдаг зүйлсийн тухай: Claude-ыг багш болгож ашиглах нь, сервер гэж юу вэ, өгөгдлийн сан гэж юу вэ, яагаад GitHub хамгийн чухал нь вэ.

Энэ сургалт үнэгүй. Бүртгүүлээд шууд үзэж болно.$md$,
   $md$Seven lessons for somebody who has never written code, and a ten-question exam at the end.

The first three are about code itself; the last four are about what sits behind it — Claude as a teacher, servers, databases, and why GitHub matters most.

This course is free.$md$,
   'beginner', 'general', true, true, 1,
   'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=70'),

  ('10000000-0000-4000-8000-000000000002', 'code-suuri',
   'Кодын суурь',
   'Programming fundamentals',
   'Кодын үндсэн ойлголтуудыг ойлгож, хүссэнээ тодорхой захиалж, гарсан үр дүнг шалгаж сурна.',
   'Understand what code is made of, ask for what you want, and check what comes back.',
   $md$Код бичихгүй. Гэхдээ код юунаас бүрддэгийг мэдэхгүйгээр захиалж ч чадахгүй.

Энэ сургалт таван ойлголтыг нэг нэгээр нь тайлбарлана: хувьсагч, нөхцөл, давталт, функц, өгөгдлийн хэлбэр. Дараа нь тэднийг хэрхэн промпт болгож бичих, гарсан үр дүнг хэрхэн унших, юуг нь заавал шалгахыг үзнэ.

Төгсгөлд нь бүтэн жижиг төслийг эхнээс нь дуустал захиалж хийнэ — юу асуусан, юу гарсан, юуг нь зассан бүгдийг харуулна.$md$,
   null,
   'beginner', 'prompt', false, true, 2,
   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=70'),

  ('10000000-0000-4000-8000-000000000003', 'landing-page',
   'Landing page хийж сурах нь',
   'Building a landing page',
   'HTML, CSS хоёроор бодит хуудас зохиож, утсанд тохируулж, интернэтэд байршуулна.',
   'Design a real page with HTML and CSS, make it work on a phone, and publish it.',
   $md$Хамгийн эхний бодит үр дүн. Төгсөхдөө та интернэтэд байрласан, утсан дээр зөв харагддаг хуудастай болно — тэр холбоосыг ажлын анкет, нийгмийн сүлжээнийхээ танилцуулгад тавьж болно.

Зөвхөн таг цээжлэхгүй: яагаад хайрцаг 340px болчихдог, яагаад утсан дээр бүх зүйл жижигхэн харагддаг зэрэг эхлэгч бүрийн тулгардаг зүйлсийг нэр заан тайлбарлана.$md$,
   $md$The first real result. You finish with a page that is live on the internet and correct on a phone — a link you can put in a job application.$md$,
   'beginner', 'web', false, true, 3,
   'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=70'),

  ('10000000-0000-4000-8000-000000000004', 'fullstack',
   'Fullstack website хийж сурах нь',
   'Building a fullstack website',
   'React, Next.js, Supabase, TypeScript — өгөгдлийн сан, нэвтрэлттэй бүтэн аппликейшн.',
   'React, Next.js, Supabase and TypeScript — a real app with a database and sign-in.',
   $md$Хуудас биш, аппликейшн. Хэрэглэгч бүртгүүлж, нэвтэрч, өөрийн өгөгдөлтэй болдог бүтэн систем хэрхэн угсрагддагийг эхнээс нь дуустал үзнэ.

React-ийн сэтгэлгээнээс эхэлж, Next.js-ийн App Router руу шилжээд, Supabase холбож, эцэст нь Vercel дээр гаргана. Сүүлийн модульд TypeScript-ийг нэмж, том код баазыг яаж аюулгүй байлгахыг үзнэ.$md$,
   null,
   'intermediate', 'react', false, true, 4,
   'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=70'),

  ('10000000-0000-4000-8000-000000000005', 'mobile-app',
   'iOS, Android аппликейшн хийж сурах нь',
   'Building an iOS and Android app',
   'Expo ба React Native-ээр нэг кодоос хоёр дэлгүүрт гардаг апп бүтээнэ.',
   'One codebase, both stores — with Expo and React Native.',
   $md$Вэб мэддэг хүн утасны апп бичиж чадна. React Native нь ижил React, зөвхөн `div` биш `View`, `p` биш `Text` бичдэг.

Expo-гоор эхэлж, өөрийн утсан дээрээ шууд туршина. Хуудас хооронд шилжих, өгөгдөл татах, төхөөрөмжийн боломжуудыг ашиглах, эцэст нь App Store болон Play Store-д гаргах хүртэлх зам.

**Урьдчилсан нөхцөл**: «Fullstack website» сургалтыг эсвэл React-ийн мэдлэгтэй байх.$md$,
   null,
   'advanced', 'mobile', false, true, 5,
   'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=70'),

  ('10000000-0000-4000-8000-000000000006', 'toglom',
   '2D, 3D тоглоом хийж сурах нь',
   'Building 2D and 3D games',
   'Canvas дээрх эхний тоглоомоос Three.js-ийн гурван хэмжээст ертөнц хүртэл.',
   'From a first game on a canvas to a three-dimensional world with Three.js.',
   $md$Тоглоом бол програмчлалыг хамгийн шууд харуулдаг зүйл. Кодоо өөрчлөхөд дэлгэц дээр юу болсныг тэр дороо хардаг — алдаа ч мөн адил ил гарна.

Эхлээд Canvas дээр хоёр хэмжээстээр эхэлнэ: зурах, хөдөлгөх, товчлуурт хариу үзүүлэх, мөргөлдөөн шалгах. Эдгээр нь ямар ч тоглоомын араг яс.

Дараа нь Three.js-ээр гурван хэмжээст рүү орно — камер, гэрэл, материал гэж юу болох, яагаад таны бүтээсэн дүрс хар өнгөтэй харагдаж байгааг ойлгоно.

**Урьдчилсан нөхцөл**: «Кодын суурь» сургалт, эсвэл JavaScript-ийн функц, объект, массивыг мэддэг байх.$md$,
   null,
   'intermediate', 'games', false, true, 6,
   'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&q=70')
on conflict (id) do update set
  slug = excluded.slug,
  title_mn = excluded.title_mn, title_en = excluded.title_en,
  summary_mn = excluded.summary_mn, summary_en = excluded.summary_en,
  description_mn = excluded.description_mn, description_en = excluded.description_en,
  level = excluded.level, topic = excluded.topic, is_free = excluded.is_free,
  is_published = excluded.is_published, rank = excluded.rank, cover_url = excluded.cover_url;

-- ── Modules ──────────────────────────────────────────────────────────────────
insert into public.modules (id, course_id, title_mn, title_en, rank) values
  -- Танилцуулга
  ('20000000-0000-4000-8000-000000001101', '10000000-0000-4000-8000-000000000001', 'Кодын ертөнц',         'The world of code',  1),
  ('20000000-0000-4000-8000-000000001118', '10000000-0000-4000-8000-000000000001', 'Хэрэгсэл ба дэд бүтэц','Tools and plumbing', 2),
  ('20000000-0000-4000-8000-000000001119', '10000000-0000-4000-8000-000000000001', 'Шалгалт',              'The exam',           3),
  -- Кодын суурь
  ('20000000-0000-4000-8000-000000001102', '10000000-0000-4000-8000-000000000002', 'Кодын үндсэн ойлголтууд','Core ideas',       1),
  ('20000000-0000-4000-8000-000000001103', '10000000-0000-4000-8000-000000000002', 'Өгөгдлийн хэлбэрүүд',  'Shapes of data',     2),
  ('20000000-0000-4000-8000-000000001104', '10000000-0000-4000-8000-000000000002', 'Захиалж сурах',        'Asking well',        3),
  ('20000000-0000-4000-8000-000000001105', '10000000-0000-4000-8000-000000000002', 'Шалгах ба алдаа',      'Checking and errors',4),
  ('20000000-0000-4000-8000-000000001106', '10000000-0000-4000-8000-000000000002', 'Жижиг төсөл',          'A small project',    5),
  -- Landing page
  ('20000000-0000-4000-8000-000000001107', '10000000-0000-4000-8000-000000000003', 'HTML-ийн суурь',       'HTML foundations',   1),
  ('20000000-0000-4000-8000-000000001108', '10000000-0000-4000-8000-000000000003', 'CSS-ээр хэлбэржүүлэх', 'Styling with CSS',   2),
  ('20000000-0000-4000-8000-000000001109', '10000000-0000-4000-8000-000000000003', 'Бодит хуудас',         'A real page',        3),
  -- Fullstack
  ('20000000-0000-4000-8000-000000001110', '10000000-0000-4000-8000-000000000004', 'React-ийн сэтгэлгээ',  'Thinking in React',  1),
  ('20000000-0000-4000-8000-000000001111', '10000000-0000-4000-8000-000000000004', 'Next.js App Router',   'Next.js App Router', 2),
  ('20000000-0000-4000-8000-000000001112', '10000000-0000-4000-8000-000000000004', 'Бодит апп',            'A real app',         3),
  ('20000000-0000-4000-8000-000000001113', '10000000-0000-4000-8000-000000000004', 'TypeScript',           'TypeScript',         4),
  -- Мобайл
  ('20000000-0000-4000-8000-000000001114', '10000000-0000-4000-8000-000000000005', 'Expo-гоор эхлэх',      'Starting with Expo', 1),
  ('20000000-0000-4000-8000-000000001115', '10000000-0000-4000-8000-000000000005', 'Бодит апп',            'A real app',         2),
  -- Тоглоом
  ('20000000-0000-4000-8000-000000001116', '10000000-0000-4000-8000-000000000006', '2D-ийн үндэс',         '2D foundations',     1),
  ('20000000-0000-4000-8000-000000001117', '10000000-0000-4000-8000-000000000006', 'Гурван хэмжээст',      'Into 3D',            2),
  -- Every course ends the same way: one module, one exam, ten questions.
  ('20000000-0000-4000-8000-000000001120', '10000000-0000-4000-8000-000000000002', 'Шалгалт',              'The exam',           6),
  ('20000000-0000-4000-8000-000000001121', '10000000-0000-4000-8000-000000000003', 'Шалгалт',              'The exam',           4),
  ('20000000-0000-4000-8000-000000001122', '10000000-0000-4000-8000-000000000004', 'Шалгалт',              'The exam',           5),
  ('20000000-0000-4000-8000-000000001123', '10000000-0000-4000-8000-000000000005', 'Шалгалт',              'The exam',           3),
  ('20000000-0000-4000-8000-000000001124', '10000000-0000-4000-8000-000000000006', 'Шалгалт',              'The exam',           3)
on conflict (id) do update set
  course_id = excluded.course_id,
  title_mn = excluded.title_mn, title_en = excluded.title_en, rank = excluded.rank;

-- Modules from an older shape of the curriculum.
--
-- The seed upserts; it does not diff. When the syllabus is reorganised the rows
-- it no longer names stay behind, and a course page then shows empty chapters
-- nobody wrote. This removes them — but only the **empty** ones: `modules`
-- cascades to `lessons`, so a stale module that still holds a lesson would take
-- it with it. One that does not delete is a signal that a lesson was missed in
-- the remapping, not something to force.
delete from public.modules m
 where m.id not in (
         '20000000-0000-4000-8000-000000001101', '20000000-0000-4000-8000-000000001102',
         '20000000-0000-4000-8000-000000001103', '20000000-0000-4000-8000-000000001104',
         '20000000-0000-4000-8000-000000001105', '20000000-0000-4000-8000-000000001106',
         '20000000-0000-4000-8000-000000001107', '20000000-0000-4000-8000-000000001108',
         '20000000-0000-4000-8000-000000001109', '20000000-0000-4000-8000-000000001110',
         '20000000-0000-4000-8000-000000001111', '20000000-0000-4000-8000-000000001112',
         '20000000-0000-4000-8000-000000001113', '20000000-0000-4000-8000-000000001114',
         '20000000-0000-4000-8000-000000001115', '20000000-0000-4000-8000-000000001116',
         '20000000-0000-4000-8000-000000001117', '20000000-0000-4000-8000-000000001118',
         '20000000-0000-4000-8000-000000001119', '20000000-0000-4000-8000-000000001120',
         '20000000-0000-4000-8000-000000001121', '20000000-0000-4000-8000-000000001122',
         '20000000-0000-4000-8000-000000001123', '20000000-0000-4000-8000-000000001124')
   and not exists (select 1 from public.lessons l where l.module_id = m.id);

-- ── Lessons ──────────────────────────────────────────────────────────────────
--
-- The video URLs are Google's public sample clips. They play, which is what a
-- seed needs — the player, the progress bar and the "watched" mark can all be
-- checked before a single real lecture has been filmed. Replace them with
-- Storage or Mux URLs as the real ones arrive.
--
-- Bodies are Markdown, parsed by `packages/core/src/markdown.ts` on both the
-- web and the phone. Keep them to the subset that parser supports: headings,
-- paragraphs, lists, fenced code, inline code, bold, links, quotes.

insert into public.lessons
  (id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes,
   body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank)
values
  -- ══ Вэб хөгжүүлэлтийн үндэс ══ HTML-ийн суурь
  ('30000000-0000-4000-8000-000000000101', '20000000-0000-4000-8000-000000001101', '10000000-0000-4000-8000-000000000001',
   'veb-yaj-ajilladag', 'Вэб хэрхэн ажилладаг вэ?', 'How the web works', 'video',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 8,
   $md$Хөтөч дээрээ хаяг бичээд Enter дарахад юу болдгийг ойлгох нь эхний алхам.

## Гурван оролцогч

- **Хөтөч** (browser) — таны компьютер дээрх програм. HTML уншиж, дэлгэц дээр зурдаг.
- **Сервер** — хаа нэгтээ байгаа компьютер. Файлуудыг хадгалж, хүсэлт ирэхэд буцаадаг.
- **HTTP** — хоёрын хооронд ярилцах хэл.

## Юу болов?

1. Та `jarvis.mn` гэж бичив.
2. Хөтөч DNS-ээс тэр нэрний хаягийг олов.
3. Сервер рүү "надад энэ хуудсыг өгөөч" гэсэн хүсэлт явуулав.
4. Сервер HTML буцаав. Хөтөч түүнийг уншиж зурав.

> Вэб хуудас бол зураг биш, **заавар**. HTML нь "энд гарчиг, энд догол мөр" гэж хэлдэг бөгөөд хөтөч түүнийг өөрийнхөөрөө зурдаг. Тиймээс ижил хуудас утсан дээр өөр, дэлгэц дээр өөр харагддаг.$md$,
   $md$Understanding what happens when you type an address and press Enter is the first step.

## Three participants

- **The browser** — a program on your computer. It reads HTML and draws it.
- **The server** — a computer somewhere else. It stores files and answers requests.
- **HTTP** — the language the two speak.

> A web page is not a picture, it is a set of **instructions**.$md$,
   null, null, null, true, 1),

  ('30000000-0000-4000-8000-000000000102', '20000000-0000-4000-8000-000000001107', '10000000-0000-4000-8000-000000000003',
   'ehnii-html-fail', 'Эхний HTML файл', 'Your first HTML file', 'text', null, 12,
   $md$Одоо өөрийн гараар файл үүсгэе. Тусгай програм хэрэггүй — ямар ч текст засварлагч болно.

## Файлаа үүсгэх

Компьютер дээрээ `veb` нэртэй хавтас үүсгээд дотор нь `index.html` файл хий. Дараа нь дараах кодыг хуулж тавь:

```html
<!doctype html>
<html lang="mn">
  <head>
    <meta charset="utf-8" />
    <title>Миний эхний хуудас</title>
  </head>
  <body>
    <h1>Сайн уу, би код бичиж эхэллээ</h1>
    <p>Энэ бол миний өөрийн гараар бичсэн анхны вэб хуудас.</p>
  </body>
</html>
```

Файлаа хадгалаад хөтөч дээрээ давхар товш. Таны бичсэн үг дэлгэц дээр гарч ирнэ.

## Юу нь юу вэ?

- `<!doctype html>` — "энэ бол орчин үеийн HTML" гэсэн мэдэгдэл. Эхний мөрөнд заавал байна.
- `lang="mn"` — хуудасны хэл. Дэлгэц уншигч болон орчуулга үүнийг уншдаг тул орхиж болохгүй.
- `<head>` — хөтөчид зориулсан мэдээлэл. Хэрэглэгчид харагдахгүй.
- `<body>` — харагдах бүх зүйл.

`charset="utf-8"` байхгүй бол кирилл үсэг эвдэрч "Ñàéí" мэт болно. Энэ бол монголоор бичдэг хүний хамгийн түгээмэл алдаа.$md$,
   null, 'html', null, null, true, 1),

  ('30000000-0000-4000-8000-000000000103', '20000000-0000-4000-8000-000000001107', '10000000-0000-4000-8000-000000000003',
   'tekst-holboos-zurag', 'Текст, холбоос, зураг', 'Text, links and images', 'text', null, 14,
   $md$HTML-д хэдэн арван таг байдаг ч өдөр тутамд хэрэглэгдэх нь арваад.

## Текст

```html
<h1>Хамгийн том гарчиг</h1>
<h2>Дэд гарчиг</h2>
<p>Энгийн догол мөр. Дотор нь <strong>тод</strong> болон <em>налуу</em> үг байж болно.</p>
```

Нэг хуудсанд `<h1>` **нэг л удаа** байна. Гарчгийн түвшнийг алгасахгүй: `<h1>`-ийн дараа `<h3>` биш `<h2>` ирнэ.

## Холбоос ба зураг

```html
<a href="https://jarvis.mn">Бидний сайт</a>
<img src="zurag.jpg" alt="Улаанбаатарын төв талбай" />
```

`alt` бол сонголт биш. Зураг ачаалагдаагүй үед, эсвэл харааны бэрхшээлтэй хүн дэлгэц уншигчаар орж ирэхэд уншигдах цорын ганц текст. Чимэглэлийн зураг бол `alt=""` гэж хоосон үлдээнэ.

## Жагсаалт

```html
<ul>
  <li>Эрэмбэгүй жагсаалт</li>
  <li>Цэгээр тэмдэглэгдэнэ</li>
</ul>
```$md$,
   null, 'html', null, null, false, 2),

  -- ══ CSS-ээр хэлбэржүүлэх
  ('30000000-0000-4000-8000-000000000104', '20000000-0000-4000-8000-000000001108', '10000000-0000-4000-8000-000000000003',
   'songogch-ba-ongo', 'Сонгогч ба өнгө', 'Selectors and colour', 'video',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 11,
   $md$CSS бол "аль элементэд юу хийх вэ" гэсэн хос дүрмийн жагсаалт.

```css
body {
  background: #0b0c0f;
  color: #f2f4f8;
  font-family: system-ui, sans-serif;
}

h1 {
  color: #7c6cff;
}
```

Зүүн талын `body`, `h1` нь **сонгогч** — аль элемент рүү хандахаа хэлнэ. Хаалтан доторх мөрүүд нь **чанар: утга** хосууд.

Анги (class) ашиглавал аль ч элементэд нэр өгч болно:

```css
.card {
  border-radius: 16px;
  padding: 20px;
}
```

```html
<div class="card">Энэ хайрцаг дугуй өнцөгтэй боллоо</div>
```$md$,
   null, 'css', null, null, false, 1),

  ('30000000-0000-4000-8000-000000000105', '20000000-0000-4000-8000-000000001108', '10000000-0000-4000-8000-000000000003',
   'box-model', 'Box model — зай, хүрээ, дотоод зай', 'The box model', 'text', null, 13,
   $md$CSS дээр **бүх зүйл хайрцаг**. Тэр хайрцаг дотроосоо гадагшаа дөрвөн давхартай.

1. `content` — доторх текст, зураг.
2. `padding` — контент ба хүрээний хоорондох дотоод зай.
3. `border` — хүрээ.
4. `margin` — хайрцгийн гадна талын зай, хөршүүдээсээ хол байх зай.

```css
.card {
  padding: 20px;      /* дотор нь амьсгалах зай */
  border: 1px solid #23262e;
  margin-bottom: 16px; /* дараагийн хайрцгаас хол */
}
```

## Хэмжээ яагаад таарахгүй байна вэ?

Анхдагчаар `width: 300px` гэж бичээд дээр нь `padding: 20px` нэмбэл хайрцаг **340px** болно. Учир нь өргөн нь зөвхөн контентод хамаарна. Үүнийг засах нэг мөр:

```css
*, *::before, *::after { box-sizing: border-box; }
```

Одоо `width: 300px` гэдэг нь хүрээ, дотоод зайг оруулаад 300px гэсэн үг. Бараг бүх төсөл энэ мөрөөр эхэлдэг.$md$,
   null, 'css', null, null, false, 2),

  ('30000000-0000-4000-8000-000000000106', '20000000-0000-4000-8000-000000001108', '10000000-0000-4000-8000-000000000003',
   'flexbox', 'Flexbox-оор байрлуулах', 'Layout with flexbox', 'code', null, 16,
   $md$Хоёр зүйлийг зэрэгцүүлэх, төвд байрлуулах, эсвэл хоёр талд нь түлхэх — энэ бүхэн Flexbox-оор хийгддэг.

```css
.row {
  display: flex;
  align-items: center;      /* босоо тэнхлэгт голлуулах */
  justify-content: space-between; /* хоёр талд нь түлхэх */
  gap: 12px;                /* хоорондын зай */
}
```

## Дасгал

Баруун талын кодыг ашиглан толгой хэсгийг байрлуул: лого зүүн талдаа, цэс баруун талдаа, хооронд нь зай.$md$,
   null, 'css',
   $md$/* Толгой хэсгийг зөв байрлуул */
.header {
  /* энд бич */
}

.header nav {
  /* цэсний холбоосуудыг зэрэгцүүл */
}$md$,
   $md$.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.header nav {
  display: flex;
  gap: 20px;
}$md$,
   false, 3),

  -- ══ Бодит төсөл
  ('30000000-0000-4000-8000-000000000107', '20000000-0000-4000-8000-000000001109', '10000000-0000-4000-8000-000000000003',
   'tanilzuulga-huudas', 'Хувийн танилцуулга хуудас', 'A personal profile page', 'code', null, 20,
   $md$Одоо сурсан бүхнээ нэг хуудсанд цуглуулъя. Энэ хуудас таны анхны ажлын жишээ болно.

## Шаардлага

- Нэр, товч танилцуулга агуулсан толгой хэсэг
- Ур чадварын жагсаалт
- Холбоо барих хэсэг, имэйл рүү холбогдох `mailto:` холбоостой

Бүтцээ эхлээд HTML-ээр бич, дараа нь CSS-ээр хэлбэржүүл. Хоёуланг зэрэг хийх гэж оролдвол аль аль нь бүтэхгүй.$md$,
   null, 'html',
   $md$<!doctype html>
<html lang="mn">
  <head>
    <meta charset="utf-8" />
    <title>Миний танилцуулга</title>
  </head>
  <body>
    <!-- Толгой хэсгээ энд бич -->
  </body>
</html>$md$,
   $md$<!doctype html>
<html lang="mn">
  <head>
    <meta charset="utf-8" />
    <title>Б. Ганбат — Вэб хөгжүүлэгч</title>
    <style>
      * , *::before, *::after { box-sizing: border-box; }
      body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.65; }
      .wrap { max-width: 640px; margin: 0 auto; padding: 40px 20px; }
      .skills { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; list-style: none; }
      .skills li { border: 1px solid #ddd; border-radius: 999px; padding: 6px 14px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>Б. Ганбат</h1>
      <p>Вэб хөгжүүлэгч болохоор суралцаж байна. HTML, CSS.</p>

      <h2>Ур чадвар</h2>
      <ul class="skills">
        <li>HTML</li>
        <li>CSS</li>
        <li>Flexbox</li>
      </ul>

      <h2>Холбоо барих</h2>
      <p><a href="mailto:ganbat@example.mn">ganbat@example.mn</a></p>
    </div>
  </body>
</html>$md$,
   false, 1),

  ('30000000-0000-4000-8000-000000000108', '20000000-0000-4000-8000-000000001109', '10000000-0000-4000-8000-000000000003',
   'utsand-tohiruulah', 'Утсанд тохируулах', 'Making it work on a phone', 'text', null, 12,
   $md$Монголд вэб хуудсыг үзэж буй хүмүүсийн дийлэнх нь утсаараа ордог. Тиймээс "утсанд тохируулах" гэдэг нь нэмэлт ажил биш, **үндсэн ажил**.

## Нэг мөр заавал

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

Энэ мөр байхгүй бол утас таны хуудсыг 980px өргөнтэй мэт дүрсэлж, бүхнийг жижигрүүлж харуулна. Текст нь уншигдахгүй болно.

## Дараа нь media query

```css
.grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

@media (min-width: 768px) {
  .grid { grid-template-columns: 1fr 1fr; }
}
```

Эхлээд утасны хувилбарыг бич, дараа нь өргөн дэлгэцэд нэм. Ингэж бичсэн CSS үргэлж богино байдаг.

360px өргөнтэй дэлгэц дээр хэвтээ гүйлгэлт **гарч болохгүй**. Энэ бол хамгийн түгээмэл алдаа, бас хамгийн хурдан анзаарагддаг нь.$md$,
   null, 'css', null, null, false, 2),

  ('30000000-0000-4000-8000-000000000109', '20000000-0000-4000-8000-000000001109', '10000000-0000-4000-8000-000000000003',
   'internetend-bairshuulah', 'Интернэтэд байршуулах', 'Publishing it', 'video',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 10,
   $md$Хуудас компьютер дээр чинь байвал зөвхөн чи л харна. Одоо түүнийг бусдад үзүүлье.

## Хамгийн хялбар зам

1. GitHub дээр бүртгүүлж, шинэ repository үүсгэ.
2. Файлуудаа байршуул.
3. Settings → Pages хэсгээс салбараа сонго.
4. Хэдэн минутын дараа `хэрэглэгч.github.io/repo` хаягаар нээгдэнэ.

Энэ холбоосыг ажлын анкет, CV, эсвэл нийгмийн сүлжээнийхээ танилцуулгад тавьж болно. Ажил олгогчийн хувьд ярьсан үгнээс илүү үнэ цэнэтэй.$md$,
   null, null, null, null, false, 3),

  ('30000000-0000-4000-8000-000000000110', '20000000-0000-4000-8000-000000001109', '10000000-0000-4000-8000-000000000003',
   'shalgalt-html-css', 'Шалгалт: HTML ба CSS', 'Quiz: HTML and CSS', 'quiz', null, 5,
   $md$Модулиа дуусгахын өмнө дөрвөн асуулт. Буруу хариулбал тайлбарыг нь уншаад дахин оролдоорой.$md$,
   null, null, null, null, false, 4)
on conflict (id) do update set
  module_id = excluded.module_id, course_id = excluded.course_id, slug = excluded.slug,
  title_mn = excluded.title_mn, title_en = excluded.title_en, kind = excluded.kind,
  video_url = excluded.video_url, duration_minutes = excluded.duration_minutes,
  body_mn = excluded.body_mn, body_en = excluded.body_en,
  code_language = excluded.code_language, starter_code = excluded.starter_code,
  solution_code = excluded.solution_code, is_preview = excluded.is_preview, rank = excluded.rank;

-- ── Fullstack, мобайл, тоглоомын хичээлүүд ─────────────────────────────────
insert into public.lessons
  (id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes,
   body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank)
values
  ('30000000-0000-4000-8000-000000000301', '20000000-0000-4000-8000-000000001110', '10000000-0000-4000-8000-000000000004',
   'komponent-ba-props', 'Компонент ба props', 'Components and props', 'video',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 12,
   $md$React-д хуудас бол компонентуудын мод. Компонент гэдэг нь UI буцаадаг функц.

```jsx
function HicheelKart({ garchig, minut }) {
  return (
    <article className="kart">
      <h3>{garchig}</h3>
      <p>{minut} минут</p>
    </article>
  );
}
```

Гаднаас өгөгдсөн утгыг **props** гэнэ. Props нь зөвхөн доошоо урсана: эцэг компонент хүүхэддээ өгнө, хүүхэд нь өөрчилж болохгүй.

```jsx
<HicheelKart garchig="Компонент ба props" minut={12} />
```$md$,
   null, 'jsx', null, null, true, 1),

  ('30000000-0000-4000-8000-000000000302', '20000000-0000-4000-8000-000000001110', '10000000-0000-4000-8000-000000000004',
   'state-ba-event', 'State ба event', 'State and events', 'code', null, 16,
   $md$Props гаднаас ирдэг бол state нь компонентийн өөрийн санах ой.

```jsx
"use client";
import { useState } from "react";

export function Toolor() {
  const [too, setToo] = useState(0);
  return <button onClick={() => setToo(too + 1)}>{too}</button>;
}
```

## Хоёр дүрэм

1. State-ийг **шууд бүү өөрчил**. `too++` биш `setToo(too + 1)`.
2. `useState`-ийг зөвхөн компонентийн дээд түвшинд дууд. `if` дотор, давталт дотор бичиж болохгүй.

Next.js дээр state ашиглах компонент заавал `"use client"` гэж эхэлнэ. Үгүй бол сервер дээр ажиллах гэж оролдоод алдаа өгнө.$md$,
   null, 'jsx',
   $md$"use client";
import { useState } from "react";

export function Maygt() {
  // нэр хадгалах state нэм
  return <form>{/* ... */}</form>;
}$md$,
   $md$"use client";
import { useState } from "react";

export function Maygt() {
  const [ner, setNer] = useState("");
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input value={ner} onChange={(e) => setNer(e.target.value)} />
      <p>Сайн уу, {ner || "зочин"}</p>
    </form>
  );
}$md$,
   false, 2),

  ('30000000-0000-4000-8000-000000000303', '20000000-0000-4000-8000-000000001110', '10000000-0000-4000-8000-000000000004',
   'jagsaalt-ba-key', 'Жагсаалт ба key', 'Lists and keys', 'text', null, 12,
   $md$Массивыг UI болгохдоо `map` ашиглана.

```jsx
<ul>
  {hicheeluud.map((h) => (
    <li key={h.id}>{h.garchig}</li>
  ))}
</ul>
```

`key` нь React-д "аль мөр нь аль вэ" гэдгийг хэлдэг. Индексийг key болгож болохгүй — жагсаалт эрэмбэлэгдэх, дунд нь мөр устахад React буруу мөрийг шинэчилнэ. Үргэлж өгөгдлийн өөрийнх нь тогтвортой id-г ашигла.$md$,
   null, 'jsx', null, null, false, 3),

  -- ══ Next.js App Router
  ('30000000-0000-4000-8000-000000000304', '20000000-0000-4000-8000-000000001111', '10000000-0000-4000-8000-000000000004',
   'route-ba-layout', 'Route ба layout', 'Routes and layouts', 'text', null, 14,
   $md$App Router-т **хавтас бол хаяг**.

```
app/
  page.tsx            →  /
  courses/page.tsx    →  /courses
  courses/[slug]/page.tsx  →  /courses/react-next
  layout.tsx          →  бүх хуудсыг ороож байдаг бүрхүүл
```

`layout.tsx` нь доторх хуудас солигдоход **дахин ачаалагддаггүй**. Тиймээс толгой хэсэг, хажуугийн цэс тэнд амьдрана.

```tsx
export default async function Page({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  return <h1>{slug}</h1>;
}
```

Next.js 16-д `params` бол Promise. `await` хийхээ мартвал шууд алдаа өгнө.$md$,
   null, 'tsx', null, null, false, 1),

  ('30000000-0000-4000-8000-000000000305', '20000000-0000-4000-8000-000000001111', '10000000-0000-4000-8000-000000000004',
   'server-component', 'Server Component', 'Server Components', 'text', null, 16,
   $md$App Router-т компонент **анхдагчаар сервер дээр** ажиллана. Тэр код хэрэглэгчийн хөтөч рүү огт очихгүй.

Энэ юу өгөх вэ:

- Өгөгдлийн санруу шууд хандаж болно — `await` хийгээд л боллоо
- Нууц түлхүүр сервер дээрээ үлдэнэ
- Хөтөч рүү явах JavaScript бага болно

```tsx
export default async function Page() {
  const hicheeluud = await getHicheeluud(); // шууд DB
  return <Jagsaalt hicheeluud={hicheeluud} />;
}
```

`useState`, `onClick`, `window` хэрэгтэй болмогц тэр хэсгээ жижиг client компонент болгож салгана. "Бүх аппаа `use client` болгох" биш, **навчийг нь** client болгоно.$md$,
   null, 'tsx', null, null, false, 2),

  ('30000000-0000-4000-8000-000000000306', '20000000-0000-4000-8000-000000001111', '10000000-0000-4000-8000-000000000004',
   'ogogdol-tatah', 'Өгөгдөл татах', 'Fetching data', 'text', null, 18,
   $md$Сервер компонент дотор өгөгдөл татахад тусгай сан хэрэггүй.

```tsx
export default async function Page() {
  const { data, error } = await supabase
    .from("courses")
    .select("id, slug, title_mn, is_free")
    .eq("is_published", true)
    .order("rank");

  if (error) throw error;
  return <CourseGrid courses={data} />;
}
```

`select("*")` бүү бич. Хэрэгтэй баганаа нэрлэ: сүлжээгээр явах өгөгдөл бага байх ба хожим багана нэмэгдэхэд юу нь эвдэрснийг харах болно.$md$,
   null, 'tsx', null, null, false, 3),

  -- ══ Бодит апп
  ('30000000-0000-4000-8000-000000000307', '20000000-0000-4000-8000-000000001112', '10000000-0000-4000-8000-000000000004',
   'supabase-holboh', 'Supabase холбох', 'Connecting Supabase', 'text', null, 20,
   $md$Supabase бол Postgres өгөгдлийн сан, нэвтрэлт, файл хадгалалтыг нэг дор өгдөг үйлчилгээ.

```ts
import { createServerClient } from "@supabase/ssr";

export function createServerSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { /* ... */ } },
  );
}
```

## RLS-ийг заавал асаа

Хүснэгт үүсгэмэгц `enable row level security` хийнэ. Үгүй бол публик түлхүүр барьсан хэн ч бүх мөрийг уншина. Хөтөч дэх түлхүүрийг нууц гэж бодох нь эхлэгчдийн хамгийн үнэтэй алдаа.$md$,
   null, 'ts', null, null, false, 1),

  ('30000000-0000-4000-8000-000000000308', '20000000-0000-4000-8000-000000001112', '10000000-0000-4000-8000-000000000004',
   'nevtrelt', 'Нэвтрэлт нэмэх', 'Adding authentication', 'text', null, 22,
   $md$Supabase Auth имэйл, нууц үг, Google-ийн нэвтрэлтийг хариуцна. Бидний ажил бол сесс хаана амьдрахыг зөв тохируулах.

```ts
const { error } = await supabase.auth.signInWithPassword({ email, password });
```

Сервер талд хэрэглэгчийг үргэлж **баталгаажуулсан** байдлаар унш:

```ts
const { data } = await supabase.auth.getClaims();
const userId = data?.claims?.sub ?? null;
```

Күүкийг задлаад `sub`-ийг нь шууд авах нь эрхийн шалгалтыг тойрч гарах нүх. Гарын үсгийг нь шалгаж байж л тэр id-д итгэнэ.$md$,
   null, 'ts', null, null, false, 2),

  ('30000000-0000-4000-8000-000000000309', '20000000-0000-4000-8000-000000001112', '10000000-0000-4000-8000-000000000004',
   'vercel-deploy', 'Vercel дээр байршуулах', 'Deploying to Vercel', 'video',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 10,
   $md$Кодоо GitHub дээр тавьчихвал Vercel үлдсэнийг нь хийнэ.

1. Vercel дээр repo-гоо холбо
2. Орчны хувьсагчуудаа (`NEXT_PUBLIC_SUPABASE_URL` гэх мэт) нэг бүрчлэн оруул
3. Deploy дар

Push хийх бүрт шинэ хувилбар гарна. Салбар бүр өөрийн урьдчилсан хаягтай болох тул нийтлэхээсээ өмнө хянаж үзэж болно.$md$,
   null, null, null, null, false, 3)
on conflict (id) do update set
  module_id = excluded.module_id, course_id = excluded.course_id, slug = excluded.slug,
  title_mn = excluded.title_mn, title_en = excluded.title_en, kind = excluded.kind,
  video_url = excluded.video_url, duration_minutes = excluded.duration_minutes,
  body_mn = excluded.body_mn, body_en = excluded.body_en,
  code_language = excluded.code_language, starter_code = excluded.starter_code,
  solution_code = excluded.solution_code, is_preview = excluded.is_preview, rank = excluded.rank;

insert into public.lessons
  (id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes,
   body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank)
values
  -- ══ TypeScript ══
  ('30000000-0000-4000-8000-000000000501', '20000000-0000-4000-8000-000000001113', '10000000-0000-4000-8000-000000000004',
   'turliin-dugnelt', 'Төрлийн дүгнэлт', 'Type inference', 'text', null, 14,
   $md$TypeScript ихэнх төрлийг өөрөө дүгнэж чадна. Гар аргаар бичих нь илүүдэл болох үе олон.

```ts
const ner = "Ганбат";        // "Ганбат" — literal type
let too = 5;                  // number
```

`const` нь шууд утгын төрөл (literal) өгдөг бол `let` нь өргөн төрөл өгдөг. Энэ ялгаа union төрөлтэй ажиллахад чухал.$md$,
   null, 'ts', null, null, false, 1),

  ('30000000-0000-4000-8000-000000000502', '20000000-0000-4000-8000-000000001113', '10000000-0000-4000-8000-000000000004',
   'generic', 'Generic', 'Generics', 'text', null, 18,
   $md$Generic бол "төрлийг нь дараа хэлнэ" гэсэн амлалт.

```ts
function ehnii<T>(jagsaalt: T[]): T | undefined {
  return jagsaalt[0];
}

const a = ehnii([1, 2, 3]);        // number | undefined
const b = ehnii(["x", "y"]);       // string | undefined
```

`any` бол шалгалтыг унтраах товч, `generic` бол шалгалтыг хадгалсаар уян хатан болгох арга.$md$,
   null, 'ts', null, null, false, 2),

  ('30000000-0000-4000-8000-000000000503', '20000000-0000-4000-8000-000000001113', '10000000-0000-4000-8000-000000000004',
   'discriminated-union', 'Discriminated union', 'Discriminated unions', 'text', null, 16,
   $md$Нэг талбараар ялгагдах union бол TypeScript-ийн хамгийн хүчтэй хэв маягийн нэг.

```ts
type Hariu =
  | { ok: true; ogogdol: string[] }
  | { ok: false; aldaa: string };

function haruulah(h: Hariu) {
  if (h.ok) {
    console.log(h.ogogdol.length); // энд ogogdol байгаа нь батлагдсан
  } else {
    console.log(h.aldaa);
  }
}
```

Сервер үйлдлүүд яг ийм хэлбэрээр хариу буцаадаг. `try/catch`-аас илүү найдвартай: алдааны төлөвийг мартвал компилятор өөрөө хэлнэ.$md$,
   null, 'ts', null, null, false, 3)
on conflict (id) do update set
  module_id = excluded.module_id, course_id = excluded.course_id, slug = excluded.slug,
  title_mn = excluded.title_mn, title_en = excluded.title_en, kind = excluded.kind,
  video_url = excluded.video_url, duration_minutes = excluded.duration_minutes,
  body_mn = excluded.body_mn, body_en = excluded.body_en,
  code_language = excluded.code_language, starter_code = excluded.starter_code,
  solution_code = excluded.solution_code, is_preview = excluded.is_preview, rank = excluded.rank;

-- ── Шинэ хичээлүүд: танилцуулга ба мобайл ────────────────────────────────────
insert into public.lessons
  (id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes,
   body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank)
values
  -- ══ Танилцуулга хичээл
  ('30000000-0000-4000-8000-000000000601', '20000000-0000-4000-8000-000000001101', '10000000-0000-4000-8000-000000000001',
   'yamar-heregsel', 'Ямар хэрэгсэл хэрэгтэй вэ', 'What you need', 'text', null, 8,
   $md$Код бичихэд хэрэгтэй зүйл гурав. Бүгд үнэгүй.

## 1. Засварлагч

**VS Code** — [code.visualstudio.com](https://code.visualstudio.com). Кодыг өнгөөр ялгаж харуулдаг, алдааг бичиж байхад чинь хэлдэг.

Эхний өдөр өргөтгөл суулгах гэж бүү яар. Анхдагч байдлаараа бүрэн хангалттай.

## 2. Хөтөч

**Chrome** эсвэл **Firefox**. Аль нь ч болно, гэхдээ хөгжүүлэгчийн хэрэгслийг нь (`F12` эсвэл `Cmd+Option+I`) байнга нээж сурах хэрэгтэй. Тэнд алдаа, сүлжээний хүсэлт, хуудасны бүтэц бүгд харагдана.

## 3. Терминал

Mac дээр **Terminal**, Windows дээр **PowerShell** аль хэдийн суусан байгаа. Айх зүйл алга — эхэндээ ганц хоёр команд л бичнэ.

> Компьютер сул байна, шинэ зөөврийн авах уу гэж бодох хэрэггүй. Эдгээр нь 10 жилийн настай машин дээр ч ажиллана. Видео эвлүүлэг хийхгүй л бол хангалттай.

## Юу суулгах шаардлагагүй вэ

Эхний сургалтуудад Node.js, өгөгдлийн сан, Docker — юу ч хэрэггүй. Хэрэгтэй болох үед нь тэр хичээл дээр нь алхам алхмаар зааж өгнө.$md$,
   null, null, null, null, true, 2),

  ('30000000-0000-4000-8000-000000000602', '20000000-0000-4000-8000-000000001101', '10000000-0000-4000-8000-000000000001',
   'yamar-daraalal', 'Ямар дарааллаар үзэх вэ', 'What order to take them in', 'text', null, 7,
   $md$Таван сургалт бий. Дарааллаар нь үзэхэд хамгийн хурдан урагшилна.

## 1. Landing page хийж сурах нь

HTML, CSS. Юу ч мэдэхгүй бол эндээс. Төгсөхөд интернэтэд байрласан хуудастай болно — гартаа барих эхний үр дүн.

## 2. Кодын суурь

JavaScript, дараа нь Python. Хувьсагч, нөхцөл, давталт, функц. Энэ бол цаашдын бүх зүйлийн суурь.

## 3. Fullstack website хийж сурах нь

React, Next.js, Supabase. Өгөгдлийн сантай, нэвтрэлттэй бүтэн аппликейшн.

## 4. iOS, Android аппликейшн

Expo. React мэддэг болсны дараа утасны апп бол шинэ хэл биш, шинэ дэлгэц.

## Алгасаж болох уу

Болно. HTML, CSS мэддэг бол шууд «Кодын суурь» руу орж болно. Гэхдээ **«Кодын суурь»-г алгасаж «Fullstack» руу орох нь ажилладаггүй** — React бол JavaScript, түүнийг мэдэхгүйгээр React сурах нь гадаад үгийг утгыг нь мэдэхгүй цээжлэхтэй адил.

## Хэр хурдан явах вэ

Өдөрт нэг хичээл бол сайн хурд. Хоёр цаг зараад дөрвөн хичээл үзэхээс, дөрвөн өдөр нэг нэгээр нь үзэх нь илүү үлддэг.

> Хичээл бүрийн дасгалыг өөрөө бичээрэй. Уншаад ойлгосон зүйл долоо хоногийн дараа алга болдог; бичээд ажиллуулсан зүйл үлддэг.$md$,
   null, null, null, null, false, 3),

  -- ══ iOS, Android аппликейшн ══ Expo-гоор эхлэх
  ('30000000-0000-4000-8000-000000000603', '20000000-0000-4000-8000-000000001114', '10000000-0000-4000-8000-000000000005',
   'expo-geh-yu', 'Expo гэж юу вэ', 'What Expo is', 'video',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 10,
   $md$Утасны апп бичихэд өмнө нь iOS-д Swift, Android-д Kotlin гэсэн хоёр өөр хэл, хоёр өөр код бичдэг байсан.

**React Native** үүнийг өөрчилсөн: нэг код бичээд хоёр систем дээр ажиллуулна. **Expo** бол түүнийг ашиглахад хялбар болгосон багц хэрэгсэл.

## Юу өөр вэ

React мэддэг бол 90 хувийг нь мэднэ. Ялгаа нь:

- `div` биш `View`
- `p`, `span` биш `Text`
- CSS файл биш `StyleSheet`
- `onClick` биш `onPress`

Бусад нь ижил: компонент, props, state, hook бүгд яг адилхан.

## Яагаад Expo

Expo Go гэдэг апп утсандаа суулгаад QR код уншуулахад л таны бичсэн апп утсан дээр чинь ажиллана. Xcode, Android Studio суулгах, симулятор тохируулах шаардлагагүй.

Дэлгүүрт гаргах болоход EAS гэдэг үйлчилгээ нь бүтээлтийг нь үүлэн дээр хийж өгдөг — Mac байхгүй ч iOS апп гаргаж болно.$md$,
   null, null, null, null, true, 1),

  ('30000000-0000-4000-8000-000000000604', '20000000-0000-4000-8000-000000001114', '10000000-0000-4000-8000-000000000005',
   'ehnii-app', 'Эхний апп', 'Your first app', 'code', null, 14,
   $md$Терминал дээрээ нэг команд:

```bash
npx create-expo-app@latest miniapp
cd miniapp
npx expo start
```

QR код гарч ирнэ. Утсан дээрээ **Expo Go** суулгаад уншуулбал таны апп ажиллана. Кодоо өөрчлөхөд утсан дээр шууд шинэчлэгдэнэ.

## Эхний дэлгэц

`app/index.tsx` файлыг нээгээд доторхийг нь солино.

## Анхаарах зүйл

`View` дотор текст шууд бичиж болохгүй — заавал `Text` дотор байх ёстой. Энэ бол вэбээс ирсэн хүний хамгийн олон гаргадаг алдаа:

```jsx
<View>Сайн уу</View>        {/* алдаа */}
<View><Text>Сайн уу</Text></View>  {/* зөв */}
```$md$,
   null, 'jsx',
   $md$import { View, Text } from "react-native";

export default function Home() {
  // Дэлгэцийн голд нэрээ гаргаж ирүүл
  return (
    <View>
    </View>
  );
}$md$,
   $md$import { View, Text } from "react-native";

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#08090a",
      }}
    >
      <Text style={{ color: "#f7f8f8", fontSize: 24 }}>Сайн уу, Ганбат</Text>
    </View>
  );
}$md$,
   false, 2),

  ('30000000-0000-4000-8000-000000000605', '20000000-0000-4000-8000-000000001114', '10000000-0000-4000-8000-000000000005',
   'delgets-butets', 'Дэлгэцийн бүтэц', 'Laying out a screen', 'text', null, 12,
   $md$React Native-д **Flexbox анхдагчаар асаалттай**. Вэб дээр `display: flex` гэж бичдэг байсныг энд бичих шаардлагагүй.

Бас нэг ялгаа: анхдагч чиглэл нь `column`, вэб дээр `row` байдаг. Утасны дэлгэц өндөр учраас ингэсэн нь утгатай.

```jsx
<View style={{ flex: 1, padding: 16, gap: 12 }}>
  <Text style={{ fontSize: 22 }}>Гарчиг</Text>
  <Text style={{ color: "#8a8f98" }}>Тайлбар</Text>
</View>
```

## flex: 1 гэж юу вэ

«Боломжтой бүх зайг эзэл» гэсэн үг. Хамгийн гадна талын `View`-д тавьбал дэлгэц дүүрнэ.

## Аюулгүй бүс

Утасны дээд талд цаг, доод талд нүүр буцах зураас байдаг. Тэдний доор контент орвол таарахгүй:

```jsx
import { SafeAreaView } from "react-native-safe-area-context";

<SafeAreaView style={{ flex: 1 }}>…</SafeAreaView>
```

> Хэмжээг `px`-ээр бичихгүй, зүгээр тоогоор бичнэ: `padding: 16`. React Native өөрөө төхөөрөмжийн нягтралд тааруулна.$md$,
   null, 'jsx', null, null, false, 3),

  -- ══ Бодит апп
  ('30000000-0000-4000-8000-000000000606', '20000000-0000-4000-8000-000000001115', '10000000-0000-4000-8000-000000000005',
   'huudas-shiljih', 'Хуудас хооронд шилжих', 'Moving between screens', 'code', null, 16,
   $md$**expo-router** нь Next.js-тэй яг ижил зарчмаар ажилладаг: **хавтас бол хаяг**.

```
app/
  index.tsx           →  /
  courses.tsx         →  /courses
  course/[slug].tsx   →  /course/react-native
  _layout.tsx         →  бүрхүүл
```

## Шилжих

```jsx
import { Link, router } from "expo-router";

<Link href="/courses">Сургалтууд</Link>

// эсвэл кодоос
router.push("/courses");
```

## Таб

Доод талын табыг `app/(tabs)/_layout.tsx` дотор `<Tabs>` компонентоор үүсгэнэ. Хаалтан доторх нэр (`(tabs)`) хаягт ордоггүй — зөвхөн бүлэглэх зориулалттай.$md$,
   null, 'jsx',
   $md$import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function Home() {
  // Сургалтын хуудас руу очих холбоос нэм
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Нүүр</Text>
    </View>
  );
}$md$,
   $md$import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22 }}>Нүүр</Text>
      <Link href="/courses" style={{ color: "#7b83eb" }}>
        Сургалтууд
      </Link>
    </View>
  );
}$md$,
   false, 1),

  ('30000000-0000-4000-8000-000000000607', '20000000-0000-4000-8000-000000001115', '10000000-0000-4000-8000-000000000005',
   'ogogdol-utsand', 'Өгөгдөл татах', 'Fetching data', 'code', null, 18,
   $md$Утсан дээр өгөгдөл татах нь вэбтэй ижил — `fetch`, эсвэл Supabase шиг сан. Ялгаа нь **хүлээх байдлыг харуулах** нь илүү чухал: гар утасны сүлжээ удаан байдаг.

```jsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  let cancelled = false;
  fetch("https://api.example.mn/courses")
    .then((r) => r.json())
    .then((json) => { if (!cancelled) setData(json); })
    .finally(() => { if (!cancelled) setLoading(false); });
  return () => { cancelled = true; };
}, []);
```

`cancelled` тугийг мартаж болохгүй. Хэрэглэгч хүсэлт дуусахаас өмнө өөр дэлгэц рүү шилжвэл, устсан компонент дээр `setState` дуудагдана.

## Жагсаалт

Олон мөр харуулахдаа `map` биш **`FlatList`** ашиглана — зөвхөн харагдаж байгаа мөрүүдийг зурдаг тул мянган мөр байсан ч гүйлгэлт гөлгөр байна.$md$,
   null, 'jsx',
   $md$import { FlatList, Text, View } from "react-native";

const courses = [
  { id: "1", title: "Landing page хийж сурах нь" },
  { id: "2", title: "Кодын суурь" },
];

export default function Courses() {
  // FlatList-ээр жагсаалтыг зур
  return <View style={{ flex: 1 }} />;
}$md$,
   $md$import { FlatList, Text, View } from "react-native";

const courses = [
  { id: "1", title: "Landing page хийж сурах нь" },
  { id: "2", title: "Кодын суурь" },
];

export default function Courses() {
  return (
    <FlatList
      data={courses}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <View style={{ padding: 16, borderRadius: 12, backgroundColor: "#141516" }}>
          <Text style={{ color: "#f7f8f8" }}>{item.title}</Text>
        </View>
      )}
    />
  );
}$md$,
   false, 2),

  ('30000000-0000-4000-8000-000000000608', '20000000-0000-4000-8000-000000001115', '10000000-0000-4000-8000-000000000005',
   'delguurt-gargah', 'Дэлгүүрт гаргах', 'Shipping to the stores', 'text', null, 15,
   $md$Апп бэлэн боллоо. Одоо хүмүүст хүргэх ээлж.

## Бүтээлт

```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

Бүтээлт нь Expo-гийн сервер дээр хийгдэнэ. **Mac байхгүй ч iOS апп гаргаж болно** — энэ бол EAS-ийн хамгийн том давуу тал.

## Юу хэрэгтэй вэ

- **Apple Developer** — жилд $99. Баталгаажуулалт 1-2 хоног
- **Google Play Console** — нэг удаа $25

## Хэр удах вэ

Эхний удаа Apple-ийн шалгалт 1-3 хоног. Google ихэвчлэн нэг өдөр.

Татгалзвал шалтгааныг нь бичиж илгээдэг. Хамгийн түгээмэл нь: нууцлалын бодлогын холбоос байхгүй, эсвэл тест хийх бүртгэл өгөөгүй.

## Шинэчлэлт

Жижиг засварт дахин шалгуулах шаардлагагүй:

```bash
eas update
```

JavaScript-ийн өөрчлөлт хэрэглэгчид рүү шууд очно. Зөвхөн шинэ native сан нэмсэн үед л бүтээлт дахин хийнэ.

> Эхний хувилбарыг төгс болгох гэж бүү хүлээ. Гаргаад, хэрэглэгчээс сонсоод, засах нь хурдан.$md$,
   null, null, null, null, false, 3)
on conflict (id) do update set
  module_id = excluded.module_id, course_id = excluded.course_id, slug = excluded.slug,
  title_mn = excluded.title_mn, title_en = excluded.title_en, kind = excluded.kind,
  video_url = excluded.video_url, duration_minutes = excluded.duration_minutes,
  body_mn = excluded.body_mn, body_en = excluded.body_en,
  code_language = excluded.code_language, starter_code = excluded.starter_code,
  solution_code = excluded.solution_code, is_preview = excluded.is_preview, rank = excluded.rank;

-- ── 2D, 3D тоглоом ───────────────────────────────────────────────────────────
insert into public.lessons
  (id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes,
   body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank)
values
  ('30000000-0000-4000-8000-000000000701', '20000000-0000-4000-8000-000000001116', '10000000-0000-4000-8000-000000000006',
   'canvas-suuri', 'Canvas дээр зурах', 'Drawing on a canvas', 'code', null, 14,
   $md$`<canvas>` бол хоосон зотон. JavaScript-ээр дээр нь зурна.

```html
<canvas id="tavtsan" width="480" height="320"></canvas>
```

```js
const tavtsan = document.querySelector("#tavtsan");
const ctx = tavtsan.getContext("2d");

ctx.fillStyle = "#7b83eb";
ctx.fillRect(20, 20, 60, 60);   // x, y, өргөн, өндөр
```

## Координат дээшээ биш доошоо

Математикийн хичээл дээрх `y` тэнхлэг дээшээ өсдөг. Canvas дээр **доошоо** өсдөг: `y = 0` бол хамгийн дээд тал. Эхний тоглоом бичиж байгаа хүн дүрсээ дээш явуулах гээд доош явуулдгийн шалтгаан энэ.

## width, height-ийг CSS-ээр бүү өөрчил

```css
canvas { width: 100%; }   /* дүрс сунаж, бүдгэрнэ */
```

`<canvas>`-ийн `width`, `height` атрибут нь зурагдах талбайн **бодит нягтрал**. CSS-ээр зөвхөн харагдах хэмжээг нь сунгадаг тул зураг нь татагдаж бүдгэрнэ. Хэмжээг атрибут дээр нь тавь.

## Дасгал

Тавцангийн голд улаан тойрог зур.$md$,
   null, 'js',
   $md$const ctx = document.querySelector("#tavtsan").getContext("2d");

// 480x320 тавцангийн голд 40 радиустай тойрог зур
$md$,
   $md$const ctx = document.querySelector("#tavtsan").getContext("2d");

ctx.fillStyle = "#eb5757";
ctx.beginPath();
ctx.arc(240, 160, 40, 0, Math.PI * 2);
ctx.fill();$md$,
   true, 1),

  ('30000000-0000-4000-8000-000000000702', '20000000-0000-4000-8000-000000001116', '10000000-0000-4000-8000-000000000006',
   'togloomiin-gogtsoo', 'Тоглоомын гогцоо', 'The game loop', 'code', null, 16,
   $md$Тоглоом бол секундэд 60 удаа давтагддаг гурван алхам: **цэвэрлэ → тооц → зур**.

```js
let x = 20;

function frame() {
  ctx.clearRect(0, 0, 480, 320);   // цэвэрлэ
  x += 2;                           // тооц
  ctx.fillRect(x, 140, 40, 40);     // зур
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

`clearRect` хийхээ мартвал дүрс арилахгүй, мөр татсан будаг шиг үлдэнэ. Заримдаа тэр нь сонирхолтой байдаг ч ихэвчлэн алдаа.

## setInterval бүү ашигла

`requestAnimationFrame` дэлгэцийн сэргээлттэй зохицдог: 120Hz дэлгэц дээр 120 удаа, батерей хэмнэх горимд цөөн удаа дуудагдана. `setInterval(frame, 16)` бол таамаг.

## Хугацаанд суурилсан хөдөлгөөн

Кадр бүрт `x += 2` гэвэл хурдан компьютер дээр тоглоом хурдан явна. Зөв нь — **өнгөрсөн хугацаагаар** үржүүлэх:

```js
let last = 0;
function frame(now) {
  const dt = (now - last) / 1000;  // секундээр
  last = now;
  x += 200 * dt;                    // секундэд 200 цэг
  requestAnimationFrame(frame);
}
```

Ингэснээр ямар ч төхөөрөмж дээр ижил хурдтай болно.$md$,
   null, 'js',
   $md$let x = 20;
let last = 0;

function frame(now) {
  // dt тооцоод, секундэд 150 цэгийн хурдаар баруун тийш хөдөлгө
  // Ирмэгт хүрвэл эргэ
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);$md$,
   $md$let x = 20;
let chiglel = 1;
let last = 0;

function frame(now) {
  const dt = last ? (now - last) / 1000 : 0;
  last = now;

  x += 150 * dt * chiglel;
  if (x > 440 || x < 0) chiglel *= -1;

  ctx.clearRect(0, 0, 480, 320);
  ctx.fillStyle = "#7b83eb";
  ctx.fillRect(x, 140, 40, 40);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);$md$,
   false, 2),

  ('30000000-0000-4000-8000-000000000703', '20000000-0000-4000-8000-000000001116', '10000000-0000-4000-8000-000000000006',
   'udirdlaga-murguldun', 'Удирдлага ба мөргөлдөөн', 'Input and collisions', 'code', null, 18,
   $md$## Товчлуур

Дарагдсан товчлууруудыг **цуглуулдаг** объект хөтөл. `keydown` дээр шууд хөдөлгөвөл товчлуурыг дарж байхад үе үе зогсоно — гарын давталтын хоцролт.

```js
const darsan = {};
addEventListener("keydown", (e) => { darsan[e.code] = true; });
addEventListener("keyup", (e) => { darsan[e.code] = false; });

// гогцоон дотор
if (darsan.ArrowLeft) x -= 200 * dt;
if (darsan.ArrowRight) x += 200 * dt;
```

## Мөргөлдөөн

Хоёр тэгш өнцөгт огтлолцож байгаа эсэх — дөрвөн харьцуулалт. Санахад хялбар арга: **огтлолцоогүй** дөрвөн тохиолдлыг бич, дараа нь эсрэгээр нь эргүүл.

```js
function murgulduv(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
```

`<` эсвэл `<=` эсэх дээр толгой бүү өвтгө: нэг цэгийн зөрүү тоглоомд мэдрэгдэхгүй.

## Дасгал

Баруун талд тавьсан хайрцагт хүрэхэд өнгө нь солигддог болго.$md$,
   null, 'js',
   $md$const togloogch = { x: 20, y: 140, w: 40, h: 40 };
const zorilt = { x: 400, y: 140, w: 40, h: 40 };

function murgulduv(a, b) {
  // энд бич
}$md$,
   $md$const togloogch = { x: 20, y: 140, w: 40, h: 40 };
const zorilt = { x: 400, y: 140, w: 40, h: 40 };

function murgulduv(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// гогцоон дотор
ctx.fillStyle = murgulduv(togloogch, zorilt) ? "#4cb782" : "#7b83eb";$md$,
   false, 3),

  -- ══ Гурван хэмжээст
  ('30000000-0000-4000-8000-000000000704', '20000000-0000-4000-8000-000000001117', '10000000-0000-4000-8000-000000000006',
   'three-ehleh', 'Three.js-ээр эхлэх', 'Starting with Three.js', 'video',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 15,
   $md$Гурван хэмжээст дүрслэлд гурван зүйл хэрэгтэй: **дүр зураг**, **камер**, **зурагч**.

```js
import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 480 / 320, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: tavtsan });

const shoo = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x7b83eb }),
);
scene.add(shoo);

camera.position.z = 3;
renderer.render(scene, camera);
```

## Юу нь юу вэ

- **Geometry** — хэлбэр. Хайрцаг, бөмбөг, хавтгай
- **Material** — гадаргуу. Өнгө, гялалзалт, гэрэлд хэрхэн хариу үзүүлэх
- **Mesh** — хоёулангийнх нь нийлбэр, дүр зураг дээр тавигддаг зүйл

## Камер тэгийн цэг дээр байна

Юу ч харагдахгүй бол хамгийн түгээмэл шалтгаан нь энэ: камер ба дүрс хоёул `(0,0,0)` дээр байна. Камерыг холдуул — `camera.position.z = 3`.

> `import * as THREE` гэж бүү бич. Нэрийн орон зайг бүтнээр нь оруулах нь bundler-т хэрэггүй кодыг хасах боломж олгодоггүй — вэб дээр 200KB илүү явна. Хэрэгтэйг нь нэрлэж ав: `import { Scene, Mesh } from "three"`.$md$,
   null, 'js', null, null, false, 1),

  ('30000000-0000-4000-8000-000000000705', '20000000-0000-4000-8000-000000001117', '10000000-0000-4000-8000-000000000006',
   'gerel-material', 'Гэрэл ба материал', 'Light and material', 'text', null, 13,
   $md$Дүрс чинь хар өнгөтэй харагдаж байна уу? Магадгүй **гэрэл алга**.

`MeshBasicMaterial` гэрэл шаарддаггүй — үргэлж ижил өнгөтэй, хавтгай харагдана. Бодит харагдац хүсвэл гэрэлд хариу үзүүлдэг материал хэрэгтэй:

```js
const material = new THREE.MeshStandardMaterial({ color: 0x7b83eb });
scene.add(new THREE.AmbientLight(0xffffff, 0.4));      // тархсан гэрэл

const chiglelt = new THREE.DirectionalLight(0xffffff, 1);
chiglelt.position.set(2, 3, 4);
scene.add(chiglelt);
```

## Хоёр гэрэл хэрэгтэй

- **Ambient** — бүх талаас тэгш. Ганцаараа бол хавтгай харагдана
- **Directional** — нарны гэрэл шиг нэг чиглэлээс. Сүүдэр, эзлэхүүн үүсгэнэ

Ганцхан directional тавибал сүүдэрт тал нь бүрэн хар болно. Хоёуланг нь хамт хэрэглэ.

## Өнгө 16-тын тоо

`0x7b83eb` гэж бичнэ — CSS-ийн `#7b83eb` биш. Урд нь `0x`, хашилтгүй.

## Хөдөлгөөн

```js
function frame() {
  shoo.rotation.x += 0.01;
  shoo.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
```

2D-тэй ижил гогцоо — зөвхөн `render` нэмэгдсэн.$md$,
   null, 'js', null, null, false, 2),

  ('30000000-0000-4000-8000-000000000706', '20000000-0000-4000-8000-000000001117', '10000000-0000-4000-8000-000000000006',
   'bodit-togloom', 'Бодит тоглоом угсрах', 'Putting a game together', 'code', null, 20,
   $md$Сурсан бүхнээ нийлүүлье: гурван хэмжээст талбай, удирдлагатай дүр, цуглуулах эд зүйл, оноо.

## Бүтэц

```
эхлүүлэх   → дүр зураг, камер, гэрэл, объектууд
гогцоо     → оролт унших → байрлал шинэчлэх → мөргөлдөөн → зурах
дуусгах    → оноо харуулах
```

## Гурван хэмжээст дэх мөргөлдөөн

Тэгш өнцөгтийн оронд **зай** хардаг нь хамгийн хялбар:

```js
const zai = togloogch.position.distanceTo(zoos.position);
if (zai < 1) {
  scene.remove(zoos);
  onoo += 1;
}
```

Нарийн тоглоомд хайрцаг (`Box3`) ашиглана, гэхдээ бөмбөрцөг хэлбэрийн шалгалт ихэнх тохиолдолд хангалттай бөгөөд хурдан.

## Дасгал

Товчлуураар хөдөлдөг шоо, санамсаргүй байрлалд гарч ирдэг бөмбөг, хүрэхэд оноо нэмэгддэг болго.

> Эхний тоглоомоо жижиг бай. Нэг механик, нэг дэлгэц, нэг зорилго. Дуусгасан жижиг тоглоом бол дуусаагүй том тоглоомоос хавьгүй их зүйл заадаг.$md$,
   null, 'js',
   $md$const togloogch = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.6, 0.6),
  new THREE.MeshStandardMaterial({ color: 0x7b83eb }),
);
scene.add(togloogch);

let onoo = 0;
// Бөмбөг нэмээд, хүрэхэд оноо нэмэгддэг болго$md$,
   $md$const togloogch = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.6, 0.6),
  new THREE.MeshStandardMaterial({ color: 0x7b83eb }),
);
scene.add(togloogch);

let onoo = 0;
let zoos = null;

function shineZoos() {
  if (zoos) scene.remove(zoos);
  zoos = new THREE.Mesh(
    new THREE.SphereGeometry(0.3),
    new THREE.MeshStandardMaterial({ color: 0x4cb782 }),
  );
  zoos.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, 0);
  scene.add(zoos);
}
shineZoos();

function frame() {
  if (darsan.ArrowLeft) togloogch.position.x -= 0.05;
  if (darsan.ArrowRight) togloogch.position.x += 0.05;
  if (darsan.ArrowUp) togloogch.position.y += 0.05;
  if (darsan.ArrowDown) togloogch.position.y -= 0.05;

  if (zoos && togloogch.position.distanceTo(zoos.position) < 0.9) {
    onoo += 1;
    shineZoos();
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);$md$,
   false, 3)
on conflict (id) do update set
  module_id = excluded.module_id, course_id = excluded.course_id, slug = excluded.slug,
  title_mn = excluded.title_mn, title_en = excluded.title_en, kind = excluded.kind,
  video_url = excluded.video_url, duration_minutes = excluded.duration_minutes,
  body_mn = excluded.body_mn, body_en = excluded.body_en,
  code_language = excluded.code_language, starter_code = excluded.starter_code,
  solution_code = excluded.solution_code, is_preview = excluded.is_preview, rank = excluded.rank;

-- ── «Танилцуулга хичээл», бүтнээр нь ────────────────────────────────────────
--
-- Энэ сургалт нь өмнө нь сургуулийн тухай тойм байсан. Одоо код бичиж
-- үзээгүй хүнд зориулсан жинхэнэ танилцуулга: код гэж юу вэ, юун дээр
-- ажилладаг вэ, ямар хэрэгсэл байдаг вэ, тэдгээрийн доор юу байдаг вэ.

insert into public.lessons
  (id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes,
   body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank)
values
  ('30000000-0000-4000-8000-000000000801', '20000000-0000-4000-8000-000000001101', '10000000-0000-4000-8000-000000000001',
   'code-gej-yu-ve', 'Код гэж юу вэ', 'What code is', 'video',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 7,
   $md$Код бол компьютерын яг дагаж биелүүлдэг заавар. Өөр юу ч биш.

## Жор ба код

Хоолны жорыг бодоод үз. «Ус буцалга», «давс нэм», «арван минут чана» — дараалсан заавар. Хүн жорыг уншаад дутууг нь өөрөө нөхдөг: хэдэн грамм давс гэж бичээгүй ч чи мэдэж байгаа.

Компьютер нөхөхгүй. Хэдийг нь хэлээгүй бол асуухгүй, таахгүй — зогсоно. Тиймээс код бичих нь ухаалаг байхаас илүү **нарийн** байх тухай ажил юм.

## Код бол зүгээр л текст

```js
const ner = "Ганбат";
console.log("Сайн уу, " + ner);
```

Энэ бол хоёр мөр текст. Notepad дээр ч бичиж болно. Ялгаа нь — тэр текстийг уншиж, биелүүлдэг програм байдагт л оршино. Дээрх хоёр мөрийг хөтчийн консол дээр тавихад «Сайн уу, Ганбат» гэж хэвлэнэ.

## Хэл гэж юу вэ

JavaScript, Python, Swift — эдгээр нь хэл. Хүний хэлтэй адил: үг, дүрэм, утга. Ялгаа нь дүрэм нь маш цөөхөн бөгөөд огт уян хатан биш.

Нэг хэл сурвал дараагийнх нь илүү хялбар болдог. Учир нь хувьсагч, нөхцөл, давталт, функц гэсэн ойлголтууд бүх хэлэнд байдаг — зөвхөн бичлэг нь өөр.

## Хамгийн түгээмэл эндүүрэл

«Кодыг цээжлэх ёстой» гэж боддог. Үгүй. Хэн ч бүх функцийн нэрийг цээжлээгүй. Цээжлэх ёстой зүйл бол **бодох арга**: асуудлыг жижиг алхам болгон хуваах, алхам бүрийг нарийн бичих.

> Эхний долоо хоногт код бичихгүй байж болно. Гэхдээ өдөр бүр арван минут уншиж, нэг мөр өөрчилж үзвэл гуравдугаар долоо хоногт өөрөө бичиж эхэлнэ.$md$,
   $md$Code is a set of instructions a computer follows exactly. Nothing more.$md$,
   null, null, null, true, 1),

  ('30000000-0000-4000-8000-000000000802', '20000000-0000-4000-8000-000000001101', '10000000-0000-4000-8000-000000000001',
   'code-herhen-ajilladag', 'Код хэрхэн ажилладаг вэ', 'How code runs', 'text', null, 9,
   $md$Чи текст бичнэ. Тэр текстийг хэн нэгэн уншиж, биелүүлнэ. Тэр «хэн нэгэн» юу вэ?

## Хоёр зам

- **Тайлбарлагч** (interpreter) — мөр мөрөөр нь уншиж, тэр дор нь биелүүлнэ. JavaScript, Python ийм.
- **Хөрвүүлэгч** (compiler) — бүх кодыг урьдчилан машины хэл рүү хөрвүүлээд, дараа нь ажиллуулна. C, Rust, Swift ийм.

Эхлэгчид тайлбарлагчтай хэл илүү тохиромжтой: бичсэн даруйдаа үр дүнг нь хардаг.

## Хөтөч дотор

Chrome дотор **V8** нэртэй JavaScript хөдөлгүүр байдаг. Хуудас ачаалахад:

1. HTML-ийг уншиж, бүтцийг үүсгэнэ.
2. CSS-ийг уншиж, хэрхэн харагдахыг тооцно.
3. JavaScript-ийг олоод V8 руу өгнө. V8 биелүүлнэ.

Тиймээс JavaScript нь ямар ч тусгай суулгацгүйгээр ажилладаг цорын ганц хэл — хөтөч бүр дотроо авч явдаг.

## Програмын гурван хэсэг

Ямар ч програм гурван зүйлээс бүрдэнэ:

- **Оролт** — хэрэглэгчийн бичсэн зүйл, файл, товч дарсан үйлдэл
- **Боловсруулалт** — тооцоо, шалгалт, өөрчлөлт
- **Гаралт** — дэлгэц дээрх текст, хадгалагдсан файл, илгээгдсэн хүсэлт

Том систем ч мөн адил. Зөвхөн энэ гурав нь олон давхар давтагдана.

## Алдааны тухай

Алдааны улаан мессеж бол бүтэлгүйтэл биш. Тэр бол компьютер чамд **аль мөрийг нь дагаж чадаагүйгээ** хэлж байгаа хэрэг.

```
Uncaught ReferenceError: ner is not defined
    at app.js:12
```

Энэ нь: 12-р мөрөнд `ner` гэж бичсэн боловч тийм нэртэй хувьсагч алга гэсэн үг. Ихэнхдээ шалтгаан нь үсгийн алдаа, эсвэл хувьсагчаа зарлаагүй байдаг.

**Хамгийн түгээмэл эндүүрэл**: алдаа гарахаар айж, бүх кодоо устгаад дахин бичдэг. Үүний оронд мессежийг бүтнээр нь уншаарай — мөрийн дугаар, нэр хоёр нь ихэвчлэн хариуг шууд хэлж байдаг.$md$,
   null, null, null, null, true, 2),

  ('30000000-0000-4000-8000-000000000803', '20000000-0000-4000-8000-000000001101', '10000000-0000-4000-8000-000000000001',
   'yu-ashiglaj-surah-ve', 'Ямар ямар зүйлс ашиглаж сурах вэ', 'What you will be using', 'text', null, 9,
   $md$Энэ сургуулийг дуусгахад чи дараах зүйлсийг ашиглаж чаддаг болно. Одоо бүгдийг нь ойлгох шаардлагагүй — нэр нь танил болоход л хангалттай.

## Бичих газар

- **VS Code** — кодын засварлагч. Үнэгүй. Өнгөөр ялгаж, алдааг зааж өгнө.
- **Терминал** — тушаал бичдэг хар цонх. Айх зүйл байхгүй, ердөө хэдэн тушаал л хэрэгтэй.
- **Хөтөч** — Chrome. `F12` дарахад хөгжүүлэгчийн хэрэгсэл нээгдэнэ.

## Хэлүүд

- **HTML** — хуудсанд юу байгааг хэлнэ. Гарчиг, догол мөр, зураг.
- **CSS** — тэр нь хэрхэн харагдахыг хэлнэ. Өнгө, зай, байрлал.
- **JavaScript** — юу болохыг хэлнэ. Товч дархад, өгөгдөл татахад.
- **Python** — өгөгдөл, автоматжуулалт, хиймэл оюунд хамгийн өргөн хэрэглэгддэг.

## Дээд давхаргууд

- **React** — хуудсыг жижиг, дахин ашиглах хэсгүүд болгон бичих арга.
- **Next.js** — React дээр суурилсан бүтэн вэб framework. Энэ сургуулийн сайт үүгээр хийгдсэн.
- **Expo / React Native** — ижил мэдлэгээр iOS, Android апп бичих.

## Доод давхаргууд

- **Node.js** — JavaScript-ийг хөтчөөс гадна, компьютер дээр ажиллуулдаг.
- **Supabase** — өгөгдлийн сан, нэвтрэлт, файл хадгалалтыг нэг дор өгдөг үйлчилгээ.
- **Git ба GitHub** — кодын түүх, хуулбар, хамтын ажиллагаа.
- **Vercel** — хийсэн сайтаа интернэтэд гаргах газар.

## Дараалал

Бүгдийг нэг дор сурахыг **бүү оролд**. Энэ бол хамгийн түгээмэл алдаа: гурван хэлний хичээлийг зэрэг эхлээд, гурвуулаа хагас дутуу үлддэг.

Дараалал нь:

1. Кодын суурь — хувьсагч, нөхцөл, функц
2. Landing page — HTML, CSS, бодит үр дүн
3. Fullstack — React, Next.js, өгөгдлийн сан
4. Гар утас, эсвэл тоглоом — аль нь сонирхолтой байна тэр

Эхний хоёрыг дуусгахад чи ажил хийж чадах хэмжээнд хүрнэ.$md$,
   null, null, null, null, false, 3),

  ('30000000-0000-4000-8000-000000000804', '20000000-0000-4000-8000-000000001118', '10000000-0000-4000-8000-000000000001',
   'claude-ashiglah', 'Claude ашиглах нь', 'Working with Claude', 'text', null, 11,
   $md$Claude бол хиймэл оюунт туслах. Код бичиж, тайлбарлаж, алдааг чинь олж өгч чадна. Зөв ашиглавал багш, буруу ашиглавал сурахад чинь саад.

## Зөв асуулт

Муу асуулт: «Надад to-do апп бичиж өг.»

Сайн асуулт: «Би to-do апп хийж байна. Товч дархад жагсаалтад мөр нэмэгдэх ёстой боловч юу ч болохгүй байна. Кодоо доор тавилаа. Юу буруу байж болох вэ, яагаад гэдгийг нь тайлбарлаж өгөөч.»

Ялгаа нь: эхнийх нь чамд код өгнө, хоёр дахь нь чамд **ойлголт** өгнө.

## Алдаа гарвал

Алдааны мессежийг **бүтнээр нь** хуулж тавь. Эхний мөрийг нь биш, бүгдийг нь — мөрийн дугаар, файлын нэр хамт. Дараа нь холбогдох кодоо тавь.

```
Uncaught TypeError: Cannot read properties of null (reading "value")
    at handleClick (app.js:23)
```

Ийм мессежтэй хамт кодоо өгвөл хариу нь бараг үргэлж зөв гардаг.

## Хийж болохгүй зүйлс

- **Нууц түлхүүр, нууц үг бүү тавь.** `.env` файлын доторх утгууд, картын дугаар, өөр хүний хувийн мэдээлэл — хэзээ ч.
- **Ойлгоогүй кодоо бүү хуул.** Ажиллаж байгаа нь ойлгосон гэсэн үг биш. Долоо хоногийн дараа тэр код эвдэрвэл чи засаж чадахгүй.
- **Хариуг нь шалгалгүй бүү итгэ.** Ажиллуулж үз. Зөв ажиллаж байна уу? Огт өөр зүйл хийж байна уу?

## Хамгийн үнэ цэнэтэй хэрэглээ

Кодоо бичсэний **дараа** асуу: «Энэ кодыг хараад юуг нь сайжруулж болох вэ? Ямар тохиолдолд эвдрэх вэ?» Энэ бол туршлагатай хүн чиний мөрөн дээгүүр хараад зөвлөж байгаатай адил.

> Claude чиний оронд бодохгүй. Чамайг хурдан бодоход л туслана. Ялгаа нь их.$md$,
   null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000000805', '20000000-0000-4000-8000-000000001118', '10000000-0000-4000-8000-000000000001',
   'server-gej-yu-ve', 'Сервер гэж юу вэ', 'What a server is', 'text', null, 9,
   $md$Сервер бол тусгай ид шид биш. Хүсэлт хүлээж суудаг компьютер.

## Хэрэглэгч ба сервер

- **Клиент** — чиний хөтөч, эсвэл утасны апп. Хүсэлт илгээнэ.
- **Сервер** — хаа нэгтээ ажиллаж байгаа компьютер. Хүсэлтийг хүлээж аваад хариу буцаана.

```
Хөтөч:  GET /courses  →
                        ← Сервер: 200 OK, HTML эсвэл JSON
```

Энэ л бүхэл юм. Facebook ч, банк ч ижил зарчмаар ажиллана — зөвхөн олон мянган хүсэлт зэрэг ирдэг.

## localhost гэж юу вэ

Хөгжүүлж байхдаа чи өөрийн компьютер дээрээ сервер асаана:

```
npm run dev
→ http://localhost:3000
```

`localhost` нь «энэ компьютер» гэсэн үг. `3000` нь **порт** — нэг компьютер дээр олон сервер зэрэг ажиллаж болох тул дугаараар нь ялгадаг.

**Хамгийн түгээмэл эндүүрэл**: `localhost:3000` холбоосыг найздаа явуулж «нээгээд үз» гэдэг. Найзын компьютер дээр тэр хаяг нь **түүний** компьютерыг заана. Бусдад харагдахын тулд интернэтэд байршуулах хэрэгтэй.

## Урд тал, ард тал

- **Frontend** — хэрэглэгчийн харж байгаа хэсэг. Хөтөч дотор ажиллана.
- **Backend** — сервер дээр ажилладаг хэсэг. Өгөгдлийн сан руу хандах, төлбөр боловсруулах, нууц түлхүүр хадгалах.

Яагаад заавал хоёр хэсэг байх ёстой вэ? Учир нь хөтөч дотор байгаа бүх зүйлийг хэрэглэгч харж чадна. Нууц түлхүүрийг тэнд тавьбал нууц биш болно.

## Байршуулах

Кодоо бусдын серверт байрлуулахыг **deploy** гэнэ. Vercel, Netlify зэрэг үйлчилгээ үүнийг нэг товчоор хийдэг: GitHub-тай холбоод, кодоо түлхэхэд л шинэ хувилбар нь гарна.$md$,
   null, null, null, null, false, 2),

  ('30000000-0000-4000-8000-000000000806', '20000000-0000-4000-8000-000000001118', '10000000-0000-4000-8000-000000000001',
   'database-gej-yu-ve', 'Database гэж юу вэ', 'What a database is', 'text', null, 10,
   $md$Хуудсаа дахин ачаалахад бичсэн зүйл чинь алга болдог. Учир нь тэр зөвхөн санах ойд байсан. Үлдээхийн тулд өгөгдлийн сан хэрэгтэй.

## Хүснэгт гэж бодоорой

Өгөгдлийн сан бол Excel-ийн хүснэгттэй төстэй:

- **Хүснэгт** (table) — нэг төрлийн зүйлсийн жагсаалт. Жишээ нь `users`.
- **Мөр** (row) — нэг зүйл. Нэг хэрэглэгч.
- **Багана** (column) — тэр зүйлийн нэг шинж. Нэр, и-мэйл, бүртгүүлсэн огноо.

| id | email | full_name |
| --- | --- | --- |
| 1 | bat@жишээ.mn | Бат |
| 2 | sara@жишээ.mn | Сараа |

## SQL

Өгөгдлийн сантай ярих хэл нь SQL. Англи өгүүлбэртэй төстэй:

```sql
select full_name from users where id = 2;
```

«`users` хүснэгтээс `id` нь 2 байгаа мөрийн `full_name`-ийг өгөөч» гэсэн үг.

## Холбоо

Хамгийн хүчтэй тал нь хүснэгтүүдийг хооронд нь холбодогт оршино. Сургалтууд нэг хүснэгтэд, хичээлүүд нөгөөд, харин хичээл бүр өөрийн сургалтын `id`-г авч явна. Үүнийг **гадаад түлхүүр** (foreign key) гэнэ.

Ингэснээр «энэ сургалтын бүх хичээлийг өг» гэж асуух боломжтой болно, мөн байхгүй сургалтад хичээл нэмэх боломжгүй болно — өгөгдлийн сан өөрөө татгалзана.

## Postgres ба Supabase

**Postgres** бол хамгийн өргөн хэрэглэгддэг нээлттэй эхийн өгөгдлийн сан. **Supabase** нь Postgres-ийг үүлэн дээр ажиллуулж, дээр нь нэвтрэлт, файл хадгалалт, эрхийн удирдлагыг нэмж өгдөг. Энэ сургуулийн бүх өгөгдөл яг тэнд байгаа.

## Хоёр түгээмэл алдаа

- **Нууц үгийг задгай хадгалах.** Хэзээ ч болохгүй. Нэвтрэлтийн систем нь нууц үгийг эргэж уншиж болдоггүй хэлбэрт хувиргаж хадгалдаг.
- **Хөтөчид итгэх.** «Энэ товчийг зөвхөн админ харна» гэж нуух нь хамгаалалт биш. Шалгалт нь заавал сервер эсвэл өгөгдлийн сан дээр байх ёстой.$md$,
   null, null, null, null, false, 3),

  ('30000000-0000-4000-8000-000000000807', '20000000-0000-4000-8000-000000001118', '10000000-0000-4000-8000-000000000001',
   'github-hamgiin-chuhal', 'GitHub бол хамгийн чухал нь', 'GitHub matters most', 'text', null, 12,
   $md$Хэрэв энэ сургалтаас ганцхан зүйл сонгож авах ёстой бол — Git сур.

## Git гэж юу вэ

Git бол кодын **цагийн машин**. Ажиллаж байсан үеийн хувилбарыг хадгалж, хүссэн үедээ буцаж очих боломж өгнө.

```bash
git add .
git commit -m "Нэвтрэлтийн товчийг нэмэв"
```

`commit` бүр нь хадгалалтын цэг: хэзээ, юуг, хэн өөрчилснийг тайлбартай нь үлдээнэ.

## Яагаад чухал вэ

- **Буцаж чадна.** Хоёр цаг ажиллаад бүгдийг эвдлэв? Өмнөх commit руу буцаана.
- **Түүхтэй.** «Энэ мөр яагаад ийм байгаа юм бэ?» Хариулт нь түүхэнд байгаа.
- **Хамтарч чадна.** Хоёр хүн нэг файл дээр зэрэг ажиллаад дараа нь нийлүүлж болно.
- **Ажлын байр.** Ажил олгогч чиний GitHub-ыг харна. Тогтмол commit хийсэн түүх нь ярианаас илүү ярьдаг.

## GitHub

Git нь чиний компьютер дээр ажиллана. **GitHub** нь тэр түүхийг интернэтэд байрлуулах газар.

- **Repository (repo)** — нэг төслийн бүх код, бүх түүх
- **push** — өөрийн commit-уудаа GitHub руу илгээх
- **pull** — бусдын өөрчлөлтийг татаж авах
- **branch** — үндсэн кодоо эвдэлгүйгээр шинэ зүйл туршиж үзэх салаа
- **Pull request** — «Би ийм өөрчлөлт хийлээ, хараад нийлүүлээч» гэсэн санал

## Хоёр алдаа, аль аль нь өдөр бүр гардаг

**Нэг: `.env` файлаа commit хийх.** Тэр дотор өгөгдлийн сангийн нууц түлхүүр байдаг. GitHub дээр нэг удаа гарсан түлхүүрийг устгасан ч түүхэнд үлдэнэ — солих л хэрэгтэй болно. `.gitignore` файлдаа `.env` гэж бичээд эхлээрэй.

**Хоёр: `node_modules` хавтсыг commit хийх.** Тэр хавтас хэдэн мянган файлтай бөгөөд `package.json`-оос дахин үүсгэгддэг. Мөн `.gitignore` руу.

> Эхний өдрөөсөө эхлээд commit хий. Төгс код хүлээх шаардлагагүй — «эхэлсэн» гэсэн commit ч түүхийн эхлэл болно.$md$,
   null, null, null, null, false, 4),

  -- ══ Төгсгөлийн шалгалтууд ══
  ('30000000-0000-4000-8000-000000000901', '20000000-0000-4000-8000-000000001119', '10000000-0000-4000-8000-000000000001',
   'shalgalt-tanilcuulga', 'Төгсгөлийн шалгалт', 'Final exam', 'quiz', null, 10,
   $md$Арван асуулт. Долоон хичээлээс бүгд асуугдана.

Зургаан ба түүнээс дээш зөв хариулбал тэнцэнэ. Буруу хариулбал яагаад болохыг тайлбарлана — тэрийг уншаад дахин оролдож болно.$md$,
   null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000000902', '20000000-0000-4000-8000-000000001120', '10000000-0000-4000-8000-000000000002',
   'shalgalt-code-suuri', 'Төгсгөлийн шалгалт', 'Final exam', 'quiz', null, 10,
   $md$Арван асуулт: ойлголтууд, өгөгдлийн хэлбэр, захиалах, шалгах.

Зургаан ба түүнээс дээш зөв хариулбал тэнцэнэ.$md$,
   null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000000903', '20000000-0000-4000-8000-000000001121', '10000000-0000-4000-8000-000000000003',
   'shalgalt-landing-page', 'Төгсгөлийн шалгалт', 'Final exam', 'quiz', null, 10,
   $md$Арван асуулт: HTML, CSS, байрлал, утсанд тохируулах, байршуулах.

Зургаан ба түүнээс дээш зөв хариулбал тэнцэнэ.$md$,
   null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000000904', '20000000-0000-4000-8000-000000001122', '10000000-0000-4000-8000-000000000004',
   'shalgalt-fullstack', 'Төгсгөлийн шалгалт', 'Final exam', 'quiz', null, 10,
   $md$Арван асуулт: React, Next.js, Supabase, TypeScript.

Зургаан ба түүнээс дээш зөв хариулбал тэнцэнэ.$md$,
   null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000000905', '20000000-0000-4000-8000-000000001123', '10000000-0000-4000-8000-000000000005',
   'shalgalt-mobile', 'Төгсгөлийн шалгалт', 'Final exam', 'quiz', null, 10,
   $md$Арван асуулт: Expo, React Native, дэлгэц, навигаци, дэлгүүрт гаргах.

Зургаан ба түүнээс дээш зөв хариулбал тэнцэнэ.$md$,
   null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000000906', '20000000-0000-4000-8000-000000001124', '10000000-0000-4000-8000-000000000006',
   'shalgalt-toglom', 'Төгсгөлийн шалгалт', 'Final exam', 'quiz', null, 10,
   $md$Арван асуулт: Canvas, тоглоомын гогцоо, мөргөлдөөн, Three.js.

Зургаан ба түүнээс дээш зөв хариулбал тэнцэнэ.$md$,
   null, null, null, null, false, 1)
on conflict (id) do update set
  module_id = excluded.module_id, course_id = excluded.course_id, slug = excluded.slug,
  title_mn = excluded.title_mn, title_en = excluded.title_en, kind = excluded.kind,
  video_url = excluded.video_url, duration_minutes = excluded.duration_minutes,
  body_mn = excluded.body_mn, body_en = excluded.body_en,
  code_language = excluded.code_language, starter_code = excluded.starter_code,
  solution_code = excluded.solution_code, is_preview = excluded.is_preview, rank = excluded.rank;

-- Хуучин «Танилцуулга»-гийн гурван хичээл.
--
-- Тэдгээр нь сургуулийн тухай тойм байсан бөгөөд дээрх долоо тэднийг орлож
-- байна. Нэг бүрчлэн нэрлэж устгаж байгаа нь санаатай: «seed-д байхгүй бүхнийг
-- устга» гэсэн дүрэм админ консолоос үүсгэсэн хичээлийг ч мөн устгах байсан, ба
-- `lessons` нь `lesson_progress`, `quiz_questions` руу каскадаар дамждаг.
delete from public.lessons
 where id in ('30000000-0000-4000-8000-000000000101',
              '30000000-0000-4000-8000-000000000601',
              '30000000-0000-4000-8000-000000000602');

-- ── «Кодын суурь», код заахгүйгээр ─────────────────────────────────────────
--
-- Энэ сургалт JavaScript, Python хоёрыг заадаг байсан. Сургууль код бичиж
-- сургахаа больсон тул агуулга нь солигдов: ойлголт бүрийг нэрлэж, түүнийг
-- хэрхэн промпт болгож бичих, гарсан үр дүнг хэрхэн унших, юуг нь заавал
-- шалгахыг заана. Нэр нь хэвээр — хайлтад танил, утга нь мөн адил зөв.

insert into public.lessons
  (id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes,
   body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank)
values
  ('30000000-0000-4000-8000-000000001001', '20000000-0000-4000-8000-000000001102', '10000000-0000-4000-8000-000000000002',
   'huvisagch-hairtsag', 'Хувьсагч — нэртэй хайрцаг', 'Variables', 'video',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 12,
   $md$Хувьсагч бол утга хадгалдаг, нэр өгсөн хайрцаг. Өөр юу ч биш.

## Яагаад нэр хэрэгтэй вэ

Програм ажиллаж байхдаа олон зүйлийг санаж байх хэрэгтэй болдог: хэн нэвтэрсэн, сагсанд юу байгаа, хэдэн төгрөг болсон. Тэр бүрийг нэртэй хайрцагт хийж тавьдаг.

Нэр нь сайн байвал бүх зүйл ойлгомжтой болно. `a`, `x`, `data1` гэсэн нэрс нь долоо хоногийн дараа юу ч хэлэхгүй. `hereglegchiin_ner`, `niit_dun` гэвэл уншаад л ойлгоно.

## Захиалахад яаж хэрэглэх вэ

Юм захиалахдаа юуг нь санаж байх ёстойг нь хэлж өгөх хэрэгтэй. Энэ нь чухал — учир нь хиймэл оюун таамаглахаас өөр аргагүй болдог.

> Хэрэглэгчийн нэр, и-мэйл хоёрыг санаж байгаад дараа нь мэндчилгээнд ашигла.

Ийм нэг өгүүлбэр нь «хэрэглэгчийн мэдээллийг ав» гэсэн ерөнхий захиалгаас хамаагүй зөв үр дүн өгнө.

## Өөрчлөгддөг ба өөрчлөгддөггүй

Зарим хайрцгийн агуулга хэзээ ч солигдохгүй — сайтын нэр, татварын хувь. Зарим нь байнга солигдоно — сагсны дүн, хуудасны дугаар.

Энэ ялгааг хэлж өгвөл алдаанаас хамгаална:

> Татварын хувийг нэг газар тогтоож бич, дараа нь хаа сайгүй тэрийгээ ашигла.

## Түгээмэл алдаа

Нэг зүйлийг хоёр газар хадгалах. Жишээ нь үнийг нэг газар, хямдралтай үнийг өөр газар. Хоёулаа тусдаа амьдарч эхлээд эрт орой хэзээ нэгэн цагт зөрнө.

> Үнийг нэг л газар хадгалаад, хямдралыг түүнээс тооцож гарга.$md$,
   null, null, null, null, true, 1),

  ('30000000-0000-4000-8000-000000001002', '20000000-0000-4000-8000-000000001102', '10000000-0000-4000-8000-000000000002',
   'nuhtsul-herew', 'Нөхцөл — хэрэв… бол', 'Conditions', 'text',
   null, 12,
   $md$Нөхцөл бол дүрэм. «Хэрэв ийм бол тэгнэ, үгүй бол өөрөөр.»

## Замын салаа

Програм шулуун урсдаггүй. Замд нь салаа гарч, аль нэгээр нь явна:

- Хэрэглэгч нэвтэрсэн бол — хяналтын самбар харуулна. Үгүй бол — нэвтрэх хуудас.
- Сагс хоосон бол — «хоосон байна» гэж бичнэ. Үгүй бол — жагсаалтыг харуулна.
- Нас 18-аас дээш бол — үргэлжлүүлнэ. Үгүй бол — татгалзана.

## Захиалахад

Дүрмээ **бүтнээр нь** хэлэх ёстой. Хамгийн түгээмэл алдаа нь зөвхөн «тийм» талыг хэлж, «үгүй бол юу болохыг» мартдаг явдал.

Дутуу:

> Хэрэглэгч нэвтэрсэн бол захиалгаа харуулна.

Бүтэн:

> Хэрэглэгч нэвтэрсэн бол захиалгаа харуулна. Нэвтрээгүй бол нэвтрэх хуудас руу шилжүүлнэ. Нэвтэрсэн ч захиалга байхгүй бол «Танд захиалга алга» гэж харуулна.

Гурав дахь тохиолдлыг анзаарсан уу? Тэр л ихэнхдээ мартагддаг — хоосон дэлгэц гарч ирээд хэрэглэгч эвдэрсэн гэж бодно.

## Гурван асуултыг үргэлж асуу

- Юу байвал **тийм** вэ?
- Юу байвал **үгүй** вэ?
- **Хоосон** эсвэл **дутуу** байвал юу вэ?

Энэ гурвыг хэлж чадвал захиалга чинь бүтэн болно.$md$,
   null, null, null, null, true, 2),

  ('30000000-0000-4000-8000-000000001003', '20000000-0000-4000-8000-000000001102', '10000000-0000-4000-8000-000000000002',
   'davtalt-bugd-deer', 'Давталт — бүгд дээр нь давт', 'Loops', 'text',
   null, 11,
   $md$Давталт бол «жагсаалтын гишүүн бүр дээр ижил ажлыг хий» гэсэн заавар.

## Хаана байдаг вэ

Дэлгэц дээр харагддаг бараг бүх жагсаалт давталтаар зурагддаг:

- Сургалтын карт бүр
- Захиалгын мөр бүр
- Мессежийн жагсаалт
- Хайлтын үр дүн

Гурван карт байх уу, гурван зуу байх уу — заавар нь ижил. Энэ л давталтын хүч.

## Захиалахад

Жагсаалттай ажиллахдаа гурван зүйлийг хэл:

- Юуны жагсаалт вэ
- Гишүүн бүрд юу харуулах вэ
- Ямар дарааллаар вэ

> Захиалгуудыг жагсаалтаар харуул. Мөр бүрд огноо, дүн, төлөв гурвыг харуул. Хамгийн сүүлийнх нь дээрээ байх ёстой.

## Хоосон тохиолдлыг бүү мартаарай

Жагсаалт хоосон байвал юу харагдах ёстой вэ? Үүнийг хэлээгүй бол хоосон цагаан дэлгэц гарч ирнэ — хэрэглэгч эвдэрсэн гэж бодно.

> Захиалга байхгүй бол «Та одоогоор захиалга хийгээгүй байна» гэж бичээд, дэлгүүр рүү очих товч тавь.

## Хэт олон бол

Мянган мөрийг нэг дор харуулах нь удаан, уншихад ч хэцүү.

> Нэг удаад хорин мөр харуулаад, доор нь «Цааш үзэх» товч тавь.$md$,
   null, null, null, null, false, 3),

  ('30000000-0000-4000-8000-000000001004', '20000000-0000-4000-8000-000000001102', '10000000-0000-4000-8000-000000000002',
   'funkts-ner-ugsun-ajil', 'Функц — нэр өгсөн ажил', 'Functions', 'text',
   null, 12,
   $md$Функц бол нэр өгсөн ажил. Юм өгөөд, хариу авдаг машин.

## Оролт, ажил, гаралт

Жишээ нь «үнийг татвартай нь тооцох» гэсэн ажил байг. Оролт нь үнэ, гаралт нь татвартай дүн. Дундуур нь тооцоо явна.

Ийм ажил нэг удаа бичигдээд олон газар ашиглагдана: сагсанд, төлбөрийн хуудсанд, баримт дээр.

## Яагаад чухал вэ

Нэг ажлыг гурван газар давтаж бичсэн бол алдааг гурван газар засах болно. Магадгүй хоёрыг нь зассан ч гурав дахийг нь мартана — тэгээд баримт дээр өөр дүн гарч ирнэ.

## Захиалахад

Дахин ашиглагдах ажлыг тусад нь гаргаж өгөхийг нь хэл:

> Татварын тооцоог тусад нь, дахин ашиглахаар хий. Сагс, төлбөр, баримт гурав бүгд тэрийг ашиглах ёстой.

Энэ нэг өгүүлбэр нь хожим гарах олон алдаанаас сэргийлнэ.

## Нэр нь тайлбар болно

Сайн нэр өгсөн ажил өөрөө өөрийгөө тайлбарладаг. Кодыг уншихад `tatvartaiDun` гэж бичсэн байвал юу хийж байгаа нь тодорхой. `calc2` гэж бичсэн бол хэн ч мэдэхгүй.

> Функцүүдийн нэрийг юу хийж байгаагаар нь, ойлгомжтой нэрлээрэй.$md$,
   null, null, null, null, false, 4),

  ('30000000-0000-4000-8000-000000001005', '20000000-0000-4000-8000-000000001103', '10000000-0000-4000-8000-000000000002',
   'turul-tekst-too', 'Текст, тоо, тийм үгүй', 'Types', 'text',
   null, 11,
   $md$Компьютер юмыг төрлөөр нь ялгадаг. Текст өөр, тоо өөр.

## Яагаад хамаатай вэ

`2 + 3` нь **5** болно. Харин `"2" + "3"` нь **«23»** болно — учир нь хашилт дотор байвал тэр нь тоо биш текст, текстийг нэмэхгүй, залгадаг.

Энэ бол хамгийн түгээмэл алдааны эх үүсвэр: маягтаас ирсэн бүх зүйл эхлээд **текст** байдаг. Тоо болгож хөрвүүлэхгүй бол нийлбэр гэнэт «10001000» болчихно.

## Үндсэн төрлүүд

- **Текст** — нэр, хаяг, тайлбар
- **Тоо** — үнэ, тоо ширхэг, нас
- **Тийм/үгүй** — идэвхтэй эсэх, төлсөн эсэх
- **Огноо** — хэзээ болсон
- **Хоосон** — утга огт байхгүй гэдгийг зориуд хэлсэн нь

## Гэнэтийн зүйл

Утасны дугаарыг **текстээр** хадгална, тоогоор биш. Учир нь эхний тэг нь алга болно: `99112233` гэж хадгалахад `099112233` нь `99112233` болчихно. Мөн `+976` гэсэн тэмдэг тоонд багтахгүй.

Ижилхэн: гэрийн дугаар, данс, бүртгэлийн дугаар — бүгд текст.

## Захиалахад

Талбар бүрийн төрлийг хэлж өг:

> Утасны дугаарыг текстээр хадгал, эхний тэг нь алга болохгүй байх ёстой. Үнийг бүхэл тоогоор, мөнгөний нэгжийг тусад нь бүү хадгал.$md$,
   null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000001006', '20000000-0000-4000-8000-000000001103', '10000000-0000-4000-8000-000000000002',
   'jagsaalt-ba-objekt', 'Жагсаалт ба объект', 'Lists and objects', 'text',
   null, 12,
   $md$Хоёр өөр зүйл, хоёуланг нь байнга уулзана.

## Жагсаалт — олон зүйл

Ижил төрлийн олон зүйлийн цуглуулга. Бүх захиалга, бүх хэрэглэгч, бүх зураг.

Жагсаалтын тухай асуух зүйлс: хэд байна, дараалал нь ямар вэ, хоосон байж болох уу.

## Объект — нэг зүйлийн олон шинж

Нэг захиалгыг авч үзье. Тэр нь өөрөө олон шинжтэй: огноо, дүн, төлөв, хэн захиалсан, юу захиалсан.

Ийм «нэг зүйлийн олон шинж»-ийг объект гэнэ. Excel-ийн нэг мөртэй адил.

## Хоёулаа хамт

Бодит амьдралд эдгээр нь давхарлаж орно. Захиалгын **жагсаалт**, жагсаалтын гишүүн бүр нь **объект**, тэр объект дотроо бүтээгдэхүүний дахин нэг **жагсаалт**.

## Захиалахад

Өгөгдлөө ингэж тайлбарлавал хамгийн зөв ойлгогдоно:

> Захиалгын жагсаалт хэрэгтэй. Захиалга бүр нь: огноо, нийт дүн, төлөв (хүлээгдэж байгаа / илгээсэн / дууссан), хэрэглэгчийн нэр, авсан бүтээгдэхүүний жагсаалт.

Хаалт доторх гурван утгыг анзаарсан уу? Байж болох утгуудыг нэрлэх нь буруу утга орохоос сэргийлнэ.$md$,
   null, null, null, null, false, 2),

  ('30000000-0000-4000-8000-000000001007', '20000000-0000-4000-8000-000000001103', '10000000-0000-4000-8000-000000000002',
   'ogogdloo-zurj-tailbarlah', 'Өгөгдлөө зурж тайлбарлах', 'Sketching your data', 'text',
   null, 13,
   $md$Юм барихын өмнө «ямар өгөгдөл байх вэ» гэдгээ зурах нь хамгийн их цаг хэмнэдэг алхам.

## Хүснэгт болгож бич

Цаас аваад хүснэгт зур. Толгой мөрөнд нь шинжүүд, доор нь хоёр жишээ мөр. Гурван хүснэгт зурахад л ихэнх системийн бүтэц тодорно.

Жишээ нь жижиг дэлгүүрт:

- **Хэрэглэгч** — нэр, утас, хаяг
- **Бүтээгдэхүүн** — нэр, үнэ, үлдэгдэл, зураг
- **Захиалга** — огноо, дүн, төлөв, хэн захиалсан

## Холбоо

Дараа нь хүснэгтүүдийн хооронд сум зур. Захиалга нь хэрэглэгч рүү заана — «энэ захиалга хэний вэ». Захиалга нь бүтээгдэхүүн рүү ч заана — «юу авсан бэ».

Энэ сумнууд бол системийн араг яс. Эдгээрийг зөв зурвал бусад нь дагаад л явна.

## Захиалахад

Зурсан зүйлээ шууд үгээр хэлээрэй:

> Гурван зүйл хадгалах хэрэгтэй. Хэрэглэгч: нэр, утас, хаяг. Бүтээгдэхүүн: нэр, үнэ, үлдэгдэл. Захиалга: огноо, дүн, төлөв. Захиалга бүр нэг хэрэглэгчийнх бөгөөд олон бүтээгдэхүүн агуулж болно.

Ийм захиалга өгвөл өгөгдлийн сангийн бүтэц эхний оролдлогоор зөв гарна.

## Юуг нь урьдчилж бодох вэ

- Устгасан зүйлийг үнэхээр устгах уу, эсвэл «устсан» гэж тэмдэглэх үү?
- Хэрэглэгч өөрийн мэдээллээ засаж чадах уу?
- Хуучин үнийг санах шаардлагатай юу? (Захиалга хийгдсэний дараа үнэ өөрчлөгдвөл юу болох вэ?)

Эдгээрийг эхэнд нь асуувал хожим дахин барих шаардлагагүй болно.$md$,
   null, null, null, null, false, 3),

  ('30000000-0000-4000-8000-000000001008', '20000000-0000-4000-8000-000000001104', '10000000-0000-4000-8000-000000000002',
   'gurwan-uguulberer', 'Юу барихаа гурван өгүүлбэрээр', 'Three sentences', 'text',
   null, 12,
   $md$Юу барихаа гурван өгүүлбэрт багтааж чадвал захиалга чинь тодорхой болно.

## Гурван өгүүлбэр

1. **Юу вэ** — «Гоо сайхны салоны цаг захиалгын хуудас.»
2. **Хэнд зориулсан** — «Үйлчлүүлэгчид утсаараа орж, цагаа сонгоно.»
3. **Юу гарах вэ** — «Захиалга бүртгэгдээд салонд мэдэгдэл очно.»

Энэ гурав нь юу оруулах, юу хийх, юу гарахыг тодорхойлж байна. Өмнөх хичээлээр үзсэн «оролт — боловсруулалт — гаралт» яг энэ.

## Дараа нь жагсаалт

Гурван өгүүлбэрийн дараа хүсэж байгаа зүйлээ дугаарлаж бич. Дугаарласан жагсаалт нь урсгал өгүүлбэрээс хамаагүй дээр — юу ч мартагдахгүй, дараа нь нэг нэгээр нь шалгах боломжтой.

## Хязгаараа хэл

Хамгийн чухал нь энэ. Хэрэггүй зүйлээ хэлээгүй бол «магадгүй хэрэгтэй байх» гэж бодоод илүү зүйл нэмэгдэнэ.

> Одоохондоо төлбөр авахгүй. Хэрэглэгчийн бүртгэл хэрэггүй. Зөвхөн цаг захиалах, харах хоёр.

## Бүтэн жишээ

> Гоо сайхны салоны цаг захиалгын хуудас хийх гэж байна. Үйлчлүүлэгчид ихэвчлэн утсаараа орно.
>
> 1. Үйлчилгээний жагсаалт, тус бүр үнэ, үргэлжлэх хугацаатай
> 2. Огноо, цаг сонгох хэсэг — завгүй цагийг сонгуулахгүй
> 3. Нэр, утсаа бичээд баталгаажуулах
> 4. Баталгаажсаны дараа «Таны цаг бүртгэгдлээ» гэсэн мэдэгдэл
>
> Төлбөр, бүртгэл хоёр хэрэггүй. Эхлээд юу хийхээ хэлээд, дараа нь хийгээрэй.$md$,
   null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000001009', '20000000-0000-4000-8000-000000001104', '10000000-0000-4000-8000-000000000002',
   'alham-alhmaar', 'Алхам алхмаар захиалах', 'One step at a time', 'text',
   null, 13,
   $md$Бүхнийг нэг дор захиалбал бүхнийг нэг дор шалгах хэрэгтэй болно. Тэр нь бараг боломжгүй.

## Яагаад алхам алхмаар вэ

Нэг том захиалга өгөөд хорин файл гарч ирвэл: юу нь ажиллаж байгааг мэдэхгүй, аль хэсэг нь эвдэрсэнийг олохгүй, засахыг хүсвэл хаанаас эхлэхээ мэдэхгүй.

Жижиг алхмаар явбал алхам бүрийн дараа шалгаж, ажиллаж байгааг нь баталгаажуулаад цааш явна.

## Сайн дараалал

1. **Бүтэц** — хуудас, хэсгүүд нь. Загваргүй ч гэсэн байрлал нь тодрох
2. **Агуулга** — жинхэнэ текст, зураг
3. **Загвар** — өнгө, фонт, зай
4. **Үйлдэл** — товч дархад юу болох
5. **Онцгой тохиолдол** — хоосон, алдаа, ачаалж байгаа төлөв

Алхам бүрийн дараа нэг л зүйл шалгана.

## «Эхлээд төлөвлөгөө» гэдэг заль

Энэ өгүүлбэрийг захиалга бүртээ нэмээрэй:

> Эхлээд юу хийхээ хэлээд, зөвшөөрөл аваад дараа нь хийгээрэй.

Ингэснээр буруу зүг рүү явахаас нь өмнө зогсоож чадна. Хорин файл бичигдсэний дараа «би тэгэхийг хүсээгүй» гэхээс хамаагүй хямд.

## Нэг удаад нэг зүйл

Засвар хийхдээ ч мөн адил. Гурван зүйлийг нэг дор өөрчилбөл аль нь юуг эвдсэнийг мэдэхгүй.

> Одоохондоо зөвхөн толгой хэсгийн өнгийг соль. Бусдыг нь бүү хөндөөрэй.$md$,
   null, null, null, null, false, 2),

  ('30000000-0000-4000-8000-000000001010', '20000000-0000-4000-8000-000000001104', '10000000-0000-4000-8000-000000000002',
   'garsan-zuiliig-unshih', 'Гарсан зүйлийг унших', 'Reading what came back', 'text',
   null, 14,
   $md$Код бичихгүй ч гэсэн гарсан зүйлийг тодорхой хэмжээнд ойлгож байх хэрэгтэй. Ойлгохгүй зүйлээ хүлээж авах нь дараа нь өөрөө өөртөө тавьсан хавх болдог.

## Юу хайх вэ

Кодыг мөр мөрөөр нь ойлгох шаардлагагүй. Гурван зүйлийг хараарай:

- **Нэрс** — файл, хэсгүүдийн нэр чиний хэлсэнтэй таарч байна уу?
- **Бүтэц** — хэдэн файл гарав? Тэд юу юуг хариуцаж байна?
- **Чиний хэлсэн зүйлс** — жагсаалтад бичсэн зүйл бүр байгаа юу?

## Тайлбар асуу

Ойлгохгүй хэсэг тааралдвал шууд асуу:

> Энэ хэсэг юу хийж байгааг код мэдэхгүй хүнд ойлгомжтой, богинохон тайлбарлаж өгөөч.

Энэ асуулт ичгэвтэр зүйл биш. Энэ бол чиний ажлын гол хэсэг.

## Бүтцийг асуу

Олон файл гарсан бол:

> Ямар файлууд үүссэн бэ, тус бүр нь юу хариуцдагийг нэг мөрөөр жагсаагаад өгөөч.

Ингэснээр хожим «энийг хаанаас засах вэ» гэхэд шууд мэдэх болно.

## Анхаарах тэмдгүүд

Эдгээр гарвал асуух хэрэгтэй:

- Чиний хэлээгүй боломж нэмэгдсэн
- Нэг зүйл олон газар давтагдсан
- Нэрс нь утгагүй эсвэл англи монгол хольсон
- «Түр зуурын», «дараа засна» гэсэн тайлбар үлдсэн

> Энд нэмэгдсэн зүйлүүдээс аль нь заавал хэрэгтэй вэ? Хэрэггүйг нь хасаад өгөөч.$md$,
   null, null, null, null, false, 3),

  ('30000000-0000-4000-8000-000000001011', '20000000-0000-4000-8000-000000001104', '10000000-0000-4000-8000-000000000002',
   'zaswariig-todorhoi', 'Засварыг тодорхой хэлэх', 'Asking for changes', 'text',
   null, 11,
   $md$Эхний хариу төгс байх шаардлагагүй. Гол нь засварыг тодорхой хэлж сурах.

## Гурван зүйлийг заа

- **Аль хэсэг** — «толгой хэсгийн», «захиалгын хүснэгтийн»
- **Юу нь** — «өнгө», «зай», «дараалал»
- **Юу болгох** — «цэнхэр», «хоёр дахин их», «шинэ нь дээрээ»

Дутуу: «арай сайхан болгооч.»

Бүтэн: «Толгой хэсгийн доорх зайг хоёр дахин ихэсгээд, гарчгийг арай том болго.»

## Хязгаарлаж хэл

> Зөвхөн энэ хэсгийг өөрчил. Бусдыг нь бүү хөндөөрэй.

Энэ өгүүлбэргүй бол засвар хийх явцад өөр хэсэг санамсаргүй өөрчлөгдөж болно.

## Буцаах

Явж явж таалагдахаа больвол буцаж болно:

> Сүүлийн гурван өөрчлөлтийг цуцлаад, өмнөх байдалд нь буцааж өгөөч.

Хэрэв Git ашиглаж байгаа бол энэ нь бүр илүү найдвартай — өмнөх хадгалалтын цэг рүүгээ буцна.

## Нэг зөвлөгөө

Засвар олон болвол жагсаалт болгож нэг дор өг, гэхдээ «нэг нэгээр нь хийгээд алхам бүрийн дараа надад хэлээрэй» гэж нэм. Ингэснээр хаана юу болсныг дагаж чадна.$md$,
   null, null, null, null, false, 4),

  ('30000000-0000-4000-8000-000000001012', '20000000-0000-4000-8000-000000001105', '10000000-0000-4000-8000-000000000002',
   'yuug-zaawal-shalgah', 'Юуг заавал шалгах вэ', 'The checklist', 'text',
   null, 12,
   $md$Гарсан зүйлийг шалгах нь чиний ажил. Хиймэл оюун өөрийгөө шалгаж чадахгүй.

## Долоон шалгалт

Юм бэлэн боллоо гэвэл дараах жагсаалтыг дагаарай:

- **Ажиллаж байна уу** — үндсэн зүйлээ хийж үз, зөвхөн хараад бүү дүгнэ
- **Утсан дээр** — дэлгэцээ нарийсгаад үз. Бүх зүйл багтаж байна уу?
- **Хоосон тохиолдол** — жагсаалт хоосон байхад юу харагдах вэ?
- **Буруу оролт** — хоосон талбар илгээвэл? Утасны оронд үсэг бичвэл?
- **Урт агуулга** — маш урт нэр бичвэл байрлал эвдрэх үү?
- **Удаан сүлжээ** — ачаалж байх үед юу харагдах вэ?
- **Буцах** — хөтчийн буцах товч зөв ажиллаж байна уу?

## Өөрөө туршиж үз

Хамгийн чухал нь энэ. Зөвхөн дэлгэцийн зураг хараад «болжээ» гэж бүү бод. Товчийг нь дарж үз, маягтыг нь бөглөж үз, буруу зүйл бичиж үз.

## Өөр хүнээр үзүүл

Чи юу хийхийг нь мэдэж байгаа учраас зөв дарж чадна. Мэдэхгүй хүн өгвөл юу нь ойлгомжгүй байгаа нь тэр дороо мэдэгдэнэ.

## Захиалахад

Шалгуулахыг нь шууд захиалж болно:

> Энийг хараад юуг нь сайжруулж болох вэ? Ямар тохиолдолд эвдрэх вэ? Хамгийн чухал гурвыг нь эрэмбэлээд хэлээрэй.$md$,
   null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000001013', '20000000-0000-4000-8000-000000001105', '10000000-0000-4000-8000-000000000002',
   'aldaanii-messejtei', 'Алдааны мессежтэй ажиллах', 'Working with errors', 'text',
   null, 12,
   $md$Алдаа гарах нь хэвийн. Түүнтэй яаж харьцахаа мэдэх нь чадвар.

## Бүтнээр нь хуул

Хамгийн түгээмэл алдаа: мессежийн эхний мөрийг л хуулж тавих. Доорх мөрүүд нь хаана болсныг хэлж байдаг — тэдгээргүйгээр таамаглах болно.

Улаан текстийг бүтнээр нь, эхнээс нь адаг хүртэл ав.

## Юу хийж байхад гарсныг хэл

Мессеж дангаараа хангалттай биш. Нөхцөлийг нь хэл:

> Захиалга хадгалах товч дархад дараах алдаа гарлаа: [мессеж]. Өмнө нь ажиллаж байсан, зөвхөн үнийн талбар нэмсний дараа эхэлсэн.

Сүүлийн өгүүлбэр нь ихэвчлэн шийдвэрлэх хариу болдог.

## Хаанаас харах вэ

Алдаа хоёр газар гарч болно:

- **Хөтөч дээр** — `F12` дараад Console таб. Улаан мөрүүд тэнд байна.
- **Терминал дээр** — сервер ажиллаж байгаа цонх. Тэнд ч бас улаан текст гарна.

Хоёуланг нь хараарай. Заримдаа нэг нь чимээгүй, нөгөө нь бүхнийг хэлж байдаг.

## Давтагдаж байна уу

Алдаа үргэлж гардаг уу, эсвэл заримдаа юу? «Заримдаа» гэдэг нь ихэвчлэн өгөгдлөөс хамаардаг гэсэн үг — тодорхой нэг захиалга, эсвэл хоосон талбар.

> Зөвхөн зарим захиалга дээр гарч байна. Гарч байгаа нэгнийх нь дүн хоосон байна.

## Засагдсаны дараа

Дахин туршиж үз. Мөн **өмнө ажиллаж байсан зүйл** нь эвдэрсэн эсэхийг шалга — засвар шинэ алдаа авчрах нь элбэг.$md$,
   null, null, null, null, false, 2),

  ('30000000-0000-4000-8000-000000001014', '20000000-0000-4000-8000-000000001105', '10000000-0000-4000-8000-000000000002',
   'hezee-bolson-gej', 'Хэзээ «болсон» гэж үзэх вэ', 'When it is done', 'text',
   null, 11,
   $md$«Болсон» гэдэг нь ажиллаж байна гэсэн үг биш. Дараах бүгд үнэн байвал болсон.

## Дууссаны шалгуур

- Хийхээр төлөвлөсөн зүйл бүр ажиллаж байна
- Хоосон, буруу, урт — гурван онцгой тохиолдол шалгагдсан
- Утсан дээр зөв харагдаж байна
- Өөр хүн ойлгож ашиглаж чадсан
- Чи гарсан зүйлээ ерөнхийд нь ойлгож байна
- Ажлаа хадгалсан

## Сүүлийн цэг хамгийн чухал

Ажиллаж байгаа хувилбар гарсан бол тэр дор нь хадгал. Дараагийн засвар эвдэрвэл буцаж очих газар болно.

> Одоогийн ажиллаж байгаа байдлыг хадгалаад, юу өөрчилснийг товч бичиж өгөөч.

## Дараагийн алхмаа бич

Дуусгахдаа юу үлдсэнийг тэмдэглэ. Долоо хоногийн дараа санахгүй.

> Одоо юу дутуу үлдсэн бэ? Дараагийн гурван алхмыг жагсаагаад өгөөч.

## Төгс болгохыг бүү оролд

Эхний хувилбар нь ажиллаж байвал болно. Дэлхийн хамгийн сайн сайтууд ч эхэндээ энгийн байсан. Гаргаад, хүмүүсийн хэрэглэхийг хараад, дараа нь сайжруул.$md$,
   null, null, null, null, false, 3),

  ('30000000-0000-4000-8000-000000001015', '20000000-0000-4000-8000-000000001106', '10000000-0000-4000-8000-000000000002',
   'ehnees-duustal', 'Эхнээс нь дуустал: тооны тоглоом', 'End to end', 'text',
   null, 18,
   $md$Одоо бүх зүйлийг нэг дор хэрэглэе. Жижиг тоглоом захиалж хийнэ — эхний өгүүлбэрээс бэлэн болтол нь.

## Юу барих вэ

Компьютер 1-ээс 100 хүртэлх тоо санана. Хэрэглэгч таана. Тоглоом «их байна» эсвэл «бага байна» гэж хэлж өгнө. Таамагласан тоог тоолно.

## Алхам 1 — гурван өгүүлбэр

> Тоо таах тоглоом хийх гэж байна. Хэрэглэгч хөтөч дээрээ тоглоно, утсан дээр ч ажиллах ёстой. Тоглоом дуусахад хэдэн удаа таасныг харуулна.

## Алхам 2 — жагсаалт, хязгаар

> 1. Компьютер 1-100 хооронд санамсаргүй тоо сонгоно
> 2. Хэрэглэгч тоо бичээд «Таах» товч дарна
> 3. Их эсвэл бага гэдгийг хэлнэ
> 4. Зөв таавал баяр хүргэж, хэдэн удаа оролдсоныг харуулна
> 5. «Дахин тоглох» товч
>
> Оноо хадгалах, нэвтрэх хэрэггүй. Эхлээд юу хийхээ хэлээд дараа нь хийгээрэй.

## Алхам 3 — шалгах

Бэлэн болмогц дараах зүйлсийг **өөрөө** туршиж үз:

- Хоосон талбараар «Таах» дарвал юу болох вэ?
- Үсэг бичвэл?
- 0 эсвэл 200 бичвэл?
- Утсан дээр товч хүрэхэд хангалттай том уу?
- «Дахин тоглох» дархад тоо шинээр сонгогдож байна уу?

Эдгээрийн аль нэг нь буруу байвал яг тэрийг нь хэлж зас:

> Хоосон талбараар таах товч дархад юу ч болохгүй байна. «Тоо оруулна уу» гэсэн мессеж гаргаж өгөөч.

## Алхам 4 — сайжруулах

Ажиллаж эхэлмэгц жижиг зүйлс нэмнэ:

> Оролдлого бүрийг доор нь жагсаалтаар харуулаад өгөөч — ямар тоо бичсэн, хариу нь юу байсныг.

## Алхам 5 — хадгалах

> Одоогийн байдлыг хадгалаад, юу хийснийг товч бичиж өгөөч.

## Даалгавар

Одоо өөрийнхөө санааг ижил замаар явуул. Гурван өгүүлбэр бич, жагсаалт гарга, хязгаараа хэл, дараа нь шалга. Санаа олдохгүй бол: тооны машин, жагсаалт тэмдэглэгч, өдрийн тэмдэглэл — гурвуулаа жижиг бөгөөд бүтэн.$md$,
   null, null, null, null, false, 1)
on conflict (id) do update set
  module_id = excluded.module_id, course_id = excluded.course_id, slug = excluded.slug,
  title_mn = excluded.title_mn, title_en = excluded.title_en, kind = excluded.kind,
  video_url = excluded.video_url, duration_minutes = excluded.duration_minutes,
  body_mn = excluded.body_mn, body_en = excluded.body_en,
  code_language = excluded.code_language, starter_code = excluded.starter_code,
  solution_code = excluded.solution_code, is_preview = excluded.is_preview, rank = excluded.rank;

-- Хуучин «Кодын суурь»-ийн арван таван хичээл.
--
-- JavaScript, Python-ы синтакс заадаг байсан — дээрх арван тав тэднийг орлож
-- байна. Хоёр дунд шалгалт нь ч мөн хамт явна: асуултууд нь код уншиж
-- чаддаг гэж үзсэн байсан.
delete from public.lessons
 where id in ('30000000-0000-4000-8000-000000000201', '30000000-0000-4000-8000-000000000202',
              '30000000-0000-4000-8000-000000000203', '30000000-0000-4000-8000-000000000204',
              '30000000-0000-4000-8000-000000000205', '30000000-0000-4000-8000-000000000206',
              '30000000-0000-4000-8000-000000000207', '30000000-0000-4000-8000-000000000208',
              '30000000-0000-4000-8000-000000000209', '30000000-0000-4000-8000-000000000401',
              '30000000-0000-4000-8000-000000000402', '30000000-0000-4000-8000-000000000403',
              '30000000-0000-4000-8000-000000000404', '30000000-0000-4000-8000-000000000405',
              '30000000-0000-4000-8000-000000000406');

-- ── Quiz questions ───────────────────────────────────────────────────────────
--
-- Every question here is about a mistake the lesson before it warned about.
-- A quiz that asks what a keyword is called teaches nothing; one that asks
-- which of four snippets is broken is the lesson, asked back.
insert into public.quiz_questions
  (id, lesson_id, prompt_mn, prompt_en, options_mn, options_en, correct_index, explanation_mn, explanation_en, rank)
values
  -- Шалгалт: HTML ба CSS
  ('40000000-0000-4000-8000-000000000101', '30000000-0000-4000-8000-000000000110',
   'Кирилл үсэг "Ñàéí" мэт эвдэрч харагдвал юу дутсан байна вэ?',
   'Cyrillic renders as "Ñàéí". What is missing?',
   array['<meta charset="utf-8">', 'lang="mn"', '<!doctype html>', 'viewport meta'],
   array['<meta charset="utf-8">', 'lang="mn"', '<!doctype html>', 'viewport meta'],
   0,
   'charset нь хөтөчид байтуудыг ямар кодчлолоор унших ёстойг хэлнэ. Дутвал UTF-8 кирилл үсэг өөр тэмдэгт болж уншигдана.',
   'The charset tells the browser how to decode the bytes. Without it UTF-8 Cyrillic is read as something else.',
   1),

  ('40000000-0000-4000-8000-000000000102', '30000000-0000-4000-8000-000000000110',
   '`width: 300px` дээр `padding: 20px` нэмэхэд хайрцаг 340px болов. Хэрхэн засах вэ?',
   'A box with width 300px and padding 20px renders 340px wide. How do you fix it?',
   array['box-sizing: border-box', 'width-ээс padding-ыг хасах', 'margin: 0 болгох', 'display: flex нэмэх'],
   array['box-sizing: border-box', 'Subtract the padding from the width', 'Set margin: 0', 'Add display: flex'],
   0,
   'border-box нь өргөнийг контент биш, хүрээ хүртэлх бүхэлд нь тооцдог болгоно.',
   'border-box makes the declared width include padding and border.',
   2),

  ('40000000-0000-4000-8000-000000000103', '30000000-0000-4000-8000-000000000110',
   'Чимэглэлийн зурагт `alt`-ыг яаж бичих вэ?',
   'What alt text does a decorative image get?',
   array['alt="" гэж хоосон', 'alt-г огт бичихгүй', 'alt="зураг"', 'alt="чимэглэл"'],
   array['alt="" (empty)', 'Leave alt off entirely', 'alt="image"', 'alt="decoration"'],
   0,
   'Хоосон alt нь дэлгэц уншигчид "энэ зургийг алгас" гэж хэлнэ. alt-ыг огт бичихгүй бол уншигч файлын нэрийг уншиж эхэлнэ.',
   'An empty alt tells a screen reader to skip the image. Omitting alt makes it read the file name instead.',
   3),

  ('40000000-0000-4000-8000-000000000104', '30000000-0000-4000-8000-000000000110',
   'Утсан дээр бүх зүйл жижигхэн харагдаж байвал юу дутсан байх магадлалтай вэ?',
   'Everything looks tiny on a phone. What is probably missing?',
   array['viewport meta таг', 'box-sizing', 'flexbox', 'media query'],
   array['The viewport meta tag', 'box-sizing', 'flexbox', 'A media query'],
   0,
   'viewport таг байхгүй бол утас хуудсыг 980px өргөн гэж үзээд бүхэлд нь жижигрүүлж багтаана.',
   'Without the viewport tag a phone assumes a 980px page and scales the whole thing down.',
   4),

  -- ══ Төгсгөлийн шалгалтууд ══
  ('40000000-0000-4000-8000-000000009101', '30000000-0000-4000-8000-000000000901',
   'Код гэж юу вэ?',
   'What is code?',
   array['Компьютерын яг дагаж биелүүлдэг заавар', 'Зөвхөн мэргэжлийн хүн уншдаг нууц хэл', 'Компьютерын дотор байдаг тусгай төхөөрөмж', 'Интернэтээс татдаг програм'],
   array['Instructions a computer follows exactly', 'A secret language only professionals read', 'A special chip inside the computer', 'A program you download'],
   0,
   'Код бол текст хэлбэртэй заавар. Компьютер түүнийг дагаж биелүүлдэг — таахгүй, нөхөхгүй.',
   'Code is instructions written as text. The computer follows them; it does not guess.',
   1),

  ('40000000-0000-4000-8000-000000009102', '30000000-0000-4000-8000-000000000901',
   'Жорд «давс нэм» гэж бичээд хэмжээг нь хэлээгүй бол компьютер яах вэ?',
   'A recipe says «add salt» without an amount. What does a computer do?',
   array['Зогсох буюу алдаа өгнө', 'Дунджаар нь таана', 'Асууж лавлана', 'Тэр алхмыг алгасана'],
   array['It stops, or errors', 'It guesses an average', 'It asks you', 'It skips the step'],
   0,
   'Компьютер дутууг нөхдөггүй. Тиймээс код бичих нь ухаалаг байхаас илүү нарийн байх тухай.',
   'A computer fills nothing in. Writing code is about being precise, not clever.',
   2),

  ('40000000-0000-4000-8000-000000009103', '30000000-0000-4000-8000-000000000901',
   'Ямар ч нэмэлт суулгацгүйгээр хөтөч дотор шууд ажилладаг хэл аль нь вэ?',
   'Which language runs in a browser with nothing extra installed?',
   array['Python', 'JavaScript', 'Swift', 'C'],
   array['Python', 'JavaScript', 'Swift', 'C'],
   1,
   'Хөтөч бүр дотроо JavaScript хөдөлгүүртэй. Chrome-д тэр нь V8.',
   'Every browser ships a JavaScript engine. In Chrome it is V8.',
   3),

  ('40000000-0000-4000-8000-000000009104', '30000000-0000-4000-8000-000000000901',
   '`Uncaught ReferenceError: ner is not defined at app.js:12` гэж гарлаа. Юу гэсэн үг вэ?',
   'You see `Uncaught ReferenceError: ner is not defined at app.js:12`. What does it mean?',
   array['Интернэт тасарсан', '12-р мөрөнд байхгүй нэрийг ашигласан', 'Файл хэт том байна', 'Хөтөч хуучирсан'],
   array['The internet dropped', 'Line 12 uses a name that does not exist', 'The file is too big', 'The browser is old'],
   1,
   'Алдааны мессеж нь мөрийн дугаар, нэрийг хэлж байна. Ихэнхдээ үсгийн алдаа эсвэл зарлаагүй хувьсагч.',
   'The message names the line and the identifier. Usually a typo or a variable never declared.',
   4),

  ('40000000-0000-4000-8000-000000009105', '30000000-0000-4000-8000-000000000901',
   '`http://localhost:3000` холбоосыг найздаа явуулбал юу болох вэ?',
   'You send a friend `http://localhost:3000`. What happens?',
   array['Чиний сайт нээгдэнэ', 'Найзын өөрийнх нь компьютер руу заана, юу ч нээгдэхгүй', 'Нууц үг асууна', 'Автоматаар интернэтэд гарна'],
   array['They see your site', 'It points at their own computer, so nothing opens', 'It asks for a password', 'It publishes automatically'],
   1,
   'localhost нь «энэ компьютер» гэсэн үг. Бусдад харагдахын тулд байршуулах хэрэгтэй.',
   'localhost means «this computer». To be seen by others it has to be deployed.',
   5),

  ('40000000-0000-4000-8000-000000009106', '30000000-0000-4000-8000-000000000901',
   'Өгөгдлийн сангийн нууц түлхүүрийг хаана тавьж болохгүй вэ?',
   'Where must a database secret never go?',
   array['Сервер дээрх орчны хувьсагчид', 'Хөтөч дээр ажилладаг код дотор', 'Нууцлагдсан тохиргооны санд', 'Багийн нууц менежерт'],
   array['A server environment variable', 'Code that runs in the browser', 'A secrets manager', 'The team password manager'],
   1,
   'Хөтөч дотор байгаа бүхнийг хэрэглэгч харж чадна. Тэнд тавьсан түлхүүр нууц биш болно.',
   'Anything in the browser is visible to the user. A key put there is no longer a secret.',
   6),

  ('40000000-0000-4000-8000-000000009107', '30000000-0000-4000-8000-000000000901',
   'Гадаад түлхүүр (foreign key) юу хийдэг вэ?',
   'What does a foreign key do?',
   array['Өгөгдлийг шифрлэнэ', 'Хоёр хүснэгтийн мөрийг холбож, байхгүй зүйл рүү заахаас сэргийлнэ', 'Хүснэгтийг хурдан болгоно', 'Нууц үгийг хадгална'],
   array['Encrypts data', 'Links rows in two tables and refuses a reference to something that is not there', 'Makes the table faster', 'Stores passwords'],
   1,
   'Хичээл бүр өөрийн сургалтын id-г авч явдаг. Байхгүй сургалтад хичээл нэмэхийг сан өөрөө татгалзана.',
   'A lesson carries its course id. The database itself refuses a lesson for a course that does not exist.',
   7),

  ('40000000-0000-4000-8000-000000009108', '30000000-0000-4000-8000-000000000901',
   '`git commit` юу хийдэг вэ?',
   'What does `git commit` do?',
   array['Кодыг интернэтэд гаргана', 'Өөрчлөлтийг тайлбартай нь түүхэнд хадгална', 'Файлыг устгана', 'Програмыг ажиллуулна'],
   array['Publishes the code', 'Records the change in history with a message', 'Deletes a file', 'Runs the program'],
   1,
   'commit бол хадгалалтын цэг. Интернэт рүү илгээх нь тусдаа алхам — push.',
   'A commit is a save point. Sending it to the internet is a separate step — push.',
   8),

  ('40000000-0000-4000-8000-000000009109', '30000000-0000-4000-8000-000000000901',
   '`.gitignore` файлд заавал бичих ёстой хоёр зүйл аль нь вэ?',
   'Which two belong in `.gitignore`?',
   array['`.env` ба `node_modules`', '`index.html` ба `style.css`', '`README.md` ба `package.json`', 'Зураг ба фонт'],
   array['`.env` and `node_modules`', '`index.html` and `style.css`', '`README.md` and `package.json`', 'Images and fonts'],
   0,
   '`.env` нууц түлхүүр агуулна; `node_modules` нь `package.json`-оос дахин үүсдэг мянган файл.',
   '`.env` holds secrets; `node_modules` is thousands of files rebuilt from `package.json`.',
   9),

  ('40000000-0000-4000-8000-000000009110', '30000000-0000-4000-8000-000000000901',
   'Claude-аас код авахад хамгийн чухал зүйл нь юу вэ?',
   'What matters most when Claude gives you code?',
   array['Аль болох хурдан хуулж тавих', 'Ойлгоогүй бол яагаад ийм болохыг нь асуух', 'Урт кодыг сонгох', 'Тайлбарыг нь устгах'],
   array['Pasting it as fast as possible', 'Asking why, when you do not understand it', 'Choosing the longest answer', 'Deleting the comments'],
   1,
   'Ажиллаж байгаа нь ойлгосон гэсэн үг биш. Долоо хоногийн дараа эвдэрвэл засах хүн нь чи.',
   'Working is not the same as understood. When it breaks next week, you are the one fixing it.',
   10),

  ('40000000-0000-4000-8000-000000009301', '30000000-0000-4000-8000-000000000903',
   'Кирилл үсэг эвдэрч харагдвал юу дутсан байна вэ?',
   'Cyrillic renders as mojibake. What is missing?',
   array['`<meta charset="utf-8">`', '`lang="mn"`', '`<!doctype html>`', 'viewport meta'],
   array['`<meta charset="utf-8">`', '`lang="mn"`', '`<!doctype html>`', 'viewport meta'],
   0,
   'charset нь хөтөчид байтуудыг ямар кодчлолоор унших ёстойг хэлнэ.',
   'The charset tells the browser how to decode the bytes.',
   1),

  ('40000000-0000-4000-8000-000000009302', '30000000-0000-4000-8000-000000000903',
   '`width: 300px` дээр `padding: 20px` нэмэхэд хайрцаг 340px болов. Хэрхэн засах вэ?',
   'A 300px box with 20px padding renders 340px. How do you fix it?',
   array['`box-sizing: border-box`', 'width-ээс padding-ыг хасах', '`margin: 0`', '`display: flex`'],
   array['`box-sizing: border-box`', 'Subtract the padding from the width', '`margin: 0`', '`display: flex`'],
   0,
   'border-box нь зарласан өргөнийг padding, хүрээг оруулаад тооцдог болгоно.',
   'border-box makes the declared width include padding and border.',
   2),

  ('40000000-0000-4000-8000-000000009303', '30000000-0000-4000-8000-000000000903',
   'Чимэглэлийн зурагт `alt`-ыг яаж бичих вэ?',
   'What alt text does a decorative image get?',
   array['`alt=""` гэж хоосон', 'alt-г огт бичихгүй', '`alt="зураг"`', '`alt="чимэглэл"`'],
   array['`alt=""` (empty)', 'Leave alt off', '`alt="image"`', '`alt="decoration"`'],
   0,
   'Хоосон alt нь дэлгэц уншигчид «алгас» гэж хэлнэ. Огт бичихгүй бол файлын нэрийг уншина.',
   'An empty alt tells a screen reader to skip it. Omitting alt makes it read the file name.',
   3),

  ('40000000-0000-4000-8000-000000009304', '30000000-0000-4000-8000-000000000903',
   'Утсан дээр бүх зүйл жижигхэн харагдвал юу дутсан байх магадлалтай вэ?',
   'Everything looks tiny on a phone. What is probably missing?',
   array['viewport meta таг', 'box-sizing', 'flexbox', 'media query'],
   array['The viewport meta tag', 'box-sizing', 'flexbox', 'A media query'],
   0,
   'viewport таг байхгүй бол утас хуудсыг 980px гэж үзээд бүхэлд нь жижигрүүлнэ.',
   'Without it a phone assumes a 980px page and scales everything down.',
   4),

  ('40000000-0000-4000-8000-000000009305', '30000000-0000-4000-8000-000000000903',
   'Flexbox-д зүйлсийг хэвтээ тэнхлэгийн дагуу тараахад алийг нь ашиглах вэ?',
   'Which property spreads flex items along the main axis?',
   array['align-items', 'justify-content', 'flex-wrap', 'gap'],
   array['align-items', 'justify-content', 'flex-wrap', 'gap'],
   1,
   'justify-content нь үндсэн тэнхлэг дээр, align-items нь хөндлөн тэнхлэг дээр ажиллана.',
   'justify-content works on the main axis; align-items on the cross axis.',
   5),

  ('40000000-0000-4000-8000-000000009306', '30000000-0000-4000-8000-000000000903',
   'Нэг хуудсанд `<h1>` хэдийг тавих нь зөв вэ?',
   'How many `<h1>` elements should a page have?',
   array['Хэдийг ч болно', 'Нэгийг', 'Гурваас доошгүй', 'Аль ч хэсэгт нэгийг'],
   array['Any number', 'One', 'At least three', 'One per section'],
   1,
   'h1 нь тэр хуудас юуны тухай болохыг хэлнэ. Хоёр байвал агуулгын шатлал эвдэрнэ.',
   'The h1 says what the page is about. Two of them break the document outline.',
   6),

  ('40000000-0000-4000-8000-000000009307', '30000000-0000-4000-8000-000000000903',
   'Сайтын өнгийг нэг дороос удирдахад CSS-д юуг ашиглах вэ?',
   'How do you control a site palette from one place in CSS?',
   array['Custom property буюу `--нэр` хувьсагч', 'Файл бүрт дахин бичих', 'JavaScript-ээр солих', 'Зургаар тавих'],
   array['Custom properties, `--name`', 'Repeat it in every file', 'Swap it with JavaScript', 'Use images'],
   0,
   '`:root` дээр нэг удаа зарлаад `var(--нэр)` гэж хаа ч ашиглана. Нэг газраас өөрчилнө.',
   'Declare once on `:root` and use `var(--name)` anywhere. One place to change.',
   7),

  ('40000000-0000-4000-8000-000000009308', '30000000-0000-4000-8000-000000000903',
   'Зургийг жижиг дэлгэцэнд багтаахад хамгийн энгийн дүрэм юу вэ?',
   'What is the simplest rule that keeps an image inside a small screen?',
   array['`max-width: 100%`', '`width: 100px`', '`position: absolute`', '`float: left`'],
   array['`max-width: 100%`', '`width: 100px`', '`position: absolute`', '`float: left`'],
   0,
   'max-width нь зургийг эцэг элементээсээ хэтрүүлэхгүй, гэхдээ жижиг зургийг сунгахгүй.',
   'max-width keeps an image inside its parent without stretching a small one.',
   8),

  ('40000000-0000-4000-8000-000000009309', '30000000-0000-4000-8000-000000000903',
   'Бэлэн болсон хуудсаа бусдад харуулахын тулд юу хийх вэ?',
   'How do you let other people see your finished page?',
   array['Файлыг и-мэйлээр явуулна', 'Байршуулах үйлчилгээнд deploy хийнэ', 'localhost холбоосыг илгээнэ', 'Screenshot авна'],
   array['Email the files', 'Deploy it to a hosting service', 'Send the localhost link', 'Take a screenshot'],
   1,
   'Vercel, Netlify зэрэг үйлчилгээ GitHub-тай холбогдоод, код түлхэх бүрт шинэ хувилбарыг гаргана.',
   'Vercel or Netlify connect to GitHub and publish a new version on every push.',
   9),

  ('40000000-0000-4000-8000-000000009310', '30000000-0000-4000-8000-000000000903',
   '`<div>` биш `<header>`, `<main>`, `<nav>` ашиглах шалтгаан юу вэ?',
   'Why use `<header>`, `<main>`, `<nav>` instead of `<div>`?',
   array['Богино бичигддэг', 'Утга агуулдаг тул дэлгэц уншигч, хайлтын систем ойлгоно', 'Хурдан ачаалдаг', 'Өнгө нь өөр'],
   array['They are shorter', 'They carry meaning, so screen readers and search engines understand them', 'They load faster', 'They look different'],
   1,
   'div нь юу ч хэлдэггүй. Утгатай таг нь хуудсыг харахгүй хүнд ч уншигдахуйц болгоно.',
   'A div says nothing. Semantic tags make the page navigable for someone who cannot see it.',
   10),

  ('40000000-0000-4000-8000-000000009401', '30000000-0000-4000-8000-000000000904',
   'React-ийн компонент гэж юу вэ?',
   'What is a React component?',
   array['Дахин ашиглаж болох интерфейсийн хэсэг', 'CSS-ийн файл', 'Өгөгдлийн сангийн хүснэгт', 'Серверийн тохиргоо'],
   array['A reusable piece of interface', 'A CSS file', 'A database table', 'A server setting'],
   0,
   'Компонент нь өөрийн тэмдэглэгээ, төлөв, зан төлвийг нэг дор агуулна.',
   'A component keeps its markup, state and behaviour in one place.',
   1),

  ('40000000-0000-4000-8000-000000009402', '30000000-0000-4000-8000-000000000904',
   'props ба state хоёрын ялгаа юу вэ?',
   'What is the difference between props and state?',
   array['Ялгаа байхгүй', 'props гаднаас ирнэ, state нь компонентын дотоод өөрчлөгддөг утга', 'state нь зөвхөн тоо байна', 'props нь өөрчлөгддөг'],
   array['No difference', 'props come from outside; state is the component''s own changing value', 'state can only hold numbers', 'props are mutable'],
   1,
   'props-ыг эцэг компонент өгнө, компонент өөрөө өөрчлөхгүй. state-ийг компонент өөрөө удирдана.',
   'The parent passes props; the component does not change them. State is the component''s own.',
   2),

  ('40000000-0000-4000-8000-000000009403', '30000000-0000-4000-8000-000000000904',
   'Жагсаалт зурахад `key`-д юуг өгөх нь зөв вэ?',
   'What should a list `key` be?',
   array['Массивын индекс', 'Мөр бүрийн тогтвортой id', 'Санамсаргүй тоо', 'Гарчгийн текст'],
   array['The array index', 'A stable id for each row', 'A random number', 'The title text'],
   1,
   'Индекс нь дараалал өөрчлөгдөхөд бусдын түлхүүр болж, React буруу мөрийг дахин ашиглана.',
   'An index becomes another row''s key when the order changes, and React reuses the wrong one.',
   3),

  ('40000000-0000-4000-8000-000000009404', '30000000-0000-4000-8000-000000000904',
   'Server Component-ийн гол давуу тал юу вэ?',
   'What is the point of a Server Component?',
   array['Хөтөч дээр илүү хурдан ажиллана', 'Өгөгдлийг сервер дээр татаж, хөтчийн багцад JavaScript нэмэхгүй', 'CSS бичих шаардлагагүй', 'Алдаа гаргахгүй'],
   array['It runs faster in the browser', 'It fetches on the server and ships no JavaScript to the browser', 'You need no CSS', 'It cannot fail'],
   1,
   'Өгөгдлийн санд сервер дээрээс шууд хандах тул нэмэлт API давхарга ч, нэмэлт багц ч хэрэггүй.',
   'It can reach the database directly, so there is no extra API layer and no extra bundle.',
   4),

  ('40000000-0000-4000-8000-000000009405', '30000000-0000-4000-8000-000000000904',
   'Орчны хувьсагчийг `NEXT_PUBLIC_` угтвартай нэрлэвэл юу болох вэ?',
   'What happens to an environment variable named with `NEXT_PUBLIC_`?',
   array['Зөвхөн сервер дээр үлдэнэ', 'Хөтчийн багцад орно, хэн ч харж чадна', 'Шифрлэгдэнэ', 'Ажиллахгүй'],
   array['It stays on the server', 'It goes into the browser bundle where anyone can read it', 'It is encrypted', 'It stops working'],
   1,
   'Тиймээс нууц түлхүүрийг хэзээ ч тэр угтвараар нэрлэж болохгүй.',
   'So a secret key must never be given that prefix.',
   5),

  ('40000000-0000-4000-8000-000000009406', '30000000-0000-4000-8000-000000000904',
   'Supabase-ийн RLS юу хийдэг вэ?',
   'What does Supabase RLS do?',
   array['Хуудсыг хурдасгана', 'Аль мөрийг хэн уншиж, бичихийг өгөгдлийн сан дээр шийднэ', 'Нууц үгийг шифрлэнэ', 'Файлыг хадгална'],
   array['Speeds up the page', 'Decides at the database which rows each user may read or write', 'Encrypts passwords', 'Stores files'],
   1,
   'Интерфейс дээр нуух нь чимэглэл. Бодит шалгалт бодлогод байх ёстой.',
   'Hiding something in the interface is decoration. The real check lives in a policy.',
   6),

  ('40000000-0000-4000-8000-000000009407', '30000000-0000-4000-8000-000000000904',
   'Хэрэглэгч админ эсэхийг хаана шалгах ёстой вэ?',
   'Where must «is this user an admin» be checked?',
   array['Зөвхөн React компонент дотор', 'Сервер дээр ба өгөгдлийн сангийн бодлогод', 'Хөтчийн санах ойд', 'URL дотор'],
   array['Only in a React component', 'On the server and in a database policy', 'In browser storage', 'In the URL'],
   1,
   'Зөвхөн компонент дотор хийсэн шалгалт бол шалгалт биш — хүсэлтийг шууд илгээж болно.',
   'A check that lives only in a component is no check: the request can be sent directly.',
   7),

  ('40000000-0000-4000-8000-000000009408', '30000000-0000-4000-8000-000000000904',
   'TypeScript юуг олж өгдөг вэ?',
   'What does TypeScript catch?',
   array['Дизайны алдаа', 'Буруу төрлийг ажиллуулахаас өмнө', 'Сүлжээний саатал', 'Хэрэглэгчийн үсгийн алдаа'],
   array['Design mistakes', 'Type mistakes, before the code runs', 'Network problems', 'User typos'],
   1,
   'Талбарын нэрийг буруу бичсэн, null байж болох утгыг шалгалгүй ашигласан зэргийг хөрвүүлэх үед хэлнэ.',
   'A misspelled field, or a possibly-null value used without a check, is reported at compile time.',
   8),

  ('40000000-0000-4000-8000-000000009409', '30000000-0000-4000-8000-000000000904',
   '`any` төрлийг хэрэглэх нь яагаад муу вэ?',
   'Why is `any` a bad habit?',
   array['Удаан ажиллана', 'Тухайн утган дээрх бүх шалгалтыг унтраана', 'Бичихэд урт', 'Хөтөч дэмжихгүй'],
   array['It is slow', 'It switches off every check on that value', 'It is long to type', 'Browsers do not support it'],
   1,
   'any нь «би мэдэхгүй» гэсэн үг. Мэдэхгүй бол `unknown` бичээд шалгах нь зөв.',
   '`any` means «I do not know». If you do not, write `unknown` and check.',
   9),

  ('40000000-0000-4000-8000-000000009410', '30000000-0000-4000-8000-000000000904',
   'Vercel дээр байршуулахад орчны хувьсагчийг яах вэ?',
   'What do you do with environment variables when deploying to Vercel?',
   array['`.env`-ээ GitHub руу оруулна', 'Төслийн тохиргоонд нь нэг бүрчлэн нэмнэ', 'Код дотор шууд бичнэ', 'Шаардлагагүй'],
   array['Commit `.env` to GitHub', 'Add them one by one in the project settings', 'Hard-code them', 'Nothing is needed'],
   1,
   '`.env` нь хэзээ ч GitHub руу орох ёсгүй. Байршуулах орчинд нь тусад нь тохируулна.',
   '`.env` must never reach GitHub. The deployment holds its own copy.',
   10),

  ('40000000-0000-4000-8000-000000009501', '30000000-0000-4000-8000-000000000905',
   'Expo гэж юу вэ?',
   'What is Expo?',
   array['Программчлалын хэл', 'React Native-ийг хялбар эхлүүлж, ажиллуулдаг хэрэгслийн багц', 'Өгөгдлийн сан', 'Дизайны програм'],
   array['A programming language', 'A toolkit that makes starting and running React Native easy', 'A database', 'A design tool'],
   1,
   'Expo байхгүй бол Xcode, Android Studio-г гараар тохируулах шаардлагатай болно.',
   'Without Expo you configure Xcode and Android Studio by hand.',
   1),

  ('40000000-0000-4000-8000-000000009502', '30000000-0000-4000-8000-000000000905',
   'React Native дээр `div` ба `p`-ийн оронд юу бичих вэ?',
   'What replaces `div` and `p` in React Native?',
   array['`View` ба `Text`', '`Box` ба `Label`', '`Frame` ба `String`', 'Ижилхэн'],
   array['`View` and `Text`', '`Box` and `Label`', '`Frame` and `String`', 'The same tags'],
   0,
   'Утсан дээр HTML байхгүй. Бүх текст заавал `Text` дотор байх ёстой.',
   'There is no HTML on a phone. Every string has to sit inside a `Text`.',
   2),

  ('40000000-0000-4000-8000-000000009503', '30000000-0000-4000-8000-000000000905',
   'Дэлгэцний дээд хэсэг хонхорхой, цагны мөрөнд дарагдахгүйн тулд юу ашиглах вэ?',
   'What keeps content clear of the notch and status bar?',
   array['`SafeAreaView`', '`ScrollView`', '`Modal`', '`Pressable`'],
   array['`SafeAreaView`', '`ScrollView`', '`Modal`', '`Pressable`'],
   0,
   'Төхөөрөмж бүр өөр хэлбэртэй. SafeAreaView нь аюулгүй хилийг өөрөө тооцно.',
   'Every device is a different shape. SafeAreaView works the safe bounds out for you.',
   3),

  ('40000000-0000-4000-8000-000000009504', '30000000-0000-4000-8000-000000000905',
   '`StyleSheet` ба CSS-ийн ялгаа юу вэ?',
   'How does `StyleSheet` differ from CSS?',
   array['Ялгаа байхгүй', 'JavaScript объект бөгөөд хэмжээ нь нэгжгүй тоо байна', 'Зөвхөн өнгө тохируулна', 'Файл тусдаа байх ёстой'],
   array['No difference', 'It is a JavaScript object and sizes are unitless numbers', 'It only sets colours', 'It must live in its own file'],
   1,
   '`padding: 16` гэж бичнэ, `16px` биш. Мөн каскад байхгүй — өв залгамжлал бараг байхгүй.',
   'You write `padding: 16`, not `16px`. And there is no cascade to inherit from.',
   4),

  ('40000000-0000-4000-8000-000000009505', '30000000-0000-4000-8000-000000000905',
   'iOS апп дотор тоглогдох видео хичээл зарахад Apple юу шаарддаг вэ?',
   'What does Apple require to sell digital content inside an iOS app?',
   array['Банкны шилжүүлэг', 'Апп доторх худалдан авалт (in-app purchase)', 'Картын дугаарыг шууд асуух', 'Ямар ч шаардлага байхгүй'],
   array['A bank transfer', 'In-app purchase', 'Asking for the card number', 'Nothing'],
   1,
   'Тиймээс манай апп дээр төлбөрт сургалтыг вэб рүү илгээдэг.',
   'That is why our app sends a paid purchase to the website.',
   5),

  ('40000000-0000-4000-8000-000000009506', '30000000-0000-4000-8000-000000000905',
   'Өгөгдөл татаж байх үед хэрэглэгчид юу харуулах ёстой вэ?',
   'What should the user see while data is loading?',
   array['Хоосон дэлгэц', 'Ачаалж байгаа тэмдэг эсвэл араг яс', 'Алдааны мессеж', 'Өмнөх хуудсыг'],
   array['An empty screen', 'A loading indicator or skeleton', 'An error message', 'The previous screen'],
   1,
   'Хоосон дэлгэц нь эвдэрсэн мэт харагдана. Утасны сүлжээ удаан байх нь энгийн зүйл.',
   'An empty screen reads as broken. A slow mobile network is normal.',
   6),

  ('40000000-0000-4000-8000-000000009507', '30000000-0000-4000-8000-000000000905',
   'Нэвтэрсэн сессийг утсан дээр хаана хадгалах вэ?',
   'Where should a signed-in session be kept on a phone?',
   array['Энгийн файлд', 'Төхөөрөмжийн аюулгүй хадгалалтад (secure store / keychain)', 'Кодын дотор', 'Хадгалахгүй'],
   array['In a plain file', 'In the device secure store or keychain', 'In the code', 'Do not keep it'],
   1,
   'Энгийн файл бол түгжээгүй утас олсон хүнд бэлэг. Keychain нь үйлдлийн системээр хамгаалагдана.',
   'A plain file is a gift to whoever finds an unlocked phone. The keychain is protected by the OS.',
   7),

  ('40000000-0000-4000-8000-000000009508', '30000000-0000-4000-8000-000000000905',
   'Хуудас хооронд шилжихэд юуг ашиглах вэ?',
   'How do you move between screens?',
   array['`window.location`', 'Навигаци — expo-router эсвэл түүнтэй адил сан', 'Хуудсыг дахин ачаалах', '`<a>` таг'],
   array['`window.location`', 'A navigator such as expo-router', 'Reloading the page', 'An `<a>` tag'],
   1,
   'Утсан дээр хаяг мөр байхгүй. Навигаци нь дэлгэцний өрөлтийг удирдана.',
   'A phone has no address bar. The navigator manages a stack of screens.',
   8),

  ('40000000-0000-4000-8000-000000009509', '30000000-0000-4000-8000-000000000905',
   'Дэлгүүрт гаргахаас өмнө заавал бэлдэх зүйл аль нь вэ?',
   'What has to be ready before you submit to a store?',
   array['Зөвхөн код', 'Дүрс, нэр, хувилбар, зөвшөөрлийн тайлбар', 'Зөвхөн дизайн', 'Юу ч хэрэггүй'],
   array['Just the code', 'Icon, name, version, and a reason for every permission', 'Just the design', 'Nothing'],
   1,
   'Камер, байршил зэрэг зөвшөөрөл бүрт яагаад хэрэгтэйг тайлбарлах ёстой, эс бөгөөс татгалзана.',
   'Every permission needs a written reason, or the review rejects the build.',
   9),

  ('40000000-0000-4000-8000-000000009510', '30000000-0000-4000-8000-000000000905',
   '«Нэг кодоос хоёр дэлгүүр» гэдэг нь юу гэсэн үг вэ?',
   'What does «one codebase, both stores» actually mean?',
   array['Хоёр өөр апп бичнэ', 'Ихэнх код нь ижил, платформын ялгааг тусад нь зохицуулна', 'Зөвхөн Android дээр ажиллана', 'Кодыг хоёр хувилна'],
   array['You write two apps', 'Most of the code is shared; platform differences are handled separately', 'It only runs on Android', 'You copy the code twice'],
   1,
   'Ялгаа үлддэг — дүрс, зөвшөөрөл, зарим зан төлөв. Гэхдээ логик, дэлгэцүүд нь нийтлэг.',
   'Differences remain — icons, permissions, some behaviour. The logic and screens are shared.',
   10),

  ('40000000-0000-4000-8000-000000009601', '30000000-0000-4000-8000-000000000906',
   'Canvas дээр `y` тэнхлэг ямар чиглэлд өсдөг вэ?',
   'Which way does `y` grow on a canvas?',
   array['Дээшээ', 'Доошоо', 'Баруун тийш', 'Зүүн тийш'],
   array['Upwards', 'Downwards', 'To the right', 'To the left'],
   1,
   'Эхлэл нь зүүн дээд буланд. Тиймээс `y` нэмэгдэхэд дүрс доошоо явна.',
   'The origin is the top-left corner, so increasing `y` moves down.',
   1),

  ('40000000-0000-4000-8000-000000009602', '30000000-0000-4000-8000-000000000906',
   'Canvas-ийг CSS-ээр томруулбал юу болох вэ?',
   'What happens if you resize a canvas with CSS?',
   array['Юу ч болохгүй', 'Зураг нь сунаж бүдгэрнэ', 'Хурдан болно', 'Өнгө нь өөрчлөгдөнө'],
   array['Nothing', 'The drawing stretches and blurs', 'It gets faster', 'The colours change'],
   1,
   'CSS нь зөвхөн харагдах хэмжээг өөрчилнө. Бодит нягтралыг `width`, `height` атрибутаар тавина.',
   'CSS only changes the display size. The real resolution comes from the `width` and `height` attributes.',
   2),

  ('40000000-0000-4000-8000-000000009603', '30000000-0000-4000-8000-000000000906',
   'Тоглоомын гогцоонд `setInterval` биш юуг ашиглах вэ?',
   'What should drive a game loop instead of `setInterval`?',
   array['`setTimeout`', '`requestAnimationFrame`', '`while` давталт', '`Promise`'],
   array['`setTimeout`', '`requestAnimationFrame`', 'A `while` loop', '`Promise`'],
   1,
   'requestAnimationFrame нь дэлгэцийн сэргээлттэй тааруулж дуудагдана. Таб нуугдвал зогсоно.',
   'requestAnimationFrame lines up with the display refresh and pauses when the tab is hidden.',
   3),

  ('40000000-0000-4000-8000-000000009604', '30000000-0000-4000-8000-000000000906',
   'Хөдөлгөөнийг delta time-аар үржүүлэх шалтгаан юу вэ?',
   'Why multiply movement by delta time?',
   array['Кодыг богиносгохын тулд', 'Өөр өөр хурдны дэлгэц дээр ижил хурдтай явахын тулд', 'Санах ой хэмнэхийн тулд', 'Шаардлагагүй'],
   array['To shorten the code', 'So it moves at the same speed on displays of different refresh rates', 'To save memory', 'It is not needed'],
   1,
   '144Hz дэлгэц дээр гогцоо хоёр дахин олон удаа ажиллана. Delta байхгүй бол тоглоом хоёр дахин хурдан болно.',
   'A 144Hz display runs the loop twice as often. Without delta, the game runs twice as fast.',
   4),

  ('40000000-0000-4000-8000-000000009605', '30000000-0000-4000-8000-000000000906',
   'Хоёр тэгш өнцөгт мөргөлдсөнийг шалгах хамгийн энгийн арга юу вэ?',
   'What is the simplest way to test two rectangles for a hit?',
   array['Пиксел бүрийг харьцуулах', 'Дөрвөн ирмэгийн давхцлыг шалгах (AABB)', 'Өнгийг нь харьцуулах', 'Зайг нь нэмэх'],
   array['Compare every pixel', 'Check the four edges for overlap (AABB)', 'Compare their colours', 'Add their distances'],
   1,
   'Дөрвөн харьцуулалт. Эргэлддэггүй дүрсэнд бараг үргэлж хангалттай.',
   'Four comparisons. For shapes that do not rotate, it is almost always enough.',
   5),

  ('40000000-0000-4000-8000-000000009606', '30000000-0000-4000-8000-000000000906',
   'Three.js-д дүрс харагдахын тулд хамгийн багадаа юу хэрэгтэй вэ?',
   'What is the minimum a Three.js scene needs?',
   array['Зөвхөн mesh', 'Scene, camera, renderer гурав', 'Зөвхөн гэрэл', 'Физикийн сан'],
   array['Just a mesh', 'A scene, a camera and a renderer', 'Just a light', 'A physics library'],
   1,
   'Scene нь юу байгааг, camera нь хаанаас харахыг, renderer нь зурахыг хариуцна.',
   'The scene holds what exists, the camera says from where, the renderer draws it.',
   6),

  ('40000000-0000-4000-8000-000000009607', '30000000-0000-4000-8000-000000000906',
   'Гурван хэмжээст дүрс чинь хар харагдаж байвал юу дутсан байх магадлалтай вэ?',
   'Your 3D object renders black. What is most likely missing?',
   array['Камер', 'Гэрэл', 'Текстур', 'Физик'],
   array['A camera', 'A light', 'A texture', 'Physics'],
   1,
   'MeshStandardMaterial нь гэрэлд хариу үзүүлдэг. Гэрэл байхгүй бол ойх зүйл алга.',
   'MeshStandardMaterial responds to light. With no light there is nothing to reflect.',
   7),

  ('40000000-0000-4000-8000-000000009608', '30000000-0000-4000-8000-000000000906',
   '`import * as THREE from "three"` бичих нь юуны хувьд сул вэ?',
   'What is the downside of `import * as THREE from "three"`?',
   array['Ажиллахгүй', 'Ашиглаагүй код багцад үлдэж, хэмжээ томордог', 'Удаан бичигддэг', 'Хуучирсан'],
   array['It does not work', 'Unused code stays in the bundle and it grows', 'It is slow to type', 'It is deprecated'],
   1,
   'Хэрэгтэй зүйлээ нэрлэж импортлоход багцаас хэрэггүй хэсэг нь хасагдана.',
   'Naming what you import lets the bundler drop the rest.',
   8),

  ('40000000-0000-4000-8000-000000009609', '30000000-0000-4000-8000-000000000906',
   'Тоглоомын төлөвийг хэрхэн зохион байгуулах нь дээр вэ?',
   'How is game state best organised?',
   array['Олон глобал хувьсагчаар', 'Нэг төлөвийн объектод төвлөрүүлж', 'DOM дотор хадгалж', 'Хадгалахгүй'],
   array['Many global variables', 'Centralised in one state object', 'Inside the DOM', 'Do not keep it'],
   1,
   'Байрлал, оноо, амь нэг дор байвал дахин эхлүүлэх нь тэр объектыг сэргээх л ажил болно.',
   'With position, score and lives in one place, restarting is just resetting that object.',
   9),

  ('40000000-0000-4000-8000-000000009610', '30000000-0000-4000-8000-000000000906',
   'Товчлуурын удирдлагыг хэрхэн уншвал зөв вэ?',
   'What is the right way to read keyboard input?',
   array['keydown дээр шууд хөдөлгөх', 'keydown/keyup-ээр төлөв тэмдэглээд гогцоонд уншина', 'setInterval дотор шалгах', 'Хулганаар солих'],
   array['Move directly on keydown', 'Record pressed keys on keydown/keyup and read them in the loop', 'Poll inside setInterval', 'Use the mouse instead'],
   1,
   'keydown нь үйлдлийн системийн давталтын хурдаар дуудагдана. Төлөв тэмдэглэвэл хөдөлгөөн жигд болно.',
   'keydown repeats at the operating system''s rate. Recording state keeps movement smooth.',
   10),

  ('40000000-0000-4000-8000-000000009201', '30000000-0000-4000-8000-000000000902',
   'Хувьсагч гэж юу вэ?',
   'What is a variable?',
   array['Утга хадгалдаг, нэр өгсөн хайрцаг', 'Програмын нэр', 'Алдааны төрөл', 'Файлын хэлбэр'],
   array['A named box that holds a value', 'The program''s name', 'A kind of error', 'A file format'],
   0,
   'Нэрээр нь дуудаад доторх утгыг нь авна. Сайн нэр өгөх нь хамгийн их ач холбогдолтой.',
   null,
   1),

  ('40000000-0000-4000-8000-000000009202', '30000000-0000-4000-8000-000000000902',
   'Нөхцөл захиалахад хамгийн түгээмэл алдаа юу вэ?',
   'What is most often left out when specifying a rule?',
   array['Хэт урт бичих', '«Үгүй бол юу болох» талыг хэлэхгүй орхих', 'Тоог буруу бичих', 'Хэт олон жишээ өгөх'],
   array['Writing too much', 'Leaving out what happens when the condition is false', 'Getting a number wrong', 'Giving too many examples'],
   1,
   'Зөвхөн «тийм» талыг хэлбэл нөгөө тал нь таамгаар хийгдэнэ. Хоосон, дутуу тохиолдлыг ч бас хэл.',
   null,
   2),

  ('40000000-0000-4000-8000-000000009203', '30000000-0000-4000-8000-000000000902',
   'Жагсаалт хоосон байхад юу харагдахыг хэлээгүй бол юу болох вэ?',
   'What happens if you do not say what an empty list should show?',
   array['Алдаа гарна', 'Хоосон дэлгэц гарч, хэрэглэгч эвдэрсэн гэж бодно', 'Автоматаар мессеж гарна', 'Юу ч болохгүй'],
   array['It errors', 'A blank screen appears and the user thinks it is broken', 'A message appears automatically', 'Nothing'],
   1,
   'Хоосон төлөв бол бүтэн шийдлийн нэг хэсэг. «Танд захиалга алга» гэсэн мөр, дараагийн алхам руу чиглүүлэх товч хэрэгтэй.',
   null,
   3),

  ('40000000-0000-4000-8000-000000009204', '30000000-0000-4000-8000-000000000902',
   'Давтагдах ажлыг тусад нь гаргах гол ашиг юу вэ?',
   'Why pull repeated work into one named place?',
   array['Код богино харагдана', 'Нэг газар засахад хаа сайгүй зөв болно', 'Хурдан ажиллана', 'Файл цөөрнө'],
   array['The code looks shorter', 'One fix corrects it everywhere', 'It runs faster', 'Fewer files'],
   1,
   'Гурван газар хуулж бичсэн бол алдааг гурван газар засна — хоёрыг нь зассан ч гурав дахийг мартах магадлалтай.',
   null,
   4),

  ('40000000-0000-4000-8000-000000009205', '30000000-0000-4000-8000-000000000902',
   'Утасны дугаарыг ямар төрлөөр хадгалах нь зөв вэ?',
   'How should a phone number be stored?',
   array['Тоогоор', 'Текстээр', 'Огноогоор', 'Тийм/үгүйгээр'],
   array['As a number', 'As text', 'As a date', 'As true/false'],
   1,
   'Тоогоор хадгалбал эхний тэг нь алга болно, мөн + тэмдэг багтахгүй. Данс, бүртгэлийн дугаар ч мөн адил.',
   null,
   5),

  ('40000000-0000-4000-8000-000000009206', '30000000-0000-4000-8000-000000000902',
   'Өгөгдлийн бүтцээ хамгийн ойлгомжтой яаж захиалах вэ?',
   'What is the clearest way to specify your data?',
   array['«Өгөгдлийн сан хий» гэж хэлэх', 'Хүснэгт бүрийн талбаруудыг жагсаагаад хоорондын холбоог хэлэх', 'Зөвхөн нэрийг нь дурдах', 'Excel файл явуулах'],
   array['Say «make a database»', 'List each table''s fields and say how they relate', 'Just mention the names', 'Send an Excel file'],
   1,
   'Гурван хүснэгт, тус бүрийн талбар, хоорондын сум — энэ гурвыг хэлэхэд бүтэц эхний оролдлогоор зөв гарна.',
   null,
   6),

  ('40000000-0000-4000-8000-000000009207', '30000000-0000-4000-8000-000000000902',
   '«Эхлээд юу хийхээ хэлээд дараа нь хийгээрэй» гэж нэмэх нь юунд хэрэгтэй вэ?',
   'Why add «tell me the plan before you do it»?',
   array['Хариуг удаашруулах', 'Буруу зүг рүү явахаас нь өмнө зогсоох', 'Илүү код бичүүлэх', 'Шаардлагагүй'],
   array['To slow the answer down', 'To stop a wrong direction before the work is done', 'To get more code', 'It is unnecessary'],
   1,
   'Хорин файл бичигдсэний дараа «би тэгэхийг хүсээгүй» гэхээс хамаагүй хямд.',
   null,
   7),

  ('40000000-0000-4000-8000-000000009208', '30000000-0000-4000-8000-000000000902',
   'Засвар захиалахдаа юуг заавал нэмэх вэ?',
   'What should you always add when asking for a change?',
   array['«Хурдан хийгээрэй»', '«Бусдыг нь бүү хөндөөрэй»', '«Дахин бичээрэй»', '«Урт тайлбар бичээрэй»'],
   array['«Do it fast»', '«Do not touch anything else»', '«Rewrite it»', '«Write a long explanation»'],
   1,
   'Хязгаар хэлээгүй бол засвар хийх явцад өөр хэсэг санамсаргүй өөрчлөгдөж болно.',
   null,
   8),

  ('40000000-0000-4000-8000-000000009209', '30000000-0000-4000-8000-000000000902',
   'Алдаа гарвал юуг хамт өгөх вэ?',
   'What do you send along with an error?',
   array['Зөвхөн эхний мөрийг', 'Мессежийг бүтнээр нь, мөн юу хийж байхад гарснаа', 'Дэлгэцийн зураг л хангалттай', 'Юу ч хэрэггүй'],
   array['Only the first line', 'The whole message, and what you were doing', 'A screenshot is enough', 'Nothing'],
   1,
   'Доорх мөрүүд нь хаана болсныг хэлдэг. «Өмнө нь ажиллаж байсан, X нэмсний дараа эхэлсэн» гэдэг нь ихэвчлэн шийдвэрлэх хариу.',
   null,
   9),

  ('40000000-0000-4000-8000-000000009210', '30000000-0000-4000-8000-000000000902',
   '«Болсон» гэж хэзээ үзэх вэ?',
   'When is something actually done?',
   array['Дэлгэц дээр зөв харагдвал', 'Онцгой тохиолдлууд шалгагдаж, өөр хүн ашиглаж чадаж, ажил хадгалагдсан бол', 'Алдаа гараагүй бол', 'Хиймэл оюун «боллоо» гэвэл'],
   array['When it looks right', 'When the edge cases are checked, someone else could use it, and the work is saved', 'When there is no error', 'When the assistant says so'],
   1,
   'Хоосон, буруу, урт — гурван онцгой тохиолдол. Дараа нь өөр хүнээр үзүүлээд, ажиллаж байгаа хувилбараа хадгална.',
   null,
   10)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  prompt_mn = excluded.prompt_mn, prompt_en = excluded.prompt_en,
  options_mn = excluded.options_mn, options_en = excluded.options_en,
  correct_index = excluded.correct_index,
  explanation_mn = excluded.explanation_mn, explanation_en = excluded.explanation_en,
  rank = excluded.rank;
