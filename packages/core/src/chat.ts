/**
 * «Мэдэхгүй зүйлээ асуу» — the rules of the room that are not a screen.
 *
 * Here for the usual reason (a rule left in a component is a rule nobody can
 * test), and for one that is particular to a live room: every message is drawn
 * twice, once on the server for the first screenful and again in the browser
 * when it arrives — and both have to print the same time.
 */
import { z } from "zod";
import { authorName } from "./projects";

/** The column's own bound (`chat_messages.body`, 20261003000100). */
export const CHAT_MESSAGE_MAX = 2000;
/** How much of the room the first screen loads. */
export const CHAT_HISTORY = 100;

/**
 * Ulaanbaatar is UTC+8 all year — Mongolia has not observed daylight saving
 * since 2017 — so the offset is a constant, not a lookup.
 *
 * Why not the reader's own clock: the server renders the first screenful in
 * UTC and the browser then re-renders it in local time, and a time that
 * disagrees between the two is a hydration error on every message. `Intl` with
 * a time zone would agree, but is the thing §6.5 keeps out of this codebase.
 * The school's readers are in Mongolia; their clock is this one.
 */
const UB_OFFSET_MS = 8 * 60 * 60 * 1000;

function inUlaanbaatar(value: string): Date | null {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : new Date(time + UB_OFFSET_MS);
}

/** `15:42`, Ulaanbaatar time. */
export function formatClock(value: string): string {
  const date = inUlaanbaatar(value);
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

/** `2026 оны 10-р сарын 3`, Ulaanbaatar's calendar — the divider between days. */
export function formatChatDay(value: string): string {
  const date = inUlaanbaatar(value);
  if (!date) return "";
  return `${date.getUTCFullYear()} оны ${date.getUTCMonth() + 1}-р сарын ${date.getUTCDate()}`;
}

/** One message as the room draws it. */
export type ChatMessage = {
  id: string;
  body: string;
  /** «Б.Тэмүүлэн», or null for an account with no given name yet. */
  author: string | null;
  isTeam: boolean;
  /** On `teacher_emails` (20261003000200): drawn apart from everybody else. */
  isTeacher: boolean;
  isMine: boolean;
  createdAt: string;
};

/** The row's columns, as both the view and a Realtime event deliver them. */
export type ChatRow = {
  id: string | null;
  body: string | null;
  author_first_name: string | null;
  author_initial: string | null;
  is_team: boolean | null;
  is_teacher: boolean | null;
  created_at: string | null;
};

/** A row becomes a message; a row without an id or a body is not one. */
export function toChatMessage(row: ChatRow, isMine: boolean): ChatMessage | null {
  if (!row.id || !row.body || !row.created_at) return null;
  return {
    id: row.id,
    body: row.body,
    author: authorName(row.author_first_name, row.author_initial),
    isTeam: row.is_team ?? false,
    isTeacher: row.is_teacher ?? false,
    isMine,
    createdAt: row.created_at,
  };
}

/** The column's `check`, said where the form and the action can both read it. */
export function chatMessageSchema(copy: { empty: string; long: string }) {
  return z.object({
    body: z.string().trim().min(1, copy.empty).max(CHAT_MESSAGE_MAX, copy.long),
  });
}
