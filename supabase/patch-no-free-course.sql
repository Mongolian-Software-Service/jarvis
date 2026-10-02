-- Үнэгүй сургалт байхгүй болсон нь: багц бол орох цорын ганц хаалга.
--
-- Дөрвөн өөрчлөлт, нэг биш. Тугийг унтраахад л хангалттай биш:
--   • courses.is_free      — нэвтэрсэн хэн ч өөрийгөө бүртгэх боломжийг хаана
--   • lessons.is_preview   — нэвтрээгүй танихгүй хүн уншиж байсан ганц хичээл
--   • description_mn / _en — сургалт өөрөө «энэ үнэгүй» гэж бичсэн байсан
--
-- Бүтэн seed биш: амьд төсөл дээр seed-ийг дахин ажиллуулах нь сурагчдын
-- уншиж буй бүх хичээлийг файл дахь хувилбараар дарж бичнэ.

update public.courses
   set is_free = false,
       description_mn = replace(description_mn,
         'Энэ сургалт үнэгүй. Бүртгүүлээд шууд үзэж болно.',
         'Энэ сургалт багцад багтана. Төлбөрөө төлсний дараа бүх сургалт нээгдэнэ.'),
       description_en = replace(description_en,
         'This course is free.',
         'This course is part of the bundle.')
 where slug = 'tanilcuulga';

update public.lessons set is_preview = false where is_preview;
