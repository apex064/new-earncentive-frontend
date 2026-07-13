type AuthHeadOptions = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  twitterCard?: "summary" | "summary_large_image";
};

/**
 * Create a head/meta object for auth pages.
 * Returns the same shape you used earlier: `{ meta: Array<Record<string,string>> }`
 */
export function createAuthHead(opts: AuthHeadOptions) {
  const siteName = "TaskMint";
  const baseUrl = (
    process.env.VITE_PUBLIC_SITE_URL || "http://localhost:5173"
  ).replace(/\/$/, "");

  const path = opts.path ?? "/";
  const url =
    path.startsWith("http") || path.startsWith("https")
      ? path
      : `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const titleWithSite = `${opts.title} — ${siteName}`;

  return {
    meta: [
      { title: titleWithSite },
      { name: "description", content: opts.description },

      // Open Graph
      { property: "og:title", content: titleWithSite },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      {
        property: "og:image",
        content: baseUrl + (opts.image || "/taskmint-half.svg"),
      },

      // Twitter
      {
        name: "twitter:card",
        content: opts.twitterCard ?? "summary_large_image",
      },
      { name: "twitter:title", content: titleWithSite },
      { name: "twitter:description", content: opts.description },
      {
        name: "twitter:image",
        content: baseUrl + (opts.image || "/taskmint-half.svg"),
      },

      // misc
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#4f21a1" },
    ],
  };
}
