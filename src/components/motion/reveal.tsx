"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/components/motion/gsap";
import { durations, eases } from "@/components/motion/tokens";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Desplazamiento vertical inicial, en píxeles. */
  y?: number;
  /** Retardo de entrada, en segundos. */
  delay?: number;
  /** Duración en segundos (por defecto, token `durations.base`). */
  duration?: number;
  /** Curva de aceleración GSAP (por defecto, token `eases.out`). */
  ease?: string;
};

/**
 * Aparición al hacer scroll: fundido + ligero desplazamiento hacia arriba.
 *
 * `duration` y `ease` salen de los tokens de animación, así toda la web comparte
 * el mismo "feel"; se pueden sobreescribir por instancia cuando una sección lo pida.
 *
 * Con reduced-motion NO animamos: como usamos `gsap.from` (anima DESDE oculto
 * HASTA su estado natural), al no crearlo el contenido se queda visible tal cual.
 */
export function Reveal({
  children,
  className,
  y = 40,
  delay = 0,
  duration = durations.base,
  ease = eases.out,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.from(ref.current, {
        opacity: 0,
        y,
        delay,
        duration,
        ease,
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    },
    { scope: ref, dependencies: [reduced, y, delay, duration, ease] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
