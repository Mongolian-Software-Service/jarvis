import { core } from "./core";
import { marketing } from "./marketing";
import { auth } from "./auth";
import { learn } from "./learn";
import { admin } from "./admin";

export const en = {
  locale: "en",
  ...core,
  marketing,
  auth,
  learn,
  admin,
} as const;
