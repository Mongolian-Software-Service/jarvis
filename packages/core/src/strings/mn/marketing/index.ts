/** Нүүр хуудас — хараахан бүртгүүлээгүй хүн уншдаг цорын ганц хуудас. */
import { front } from "./front";
import { about } from "./about";
import { contact } from "./contact";
import { cta } from "./cta";

export const marketing = {
  ...front,
  ...about,
  ...contact,
  ...cta,
} as const;
