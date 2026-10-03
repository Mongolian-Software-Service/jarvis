import { type NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isLocale,
  signInPath,
  toLocale,
  type Locale,
} from "@jarvis/core";
import { updateSession } from "@/lib/supabase/session";

/**
 * Next 16 calls this `proxy`, not `middleware` — the file and the exported
 * function were both renamed, and the `edge` runtime is not available here.
 * Node is what we want anyway: `@supabase/ssr` runs unchanged.
 *
 * Three jobs, in this order:
 *   1. put a language on every URL,
 *   2. refresh the Supabase session while there is still a response to write to,
 *   3. send a signed-out visitor to the sign-in form before a private page renders.
 */

/** Signed-in only. Matched against the path with its language prefix removed. */
const PRIVATE = [
  /^\/hello(\/.*)?$/,
  /^\/dashboard(\/.*)?$/,
  /^\/learn(\/.*)?$/,
  /^\/ask(\/.*)?$/,
  /^\/account(\/.*)?$/,
  /^\/admin(\/.*)?$/,
];

function unprefixed(pathname: string): string {
  for (const code of LOCALES) {
    if (pathname === `/${code}`) return "/";
    if (pathname.startsWith(`/${code}/`)) return pathname.slice(code.length + 1);
  }
  return pathname;
}

function isPrivate(pathname: string): boolean {
  const path = unprefixed(pathname);
  return PRIVATE.some((pattern) => pattern.test(path));
}

/**
 * The language for a request that did not name one.
 *
 * The cookie, or Mongolian. **`Accept-Language` is deliberately not consulted.**
 * A great many people in Mongolia run an en-US browser on a Mac bought abroad,
 * and sending them to the English edition — the one whose lesson bodies can be
 * missing — because of a header they never set is worse than serving the
 * default. Readers switch on purpose, from the header.
 */
function localeFor(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  return toLocale(cookie ?? DEFAULT_LOCALE);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  // The gateway posts here with no session and no interest in a language
  // prefix. A redirect would be answered by a machine that does not follow one.
  if (pathname.startsWith("/api/webhooks")) return NextResponse.next();

  const segment = pathname.split("/")[1];
  const hasLocale = isLocale(segment);

  if (!hasLocale && !pathname.startsWith("/api") && !pathname.startsWith("/auth")) {
    const locale = localeFor(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const locale = hasLocale ? (segment as Locale) : localeFor(request);

  // Refreshing the session is also how we find out who is asking, so it happens
  // before the gate below rather than beside it.
  const { response, userId } = await updateSession(request);

  if (!userId && isPrivate(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = signInPath(locale);
    // Where they were going, so the form can put them back there afterwards.
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // Server Actions and Route Handlers cannot read root params. This header is
  // how they find out which language the person is reading in.
  response.headers.set(LOCALE_HEADER, locale);
  return response;
}

export const config = {
  /*
   * Everything except the files. Without a matcher the proxy runs on every
   * request including `_next/static`, and an auth redirect would then block the
   * stylesheet of the page it redirected to.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|mp4|webm|woff2?)$).*)",
  ],
};
