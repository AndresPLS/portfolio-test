"use client";

import { useRef, useState } from "react";

import { gsap, useGSAP } from "@/components/motion/gsap";
import { durations, eases } from "@/components/motion/tokens";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type EaseName = keyof typeof eases;
const OPTIONS = Object.keys(eases) as EaseName[];

/**
 * Playground: pulsa un ease y observa la MISMA animación con esa curva.
 * Sirve para "sentir" la diferencia entre easings (la perilla que más cambia el
 * carácter del movimiento).
 *
 * `contextSafe` (de useGSAP) registra la animación lanzada desde el onClick en el
 * contexto del componente para que se limpie sola. La función recibe el elemento
 * como argumento (no lee refs durante el render); el ref se lee en el handler.
 */
export function EasePlayground() {
  const scope = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<EaseName>("out");
  const reduced = usePrefersReducedMotion();

  const { contextSafe } = useGSAP({ scope });

  const animate = contextSafe((el: HTMLElement, name: EaseName) => {
    const track = el.parentElement;
    const distance = track ? track.clientWidth - el.offsetWidth : 280;

    if (reduced) {
      gsap.set(el, { x: 0 });
      return;
    }
    gsap.fromTo(
      el,
      { x: 0 },
      { x: distance, duration: durations.base, ease: eases[name] },
    );
  });

  const play = (name: EaseName) => {
    setCurrent(name);
    if (box.current) animate(box.current, name);
  };

  return (
    <div ref={scope}>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => play(name)}
            className={`rounded-full border px-4 py-1 text-sm transition-colors ${
              current === name
                ? "border-ink bg-ink text-paper"
                : "border-ink/20 hover:border-ink/50"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="bg-ink/5 relative mt-6 h-16 w-full rounded-xl">
        <div ref={box} className="bg-ink h-16 w-16 rounded-xl" />
      </div>

      <p className="text-ink/50 mt-3 text-sm">
        ease actual: <code className="font-display">{eases[current]}</code>
      </p>
    </div>
  );
}
