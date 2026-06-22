"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

/**
 * Reveal de entrada al abrir la ficha: la primera slide (imagen + intro) asienta
 * con un fade + leve subida/escala. Isla cliente sin marcado propio; opera sobre
 * el `#shot-0` ya renderizado por el Server Component.
 */
export function ProjectReveal() {
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const image = document.querySelector("#shot-0 img");
    const caption = document.querySelector("#shot-0 figcaption");

    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(image, { autoAlpha: 0, y: 18, scale: 1.02, duration: 0.7 })
      .from(
        caption ? Array.from(caption.children) : [],
        { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.08 },
        "-=0.4",
      );
  }, []);

  return null;
}
