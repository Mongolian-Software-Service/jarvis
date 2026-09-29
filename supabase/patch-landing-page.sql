-- Landing page: есөн хичээлийн оронд нэг видео хичээл
--
-- ЯАГААД ТУСДАА ФАЙЛ ВЭ: `supabase/seed.sql` бүхэлдээ ажиллахдаа
-- `on conflict (id) do update` хийдэг тул админ консолоос гараар хийсэн засвар
-- дарагдана (`patch-curriculum.sql`-тэй ижил шалтгаан). Энэ файл нь зөвхөн
-- доорхийг хийнэ; seed.sql-д ижил өөрчлөлт аль хэдийн орсон.
--
-- ⚠️ 3-Р ХЭСЭГ ЭРГЭЖ БУЦААХГҮЙ. Хичээл устгахад түүний `lesson_progress`,
-- `quiz_questions` каскадаар дагаж устана — «Шалгалт: HTML ба CSS»-ийн дөрвөн
-- асуулт ч мөн. Хэдэн мөр явц устахыг ажиллуулахын өмнө:
--
--   select count(*) from public.lesson_progress p
--     join public.lessons l on l.id = p.lesson_id
--    where l.course_id = '10000000-0000-4000-8000-000000000003';

begin;

-- ── 1 · Нэр. Товч тайлбарт ганц үг солигдоно ────────────────────────────────
--
-- `replace` нь товч тайлбарыг консолоос өөрөөр бичсэн бол түүнд хүрэхгүй.
update public.courses
   set title_mn   = 'Landing page хийж сурах нь',
       summary_mn = replace(summary_mn, 'эхнээс нь захиалж', 'эхнээс нь хийж')
 where id = '10000000-0000-4000-8000-000000000003';

-- ── 2 · Үлдэх ганц модуль ───────────────────────────────────────────────────
update public.modules
   set title_mn = 'Видео хичээл', title_en = null
 where id = '20000000-0000-4000-8000-000000001107';

-- ── 3 · Есөн хичээл ⚠️ ЭРГЭЖ БУЦААХГҮЙ ───────────────────────────────────────
delete from public.lessons
 where id in ('30000000-0000-4000-8000-000000000102', '30000000-0000-4000-8000-000000000103',
              '30000000-0000-4000-8000-000000000104', '30000000-0000-4000-8000-000000000105',
              '30000000-0000-4000-8000-000000000106', '30000000-0000-4000-8000-000000000107',
              '30000000-0000-4000-8000-000000000108', '30000000-0000-4000-8000-000000000109',
              '30000000-0000-4000-8000-000000000110');

-- Хоосорсон хоёр модуль. `modules` нь `lessons` руу каскадаар дамждаг тул
-- консолоос нэмсэн хичээл тэнд байвал модуль ч, тэр хичээл ч үлдэнэ.
delete from public.modules m
 where m.id in ('20000000-0000-4000-8000-000000001108', '20000000-0000-4000-8000-000000001109')
   and not exists (select 1 from public.lessons l where l.module_id = m.id);

-- ── 4 · Шинэ видео хичээл ───────────────────────────────────────────────────
--
-- Бичлэг нь түр орлуулга — MDN-ийн таван секундийн CC0 клип. Жинхэнэ бичлэг
-- бэлэн болмогц `video_url`, `duration_minutes` хоёрыг seed.sql-д ч, энд ч
-- солино. 0 минут бол «хараахан мэдэхгүй» — хуудас үүнийг харуулахгүй.
insert into public.lessons
  (id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes,
   body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank)
values
  ('30000000-0000-4000-8000-000000000111', '20000000-0000-4000-8000-000000001107', '10000000-0000-4000-8000-000000000003',
   'nemelt-lavlagaa', 'Landing page хийх хичээлийн нэмэлт лавлагаа', null, 'video',
   'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', 0,
   null, null, null, null, null, false, 1)
on conflict (id) do nothing;

-- ── 5 · Google-ийн түр бичлэгүүд 403 буцаадаг болсон ────────────────────────
--
-- `gtv-videos-bucket` нэвтрээгүй хүсэлтэд хаалттай болсон тул тоглуулагч хар
-- дэлгэц харуулж байв. Хаяг нь тэр bucket хэвээр байгаа мөрийг л солино —
-- консолоос жинхэнэ бичлэг тавьсан хичээлд хүрэхгүй.
update public.lessons
   set video_url = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
 where video_url like 'https://commondatastorage.googleapis.com/gtv-videos-bucket/%';

commit;

-- Шалгах:
--   select m.rank, m.title_mn, l.rank, l.kind, l.title_mn
--     from public.modules m
--     left join public.lessons l on l.module_id = m.id
--    where m.course_id = '10000000-0000-4000-8000-000000000003'
--    order by m.rank, l.rank;
