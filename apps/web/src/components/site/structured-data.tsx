import {
  COMPANY_NAME,
  COMPANY_URL,
  CONTACT,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  type Locale,
} from "@jarvis/core";

/**
 * Who this is, said to search engines in their own vocabulary (schema.org).
 *
 * Two things, on the front page only, because that is where Google reads them:
 *
 * - **`WebSite`** with `name`. Without it Google titled every result with the
 *   bare domain, «tsstark-academy.com»; the site-name system reads this to put
 *   «TsStark Academy» there instead.
 * - **`EducationalOrganization`** — the school itself: its logo (the 192px icon,
 *   over Google's 112px minimum), what it teaches, how to reach it, and the
 *   company behind it with that company's own profiles. It is what lets Google
 *   connect the brand's pages and profiles into one entity, rather than
 *   matching «tsstark academy» to whichever academy has the nearest name.
 *
 * Not a Google Business Profile, and not a substitute for one: the map panel
 * with an address and reviews is Google's own product, and it is only for a
 * business that meets its customers in person.
 *
 * Rendered as a plain `<script>` with a text child, **not**
 * `dangerouslySetInnerHTML` — the property this codebase keeps (§4.5). React 19
 * writes a script's text unescaped and turns any `</script` inside it into
 * `</script`, which is still valid JSON inside a string and can no longer
 * close the tag. Verified against react-dom/server 19.2 on 2026-10-06; if a
 * React upgrade changes that, this tag is the place to look.
 */
export function StructuredData({ locale }: { locale: Locale }) {
  const home = `${SITE_URL}/`;
  const organization = `${SITE_URL}/#organization`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: home,
        name: SITE_NAME,
        inLanguage: locale,
        publisher: { "@id": organization },
      },
      {
        "@type": "EducationalOrganization",
        "@id": organization,
        name: SITE_NAME,
        url: home,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/icon1.png`,
          width: 192,
          height: 192,
        },
        description: SITE_TAGLINE[locale],
        // An emptied channel is not rendered on the contact page, and is not
        // claimed here either.
        ...(CONTACT.email ? { email: CONTACT.email } : {}),
        ...(CONTACT.phone ? { telephone: CONTACT.phone } : {}),
        /*
         * The Facebook and Instagram in CONTACT are the company's («TS Stark
         * Software»), not the school's, so they are the parent's `sameAs`. A
         * `sameAs` says "this is the same entity", and claiming the company's
         * page *as* the school is the kind of mismatch that gets markup
         * ignored. When the school has profiles of its own, they go on the
         * school.
         */
        parentOrganization: {
          "@type": "Organization",
          name: COMPANY_NAME,
          url: COMPANY_URL,
          sameAs: [CONTACT.facebook, CONTACT.instagram].filter(Boolean),
        },
        areaServed: { "@type": "Country", name: "Mongolia" },
        knowsLanguage: locale,
      },
    ],
  };

  return <script type="application/ld+json">{JSON.stringify(graph)}</script>;
}
