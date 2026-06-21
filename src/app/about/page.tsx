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

      <main className="flex w-full flex-1 flex-col justify-center gap-10 px-4 py-20 md:px-6">
        {/* TODO: sustituir por tu bio real. */}
        <div className="max-w-full space-y-5 text-[1.4rem] leading-[1.3] text-pretty sm:max-w-md md:max-w-lg lg:max-w-xl">
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
