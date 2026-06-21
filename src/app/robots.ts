import type { MetadataRoute } from "next";

import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * `/robots.txt` generado por Next. Permitimos todo el rastreo y apuntamos al
 * sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
