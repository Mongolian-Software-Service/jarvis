-- Сургалтын нүүр зургийг бараан, кино маягийн фотооос гэгээлэг, өнгөлөг
-- цуврал руу шилжүүлсэн нь (2026-10-02).
--
-- Таван зураг нэг хэв маягтай: зөөлөн 3D, тус бүр өөрийн өнгөт дэвсгэр —
-- тэр өнгө нь сургалтын картын topic chip-тэй ойролцоо. Higgsfield
-- (GPT Image 2.5)-ээр үүсгэсэн. Текст, лого, код аль нь ч зураг дээр байхгүй:
-- нүүр зураг бол энэ сургууль юу заадаг тухай мэдэгдэл (CLAUDE.md §1), бас
-- курсын замын тойрог дээр алхмын дугаар давхарлагддаг.
--
-- Шинэ файл шинэ нэртэй (`-v2.jpg`), хуучныг дарж бичээгүй: ижил URL дээр
-- солибол next/image болон хөтчийн кэш хуучин зургийг үргэлжлүүлэн үзүүлнэ.
-- Хуучин таван файл bucket-д хэвээр байгаа тул буцаах нь доорх URL-уудаас
-- `-v2`-ийг хасахад л болно.
--
-- Бүтэн seed биш, таван мөр: амьд төсөл дээр seed-ийг дахин ажиллуулах нь
-- консолоос засварласан бүхнийг файл дахь хувилбараар дарж бичнэ.
begin;
update public.courses set cover_url = 'https://dhdrcjhrznkgdizkuolo.supabase.co/storage/v1/object/public/covers/courses/tanilcuulga-v2.jpg' where slug = 'tanilcuulga';
update public.courses set cover_url = 'https://dhdrcjhrznkgdizkuolo.supabase.co/storage/v1/object/public/covers/courses/landing-page-v2.jpg' where slug = 'landing-page';
update public.courses set cover_url = 'https://dhdrcjhrznkgdizkuolo.supabase.co/storage/v1/object/public/covers/courses/fullstack-v2.jpg' where slug = 'fullstack';
update public.courses set cover_url = 'https://dhdrcjhrznkgdizkuolo.supabase.co/storage/v1/object/public/covers/courses/mobile-app-v2.jpg' where slug = 'mobile-app';
update public.courses set cover_url = 'https://dhdrcjhrznkgdizkuolo.supabase.co/storage/v1/object/public/covers/courses/toglom-v2.jpg' where slug = 'toglom';
commit;
