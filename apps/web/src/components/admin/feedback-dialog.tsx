"use client";

import { useEffect, useRef } from "react";
import { Mail, Phone, X } from "lucide-react";
import { formatDate, telHref, type Locale, type Strings } from "@jarvis/core";
import { buttonClass } from "@/components/ui/button";
import type { FeedbackMessage } from "@/lib/queries/admin";

/**
 * One request, in full.
 *
 * The phone and the address are **links**, not text: the team opens this to
 * answer somebody, and retyping a number off a screen into a phone is the
 * step where a digit gets dropped.
 *
 * Escape closes it, the backdrop closes it, and focus moves into the dialog on
 * open and nothing outside it is reachable while it is up — a dialog that
 * leaves the page behind it tabbable reads as a page to a screen reader.
 */
export function FeedbackDialog({
  message,
  locale,
  t,
  onClose,
}: {
  message: FeedbackMessage;
  locale: Locale;
  t: Strings;
  onClose: () => void;
}) {
  const copy = t.admin.feedback;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    /*
     * The page behind must not scroll while this is open. Restoring the
     * previous value rather than clearing it matters: two things that both set
     * `overflow` would otherwise leave the page locked when the second closes.
     */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const name = message.author.name ?? message.author.email ?? "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.dialogTitle}
      className="fixed inset-0 z-50 grid place-items-center p-5"
    >
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(8,9,10,.72)", backdropFilter: "blur(6px)" }}
      />

      <div className="panel-raised relative flex max-h-[85dvh] w-full max-w-lg flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display truncate text-[19px] leading-[1.2]">{name}</h2>
            <p className="text-ink-3 mt-1 text-xs">{formatDate(message.createdAt, locale)}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="text-ink-3 hover:text-ink hover:bg-panel-2 -m-1.5 rounded-md p-1.5 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
          {message.author.phone ? (
            <a
              href={telHref(message.author.phone)}
              className="text-ink-2 hover:text-ink inline-flex items-center gap-1.5 transition-colors"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              {message.author.phone}
            </a>
          ) : null}
          {message.author.email ? (
            <a
              href={`mailto:${message.author.email}`}
              className="text-ink-2 hover:text-ink inline-flex min-w-0 items-center gap-1.5 transition-colors"
            >
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{message.author.email}</span>
            </a>
          ) : null}
        </div>

        <p className="kicker mt-6">{copy.message}</p>
        {/*
         * `whitespace-pre-wrap` keeps the paragraphs the student typed. A
         * request collapsed into one block is harder to read than the thing
         * they actually wrote, and this is the one screen where their words
         * matter more than the layout.
         */}
        <p className="text-ink mt-2 min-h-0 flex-1 overflow-y-auto text-[14px] leading-relaxed whitespace-pre-wrap">
          {message.body}
        </p>

        <div className="hairline mt-6 flex justify-end pt-4">
          <button type="button" onClick={onClose} className={buttonClass("secondary", "md")}>
            {copy.close}
          </button>
        </div>
      </div>
    </div>
  );
}
