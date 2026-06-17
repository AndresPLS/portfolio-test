/**
 * Tokens de animación: el "feel" del estudio, centralizado.
 *
 * Igual que los tokens de color definen la paleta, esto es la única fuente de
 * verdad del movimiento: todas las páginas animan con la misma personalidad.
 * Cambia un valor aquí y cambia en toda la web.
 */

/** Duraciones, en segundos. */
export const durations = {
  fast: 0.5,
  base: 0.9,
  slow: 1.2,
} as const;

/**
 * Curvas de aceleración (sintaxis de GSAP). El `ease` define el CARÁCTER del
 * movimiento. Visualízalas en https://gsap.com/docs/v3/Eases
 */
export const eases = {
  out: "power3.out", // arranca y frena con suavidad (uso general)
  inOut: "power2.inOut", // simétrico (entradas/salidas)
  back: "back.out(1.7)", // se pasa un poco y vuelve (rebote sutil)
  none: "none", // lineal: para parallax / scrub
} as const;

/** Separación entre elementos en animaciones escalonadas (segundos). */
export const staggers = {
  tight: 0.06,
  base: 0.12,
  loose: 0.2,
} as const;
