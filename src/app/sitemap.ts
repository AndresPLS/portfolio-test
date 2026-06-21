import type { MetadataRoute } from "next";

import { getAllProjectSlugs } from "@/content/projects";
import { absoluteUrl } from "@/lib/site";

/**
 * Sitemap generado en build por Next (App Router): exportar por defecto una
 * función que devuelve la lista de URLs. Next la sirve en `/sitemap.xml`.
 *
 * Es async porque leemos los slugs del contenido (file system) desde el
 * servidor — igual que en cualquier Server Component.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllProjectSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.5 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: absoluteUrl(`/work/${slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes];
}
