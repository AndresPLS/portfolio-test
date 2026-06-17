"use client";

import { useRef } from "react";

import { gsap, SplitText, useGSAP } from "@/components/motion/gsap";
import { durations, eases, staggers } from "@/components/motion/tokens";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type SplitTextRevealProps = {
  text: string;
  className?: string;
  /** Duración por línea, en segundos (por defecto `durations.slow`). */
  duration?: number;
  /** Curva GSAP (por defecto `eases.out`). */
  ease?: string;
  /** Separación entre líneas, en segundos (por defecto `staggers.base`). */
  stagger?: number;
};

/**
 * Titular que se revela línea a línea (efecto máscara) al entrar en pantalla.
 * `duration` / `ease` / `stagger` salen de los tokens; sobreescribibles por instancia.
 *
 * - `mask: "lines"` envuelve cada línea en un contenedor con overflow recortado,
 *   por eso las líneas "suben" desde detrás de la máscara (yPercent 100 → 0).
 * - `autoSplit: true` + devolver la animación en `onSplit` re-mide las líneas
 *   cuando cargan las fuentes o cambia el ancho (evita líneas mal medidas).
 * - El SplitText reescrito (2025) mantiene el texto accesible para lectores de pantalla.
 */
export function SplitTextReveal({
  text,
  className,
  duration = durations.slow,
  ease = eases.out,
  stagger = staggers.base,
}: SplitTextRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;

      const split = SplitText.create(ref.current, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 100,
            opacity: 0,
            duration,
            ease,
            stagger,
            scrollTrigger: { trigger: ref.current, start: "top 80%" },
          });
        },
      });

      return () => split.revert();
    },
    { scope: ref, dependencies: [reduced, duration, ease, stagger] },
  );

  return (
    <h2 ref={ref} className={className}>
      {text}
    </h2>
  );
}
