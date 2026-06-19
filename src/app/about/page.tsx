import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 py-20 md:px-6">
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          Andrés Polo
        </h1>

        {/* TODO: sustituir por tu bio real. */}
        <div className="space-y-5 text-[1.125rem] leading-[1.5] text-pretty">
          <p>
            Fotógrafo. Trabajo el paisaje, el retrato y la luz como materia.
            (Texto de relleno: cuéntame quién eres y lo edito, o cámbialo tú
            aquí mismo.)
          </p>
          <p>
            Selección de series personales y encargos. Disponible para
            colaboraciones, editoriales y proyectos a medida.
          </p>
        </div>

        <div className="text-ink/60 space-y-1 text-sm">
          <p>
            Contacto:{" "}
            <a
              href="mailto:hola@andrespolo.com"
              className="text-ink/80 transition-opacity hover:opacity-60"
            >
              hola@andrespolo.com
            </a>
          </p>
          <p>Instagram · Behance</p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
