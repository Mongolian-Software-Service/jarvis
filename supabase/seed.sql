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
   $md$Код бичиж үзээгүй хүн хамгийн түрүүнд эндээс эхэлнэ.

Эхлээд бичлэгээ үзнэ. Дараа нь хэрэглэгдэхүүн хэсгээс дараагийн сургалтуудад өдөр бүр ашиглах хэрэгслүүдтэй танилцаж, бүртгэлээ нээнэ.

Энэ сургалт багцад багтана. Төлбөрөө төлсний дараа бүх сургалт нээгдэнэ.$md$,
   $md$For somebody who has never written code: a video first, then the tools every later course uses and the accounts to open.

This course is part of the bundle.$md$,
   'beginner', 'general', false, true, 1,
   'https://dhdrcjhrznkgdizkuolo.supabase.co/storage/v1/object/public/covers/courses/tanilcuulga-v2.jpg'),

  ('10000000-0000-4000-8000-000000000003', 'landing-page',
   'Landing page хийж сурах нь',
   'Building a landing page',
   'Нэг зорилготой хуудсыг эхнээс нь хийж, утсанд тохируулж, домэйнтэйгээ интернэтэд гаргана.',
   'Design a real page with HTML and CSS, make it work on a phone, and publish it.',
   $md$Хамгийн эхний бодит үр дүн. Төгсөхдөө та интернэтэд байрласан, утсан дээр зөв харагддаг хуудастай болно — тэр холбоосыг ажлын анкет, нийгмийн сүлжээнийхээ танилцуулгад тавьж болно.

Зөвхөн таг цээжлэхгүй: яагаад хайрцаг 340px болчихдог, яагаад утсан дээр бүх зүйл жижигхэн харагддаг зэрэг эхлэгч бүрийн тулгардаг зүйлсийг нэр заан тайлбарлана.$md$,
   $md$The first real result. You finish with a page that is live on the internet and correct on a phone — a link you can put in a job application.$md$,
   'beginner', 'web', false, true, 2,
   'https://dhdrcjhrznkgdizkuolo.supabase.co/storage/v1/object/public/covers/courses/landing-page-v2.jpg'),

  ('10000000-0000-4000-8000-000000000004', 'fullstack',
   'Бүтэн вэб апп хийж сурах нь',
   'Building a fullstack website',
   'Нэвтрэлт, өгөгдлийн сан, эрхийн хамгаалалттай бүтэн аппликейшныг захиалж угсрах.',
   'React, Next.js, Supabase and TypeScript — a real app with a database and sign-in.',
   $md$Хуудас биш, аппликейшн. Хүн бүртгүүлж, нэвтэрч, өөрийн өгөгдөлтэй болдог систем хэрхэн угсрагддагийг эхнээс нь дуустал үзнэ.

Энд ч мөн код бичихгүй. Гэхдээ хэсэг бүр нь юу хийдгийг, аль нь эвдэрсэнийг хэрхэн таних, юуг заавал нэрлэж захиалахыг сурна. Хамгийн чухал нь — өгөгдлийг хэн харж болохыг өгөгдлийн санд өөрт нь хэрхэн хатуу тогтоохыг.$md$,
   null,
   'intermediate', 'app', false, true, 3,
   'https://dhdrcjhrznkgdizkuolo.supabase.co/storage/v1/object/public/covers/courses/fullstack-v2.jpg'),

  ('10000000-0000-4000-8000-000000000005', 'mobile-app',
   'Утасны апп хийж сурах нь',
   'Building an iOS and Android app',
   'Нэг захиалгаас iPhone, Android хоёуланд ажиллах апп. Дэлгүүрийн дүрэм, туршилт, гаргах зам.',
   'One codebase, both stores — with Expo and React Native.',
   $md$Утасны апп бол вэб сайт биш. Хоёр компани зөвшөөрөл өгөх ёстой, дүрэм нь хатуу, шинэчлэл нь удаан.

Энэ сургалт тэр дүрмүүдийг эхэнд нь заана — дараа нь биш. Дэлгэцүүдээ захиалж угсрах, зөвшөөрөл, мэдэгдэл, офлайн гурвыг зөв хийх, эцэст нь хөгжүүлэгчийн бүртгэлээс дэлгүүрийн шалгалт хүртэлх замыг алхам алхмаар туулна.

**Урьдчилсан нөхцөл**: «Бүтэн вэб апп» сургалтыг үзсэн байвал зүгээр.$md$,
   null,
   'advanced', 'mobile', false, true, 4,
   'https://dhdrcjhrznkgdizkuolo.supabase.co/storage/v1/object/public/covers/courses/mobile-app-v2.jpg'),

  ('10000000-0000-4000-8000-000000000006', 'toglom',
   'Тоглоом хийж сурах нь',
   'Building 2D and 3D games',
   'Эхний хоёр хэмжээст тоглоомоос гурван хэмжээст ертөнц хүртэл. Хөгжилтэй болгох нь код биш, шийдвэр.',
   'From a first game on a canvas to a three-dimensional world with Three.js.',
   $md$Тоглоом бол хамгийн хөгжилтэй, бас хамгийн олон хүн дуусгаж чаддаггүй төрөл. Шалтгаан нь бараг үргэлж хүрээ хэт том, эсвэл хөгжилтэй эсэхийг хэтэрхий оройтож шалгасан явдал.

Энэ сургалт тэр хоёрыг эхэлж заана. Дараа нь хөдөлгөөний мэдрэмж, мөргөлдөөн, оноо, хэцүүрэх муруй — тоглоомыг тоглом болгодог зүйлс. Эцэст нь гурван хэмжээст рүү орж, камер, гэрэл, гадаргуу гуравтай танилцана.

Код бичихгүй. Хэсгүүдийг нэрлэж захиалж, тоглож үзээд шийдэх ур чадвар.$md$,
   null,
   'intermediate', 'games', false, true, 5,
   'https://dhdrcjhrznkgdizkuolo.supabase.co/storage/v1/object/public/covers/courses/toglom-v2.jpg')

