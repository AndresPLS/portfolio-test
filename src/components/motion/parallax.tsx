"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/components/motion/gsap";
import { eases } from "@/components/motion/tokens";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type ParallaxProps = {
  children: React.ReactNode;
  className?: string;
  /** Fracción de su altura que se desplaza durante el scroll (0–1). */
  speed?: number;
};

/**
 * Parallax ligado al scroll: el elemento se desplaza más despacio que la página.
 * `scrub: true` ata la animación a la barra de scroll (avanza y retrocede con ella).
 * Usa `eases.none` (lineal) porque el "ritmo" lo marca el propio scroll.
 */
export function Parallax({ children, className, speed = 0.3 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.to(ref.current, {
        yPercent: -speed * 100,
        ease: eases.none,
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: ref, dependencies: [reduced, speed] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
