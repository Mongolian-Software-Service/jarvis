-- ─────────────────────────────────────────────────────────────────────────────
-- Jarvis — seed.
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
   level, topic, price_mnt, is_published, rank, cover_url)
values
  ('10000000-0000-4000-8000-000000000001', 'web-undes',
   'Вэб хөгжүүлэлтийн үндэс',
   'Web development foundations',
   'HTML, CSS хоёроор анхны вэб хуудсаа бүтээж, интернэтэд байршуулах хүртэлх зам.',
   'From your first HTML file to a page on the internet, with HTML and CSS.',
   $md$Энэ сургалт код бичиж үзээгүй хүнд зориулагдсан. Бид онолоос эхлэхгүй — эхний хичээл дээрээ л хөтчөө нээж, өөрийн гараар бичсэн хуудсаа хардаг.

Төгсөхдөө та өөрийн танилцуулга хуудсыг гар утсанд тохирсон байдлаар бүтээж, үнэгүй хостинг дээр байршуулсан байх болно. Тэр холбоосыг ажлын байрны анкетдаа тавьж болно.$md$,
   $md$Written for someone who has never written code. We open a browser in the first lesson and look at a page you typed yourself.

By the end you will have built a personal profile page that works on a phone, and put it online at a link you can send to anyone.$md$,
   'beginner', 'web', 0, true, 1,
   'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=70'),

  ('10000000-0000-4000-8000-000000000002', 'javascript-suur',
   'JavaScript: эхний алхам',
   'JavaScript: the first step',
   'Хувьсагчаас эхлээд бодит To-do аппликейшн хүртэл — браузер дээр ажилладаг код.',
   'From your first variable to a working to-do app that runs in the browser.',
   $md$JavaScript бол вэб дээр ажилладаг цорын ганц програмчлалын хэл. Энэ сургалт түүний суурийг — хувьсагч, нөхцөл, давталт, функц — бодит жишээн дээр заана.

Хоёрдугаар хэсэгт браузерын DOM-той ажиллаж, хэрэглэгчийн товшилтод хариу үзүүлдэг код бичнэ. Төгсгөлд нь өөрийн To-do аппликейшнаа бүтээж, өгөгдлөө хөтөч дээр хадгалж сурна.$md$,
   $md$JavaScript is the only programming language that runs in a browser. This course teaches its foundations — variables, conditions, loops, functions — through examples you can run.

In the second half you work with the DOM and write code that responds to a click. You finish by building a to-do app that remembers its own data.$md$,
   'beginner', 'javascript', 149000, true, 2,
   'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=1200&q=70'),

  ('10000000-0000-4000-8000-000000000003', 'react-next',
   'React ба Next.js-ээр бүтээх',
   'Building with React and Next.js',
   'Компонентоос эхлээд Supabase холбосон, Vercel дээр байршсан бүтэн апп хүртэл.',
   'From a component to a deployed app with Supabase behind it.',
   $md$JavaScript-ийн суурьтай хүнд зориулсан дараагийн шат. React-ийн сэтгэлгээ — компонент, state, нэг чиглэлийн өгөгдөл — яагаад ийм болсныг ойлгуулж, дараа нь Next.js-ийн App Router руу шилжинэ.

Сүүлийн модульд бид жинхэнэ өгөгдлийн сан (Supabase) холбож, нэвтрэлт нэмж, аппаа Vercel дээр байршуулна. Энэ бол уншаад ойлгодог биш, бичээд ажиллуулдаг сургалт.$md$,
   null,
   'intermediate', 'react', 249000, true, 3,
   'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=70'),

  ('10000000-0000-4000-8000-000000000004', 'python-suur',
   'Python-оор програмчлалын эхлэл',
   'Programming with Python',
   'Орчноо бэлдэхээс эхлээд pandas-аар бодит өгөгдөл боловсруулах хүртэл.',
   'From setting up your environment to working with real data in pandas.',
   $md$Python бол өнөөдөр хамгийн өргөн ашиглагддаг хэлүүдийн нэг — өгөгдөл шинжилгээ, автоматжуулалт, хиймэл оюун бүгд энд уулздаг.

Сургалт орчноо бэлдэхээс эхэлнэ, учир нь эхлэгчдийн хамгийн олон нь яг тэнд бууж өгдөг. Дараа нь хэлний суурийг үзээд, эцэст нь Excel файл уншиж, цэвэрлэж, дүгнэлт гаргах бодит ажил хийнэ.$md$,
   null,
   'beginner', 'python', 199000, true, 4,
   'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&q=70'),

  ('10000000-0000-4000-8000-000000000005', 'typescript-gunzgii',
   'TypeScript гүнзгийрүүлэх',
   'TypeScript in depth',
   'Төрлийн систем, generic, утга дүгнэлт — том код баазыг аюулгүй барих.',
   'Generics, inference and the type system, for code that has to last.',
   $md$Энэ сургалт бэлтгэгдэж байна. Агуулга нь: generic, conditional type, template literal type, mapped type, discriminated union, зохиомж (declaration) файл бичих.$md$,
   null,
   'advanced', 'typescript', 229000, false, 5, null)
