/**
 * Configuración del sitio en un único lugar (URL base, nombre, etc.).
 *
 * La URL base la necesitan `metadataBase`, el sitemap, robots y las imágenes
 * OG para generar URLs absolutas. Se resuelve en este orden:
 *   1. `NEXT_PUBLIC_SITE_URL` (si la defines a mano, p. ej. tu dominio propio).
 *   2. `VERCEL_PROJECT_PRODUCTION_URL` (Vercel la inyecta en build/runtime;
 *      es el dominio de producción del proyecto, sin protocolo).
 *   3. `http://localhost:3000` (desarrollo local).
 *
 * Nota Angular: equivale a un `environment.ts`, pero en Next las variables se
 * leen de `process.env` y solo las `NEXT_PUBLIC_*` llegan al cliente.
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Andrés Polo",
  /** Título por defecto / sufijo de la plantilla. */
  title: "Andrés Polo — Photography",
  description:
    "Fotografía de Andrés Polo. Series y proyectos. Portfolio construido con Next.js, React y GSAP.",
  url: resolveSiteUrl(),
} as const;

/** URL absoluta a partir de una ruta relativa (`/work/dreamly` → `https://…/work/dreamly`). */
export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}
