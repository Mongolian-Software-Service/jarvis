/**
 * The boxes and the arrows between them — every piece of the system map, each
 * in its own `<g id="…">` so Figma names the layer for you.
 *
 * Separate from the frames because the frames are only a choice of which of
 * these to show: the geometry is decided once here, which is what stops a box
 * from drifting between step two and step three.
 */
import { ACCENT, ACCENT_SOFT, BOX, FAINT, H, INK, LINE, MUTED, OK, OK_SOFT, W, WASH, arrow, card, elbow, step, text } from "./canvas.mjs";

// ── The pieces ───────────────────────────────────────────────────────────────

export const frame = `  <g id="chinii-computer">
    <rect x="60" y="90" width="520" height="420" rx="22" fill="none" stroke="${LINE}" stroke-width="2" stroke-dasharray="10 8"/>
    ${text(84, 124, "ЧИНИЙ КОМПЬЮТЕР", { size: 14, weight: 600, fill: FAINT })}
  </g>`;

export const vscode = card(
  "vs-code",
  BOX.vscode,
  "VS Code",
  ["Код энд байрлана. Claude энд ажиллана.", "Чи юу хэрэгтэйг хэлж, шалгана."],
  { tint: ACCENT_SOFT, border: ACCENT, accent: true },
);

export const terminal = card("terminal", BOX.terminal, "Терминал", ["Тушаал бичих", "цонх"], {
  tint: WASH,
});

export const localhost = card("localhost", BOX.localhost, "localhost", ["Зөвхөн чамд", "харагдана"], {
  tint: WASH,
});

export const github = card("github", BOX.github, "GitHub", [
  "Ажлын түүх, хуулбар.",
  "Бүх хувилбар энд үлдэнэ.",
]);

export const vercel = card("vercel", BOX.vercel, "Vercel", [
  "Сайтыг интернэтэд гаргана.",
  "Өөрчлөлт бүрт шинэчилнэ.",
]);

export const users = card(
  "hereglegchid",
  BOX.users,
  "Хэрэглэгчид",
  ["Утас, компьютероороо", "сайт руу орно."],
  {
    tint: OK_SOFT,
    border: OK,
  },
);

export const supabase = `  <g id="supabase">
    <rect x="${BOX.supabase.x}" y="${BOX.supabase.y}" width="${BOX.supabase.w}" height="${BOX.supabase.h}" rx="16" fill="white" stroke="${LINE}" stroke-width="2"/>
    ${text(BOX.supabase.x + 24, BOX.supabase.y + 48, "Supabase", { size: 22, weight: 600, fill: INK })}
    ${text(BOX.supabase.x + 24, BOX.supabase.y + 78, "Ард талын бүх зүйл нэг дор", { size: 15, fill: FAINT })}

    <rect x="${BOX.supabase.x + 20}" y="${BOX.supabase.y + 100}" width="${BOX.supabase.w - 40}" height="64" rx="10" fill="${WASH}"/>
    ${text(BOX.supabase.x + 40, BOX.supabase.y + 128, "Өгөгдлийн сан", { size: 17, weight: 600, fill: INK })}
    ${text(BOX.supabase.x + 40, BOX.supabase.y + 150, "Хүснэгт, мөр, багана", { size: 14, fill: MUTED })}

    <rect x="${BOX.supabase.x + 20}" y="${BOX.supabase.y + 176}" width="${BOX.supabase.w - 40}" height="64" rx="10" fill="${WASH}"/>
    ${text(BOX.supabase.x + 40, BOX.supabase.y + 204, "Нэвтрэлт", { size: 17, weight: 600, fill: INK })}
    ${text(BOX.supabase.x + 40, BOX.supabase.y + 226, "Хэн нэвтэрснийг мэднэ", { size: 14, fill: MUTED })}

    <rect x="${BOX.supabase.x + 20}" y="${BOX.supabase.y + 252}" width="${BOX.supabase.w - 40}" height="64" rx="10" fill="${WASH}"/>
    ${text(BOX.supabase.x + 40, BOX.supabase.y + 280, "Файл хадгалалт", { size: 17, weight: 600, fill: INK })}
    ${text(BOX.supabase.x + 40, BOX.supabase.y + 302, "Зураг, видео, PDF", { size: 14, fill: MUTED })}
  </g>`;

// ── The arrows ───────────────────────────────────────────────────────────────

export const aDev = arrow("suum-1-turshih", [435, 280], [435, 330], null);
export const devLabel = `  <g id="shosh-turshih">${text(455, 312, "Туршиж харах", { size: 15, weight: 500, fill: MUTED })}</g>`;

export const aPush = arrow("suum-2-push", [540, 215], [720, 215], "Кодоо илгээх");
export const aDeploy = arrow("suum-3-deploy", [880, 280], [880, 350], "Автоматаар");
export const aVisit = arrow("suum-4-hereglegch", [880, 480], [880, 590], "Хүсэлт ба хариу", {
  both: true,
});
export const aProd = arrow("suum-5-vercel-supabase", [1040, 400], [1200, 330], "Бодит өгөгдөл");
export const aLocal = elbow(
  "suum-6-localhost-supabase",
  [
    [435, 460],
    [435, 770],
    [1360, 770],
    [1360, 480],
  ],
  "Хөгжүүлж байхдаа мөн энэ рүү холбогдоно",
  { dashed: true, labelAt: 1, labelDy: 34 },
);

/* Beads sit above a card's top-right corner: inside a box they cover the
   title, and to its left they land on the dashed frame. */
export const bead = (id, n, box) => step(id, n, box.x + box.w - 22, box.y - 24);

export const beads = [
  bead("alham-1", 1, BOX.vscode),
  bead("alham-2", 2, BOX.github),
  bead("alham-3", 3, BOX.vercel),
  bead("alham-4", 4, BOX.users),
  bead("alham-5", 5, BOX.supabase),
].join("\n");

export const title = (heading, sub) => `  <g id="garchig">
    ${text(60, 56, heading, { size: 30, weight: 600, fill: INK })}
    ${text(60, 84, sub, { size: 17, fill: FAINT })}
  </g>`;