on conflict (id) do update set
  slug = excluded.slug,
  title_mn = excluded.title_mn, title_en = excluded.title_en,
  summary_mn = excluded.summary_mn, summary_en = excluded.summary_en,
  description_mn = excluded.description_mn, description_en = excluded.description_en,
  level = excluded.level, topic = excluded.topic, price_mnt = excluded.price_mnt,
  is_published = excluded.is_published, rank = excluded.rank, cover_url = excluded.cover_url;

-- ── Modules ──────────────────────────────────────────────────────────────────
insert into public.modules (id, course_id, title_mn, title_en, rank) values
  -- Вэб хөгжүүлэлтийн үндэс
  ('20000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000001', 'HTML-ийн суурь',        'HTML foundations',   1),
  ('20000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000001', 'CSS-ээр хэлбэржүүлэх',  'Styling with CSS',   2),
  ('20000000-0000-4000-8000-000000000103', '10000000-0000-4000-8000-000000000001', 'Бодит төсөл',           'A real project',     3),
  -- JavaScript
  ('20000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000002', 'Хэлний суурь',          'Language basics',    1),
  ('20000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000002', 'Браузер дээр',          'In the browser',     2),
  ('20000000-0000-4000-8000-000000000203', '10000000-0000-4000-8000-000000000002', 'Жижиг төсөл',           'A small project',    3),
  -- React + Next.js
  ('20000000-0000-4000-8000-000000000301', '10000000-0000-4000-8000-000000000003', 'React-ийн сэтгэлгээ',   'Thinking in React',  1),
  ('20000000-0000-4000-8000-000000000302', '10000000-0000-4000-8000-000000000003', 'Next.js App Router',    'Next.js App Router', 2),
  ('20000000-0000-4000-8000-000000000303', '10000000-0000-4000-8000-000000000003', 'Бодит апп',             'A real app',         3),
  -- Python
  ('20000000-0000-4000-8000-000000000401', '10000000-0000-4000-8000-000000000004', 'Python-ы суурь',        'Python basics',      1),
  ('20000000-0000-4000-8000-000000000402', '10000000-0000-4000-8000-000000000004', 'Практик ажил',          'Practical work',     2),
  -- TypeScript (ноорог)
  ('20000000-0000-4000-8000-000000000501', '10000000-0000-4000-8000-000000000005', 'Төрлийн систем',        'The type system',    1)
