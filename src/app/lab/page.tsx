import type { Metadata } from "next";

import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { eases } from "@/components/motion/tokens";

import { EasePlayground } from "./ease-playground";

export const metadata: Metadata = {
  title: "Lab · animación",
};

/**
 * Página de laboratorio (Server Component) que usa las primitivas de animación
 * (Client Components). Es temporal: sirve para probar el sistema antes de la home.
 */
export default function LabPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 md:px-10">
      {/* 1 · Intro con titular animado por líneas */}
      <section className="flex min-h-dvh flex-col justify-center">
        <p className="text-ink/50 mb-4 text-sm tracking-widest uppercase">
          Laboratorio de animación · Fase 1
        </p>
        <SplitTextReveal
          text="Un titular que se revela línea a línea al hacer scroll."
          className="font-display text-4xl leading-[1.1] tracking-tight md:text-6xl"
        />
        <p className="text-ink/60 mt-8 max-w-md">
          Baja despacio: el scroll es suave (Lenis) y cada bloque aparece con
          ScrollTrigger. Activa “reducir movimiento” en tu sistema y recarga:
          todo se mostrará al instante, sin animación.
        </p>
      </section>

      {/* 2 · Playground de easings (interactivo) */}
      <section className="flex min-h-dvh flex-col justify-center">
        <h3 className="font-display text-2xl">Playground de easings</h3>
        <p className="text-ink/60 mt-3 mb-8 max-w-md">
          Pulsa cada curva y observa cómo cambia el carácter del movimiento con
          la misma duración. Estos nombres viven en{" "}
          <code className="font-display">tokens.ts</code>.
        </p>
        <EasePlayground />
      </section>

      {/* 3 · Reveals (con eases distintos por prop) */}
      <section className="flex min-h-dvh flex-col justify-center gap-6">
        <Reveal>
          <h3 className="font-display text-2xl">Reveal con fundido</h3>
        </Reveal>
        <Reveal y={60} delay={0.05}>
          <p className="text-ink/70 max-w-lg">
            Por defecto usa los tokens (
            <code className="font-display">eases.out</code>).
          </p>
        </Reveal>
        <Reveal y={60} ease={eases.back}>
          <p className="text-ink/70 max-w-lg">
            Este otro recibe{" "}
            <code className="font-display">{"ease={eases.back}"}</code> por
            prop: entra con un pequeño rebote.
          </p>
        </Reveal>
      </section>

      {/* 4 · Parallax con scrub */}
      <section className="flex min-h-dvh items-center justify-center">
        <Parallax
          speed={0.4}
          className="bg-ink text-paper rounded-3xl px-12 py-24"
        >
          <span className="font-display text-3xl">Bloque con parallax</span>
        </Parallax>
      </section>

      {/* 5 · Cierre */}
      <section className="flex min-h-dvh flex-col justify-center">
        <SplitTextReveal
          text="Mismo sistema, listo para la home."
          className="font-display text-4xl leading-[1.1] tracking-tight md:text-6xl"
        />
      </section>
    </main>
  );
}
