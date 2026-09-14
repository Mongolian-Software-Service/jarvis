/**
 * «Кодын суурь»: the five ideas, one picture each.
 *
 * Wider and much shorter than the system frames — each of these sits inside a
 * page of the handbook rather than filling a screen.
 */
import { ACCENT, ACCENT_SOFT, FAINT, INK, LINE, MUTED, OK, OK_SOFT, WASH, card, text } from "./canvas.mjs";

// ── Кодын суурь: the five ideas, one picture each ────────────────────────────
//
// Small, single-idea drawings rather than a map: these are shown one at a time
// beside a sentence, and a wide canvas would leave the shape stranded in it.

export const SMALL_W = 1200;
export const SMALL_H = 380;

const box = (x, y, w, h, fill, stroke) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;

export const SMALL = [
  {
    file: "c2-01-huvisagch.svg",
    heading: "Хувьсагч — нэртэй хайрцаг",
    sub: "Нэрээр нь дуудаад доторх утгыг нь авна",
    body: [
      `<g id="hairtsag-1">${box(80, 150, 300, 110, "white", ACCENT)}${text(230, 218, "«Сараа»", { size: 30, fill: INK, anchor: "middle" })}${text(230, 132, "hereglegchiin_ner", { size: 17, weight: 600, fill: ACCENT, anchor: "middle" })}</g>`,
      `<g id="hairtsag-2">${box(450, 150, 300, 110, "white", ACCENT)}${text(600, 218, "24", { size: 30, fill: INK, anchor: "middle" })}${text(600, 132, "nas", { size: 17, weight: 600, fill: ACCENT, anchor: "middle" })}</g>`,
      `<g id="hairtsag-3">${box(820, 150, 300, 110, "white", ACCENT)}${text(970, 218, "199 000", { size: 30, fill: INK, anchor: "middle" })}${text(970, 132, "niit_dun", { size: 17, weight: 600, fill: ACCENT, anchor: "middle" })}</g>`,
      `<g id="temdeglel">${text(600, 320, "Нэр нь сайн байвал долоо хоногийн дараа ч уншаад ойлгоно", { size: 17, fill: FAINT, anchor: "middle" })}</g>`,
    ],
  },
  {
    file: "c2-02-nuhtsul.svg",
    heading: "Нөхцөл — замын салаа",
    sub: "«Тийм» тал, «үгүй» тал — хоёуланг нь хэлэх ёстой",
    body: [
      `<g id="asuult">${box(80, 170, 300, 80, WASH, LINE)}${text(230, 218, "Нэвтэрсэн үү?", { size: 20, fill: INK, anchor: "middle" })}</g>`,
      `<g id="tiim-zam"><path d="M392 190 C500 190 500 120 600 120" stroke="${OK}" stroke-width="3" fill="none"/><path d="M600 120 l-12 -6 v12 z" fill="${OK}"/>${text(500, 104, "тийм", { size: 16, weight: 600, fill: OK, anchor: "middle" })}</g>`,
      `<g id="ugui-zam"><path d="M392 230 C500 230 500 300 600 300" stroke="#9a6c0f" stroke-width="3" fill="none"/><path d="M600 300 l-12 -6 v12 z" fill="#9a6c0f"/>${text(500, 330, "үгүй", { size: 16, weight: 600, fill: "#9a6c0f", anchor: "middle" })}</g>`,
      `<g id="tiim-hariu">${box(612, 84, 500, 74, OK_SOFT, OK)}${text(640, 128, "Хяналтын самбарыг харуулна", { size: 19, fill: INK })}</g>`,
      `<g id="ugui-hariu">${box(612, 264, 500, 74, "#fdf5e4", "#9a6c0f")}${text(640, 308, "Нэвтрэх хуудас руу илгээнэ", { size: 19, fill: INK })}</g>`,
    ],
  },
  {
    file: "c2-03-davtalt.svg",
    heading: "Давталт — бүгд дээр нь давт",
    sub: "Гурав байна уу, гурван зуу байна уу — заавар нь ижил",
    body: [
      `<g id="zuil-1">${box(80, 190, 240, 80, "white", LINE)}${text(200, 238, "Захиалга 1", { size: 19, fill: INK, anchor: "middle" })}</g>`,
      `<g id="zuil-2">${box(360, 190, 240, 80, "white", LINE)}${text(480, 238, "Захиалга 2", { size: 19, fill: INK, anchor: "middle" })}</g>`,
      `<g id="zuil-3">${box(640, 190, 240, 80, "white", LINE)}${text(760, 238, "Захиалга 3", { size: 19, fill: INK, anchor: "middle" })}</g>`,
      `<g id="tsaash">${text(960, 238, "… цааш", { size: 19, fill: FAINT })}</g>`,
      `<g id="niiluulegch"><path d="M200 176 C200 130 480 130 480 176" stroke="${ACCENT}" stroke-width="3" fill="none"/><path d="M480 176 l-6 -12 h12 z" fill="${ACCENT}"/><path d="M480 176 C480 130 760 130 760 176" stroke="${ACCENT}" stroke-width="3" fill="none"/><path d="M760 176 l-6 -12 h12 z" fill="${ACCENT}"/>${text(480, 116, "гишүүн бүр дээр ижил ажил", { size: 16, weight: 600, fill: ACCENT, anchor: "middle" })}</g>`,
      `<g id="hooson">${text(600, 330, "Хоосон байвал юу харагдахыг заавал хэл", { size: 17, fill: FAINT, anchor: "middle" })}</g>`,
    ],
  },
  {
    file: "c2-04-funkts.svg",
    heading: "Функц — нэр өгсөн ажил",
    sub: "Юм өгөөд, хариу авдаг машин",
    body: [
      `<g id="orolt">${text(150, 220, "199 000₮", { size: 24, fill: MUTED, anchor: "middle" })}<path d="M250 210 H400" stroke="${FAINT}" stroke-width="3"/><path d="M400 210 l-12 -6 v12 z" fill="${FAINT}"/>${text(325, 190, "оролт", { size: 16, fill: FAINT, anchor: "middle" })}</g>`,
      `<g id="ajil">${box(412, 150, 380, 120, ACCENT_SOFT, ACCENT)}${text(602, 200, "tatvartaiDun", { size: 22, weight: 600, fill: INK, anchor: "middle" })}${text(602, 232, "нэг удаа бичээд хаа сайгүй", { size: 16, fill: MUTED, anchor: "middle" })}</g>`,
      `<g id="garalt"><path d="M804 210 H954" stroke="${OK}" stroke-width="3"/><path d="M954 210 l-12 -6 v12 z" fill="${OK}"/>${text(879, 190, "гаралт", { size: 16, fill: OK, anchor: "middle" })}${text(1060, 220, "218 900₮", { size: 24, fill: MUTED, anchor: "middle" })}</g>`,
      `<g id="temdeglel">${text(600, 330, "Нэг газар засахад хаа сайгүй зөв болно", { size: 17, fill: FAINT, anchor: "middle" })}</g>`,
    ],
  },
  {
    file: "c2-05-promptiin-butets.svg",
    heading: "Сайн промптын дөрвөн хэсэг",
    sub: "Дараалал нь ч бас чухал",
    body: [
      `<g id="heseg-1">${box(80, 110, 1040, 58, WASH, LINE)}${text(110, 147, "1 · Юу хийх гэж байна вэ — нэг өгүүлбэрээр", { size: 19, fill: INK })}</g>`,
      `<g id="heseg-2">${box(80, 180, 1040, 58, WASH, LINE)}${text(110, 217, "2 · Хэнд зориулсан, ямар нөхцөлд", { size: 19, fill: INK })}</g>`,
      `<g id="heseg-3">${box(80, 250, 1040, 58, WASH, LINE)}${text(110, 287, "3 · Юу байх ёстой — дугаарласан жагсаалтаар", { size: 19, fill: INK })}</g>`,
      `<g id="heseg-4">${box(80, 320, 1040, 58, ACCENT_SOFT, ACCENT)}${text(110, 357, "4 · Юуг нь хийх шаардлагагүй — хамгийн чухал нь", { size: 19, weight: 600, fill: ACCENT })}</g>`,
    ],
  },
];