on conflict (id) do update set
  slug = excluded.slug,
  title_mn = excluded.title_mn, title_en = excluded.title_en,
  summary_mn = excluded.summary_mn, summary_en = excluded.summary_en,
  description_mn = excluded.description_mn, description_en = excluded.description_en,
  level = excluded.level, topic = excluded.topic, is_free = excluded.is_free,
  is_published = excluded.is_published, rank = excluded.rank, cover_url = excluded.cover_url;

-- ── Modules ──────────────────────────────────────────────────────────────────
-- Every course is one chapter now — a video, then the page of links and
-- accounts it needs — so every chapter is called the same thing.
insert into public.modules (id, course_id, title_mn, title_en, rank) values
  ('20000000-0000-4000-8000-000000001101', '10000000-0000-4000-8000-000000000001', 'Видео хичээл', null, 1),
  ('20000000-0000-4000-8000-000000001107', '10000000-0000-4000-8000-000000000003', 'Видео хичээл', null, 1),
  ('20000000-0000-4000-8000-000000001110', '10000000-0000-4000-8000-000000000004', 'Видео хичээл', null, 1),
  ('20000000-0000-4000-8000-000000001114', '10000000-0000-4000-8000-000000000005', 'Видео хичээл', null, 1),
  ('20000000-0000-4000-8000-000000001116', '10000000-0000-4000-8000-000000000006', 'Видео хичээл', null, 1)
on conflict (id) do update set
  course_id = excluded.course_id,
  title_mn = excluded.title_mn, title_en = excluded.title_en, rank = excluded.rank;

-- Every lesson from before each course became one video and one page of links.
--
-- Named one by one, so a lesson written in the console is never swept up with
-- them. They go here, above the module sweep, because the chapters they lived
-- in are now empty and the sweep only takes empty ones — below it, the
-- chapters would outlive their lessons by one run. `lessons` cascades to
-- `lesson_progress` and `quiz_questions`, which is how the four-question quiz
-- «Шалгалт: HTML ба CSS» went with Landing page's nine.
--
-- The prose is in git history (before this commit) if any of it is wanted back.
delete from public.lessons
 where id in ('30000000-0000-4000-8000-000000000101', '30000000-0000-4000-8000-000000000601',
              '30000000-0000-4000-8000-000000000602', '30000000-0000-4000-8000-000000000102',
              '30000000-0000-4000-8000-000000000103', '30000000-0000-4000-8000-000000000104',
              '30000000-0000-4000-8000-000000000105', '30000000-0000-4000-8000-000000000106',
              '30000000-0000-4000-8000-000000000107', '30000000-0000-4000-8000-000000000108',
              '30000000-0000-4000-8000-000000000109', '30000000-0000-4000-8000-000000000110',
              '30000000-0000-4000-8000-000000000801', '30000000-0000-4000-8000-000000000802',
              '30000000-0000-4000-8000-000000000803', '30000000-0000-4000-8000-000000000804',
              '30000000-0000-4000-8000-000000000805', '30000000-0000-4000-8000-000000000806',
              '30000000-0000-4000-8000-000000000807', '30000000-0000-4000-8000-000000000301',
              '30000000-0000-4000-8000-000000000302', '30000000-0000-4000-8000-000000000303',
              '30000000-0000-4000-8000-000000000304', '30000000-0000-4000-8000-000000000305',
              '30000000-0000-4000-8000-000000000306', '30000000-0000-4000-8000-000000000307',
              '30000000-0000-4000-8000-000000000308', '30000000-0000-4000-8000-000000000309',
              '30000000-0000-4000-8000-000000000501', '30000000-0000-4000-8000-000000000502',
              '30000000-0000-4000-8000-000000000503', '30000000-0000-4000-8000-000000000603',
              '30000000-0000-4000-8000-000000000604', '30000000-0000-4000-8000-000000000605',
              '30000000-0000-4000-8000-000000000606', '30000000-0000-4000-8000-000000000607',
              '30000000-0000-4000-8000-000000000608', '30000000-0000-4000-8000-000000000701',
              '30000000-0000-4000-8000-000000000702', '30000000-0000-4000-8000-000000000703',
              '30000000-0000-4000-8000-000000000704', '30000000-0000-4000-8000-000000000705',
              '30000000-0000-4000-8000-000000000706');

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
         '20000000-0000-4000-8000-000000001101', '20000000-0000-4000-8000-000000001107',
         '20000000-0000-4000-8000-000000001110', '20000000-0000-4000-8000-000000001114',
         '20000000-0000-4000-8000-000000001116')
   and not exists (select 1 from public.lessons l where l.module_id = m.id);

