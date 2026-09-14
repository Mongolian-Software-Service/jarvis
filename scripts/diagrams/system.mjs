/**
 * The system map — laptop, GitHub, Vercel, Supabase, the reader — drawn once
 * and revealed in five steps.
 *
 * One layout, five frames: the coordinates live in `BOX` exactly once, so a
 * box cannot drift between steps. The picture is for explaining, and a
 * finished map put on screen all at once is a wall.
 */

import { W, H } from "./canvas.mjs";
import {
  aDeploy,
  aDev,
  aLocal,
  aProd,
  aPush,
  aVisit,
  beads,
  devLabel,
  frame,
  github,
  localhost,
  supabase,
  terminal,
  title,
  users,
  vercel,
  vscode,
} from "./parts.mjs";

// ── The five frames ──────────────────────────────────────────────────────────

export const FRAMES = [
  {
    file: "01-chinii-computer.svg",
    parts: [
      title("Эхлээд — чиний компьютер", "Код энд төрнө, энд туршигдана"),
      frame,
      vscode,
      terminal,
      localhost,
      aDev,
      devLabel,
    ],
  },
  {
    file: "02-github.svg",
    parts: [
      title("Дараа нь — GitHub", "Ажлын түүх компьютерээс гадна үлдэнэ"),
      frame,
      vscode,
      terminal,
      localhost,
      aDev,
      devLabel,
      github,
      aPush,
    ],
  },
  {
    file: "03-vercel.svg",
    parts: [
      title("Дараа нь — Vercel", "Кодыг түлхэх бүрт сайт өөрөө шинэчлэгдэнэ"),
      frame,
      vscode,
      terminal,
      localhost,
      aDev,
      devLabel,
      github,
      aPush,
      vercel,
      aDeploy,
      users,
      aVisit,
    ],
  },
  {
    file: "04-supabase.svg",
    parts: [
      title("Дараа нь — Supabase", "Өгөгдөл, нэвтрэлт, файл — хоёр талаас нь хандана"),
      frame,
      vscode,
      terminal,
      localhost,
      aDev,
      devLabel,
      github,
      aPush,
      vercel,
      aDeploy,
      users,
      aVisit,
      supabase,
      aProd,
      aLocal,
    ],
  },
  {
    file: "05-buten-zurag.svg",
    parts: [
      title("Бүгд хэрхэн холбогддог вэ", "Нэг өөрчлөлт чиний компьютерээс хэрэглэгч хүртэл"),
      frame,
      vscode,
      terminal,
      localhost,
      aDev,
      devLabel,
      github,
      aPush,
      vercel,
      aDeploy,
      users,
      aVisit,
      supabase,
      aProd,
      aLocal,
      beads,
    ],
  },
];
