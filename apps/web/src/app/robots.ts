import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /*
       * The console, the player and anything behind a session.
       *
       * Not a security measure — the policies are that — but a crawler that
       * indexes `/learn/...` fills search results with pages that answer
       * everybody else with a sign-in form.
       */
      disallow: ["/api/", "/*/admin", "/*/learn", "/*/account", "/*/checkout", "/auth/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
