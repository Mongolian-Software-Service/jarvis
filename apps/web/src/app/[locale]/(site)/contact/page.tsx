import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { CONTACT, telHref, type ContactChannel } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { getViewer } from "@/lib/queries/viewer";
import { FeedbackForm } from "@/components/site/feedback-form";
import { pageMetadata } from "@/lib/seo";
import { FacebookMark, InstagramMark } from "@/components/ui/brand-icons";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getIntl();
  return pageMetadata({
    locale,
    title: t.marketing.contact.title,
    description: t.marketing.contact.deck,
    path: "/contact",
  });
}

type Channel = {
  key: ContactChannel;
  icon: ReactNode;
  label: string;
  /** What the reader sees — a handle, not the URL it resolves to. */
  display: string;
  href: string;
  note: string;
  external: boolean;
};

/** `instagram.com/ts.stark.software` reads as an address; the full URL reads as markup. */
function handle(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/**
 * The ways to reach the school, drawn from `CONTACT` in `packages/core`.
 *
 * **A channel whose value is empty is not rendered.** That is the whole reason
 * the list is built rather than written out: emptying one line in core removes
 * it everywhere, and the page can never offer an inbox nobody is reading.
 */
export default async function ContactPage() {
  const { t } = await getIntl();
  const copy = t.marketing.contact;
  /*
   * The form is for students, not for visitors.
   *
   * A request carries the sender's name, phone and address from their profile
   * (§5) — so a signed-out person has none of those, and the console would get
   * a message it cannot answer. They get the channels above instead, which is
   * what those are for.
   */
  const viewer = await getViewer();

  const channels: Channel[] = [];

  if (CONTACT.email) {
    channels.push({
      key: "email",
      icon: <Mail className="size-5" aria-hidden="true" />,
      label: copy.channels.email.label,
      display: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
      note: copy.channels.email.note,
      external: false,
    });
  }
  if (CONTACT.phone) {
    channels.push({
      key: "phone",
      icon: <Phone className="size-5" aria-hidden="true" />,
      label: copy.channels.phone.label,
      display: CONTACT.phone,
      href: telHref(CONTACT.phone),
      note: copy.channels.phone.note,
      external: false,
    });
  }
  if (CONTACT.facebook) {
    channels.push({
      key: "facebook",
      icon: <FacebookMark />,
      label: copy.channels.facebook.label,
      display: handle(CONTACT.facebook),
      href: CONTACT.facebook,
      note: copy.channels.facebook.note,
      external: true,
    });
  }
  if (CONTACT.instagram) {
    channels.push({
      key: "instagram",
      icon: <InstagramMark />,
      label: copy.channels.instagram.label,
      display: handle(CONTACT.instagram),
      href: CONTACT.instagram,
      note: copy.channels.instagram.note,
      external: true,
    });
  }

  return (
    <>
      <section className="shell pt-16 pb-10 sm:pt-20">
        <p className="kicker mb-4">{copy.kicker}</p>
        <h1 className="font-display max-w-2xl text-[2rem] leading-[1.1] sm:text-[2.75rem]">
          {copy.title}
        </h1>
        <p className="measure mt-5 text-[15px] text-ink-2">{copy.deck}</p>
      </section>

      {channels.length > 0 ? (
        <section className="shell pb-12">
          <ul className="grid gap-4 sm:grid-cols-2">
            {channels.map((channel) => (
              <li key={channel.key} className="panel relative p-6 transition-colors hover:border-line-strong">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-lg bg-panel-2 text-ink-2"
                  >
                    {channel.icon}
                  </span>

                  <div className="min-w-0">
                    <p className="kicker">{channel.label}</p>
                    {/*
                     * The whole card is the link's target (`.card-link`), so the
                     * card is one tab stop and the focus ring lands on the
                     * address rather than on the icon tile (CLAUDE.md §4.4).
                     */}
                    <a
                      href={channel.href}
                      {...(channel.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="card-link mt-1 inline-flex items-center gap-1.5 text-[15px] font-medium break-all text-ink transition-colors hover:text-accent"
                    >
                      {channel.display}
                      {channel.external ? (
                        <ArrowUpRight className="size-3.5 shrink-0 text-ink-3" aria-hidden="true" />
                      ) : null}
                    </a>
                    <p className="mt-2 text-[13px] leading-[1.6] text-ink-3">{channel.note}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="shell border-t border-line py-12">
        <div className="grid gap-8 sm:grid-cols-2">
          {[copy.response, copy.support].map((block) => (
            <div key={block.title}>
              <h2 className="font-display text-[17px] leading-[1.3]">{block.title}</h2>
              <p className="mt-2 text-[14px] leading-[1.7] text-ink-3">{block.body}</p>
            </div>
          ))}
        </div>
      </section>

      {viewer ? (
        <section className="shell pb-16">
          <div className="max-w-xl">
            <FeedbackForm t={t} />
          </div>
        </section>
      ) : null}
    </>
  );
}
