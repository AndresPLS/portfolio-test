"use client";

import Lenis from "lenis";
import { useEffect } from "react";

import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Holder a nivel de módulo con la instancia de Lenis. Lo exponemos con `getLenis()`
 * para que otros componentes hagan scroll programático coherente con el scroll
 * suave (p. ej. saltar a una foto desde Thumbnails) sin necesitar Context ni estado.
 * Es `null` si el scroll suave está desactivado (reduced-motion).
 */
let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Scroll suave global (Lenis) sincronizado con GSAP / ScrollTrigger.
 * - Desactivado con reduced-motion (scroll nativo).
 * - El ticker de GSAP conduce el rAF de Lenis (un único bucle, sincronía total).
 * - El cleanup destruye Lenis → seguro con StrictMode.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const instance = new Lenis();
    instance.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    lenisInstance = instance;

    return () => {
      gsap.ticker.remove(onTick);
      instance.destroy();
      lenisInstance = null;
    };
  }, [reduced]);

  return <>{children}</>;
}