-- ── Lessons ──────────────────────────────────────────────────────────────────
--
-- Every video URL is one stand-in: MDN's five-second CC0 sample clip. It plays,
-- which is what a seed needs — the player, the progress bar and the "watched"
-- mark can all be checked before a single real lecture has been filmed.
-- Replace each with a Storage or Mux URL as the real one arrives;
-- `scripts/check-seed.mjs` names every lesson still waiting on every run.
--
-- They were Google's `gtv-videos-bucket` clips until that bucket stopped
-- answering anonymous requests: every one returns 403 now, so the player
-- drew a black frame on four lessons and nothing anywhere said so.
--
-- Bodies are Markdown, parsed by `packages/core/src/markdown.ts`. Keep them to
-- the subset that parser supports: headings, paragraphs, lists, ```diagram,
-- inline code, bold, links, quotes, and `> [!IMPORTANT]` for a warning box.

insert into public.lessons
  (id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes,
   body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank)
values
  -- Slugs are unique across the whole seed, not only per course as the
  -- database requires: `pnpm video:upload` finds its lesson by slug alone, so
  -- five courses each with a `nemelt-lavlagaa` would take one film five times.
  -- Landing page keeps its two because they were live first.
  --
  -- Танилцуулга. `ehlehiin-umnu` keeps its slug: SETUP.md and
  -- `pnpm video:upload` use it as the worked example.
  ('30000000-0000-4000-8000-000000000800', '20000000-0000-4000-8000-000000001101', '10000000-0000-4000-8000-000000000001',
   'ehlehiin-umnu', 'Эхлэхийн өмнө', null, 'video',
   'https://pub-9a482c29633c419cac5f020cd2878e0a.r2.dev/lessons/ehlehiin-umnu.mp4', 3,
   null, null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000000808', '20000000-0000-4000-8000-000000001101', '10000000-0000-4000-8000-000000000001',
   'tanilcuulga-hereglegdehuun', 'Танилцуулга хичээлийн хэрэглэгдэхүүн', null, 'text', null, 5,
   $md$Энэ сургалтыг үзэхэд юу ч суулгах шаардлагагүй — бүгд хөтөч дотор явна. Доорх дөрөв бол дараагийн сургалтуудад өдөр бүр ашиглах зүйлс. Одоо нээгээд танилцчихвал Landing page сургалт дээр шууд ажилдаа орно.

> [!IMPORTANT]
> **Claude-ийг заавал худалдаж авна.** Өөрийн Visa эсвэл Mastercard картаа claude.ai дээр холбож төлбөрөө төлөх шаардлагатай — дараагийн сургалт бүр Claude дээр хийгдэнэ. Бусад гурав нь үнэгүй.

## Юу нь юунд хэрэгтэй вэ

```diagram
Claude | Асуултад чинь хариулж, захиалгаар чинь код бичнэ
Chrome | Бүтсэн хуудсыг чинь харуулна
VS Code | Кодын файлууд чинь нээгдэнэ
GitHub | Кодын хуулбар интернэтэд хадгалагдана
```

## Одоо нээх

### Claude — багш ба туслах

[claude.ai](https://claude.ai)

Ойлгохгүй үг гарвал эндээс асуу. Хариулт нь ойлгомжгүй байвал «дахиад энгийнээр» гэж нэмээд дахин асуу — хоёр дахь хариулт ихэвчлэн илүү ойлгомжтой байдаг.

> Сервер гэж юу вэ? Код бичиж үзээгүй хүнд ойлгогдохоор, өдөр тутмын жишээгээр тайлбарлаач.

### Chrome — хөтөч

[google.com/chrome](https://www.google.com/chrome/)

Firefox, Safari ч болно. Хамгийн чухал нь хөгжүүлэгчийн хэрэгсэл: `F12` (Mac дээр `Cmd+Option+I`) дарахад нээгдэнэ. Хуудас буруу харагдах, товч ажиллахгүй байх үед хамгийн түрүүнд харах газар.

## Дараагийн сургалтад хэрэгтэй

### VS Code — засварлагч

[code.visualstudio.com/download](https://code.visualstudio.com/download)

Одоо суулгаж болно, гэхдээ заавал биш. Landing page сургалтаас эхлэн хуудасны чинь файлууд энд нээгдэнэ.

### GitHub — кодын хадгалах газар

[github.com/signup](https://github.com/signup)

Бүртгэлээ эртхэн нээ. Хэрэглэгчийн нэр чинь төсөл бүрийн хаягт харагдана — `github.com/chinii-ner` — ажил олгогч ч яг тэр хаягийг нээнэ. Хоч биш, өөрийн нэрээ ашигла.

> Дараагийн алхам бол Landing page сургалт. Тэнд эдгээр дээр Node.js, Git, Vercel гурав нэмэгдэнэ.$md$,
   null, null, null, null, false, 2),

  -- Landing page
  ('30000000-0000-4000-8000-000000000111', '20000000-0000-4000-8000-000000001107', '10000000-0000-4000-8000-000000000003',
   'nemelt-lavlagaa', 'Landing page хийх хичээлийн нэмэлт лавлагаа', null, 'video',
   'https://pub-9a482c29633c419cac5f020cd2878e0a.r2.dev/lessons/nemelt-lavlagaa.mp4', 38,
   null, null, null, null, null, false, 1),

  -- The links the video leans on, in one place a student can come back to.
  -- Every href is the vendor's own download or sign-up page, not a mirror.
  ('30000000-0000-4000-8000-000000000112', '20000000-0000-4000-8000-000000001107', '10000000-0000-4000-8000-000000000003',
   'hereglegdehuun', 'Landing page хичээлийн хэрэглэгдэхүүн', null, 'text', null, 10,
   $md$Энэ сургалтад хэрэгтэй бүх хэрэгсэл энд байна. Бүгд үнэгүй, бүгд нэг удаа суугаад олон жил ажиллана. Видеогоо үзэхээсээ өмнө суулгаж дуусгавал хичээлийн дундуур зогсохгүй.

Чи код бичихгүй гэдгээ сана. Эдгээр програм бол Claude-ийн бичсэн зүйл чиний компьютер дээр буух, тэндээсээ интернэт рүү гарах зам. Нэг ч удаа «энэ мөр юу хийдэг вэ» гэж асуухгүй — зөвхөн суулгаад, ажиллаж байгааг нь шалгана.

## Юу нь юунд хэрэгтэй вэ

```diagram
Claude | Хуудсыг чиний захиалгаар бичнэ
VS Code | Файлууд чиний компьютер дээр нээгдэнэ
GitHub | Кодын хуулбар интернэтэд хадгалагдана
Vercel | GitHub-аас аваад хаягтай сайт болгоно
```

Дөрөв нь гинжин холбоо: Claude бичнэ, VS Code хадгална, GitHub интернэтэд хуулна, Vercel хаягтай сайт болгоно. Аль нэг нь дутвал дараагийнх нь эхлэх юмгүй болно — тиймээс дөрвийг нь урьдчилж бэлдэнэ.

## Ямар дарааллаар суулгах вэ

```diagram
Нэгдүгээрт | VS Code — бусад бүхэн үүний дотор ажиллана
Хоёрдугаарт | Node.js ба Git — терминалын хоёр хэрэгсэл
Гуравдугаарт | GitHub, Vercel, Claude — суулгах юмгүй, зөвхөн бүртгэл
```

Дараалал чухал. Node.js, Git хоёрыг суулгасны дараа терминал тэднийг мэддэг болдог, харин **суулгахаас өмнө нээсэн терминал мэдэхгүй**. VS Code-оо эхэлж суулгаад дотор нь терминал нээвэл энэ асуудал өөрөө арилна.

---

## Компьютер дээрээ суулгах

### VS Code — файлууд нээгдэх газар

[code.visualstudio.com/download](https://code.visualstudio.com/download)

Хуудасны файлууд энд нээгдэнэ. Word шиг зүйл, зөвхөн ганц бичвэрийн оронд бүхэл хавтас барьдаг.

- **Mac дээр** татсан програмаа **Applications** хавтас руу чирж хийгээрэй. Downloads дотроос нь ажиллуулбал шинэчлэлт нь суухгүй, хэдэн сарын дараа хуучирсан хувилбар дээр сууж байгаагаа ч мэдэхгүй.
- **Windows дээр** суулгах явцад **Add to PATH** гэсэн сонголтыг заавал тэмдэглэ. Энэ нь терминалаас VS Code нээх боломж өгнө, хичээлийн дунд хэрэг болно.

Нээгээд эхний удаад хийх зүйл ганц: дээд цэсний **File → Open Folder** дээрээс хоосон хавтас сонгож үз. Файл биш, **хавтас** нээдэг гэдгийг мэдэж авбал хангалттай — хичээл дээр яг ингэж ажиллана.

VS Code дотроос терминал нээхийн тулд дээд цэсний **Terminal → New Terminal** дээр дар. Ингэвэл тусад нь Terminal програм хайх шаардлагагүй, хавтас чинь ч аль хэдийн зөв байрлана.

### Node.js — хуудсаа өөр дээрээ ажиллуулах

[nodejs.org/en/download](https://nodejs.org/en/download)

**LTS** гэсэн хувилбарыг ав. LTS нь «Long Term Support» — олон жил дэмжигдэх, тогтвортой хувилбар. «Current» нь шинэ ч зарим сан түүн дээр хараахан ажилладаггүй, тэр алдаа чинийх биш байсан ч цагийг чинь идэх болно.

Суулгасны дараа терминал нээгээд дараах хоёрыг ээлжлэн бичиж Enter дар:

- `node -v` — `v`-ээр эхэлсэн дугаар гарах ёстой
- `npm -v` — цэгээр тусгаарлагдсан дугаар гарах ёстой. npm нь Node-той хамт суудаг, тусад нь татах шаардлагагүй

«command not found» эсвэл «is not recognized» гарвал терминалаа бүрэн хааж дахин нээ. Суулгахаас өмнө нээгдсэн терминал шинэ програмыг хараахан мэдэхгүй байдаг — энэ бол эвдрэл биш, ердийн зан.

### Git — кодоо GitHub руу илгээх

[git-scm.com/downloads](https://git-scm.com/downloads)

Терминалд `git --version` гэж бич.

- **Mac дээр** суугаагүй бол Mac өөрөө суулгахыг санал болгоно — зөвшөөр, хэдэн минут болно.
- **Windows дээр** дээрх холбоосоос татаад, асуух бүх цонхонд анхдагч сонголтыг нь үлдээж Next дар. Сонголт олон боловч анхдагч нь бүгд зөв.

Суусны дараа **заавал хийх нэг зүйл** байна. Git чамайг хэн болохыг мэдэхгүй бол эхний хуулбарыг илгээхээс татгалздаг, тиймээс нэрээ болон GitHub-д бүртгүүлэх имэйлээ урьдчилж хэлж өг:

- `git config --global user.name "Өөрийн нэр"`
- `git config --global user.email "имэйл@жишээ.com"`

Энэ хоёрыг одоо хийчихвэл хичээлийн дунд «Author identity unknown» гэсэн алдаа гарахгүй. Яг тэр алдаан дээр хүмүүс хамгийн их зогсдог.

---

## Бүртгэл нээх

### GitHub — кодын хадгалах газар

[github.com/signup](https://github.com/signup)

Хэрэглэгчийн нэрээ бодож сонго. Тэр нэр чиний төсөл бүрийн хаягт харагдана — `github.com/chinii-ner` — ажил олгогч ч яг тэр хаягийг нээнэ. Хоч биш, өөрийн нэрээ ашигла. Дараа нь солих боломжтой ч хуучин холбоосууд чинь эвдэрнэ.

Бүртгүүлсний дараа хоёр зүйл үлдэнэ:

- **Имэйлээ баталгаажуул.** GitHub захидал илгээнэ, доторх холбоос дээр дар. Баталгаажаагүй бүртгэл код илгээж чадахгүй.
- **Хоёр шатлалт нэвтрэлтийг асаа.** GitHub үүнийг шаарддаг болсон. Утсан дээрээ баталгаажуулах програм суулгах эсвэл мессежээр авахыг сонгоно. Сэргээх кодуудыг нь хадгалж ав — утсаа солиход тэр л чамайг оруулна.

### Vercel — сайтыг интернэтэд гаргах

[vercel.com/signup](https://vercel.com/signup)

**Hobby** төлөвлөгөөг сонго, энэ нь үнэгүй бөгөөд хичээлд хангалттай.

Имэйлээр биш **Continue with GitHub** товчоор бүртгүүл. Тэгвэл Vercel GitHub дээрх төслүүдийг чинь шууд харна; имэйлээр нээсэн бүртгэлд хоёрыг дараа нь тусад нь холбох алхам нэмэгдэнэ, тэр алхам дээр хүмүүс төөрдөг.

### Claude — захиалга өгөх

[claude.ai](https://claude.ai)

Хуудсаа Claude-аар бичүүлнэ. Үнэгүй бүртгэлээр хичээлийг эхнээс нь дуустал хийж болно; өдрийн хязгаартаа хүрвэл хэдэн цаг хүлээх эсвэл төлбөрт хувилбар руу шилжинэ.

Бүртгэлээ одоо нээчихвэл видеон дээр бичиж байгаа захиалгыг зэрэг давтаж, өөрийн хуудсаа хамт өсгөж болно.

---

## Бэлэн эсэхээ шалгах

Терминал нээгээд дараах гурвыг бичиж, гурвуулаа дугаар буцааж байвал бэлэн:

1. `node -v`
2. `npm -v`
3. `git --version`

> Гурвуулаа дугаар буцаавал видео үзэхэд бэлэн боллоо. Аль нэг нь алдаа буцаавал доорх гурван шалтгааны нэг нь мөн байх магадлалтай.

## Болохгүй байвал

- **«command not found» эсвэл «is not recognized»** — терминалаа бүрэн хааж дахин нээ. Үүгээр арилахгүй бол компьютероо унтрааж асаа. Windows дээр Node суулгахдаа **Add to PATH** тэмдэглэгээг алгассан бол дахин суулгах хэрэгтэй.
- **Дугаар гарч байгаа ч хэтэрхий хуучин** — өмнө нь өөр хувилбар суусан байна. Шинэ LTS хувилбарыг дахин суулгаад терминалаа дахин нээ.
- **«Author identity unknown»** — Git хэсгийн `git config` хоёр мөрийг хийгээгүй байна. Одоо хийгээд дахин оролд.

Аль нь ч тохирохгүй бол алдааны бичвэрийг бүтнээр нь хуулж аваад Claude-д үзүүл. Тэр юу болсныг тайлбарлаж, дараагийн алхмыг хэлнэ — энэ сургалтын гол чадвар ч яг тэр.
$md$,
   null, null, null, null, false, 2),

  -- Бүтэн вэб апп
  ('30000000-0000-4000-8000-000000000310', '20000000-0000-4000-8000-000000001110', '10000000-0000-4000-8000-000000000004',
   'fullstack-lavlagaa', 'Бүтэн вэб апп хийх хичээлийн нэмэлт лавлагаа', null, 'video',
   'https://pub-9a482c29633c419cac5f020cd2878e0a.r2.dev/lessons/fullstack-lavlagaa.mp4', 88,
   null, null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000000311', '20000000-0000-4000-8000-000000001110', '10000000-0000-4000-8000-000000000004',
   'fullstack-hereglegdehuun', 'Бүтэн вэб апп хичээлийн хэрэглэгдэхүүн', null, 'text', null, 5,
   $md$Энэ сургалтад хэрэгтэй бүх хэрэгсэл энд байна. Landing page сургалтад суулгасан зүйлс дахин хэрэгтэй — суулгачихсан бол шууд «Бүртгэл нээх» хэсэг рүү ор.

## Юу нь юунд хэрэгтэй вэ

```diagram
Claude | Аппыг чиний захиалгаар бичнэ
GitHub | Кодын хуулбар интернэтэд хадгалагдана
Supabase | Өгөгдөл, нэвтрэлт, эрх хадгалагдана
Vercel | Аппыг хаягтай болгож интернэтэд гаргана
```

## Компьютер дээрээ суулгах

- **VS Code** — [code.visualstudio.com/download](https://code.visualstudio.com/download)
- **Node.js** — [nodejs.org/en/download](https://nodejs.org/en/download). **LTS** хувилбарыг ав
- **Git** — [git-scm.com/downloads](https://git-scm.com/downloads)

Суулгасны дараа терминалд `node -v`, `git --version` хоёрыг бич. Хоёулаа дугаар буцаавал болсон. «command not found» гарвал терминалаа хаагаад дахин нээ.

## Бүртгэл нээх

### GitHub — кодын хадгалах газар

[github.com/signup](https://github.com/signup)

Дараагийн хоёрыг GitHub-аараа нээнэ, тиймээс хамгийн түрүүнд энэ.

### Supabase — өгөгдлийн сан ба нэвтрэлт

[supabase.com/dashboard/sign-up](https://supabase.com/dashboard/sign-up)

**Continue with GitHub** товчоор бүртгүүл, **Free** төлөвлөгөө хангалттай. Шинэ төсөл үүсгэхэд хоёр зүйлд анхаар:

- **Бүс (region)** — Монголд ойрыг сонго: Seoul, Tokyo эсвэл Singapore. Дараа нь солих боломжгүй
- **Өгөгдлийн сангийн нууц үг** — нууц үгийн менежер эсвэл аюулгүй газар хадгалж ав

Supabase хоёр түлхүүр өгнө. **Publishable** түлхүүр хөтөчид ил байж болно. **Secret** түлхүүр болохгүй — түүнийг GitHub руу ч, чат руу ч хэзээ ч бүү хуулж тавь. Хэн нэгэнд харагдсан бол Supabase-ийн самбараас шууд солино.

Долоо хоног ашиглаагүй үнэгүй төсөл түр зогсдог. Апп чинь гэнэт «холбогдож чадсангүй» гэвэл эхлээд Supabase-ийн самбарт орж төслөө сэргээ.

### Vercel — аппыг интернэтэд гаргах

[vercel.com/signup](https://vercel.com/signup)

**Hobby** төлөвлөгөө үнэгүй. **Continue with GitHub** товчоор бүртгүүлбэл GitHub дээрх төслүүдийг чинь шууд харна.

### Claude — захиалга өгөх

[claude.ai](https://claude.ai)

Аппын хэсэг бүрийг Claude-аар бичүүлнэ. Алдаа гарвал мессежийг нь бүтнээр нь хуулж өг — «ажиллахгүй байна» гэсэн ганц өгүүлбэрээс хамаагүй хурдан засагдана.

> Бүгдийг нээж дуусаад GitHub, Supabase, Vercel гурвын самбарт нэг нэг орж үз. Гурвуулаа нээгдэж байвал видео үзэхэд бэлэн.$md$,
   null, null, null, null, false, 2),

  -- Утасны апп
  ('30000000-0000-4000-8000-000000000609', '20000000-0000-4000-8000-000000001114', '10000000-0000-4000-8000-000000000005',
   'mobile-app-lavlagaa', 'Утасны апп хийх хичээлийн нэмэлт лавлагаа', null, 'video',
   'https://pub-9a482c29633c419cac5f020cd2878e0a.r2.dev/lessons/mobile-app-lavlagaa.mp4', 35,
   null, null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000000610', '20000000-0000-4000-8000-000000001114', '10000000-0000-4000-8000-000000000005',
   'mobile-app-hereglegdehuun', 'Утасны апп хичээлийн хэрэглэгдэхүүн', null, 'text', null, 5,
   $md$Утасны апп хийхэд хоёр төрлийн зүйл хэрэгтэй: компьютер, утсан дээрх хэрэгслүүд, бас дэлгүүрүүдийн бүртгэл. Эхнийх нь үнэгүй. Хоёр дахь нь **төлбөртэй** бөгөөд апп чинь ажиллаж эхэлтэл хүлээж болно — гэхдээ шалгалт нь хэр удаан болохыг одооноос мэдэж ав.

## Юу нь юунд хэрэгтэй вэ

```diagram
Claude | Аппыг чиний захиалгаар бичнэ
Expo Go | Утсан дээрээ шууд туршина
Expo | Дэлгүүрт оруулах файлыг бэлдэнэ
App Store, Google Play | Хүмүүс татаж суулгана
```

## Компьютер дээрээ суулгах

- **VS Code** — [code.visualstudio.com/download](https://code.visualstudio.com/download)
- **Node.js** — [nodejs.org/en/download](https://nodejs.org/en/download). **LTS** хувилбарыг ав
- **Git** — [git-scm.com/downloads](https://git-scm.com/downloads)

Суулгасны дараа терминалд `node -v`, `git --version` хоёрыг бич. Хоёулаа дугаар буцаавал болсон.

## Утсан дээрээ суулгах

### Expo Go — апп-аа утсан дээрээ турших

- iPhone: [App Store](https://apps.apple.com/app/expo-go/id982107779)
- Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

Компьютер дээрээ төслөө ажиллуулаад, утсаараа QR код уншуулна. **Компьютер, утас хоёр нэг Wi-Fi сүлжээнд байх ёстой.** Нэг нь утасны интернэт, нөгөө нь гэрийн Wi-Fi дээр байвал QR код уншигдсан ч апп ачаалахгүй удаан эргэлдсээр алдаа өгнө.

## Бүртгэл нээх

### Expo — апп-аа бүтээж, дэлгүүрт илгээх

[expo.dev/signup](https://expo.dev/signup)

Үнэгүй төлөвлөгөө эхлэхэд хангалттай. Дэлгүүрт оруулах файлыг Expo өөрийн серверт бүтээж өгдөг тул Mac-гүй байсан ч iPhone-ы апп гаргаж болно.

### GitHub — кодын хадгалах газар

[github.com/signup](https://github.com/signup)

### Claude — захиалга өгөх

[claude.ai](https://claude.ai)

## Дэлгүүрийн бүртгэл — төлбөртэй

### Apple Developer Program

[developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/)

Жилд 99 ам.доллар. Хувь хүнээр бүртгүүлбэл ихэвчлэн нэг хоёр хоногт баталгаажна; байгууллагаар бол баримт шалгуулж, хэдэн долоо хоног болж магадгүй. Дэлгүүрт гаргах өдрөө биш, дор хаяж долоо хоногийн өмнө нээ.

### Google Play Console

[play.google.com/console/signup](https://play.google.com/console/signup)

Нэг удаа 25 ам.доллар. Шинэ хувь хүний бүртгэлд Google эхлээд хаалттай туршилт хийлгэдэг: хэсэг хүн дор хаяж хоёр долоо хоног туршсаны дараа л бүх хүнд нээх эрхтэй болно. Энэ хугацааг төлөвлөгөөндөө оруул.

> Эхний видеонуудад Expo Go л хангалттай. Дэлгүүрийн бүртгэл апп чинь утсан дээр ажиллаж эхэлсний дараа хэрэгтэй болно.$md$,
   null, null, null, null, false, 2),

  -- Тоглоом
  ('30000000-0000-4000-8000-000000000707', '20000000-0000-4000-8000-000000001116', '10000000-0000-4000-8000-000000000006',
   'toglom-lavlagaa', 'Тоглоом хийх хичээлийн нэмэлт лавлагаа', null, 'video',
   'https://pub-9a482c29633c419cac5f020cd2878e0a.r2.dev/lessons/toglom-lavlagaa.mp4', 15,
   null, null, null, null, null, false, 1),

  ('30000000-0000-4000-8000-000000000708', '20000000-0000-4000-8000-000000001116', '10000000-0000-4000-8000-000000000006',
   'toglom-hereglegdehuun', 'Тоглоом хичээлийн хэрэглэгдэхүүн', null, 'text', null, 5,
   $md$Тоглоом хөтөч дээр ажиллана, тиймээс хэрэгсэл нь вэб сайтынхтай бараг ижил. Нэмэгдэх нь гурав: зураг дууны сан, гурван хэмжээстийн жишээнүүд, тоглоомоо нийтлэх газар. Бүгд үнэгүй.

## Юу нь юунд хэрэгтэй вэ

```diagram
Claude | Тоглоомыг чиний захиалгаар бичнэ
Хөтөч | Тоглоод шалгана
Kenney | Зураг, дуу, загвар өгнө
itch.io | Тоглоомоо бусдад тоглуулна
```

## Компьютер дээрээ суулгах

- **VS Code** — [code.visualstudio.com/download](https://code.visualstudio.com/download)
- **Node.js** — [nodejs.org/en/download](https://nodejs.org/en/download). **LTS** хувилбарыг ав
- **Git** — [git-scm.com/downloads](https://git-scm.com/downloads)

Суулгасны дараа терминалд `node -v`, `git --version` хоёрыг бич. Хоёулаа дугаар буцаавал болсон.

## Тоглоомын хэрэглэгдэхүүн

### Kenney — зураг, дуу, 3D загвар

[kenney.nl/assets](https://kenney.nl/assets)

Мянга мянган дүрс, дуу, гурван хэмжээст загвар — бүгд **CC0** лицензтэй. Өөрөөр хэлбэл нэр дурдахгүйгээр, зардаг тоглоомдоо ч ашиглаж болно. Интернэтээс олсон дурын зургийг тавих нь хамгийн түгээмэл алдаа: өөр хүний бүтээл бөгөөд тоглоомоо нийтлэхэд асуудал болно.

### Three.js — гурван хэмжээстийн жишээнүүд

[threejs.org/examples](https://threejs.org/examples/)

Гурван хэмжээст хэсэгт хэрэгтэй. Хүссэн эффектээ эндээс олоод нэрийг нь захиалгадаа хэл — «гэрлийг гоё болгооч» гэхээс «энэ жишээ шиг сүүдэртэй болгооч» гэх нь хамаагүй тодорхой.

## Бүртгэл нээх

### itch.io — тоглоомоо нийтлэх

[itch.io/register](https://itch.io/register)

Хөтөч дээр тоглодог тоглоом байршуулах хамгийн энгийн газар — холбоосоо хуваалцахад л болно. Файлаа ZIP болгож оруулахдаа `index.html` нь ZIP-ийн яг эхэнд байх ёстой. Хавтас дотор хавтас байвал itch.io тоглоомоо олохгүй.

### GitHub — кодын хадгалах газар

[github.com/signup](https://github.com/signup)

### Claude — захиалга өгөх

[claude.ai](https://claude.ai)

> Бүгдийг суулгаж дуусаад терминалд `node -v`, `git --version` хоёрыг бичиж шалга. Хоёулаа дугаар буцаавал видео үзэхэд бэлэн.$md$,
   null, null, null, null, false, 2)

on conflict (id) do update set
  module_id = excluded.module_id, course_id = excluded.course_id, slug = excluded.slug,
  title_mn = excluded.title_mn, title_en = excluded.title_en, kind = excluded.kind,
  video_url = excluded.video_url, duration_minutes = excluded.duration_minutes,
  body_mn = excluded.body_mn, body_en = excluded.body_en,
  code_language = excluded.code_language, starter_code = excluded.starter_code,
  solution_code = excluded.solution_code, is_preview = excluded.is_preview, rank = excluded.rank;
