"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Se suscribe a la preferencia "reducir movimiento" del sistema operativo.
 *
 * Usamos `useSyncExternalStore`, la API de React pensada justo para leer/suscribirse
 * a un "store" externo (aquí, `matchMedia`):
 *  - `subscribe`: registra el listener y devuelve la función de limpieza.
 *  - `getSnapshot`: valor actual en cliente.
 *  - `getServerSnapshot`: valor en SSR (asumimos `false`, sin reducción).
 *
 * Ventaja sobre useState+useEffect: es SSR-safe y evita el `setState` dentro de un
 * efecto (que React 19 desaconseja por provocar renders en cascada).
 */
function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
