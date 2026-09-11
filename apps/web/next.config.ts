import type { NextConfig } from "next";

/** The hostname of a URL, or null if it is missing or malformed. */
function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const storageHost = hostOf(process.env.NEXT_PUBLIC_SUPABASE_URL);

const nextConfig: NextConfig = {
  // The shared packages ship raw TypeScript from their own src directories.
  transpilePackages: ["@jarvis/core", "@jarvis/types"],

  images: {
    remotePatterns: [
      /*
       * Supabase Storage, read from the URL the app already has — so adding a
       * bucket never means editing this file, and a misconfigured environment
       * fails here rather than silently serving unoptimised images.
       */
      ...(storageHost
        ? ([
            {
              protocol: "https" as const,
              hostname: storageHost,
              pathname: "/storage/v1/object/public/**",
            },
          ])
        : []),
      /* Course covers in the seed, until real ones are uploaded. */
      { protocol: "https" as const, hostname: "images.unsplash.com" },
    ],
  },

  experimental: {
    /*
     * `@jarvis/core` re-exports a dozen modules, the string tables among them,
     * and client components import from it by name. Without this, asking for
     * `formatMoney` pulls the whole barrel into the browser bundle. Both
     * packages declare `sideEffects: false`, which is what makes it safe.
     */
    optimizePackageImports: ["@jarvis/core", "lucide-react"],
  },
};

export default nextConfig;
