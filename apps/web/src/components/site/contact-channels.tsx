import type { ReactNode } from "react";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { CONTACT, CONTACT_NAMES, telHref, type ContactChannel, type Strings } from "@jarvis/core";
import { FacebookMark, InstagramMark } from "@/components/ui/brand-icons";

/**
 * The ways to reach the school, drawn in two places: the public «Холбоо барих»
 * for a visitor, and «Тусламж» inside settings for a student. One component, so
 * a channel added to `CONTACT` appears in both or in neither.
 *
 * Neither piece carries `.shell` — the page around it owns the column (§3).
 */

type Channel = {
  key: ContactChannel;
  icon: ReactNode;
  label: string;
  /** What the reader sees — an address, a number or a name, never a URL. */
  display: string;
  href: string;
  note: string;
  external: boolean;
};

/**
 * Built from `CONTACT` in `packages/core`, and **a channel whose value is empty
 * is not rendered.** That is the whole reason the list is built rather than
 * written out: emptying one line in core removes it everywhere, and the page
 * can never offer an inbox nobody is reading.
 */
function buildChannels(copy: Strings["marketing"]["contact"]["channels"]): Channel[] {
  const channels: Channel[] = [];
  if (CONTACT.email) {
    channels.push({
      key: "email",
      icon: <Mail className="size-5" aria-hidden="true" />,
      label: copy.email.label,
      display: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
      note: copy.email.note,
      external: false,
    });
  }
  if (CONTACT.phone) {
    channels.push({
      key: "phone",
      icon: <Phone className="size-5" aria-hidden="true" />,
      label: copy.phone.label,
      display: CONTACT.phone,
      href: telHref(CONTACT.phone),
      note: copy.phone.note,
      external: false,
    });
  }
  if (CONTACT.facebook) {
    channels.push({
      key: "facebook",
      icon: <FacebookMark />,
      label: copy.facebook.label,
      display: CONTACT_NAMES.facebook,
      href: CONTACT.facebook,
      note: copy.facebook.note,
      external: true,
    });
  }
  if (CONTACT.instagram) {
    channels.push({
      key: "instagram",
      icon: <InstagramMark />,
      label: copy.instagram.label,
      display: CONTACT_NAMES.instagram,
      href: CONTACT.instagram,
      note: copy.instagram.note,
      external: true,
    });
  }
  return channels;
}

export function ContactChannels({ t }: { t: Strings }) {
  const channels = buildChannels(t.marketing.contact.channels);
  if (channels.length === 0) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {channels.map((channel) => (
        <li
          key={channel.key}
          className="panel hover:border-line-strong relative p-6 transition-colors"
        >
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="bg-panel-2 text-ink-2 grid size-10 shrink-0 place-items-center rounded-lg"
            >
              {channel.icon}
            </span>

            <div className="min-w-0">
              <p className="kicker">{channel.label}</p>
              {/*
               * The whole card is the link's target (`.card-link`), so the
               * card is one tab stop and the focus ring lands on the address
               * rather than on the icon tile (CLAUDE.md §4.4).
               */}
              <a
                href={channel.href}
                {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="card-link text-ink hover:text-accent mt-1 inline-flex items-center gap-1.5 text-[15px] font-medium break-all transition-colors"
              >
                {channel.display}
                {channel.external ? (
                  <ArrowUpRight className="text-ink-3 size-3.5 shrink-0" aria-hidden="true" />
                ) : null}
              </a>
              <p className="text-ink-3 mt-2 text-[13px] leading-[1.6]">{channel.note}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** «Хэзээ хариу ирэх вэ» and «Сургалт дээр гацсан уу?» — the wrapper decides the grid. */
export function ContactNotes({ t, className }: { t: Strings; className?: string }) {
  const copy = t.marketing.contact;
  return (
    <div className={className}>
      {[copy.response, copy.support].map((block) => (
        <div key={block.title}>
          <h2 className="font-display text-[17px] leading-[1.3]">{block.title}</h2>
          <p className="text-ink-3 mt-2 text-[14px] leading-[1.7]">{block.body}</p>
        </div>
      ))}
    </div>
  );
}
