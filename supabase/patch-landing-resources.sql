-- Landing page: видеоны доор «Landing page хичээлийн хэрэглэгдэхүүн» текст хичээл
--
-- ЯАГААД ТУСДАА ФАЙЛ ВЭ: `supabase/seed.sql` бүхэлдээ ажиллахдаа
-- `on conflict (id) do update` хийдэг тул админ консолоос гараар хийсэн засвар
-- дарагдана (`patch-landing-page.sql`-тэй ижил шалтгаан). Энэ файл нь зөвхөн
-- нэг мөр нэмнэ; seed.sql-д ижил мөр аль хэдийн орсон.
--
-- Юу ч устгахгүй, юу ч дарахгүй: мөр аль хэдийн байвал (консолоос засагдсан
-- ч бай) `do nothing` хэвээр нь үлдээнэ. Дахин ажиллуулахад аюулгүй.

begin;

insert into public.lessons
  (id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes,
   body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank)
values
  ('30000000-0000-4000-8000-000000000112', '20000000-0000-4000-8000-000000001107', '10000000-0000-4000-8000-000000000003',
   'hereglegdehuun', 'Landing page хичээлийн хэрэглэгдэхүүн', null, 'text', null, 5,
   $md$Энэ сургалтад хэрэгтэй бүх хэрэгсэл энд байна. Бүгд үнэгүй. Видеогоо үзэхээсээ өмнө суулгаж дуусгавал хичээлийн дундуур зогсохгүй.

## Юу нь юунд хэрэгтэй вэ

```diagram
Claude | Хуудсыг чиний захиалгаар бичнэ
VS Code | Файлууд чиний компьютер дээр нээгдэнэ
GitHub | Кодын хуулбар интернэтэд хадгалагдана
Vercel | GitHub-аас аваад хаягтай сайт болгоно
```

## Компьютер дээрээ суулгах

### VS Code — засварлагч

[code.visualstudio.com/download](https://code.visualstudio.com/download)

Хуудасны файлууд энд нээгдэнэ. Mac дээр татсан програмаа **Applications** хавтас руу чирж хийгээрэй — Downloads дотроос нь ажиллуулбал шинэчлэлт нь суухгүй.

### Node.js — хуудсаа өөр дээрээ ажиллуулах

[nodejs.org/en/download](https://nodejs.org/en/download)

**LTS** гэсэн хувилбарыг ав. Энэ нь олон жил дэмжигдэх, тогтвортой хувилбар. «Current» нь шинэ ч зарим сан түүн дээр хараахан ажилладаггүй.

Суулгасны дараа терминалд (Mac дээр **Terminal**, Windows дээр **PowerShell**) `node -v` гэж бичээд Enter дар. `v`-ээр эхэлсэн дугаар гарвал болсон. «command not found» гарвал терминалаа хаагаад дахин нээ — суулгахаас өмнө нээсэн терминал Node-г хараахан мэдэхгүй.

### Git — кодоо GitHub руу илгээх

[git-scm.com/downloads](https://git-scm.com/downloads)

Mac дээр терминалд `git --version` гэж бич. Суугаагүй бол Mac өөрөө суулгахыг санал болгоно — зөвшөөр. Windows дээр дээрх холбоосоос татаад, асуух бүх цонхонд анхдагч сонголтыг нь үлдээж Next дар.

## Бүртгэл нээх

### GitHub — кодын хадгалах газар

[github.com/signup](https://github.com/signup)

Хэрэглэгчийн нэрээ бодож сонго. Тэр нэр чиний төсөл бүрийн хаягт харагдана — `github.com/chinii-ner` — ажил олгогч ч яг тэр хаягийг нээнэ. Хоч биш, өөрийн нэрээ ашигла.

### Vercel — сайтыг интернэтэд гаргах

[vercel.com/signup](https://vercel.com/signup)

**Hobby** төлөвлөгөөг сонго, энэ нь үнэгүй. Имэйлээр биш **Continue with GitHub** товчоор бүртгүүл. Тэгвэл Vercel GitHub дээрх төслүүдийг чинь шууд харна; имэйлээр нээсэн бүртгэлд хоёрыг дараа нь тусад нь холбох алхам нэмэгдэнэ.

### Claude — захиалга өгөх

[claude.ai](https://claude.ai)

Хуудсаа Claude-аар бичүүлнэ. Бүртгэлээ одоо нээчихвэл видеон дээр бичиж байгаа захиалгыг зэрэг давтаж болно.

> Бүгдийг суулгаж дуусаад терминалд `node -v`, `git --version` хоёрыг бичиж шалга. Хоёулаа дугаар буцаавал видео үзэхэд бэлэн.$md$,
   null, null, null, null, false, 2)
on conflict (id) do nothing;

commit;

-- Шалгах:
--   select l.rank, l.kind, l.title_mn, length(l.body_mn)
--     from public.lessons l
--    where l.course_id = '10000000-0000-4000-8000-000000000003'
--    order by l.rank;
