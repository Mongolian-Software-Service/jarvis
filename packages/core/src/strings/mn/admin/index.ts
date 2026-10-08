/**
 * Удирдлагын хэсэг.
 *
 * Энэ хэсгийг зөвхөн манай багийнхан хардаг тул монгол хэл дээр бичигдсэн —
 * серверийн үйлдлүүдийн алдааны текст, zod-ын мессежүүд ч мөн адил.
 */
import { content } from "./content";
import { people } from "./people";
import { errors } from "./errors";
import { pricing } from "./pricing";
import { chat } from "./chat";

export const admin = {
  ...content,
  ...people,
  ...pricing,
  ...chat,
  errors,
} as const;
