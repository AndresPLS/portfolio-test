"use client";

import Lenis from "lenis";
import { useEffect } from "react";

import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Scroll suave global (Lenis) sincronizado con GSAP / ScrollTrigger.
 *
 * - Si el usuario pide reducir movimiento → NO activamos Lenis (scroll nativo).
 * - Un único bucle de animación: el ticker de GSAP "conduce" el rAF de Lenis,
 *   así el scroll y las animaciones quedan perfectamente sincronizados.
 * - El cleanup destruye Lenis y quita el ticker; por eso es seguro con React
 *   StrictMode, que en desarrollo monta → desmonta → vuelve a montar para
 *   detectar fugas de recursos.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis();

    // En cada scroll de Lenis, recalculamos los disparadores de ScrollTrigger.
    lenis.on("scroll", ScrollTrigger.update);

    // El ticker de GSAP entrega el tiempo en segundos; Lenis lo quiere en ms.
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