on conflict (id) do update set
  course_id = excluded.course_id,
  title_mn = excluded.title_mn, title_en = excluded.title_en, rank = excluded.rank;

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
  ('30000000-0000-4000-8000-000000000101', '20000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000001',
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

  ('30000000-0000-4000-8000-000000000102', '20000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000001',
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
   null, 'html', null, null, true, 2),

  ('30000000-0000-4000-8000-000000000103', '20000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000001',
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
   null, 'html', null, null, false, 3),

  -- ══ CSS-ээр хэлбэржүүлэх
  ('30000000-0000-4000-8000-000000000104', '20000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000001',
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

  ('30000000-0000-4000-8000-000000000105', '20000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000001',
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

  ('30000000-0000-4000-8000-000000000106', '20000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000001',
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
  ('30000000-0000-4000-8000-000000000107', '20000000-0000-4000-8000-000000000103', '10000000-0000-4000-8000-000000000001',
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

  ('30000000-0000-4000-8000-000000000108', '20000000-0000-4000-8000-000000000103', '10000000-0000-4000-8000-000000000001',
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

  ('30000000-0000-4000-8000-000000000109', '20000000-0000-4000-8000-000000000103', '10000000-0000-4000-8000-000000000001',
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

  ('30000000-0000-4000-8000-000000000110', '20000000-0000-4000-8000-000000000103', '10000000-0000-4000-8000-000000000001',
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

insert into public.lessons
  (id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes,
   body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank)
values
  -- ══ JavaScript: эхний алхам ══ Хэлний суурь
  ('30000000-0000-4000-8000-000000000201', '20000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000002',
   'huvisagch-ba-turul', 'Хувьсагч ба төрөл', 'Variables and types', 'video',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 10,
   $md$Хувьсагч бол утга хадгалдаг нэртэй хайрцаг.

```js
const ner = "Ганбат";   // өөрчлөгдөхгүй
let nas = 24;            // өөрчлөгдөнө
nas = 25;
```

`var` гэж бүү бич. Хуучин код дээр л уулзана — өнөөдөр `const`-оор эхэл, өөрчлөх шаардлага гарвал `let` болго.

## Үндсэн төрлүүд

- `string` — текст: `"сайн уу"`
- `number` — тоо: `42`, `3.14`
- `boolean` — үнэн/худал: `true`, `false`
- `null`, `undefined` — утга байхгүй гэдгийн хоёр өөр хэлбэр
- `object`, `array` — цуглуулга

```js
const suragch = { ner: "Ганбат", nas: 24 };
const honoguud = ["Даваа", "Мягмар"];
```$md$,
   $md$A variable is a named box that holds a value.

```js
const name = "Ganbat";
let age = 24;
```

Never write `var`. Start with `const`, reach for `let` only when the value has to change.$md$,
   'javascript', null, null, true, 1),

  ('30000000-0000-4000-8000-000000000202', '20000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000002',
   'nuhtsul-ba-davtalt', 'Нөхцөл ба давталт', 'Conditions and loops', 'code', null, 15,
   $md$Програм гэдэг бол шийдвэр гаргаж, ажлыг давтдаг зүйл.

```js
if (nas >= 18) {
  console.log("Тавтай морил");
} else {
  console.log("Эцэг эхийнхээ зөвшөөрөл авна уу");
}
```

## Давталт

```js
for (const honog of honoguud) {
  console.log(honog);
}
```

`for...of` нь массивын **утга** дээр, `for...in` нь **түлхүүр** дээр явдаг. Эхлэгчдийн хамгийн олон алдаа энэ хоёрыг андуурахаас гардаг.

## Дасгал

1-ээс 20 хүртэлх тоонуудаас 3-т хуваагддагийг нь хэвлэ.$md$,
   null, 'javascript',
   $md$// 1-20 хүртэл давтаж, 3-т хуваагдахыг нь хэвлэ
for (let i = 1; i <= 20; i++) {
  // энд бич
}$md$,
   $md$for (let i = 1; i <= 20; i++) {
  if (i % 3 === 0) {
    console.log(i);
  }
}$md$,
   false, 2),

  ('30000000-0000-4000-8000-000000000203', '20000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000002',
   'funkts', 'Функц', 'Functions', 'code', null, 14,
   $md$Функц бол нэр өгсөн, дахин дуудаж болдог кодын хэсэг.

```js
function niilber(a, b) {
  return a + b;
}

const ur = niilber(2, 3); // 5
```

Орчин үеийн бичлэг — сумтай функц:

```js
const niilber = (a, b) => a + b;
```

## Сайн функцийн гурван шинж

1. **Нэг ажил хийдэг.** Нэрийг нь хэлэхэд юу хийхийг ойлгомжтой байх.
2. **Гаднаас нь юм өөрчилдөггүй.** Зөвхөн өгсөн аргументаас хамаарч утга буцаана.
3. **Богино.** Дэлгэц дүүрэн функц бол хоёр функц болж хуваагдах гэж хүлээж байгаа функц.$md$,
   null, 'javascript',
   $md$// Массив доторх тоонуудын дунджийг буцаадаг функц бич
const dundaj = (toonuud) => {
  // энд бич
};$md$,
   $md$const dundaj = (toonuud) => {
  if (toonuud.length === 0) return 0;
  const niit = toonuud.reduce((a, b) => a + b, 0);
  return niit / toonuud.length;
};$md$,
   false, 3),

  -- ══ Браузер дээр
  ('30000000-0000-4000-8000-000000000204', '20000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000002',
   'dom-toi-ajillah', 'DOM-той ажиллах', 'Working with the DOM', 'code', null, 16,
   $md$Хөтөч HTML-ийг уншаад санах ойд мод шиг бүтэц үүсгэдэг. Түүнийг DOM гэнэ. JavaScript-ээр тэр модыг өөрчилж болно.

```js
const garchig = document.querySelector("h1");
garchig.textContent = "Шинэ гарчиг";
garchig.classList.add("tod");
```

`innerHTML` биш `textContent` ашигла. Хэрэглэгчийн оруулсан текстийг `innerHTML`-ээр тавих нь халдлагын хамгийн түгээмэл нүх.

```js
const shine = document.createElement("li");
shine.textContent = "Шинэ мөр";
document.querySelector("ul").append(shine);
```$md$,
   null, 'javascript',
   $md$// Товч дарах бүрт тоолуурыг нэгээр нэмэгдүүл
let toolor = 0;
const tovch = document.querySelector("#tovch");
const utga = document.querySelector("#utga");$md$,
   $md$let toolor = 0;
const tovch = document.querySelector("#tovch");
const utga = document.querySelector("#utga");

tovch.addEventListener("click", () => {
  toolor += 1;
  utga.textContent = String(toolor);
});$md$,
   false, 1),

  ('30000000-0000-4000-8000-000000000205', '20000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000002',
   'event', 'Event — хэрэглэгчийн үйлдэл', 'Events', 'code', null, 13,
   $md$Товшилт, гар, гүйлгэлт — бүгд event. Кодоо тэдэнд "сонсогч" болгож холбоно.

```js
tovch.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("дарлаа");
});
```

Маягтын `submit` дээр `preventDefault()` дуудахгүй бол хуудас дахин ачаалагдаж, бичсэн бүхэн алга болно.

## Нэг сонсогчоор олон элемент

```js
jagsaalt.addEventListener("click", (e) => {
  const mur = e.target.closest("li");
  if (!mur) return;
  mur.remove();
});
```

Энэ аргыг **event delegation** гэдэг. Мөр нэмэгдэх бүрт шинэ сонсогч холбох шаардлагагүй болно.$md$,
   null, 'javascript', null, null, false, 2),

  ('30000000-0000-4000-8000-000000000206', '20000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000002',
   'fetch-ba-api', 'Fetch ба API', 'Fetch and APIs', 'code', null, 18,
   $md$Бусад серверээс өгөгдөл авахад `fetch` ашиглана. Хариу нь шууд ирэхгүй тул `await` хэрэгтэй.

```js
const hariu = await fetch("https://api.example.mn/hicheel");
if (!hariu.ok) {
  throw new Error("Татаж чадсангүй: " + hariu.status);
}
const ogogdol = await hariu.json();
```

`hariu.ok`-г шалгахгүй орхих нь түгээмэл алдаа: 404 буцаасан ч `fetch` алдаа шидэхгүй, чи хоосон өгөгдөл дээр ажиллаж эхэлнэ.

```js
try {
  const ogogdol = await tatah();
  zurah(ogogdol);
} catch (aldaa) {
  haruulah("Сүлжээнд холбогдож чадсангүй");
}
```$md$,
   null, 'javascript', null, null, false, 3),

  -- ══ Жижиг төсөл
  ('30000000-0000-4000-8000-000000000207', '20000000-0000-4000-8000-000000000203', '10000000-0000-4000-8000-000000000002',
   'todo-app', 'To-do аппликейшн', 'A to-do app', 'code', null, 25,
   $md$Сурсан бүхнээ нийлүүлж бодит апп бичье: мөр нэмэх, дуусгасан гэж тэмдэглэх, устгах.

## Алхам алхмаар

1. Маягтаас текст уншиж авах
2. Массивдаа нэмэх
3. Массиваа дэлгэц дээр зурах функц бичих
4. Өөрчлөлт болгоны дараа дахин зурах

Энэ "өгөгдөл → зурах" загвар бол React-ийн үндсэн санаа. Одоо гараараа бичиж байгаа зүйлээ дараагийн сургалтад номхон бэлэн авна.$md$,
   null, 'javascript',
   $md$const ajluud = [];

function zurah() {
  // ajluud-ыг <ul> дотор зур
}

maygt.addEventListener("submit", (e) => {
  e.preventDefault();
  // энд нэм
});$md$,
   $md$const ajluud = [];
const jagsaalt = document.querySelector("#jagsaalt");
const maygt = document.querySelector("#maygt");
const oruulga = document.querySelector("#oruulga");

function zurah() {
  jagsaalt.innerHTML = "";
  for (const [index, ajil] of ajluud.entries()) {
    const mur = document.createElement("li");
    mur.textContent = ajil.tekst;
    mur.dataset.index = String(index);
    if (ajil.duussan) mur.classList.add("duussan");
    jagsaalt.append(mur);
  }
}

maygt.addEventListener("submit", (e) => {
  e.preventDefault();
  const tekst = oruulga.value.trim();
  if (!tekst) return;
  ajluud.push({ tekst, duussan: false });
  oruulga.value = "";
  zurah();
});

jagsaalt.addEventListener("click", (e) => {
  const mur = e.target.closest("li");
  if (!mur) return;
  const index = Number(mur.dataset.index);
  ajluud[index].duussan = !ajluud[index].duussan;
  zurah();
});$md$,
   false, 1),

  ('30000000-0000-4000-8000-000000000208', '20000000-0000-4000-8000-000000000203', '10000000-0000-4000-8000-000000000002',
   'lokal-hadgalalt', 'Локал хадгалалт', 'Local storage', 'text', null, 12,
   $md$Хуудсыг сэргээхэд бүх зүйл алга болдог. `localStorage` үүнийг засна.

```js
localStorage.setItem("ajluud", JSON.stringify(ajluud));

const hadgalsan = localStorage.getItem("ajluud");
const ajluud = hadgalsan ? JSON.parse(hadgalsan) : [];
```

`localStorage` зөвхөн текст хадгална — тиймээс `JSON.stringify` / `JSON.parse` хос үргэлж хамт явна.

> Нууц үг, төлбөрийн мэдээллийг энд **хэзээ ч** бүү хадга. Энэ бол хөтөч дээрх, ямар ч скрипт уншиж чадах ил хадгалалт.$md$,
   null, 'javascript', null, null, false, 2),

  ('30000000-0000-4000-8000-000000000209', '20000000-0000-4000-8000-000000000203', '10000000-0000-4000-8000-000000000002',
   'shalgalt-javascript', 'Шалгалт: JavaScript', 'Quiz: JavaScript', 'quiz', null, 6,
   $md$Дөрвөн асуулт. Хариултаа сонгоод шалгаарай.$md$,
   null, null, null, null, false, 3),

  -- ══ React ба Next.js ══ React-ийн сэтгэлгээ
  ('30000000-0000-4000-8000-000000000301', '20000000-0000-4000-8000-000000000301', '10000000-0000-4000-8000-000000000003',
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

  ('30000000-0000-4000-8000-000000000302', '20000000-0000-4000-8000-000000000301', '10000000-0000-4000-8000-000000000003',
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

  ('30000000-0000-4000-8000-000000000303', '20000000-0000-4000-8000-000000000301', '10000000-0000-4000-8000-000000000003',
   'jagsaalt-ba-key', 'Жагсаалт ба key', 'Lists and keys', 'code', null, 12,
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
  ('30000000-0000-4000-8000-000000000304', '20000000-0000-4000-8000-000000000302', '10000000-0000-4000-8000-000000000003',
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

  ('30000000-0000-4000-8000-000000000305', '20000000-0000-4000-8000-000000000302', '10000000-0000-4000-8000-000000000003',
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

  ('30000000-0000-4000-8000-000000000306', '20000000-0000-4000-8000-000000000302', '10000000-0000-4000-8000-000000000003',
   'ogogdol-tatah', 'Өгөгдөл татах', 'Fetching data', 'code', null, 18,
   $md$Сервер компонент дотор өгөгдөл татахад тусгай сан хэрэггүй.

```tsx
export default async function Page() {
  const { data, error } = await supabase
    .from("courses")
    .select("id, slug, title_mn, price_mnt")
    .eq("is_published", true)
    .order("rank");

  if (error) throw error;
  return <CourseGrid courses={data} />;
}
```

`select("*")` бүү бич. Хэрэгтэй баганаа нэрлэ: сүлжээгээр явах өгөгдөл бага байх ба хожим багана нэмэгдэхэд юу нь эвдэрснийг харах болно.$md$,
   null, 'tsx', null, null, false, 3),

  -- ══ Бодит апп
  ('30000000-0000-4000-8000-000000000307', '20000000-0000-4000-8000-000000000303', '10000000-0000-4000-8000-000000000003',
   'supabase-holboh', 'Supabase холбох', 'Connecting Supabase', 'code', null, 20,
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

  ('30000000-0000-4000-8000-000000000308', '20000000-0000-4000-8000-000000000303', '10000000-0000-4000-8000-000000000003',
   'nevtrelt', 'Нэвтрэлт нэмэх', 'Adding authentication', 'code', null, 22,
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

  ('30000000-0000-4000-8000-000000000309', '20000000-0000-4000-8000-000000000303', '10000000-0000-4000-8000-000000000003',
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
  -- ══ Python-оор програмчлалын эхлэл ══ Python-ы суурь
  ('30000000-0000-4000-8000-000000000401', '20000000-0000-4000-8000-000000000401', '10000000-0000-4000-8000-000000000004',
   'orchnoo-beldeh', 'Орчноо бэлдэх', 'Setting up', 'video',
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 9,
   $md$Эхлэгчдийн хамгийн олон нь код бичиж эхлэхээсээ өмнө, суулгах шатанд бууж өгдөг. Тиймээс үүнийг эхний хичээл болгов.

1. [python.org](https://www.python.org/downloads/) дээрээс суулга. Windows дээр **"Add Python to PATH"** сонголтыг заавал тэмдэглэ.
2. VS Code суулгаад Python өргөтгөлийг нэм.
3. Терминал нээгээд шалга:

```bash
python --version
```

Хувилбарын дугаар гарч ирвэл бэлэн. Алдаа гарвал PATH-ын тэмдэглэгээгээ мартсан байх магадлалтай — дахин суулгахад л хангалттай.$md$,
   null, 'bash', null, null, true, 1),

  ('30000000-0000-4000-8000-000000000402', '20000000-0000-4000-8000-000000000401', '10000000-0000-4000-8000-000000000004',
   'ogogdliin-turul', 'Өгөгдлийн төрөл', 'Data types', 'code', null, 14,
   $md$Python-д хувьсагчийн төрлийг зарлах шаардлагагүй — утгаасаа өөрөө таамагладаг.

```python
ner = "Ганбат"      # str
nas = 24             # int
une = 149000.0       # float
suralcsan = True     # bool
```

## Цуглуулгууд

```python
honoguud = ["Даваа", "Мягмар", "Лхагва"]   # list — өөрчлөгддөг
tseg = (47.92, 106.92)                       # tuple — өөрчлөгддөггүй
suragch = {"ner": "Ганбат", "nas": 24}      # dict — түлхүүр: утга
```

`list` ба `dict` хоёр өдөр тутмын ажлын 90 хувийг эзэлнэ.$md$,
   null, 'python',
   $md$# Оюутнуудын нэрсээс 5-аас урт нэрийг нь шүүж ав
nersuud = ["Ганбат", "Оюун", "Батбаяр", "Сүх"]
# энд бич$md$,
   $md$nersuud = ["Ганбат", "Оюун", "Батбаяр", "Сүх"]
urt = [n for n in nersuud if len(n) > 5]
print(urt)  # ['Ганбат', 'Батбаяр']$md$,
   false, 2),

  ('30000000-0000-4000-8000-000000000403', '20000000-0000-4000-8000-000000000401', '10000000-0000-4000-8000-000000000004',
   'davtalt-ba-funkts', 'Давталт ба функц', 'Loops and functions', 'code', null, 16,
   $md$Python-д блокыг хаалт биш, **догол мөр** тодорхойлно. Дөрвөн хоосон зай — тогтмол.

```python
def mendleh(ner):
    return f"Сайн уу, {ner}"

for honog in honoguud:
    print(mendleh(honog))
```

`f"..."` бол текст дотор утга суулгах хамгийн цэвэр арга. Хуучин `%` болон `.format()`-ыг шинэ кодод бүү хэрэглэ.

Догол мөрөө хольж болохгүй: tab ба хоосон зайг хутгасан файл `IndentationError` өгнө. Засварлагчаа "insert spaces" горимд тохируулаарай.$md$,
   null, 'python',
   $md$# Өгсөн жагсаалтын хамгийн их утгыг буцаадаг функц бич (max() ашиглахгүй)
def hamgiin_ih(toonuud):
    pass$md$,
   $md$def hamgiin_ih(toonuud):
    if not toonuud:
        return None
    ur = toonuud[0]
    for too in toonuud[1:]:
        if too > ur:
            ur = too
    return ur$md$,
   false, 3),

  -- ══ Практик ажил
  ('30000000-0000-4000-8000-000000000404', '20000000-0000-4000-8000-000000000402', '10000000-0000-4000-8000-000000000004',
   'failtai-ajillah', 'Файлтай ажиллах', 'Working with files', 'code', null, 15,
   $md$Бодит ажлын ихэнх нь файл уншиж, боловсруулж, буцааж бичихээс бүрддэг.

```python
with open("ogogdol.txt", encoding="utf-8") as f:
    murnuud = f.read().splitlines()
```

`encoding="utf-8"` заавал. Үгүй бол Windows дээр кирилл үсэг эвдэрч уншигдана.

`with` хэрэглэх шалтгаан: блокоос гармагц файлыг автоматаар хаадаг. Алдаа гарлаа ч хаагдана.

```python
with open("ur_dun.txt", "w", encoding="utf-8") as f:
    for mur in murnuud:
        f.write(mur.upper() + "\n")
```$md$,
   null, 'python', null, null, false, 1),

  ('30000000-0000-4000-8000-000000000405', '20000000-0000-4000-8000-000000000402', '10000000-0000-4000-8000-000000000004',
   'pandas-ogogdol', 'pandas-аар өгөгдөл боловсруулах', 'Data with pandas', 'code', null, 20,
   $md$pandas бол Excel-ийн хүснэгтийг кодоор барьдаг сан.

```python
import pandas as pd

df = pd.read_excel("borluulalt.xlsx")
print(df.head())
print(df.shape)       # (мөр, багана)
```

## Шүүх, бүлэглэх

```python
ulaanbaatar = df[df["hot"] == "Улаанбаатар"]
niit = df.groupby("hot")["dun"].sum().sort_values(ascending=False)
```

Гурван мөр кодоор гараар хийвэл цаг зарцуулах ажлыг гүйцэтгэлээ. Энэ бол Python сурах хамгийн шууд шалтгаан.$md$,
   null, 'python', null, null, false, 2),

  ('30000000-0000-4000-8000-000000000406', '20000000-0000-4000-8000-000000000402', '10000000-0000-4000-8000-000000000004',
   'shalgalt-python', 'Шалгалт: Python', 'Quiz: Python', 'quiz', null, 6,
   $md$Гурван асуулт. Модуль дуусахын өмнөх шалгалт.$md$,
   null, null, null, null, false, 3),

  -- ══ TypeScript гүнзгийрүүлэх (ноорог — зөвхөн админд харагдана)
  ('30000000-0000-4000-8000-000000000501', '20000000-0000-4000-8000-000000000501', '10000000-0000-4000-8000-000000000005',
   'turliin-dugnelt', 'Төрлийн дүгнэлт', 'Type inference', 'text', null, 14,
   $md$TypeScript ихэнх төрлийг өөрөө дүгнэж чадна. Гар аргаар бичих нь илүүдэл болох үе олон.

```ts
const ner = "Ганбат";        // "Ганбат" — literal type
let too = 5;                  // number
```

`const` нь шууд утгын төрөл (literal) өгдөг бол `let` нь өргөн төрөл өгдөг. Энэ ялгаа union төрөлтэй ажиллахад чухал.$md$,
   null, 'ts', null, null, false, 1),

  ('30000000-0000-4000-8000-000000000502', '20000000-0000-4000-8000-000000000501', '10000000-0000-4000-8000-000000000005',
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

  ('30000000-0000-4000-8000-000000000503', '20000000-0000-4000-8000-000000000501', '10000000-0000-4000-8000-000000000005',
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

  -- Шалгалт: JavaScript
  ('40000000-0000-4000-8000-000000000201', '30000000-0000-4000-8000-000000000209',
   'Хэрэглэгчийн бичсэн текстийг хуудсанд оруулахад алийг нь ашиглах вэ?',
   'How should user-typed text be put into the page?',
   array['textContent', 'innerHTML', 'document.write', 'eval'],
   array['textContent', 'innerHTML', 'document.write', 'eval'],
   0,
   'innerHTML нь текстийг HTML болгон уншдаг тул хэрэглэгч script оруулах боломжтой болно. textContent зөвхөн текст гэж үзнэ.',
   'innerHTML parses the string as HTML, so a user can inject a script. textContent treats it as text.',
   1),

  ('40000000-0000-4000-8000-000000000202', '30000000-0000-4000-8000-000000000209',
   'Маягт илгээхэд хуудас дахин ачаалагдаж, бичсэн бүхэн алга болж байна. Яагаад?',
   'Submitting the form reloads the page and everything typed is gone. Why?',
   array['e.preventDefault() дуудаагүй', 'addEventListener буруу', 'const хэрэглэсэн', 'async дутуу'],
   array['e.preventDefault() was not called', 'addEventListener is wrong', 'const was used', 'async is missing'],
   0,
   'Маягтын анхдагч үйлдэл бол сервер рүү илгээж хуудсыг шинэчлэх. Түүнийг зогсоохгүй бол JavaScript ажиллах завсаргүй болно.',
   'A form submit reloads by default; preventDefault is what stops it.',
   2),

  ('40000000-0000-4000-8000-000000000203', '30000000-0000-4000-8000-000000000209',
   'fetch 404 буцаалаа. Дараах кодын алдаа хаана вэ?',
   'fetch returned a 404. Where is the bug?',
   array['hariu.ok шалгаагүй', 'await дутсан', 'JSON.parse хэрэгтэй', 'Алдаа алга'],
   array['hariu.ok was not checked', 'await is missing', 'JSON.parse is needed', 'There is no bug'],
   0,
   'fetch нь 404, 500 дээр алдаа шиддэггүй — хариу ирсэн л бол амжилттай гэж үзнэ. Төлвийг гараар шалгана.',
   'fetch does not throw on 404 or 500; you have to check the status yourself.',
   3),

  ('40000000-0000-4000-8000-000000000204', '30000000-0000-4000-8000-000000000209',
   'localStorage-д юуг хадгалж болохгүй вэ?',
   'What must never go into localStorage?',
   array['Нууц үг, төлбөрийн мэдээлэл', 'Хэрэглэгчийн сонгосон хэл', 'To-do жагсаалт', 'Харанхуй горимын тохиргоо'],
   array['Passwords and payment details', 'The chosen language', 'A to-do list', 'The dark mode setting'],
   0,
   'localStorage бол хөтөч дээрх ил хадгалалт. Тэр хуудсан дээр ажиллах ямар ч скрипт уншиж чадна.',
   'localStorage is plain text in the browser and any script on the page can read it.',
   4),

  -- Шалгалт: Python
  ('40000000-0000-4000-8000-000000000301', '30000000-0000-4000-8000-000000000406',
   'Python-д блокыг юугаар тодорхойлдог вэ?',
   'What defines a block in Python?',
   array['Догол мөр (indentation)', 'Хаалт { }', 'end түлхүүр үг', 'Цэг таслал'],
   array['Indentation', 'Braces { }', 'An end keyword', 'Semicolons'],
   0,
   'Догол мөр нь хэлбэр биш, дүрэм. Tab ба хоосон зайг хутгавал IndentationError гарна.',
   'Indentation is syntax, not style. Mixing tabs and spaces raises IndentationError.',
   1),

  ('40000000-0000-4000-8000-000000000302', '30000000-0000-4000-8000-000000000406',
   'Windows дээр файл уншихад кирилл үсэг эвдэрч байна. Юу нэмэх вэ?',
   'Cyrillic breaks when reading a file on Windows. What do you add?',
   array['encoding="utf-8"', 'mode="rb"', 'newline=""', 'errors="ignore"'],
   array['encoding="utf-8"', 'mode="rb"', 'newline=""', 'errors="ignore"'],
   0,
   'open() нь системийн анхдагч кодчлолыг ашигладаг бөгөөд Windows дээр тэр нь UTF-8 байдаггүй.',
   'open() uses the system default encoding, and on Windows that is not UTF-8.',
   2),

  ('40000000-0000-4000-8000-000000000303', '30000000-0000-4000-8000-000000000406',
   '`with open(...)` хэрэглэх гол шалтгаан юу вэ?',
   'Why use `with open(...)`?',
   array['Файлыг автоматаар хаадаг', 'Илүү хурдан', 'UTF-8-ийг өөрөө тааруулдаг', 'Алдаа гаргахгүй'],
   array['It closes the file automatically', 'It is faster', 'It picks UTF-8 for you', 'It cannot fail'],
   0,
   'Блокоос гармагц — алдаа гарсан ч — файл хаагдана. Гараар close() бичих шаардлагагүй болно.',
   'The file is closed when the block exits, even if an exception was raised.',
   3)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  prompt_mn = excluded.prompt_mn, prompt_en = excluded.prompt_en,
  options_mn = excluded.options_mn, options_en = excluded.options_en,
  correct_index = excluded.correct_index,
  explanation_mn = excluded.explanation_mn, explanation_en = excluded.explanation_en,
  rank = excluded.rank;
