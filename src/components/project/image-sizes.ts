export type ImageSize = "sm" | "md" | "lg" | "full";

/**
 * Sistema de tallas de imagen del detalle de proyecto: cuánto ocupa cada foto
 * dentro de su "pantalla" (siempre centrada). Ajusta estos valores y cambia en
 * todo el sitio. En móvil van más anchas; en escritorio (md:) aplican las vw.
 *
 * NOTA: deben ser clases LITERALES para que Tailwind las genere (no construir
 * los nombres dinámicamente).
 */
export const imageSizeClass: Record<ImageSize, string> = {
  sm: "max-h-[38vh] max-w-[80vw] md:max-w-[40vw]",
  md: "max-h-[62vh] max-w-[88vw] md:max-w-[58vw]",
  lg: "max-h-[82vh] max-w-[92vw] md:max-w-[76vw]",
  full: "max-h-[92vh] max-w-[94vw]",
};

/** Cada imagen dentro de una pareja (dos en fila). */
export const rowImageClass = "max-h-[42vh] max-w-[44vw] md:max-h-[66vh]";

/**
 * La PRIMERA imagen del detalle: tamaño fijo y consistente entre proyectos.
 * Tope de alto de 36vh.
 */
export const introImageClass = "h-auto w-auto max-h-[36vh]";
