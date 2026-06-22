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

      <main className="flex w-full flex-1 flex-col justify-center gap-14 px-4 py-20 md:px-6">
        {/* TODO: sustituir por tu bio real. */}
        <div className="max-w-full space-y-5 text-[1.2rem] leading-[1.3] text-pretty sm:max-w-md md:max-w-lg md:text-[1.3rem] lg:max-w-2xl">
          <p>
            I&apos;m Andrés Polo, a photographer and mountain guide based in
            Madrid. The countryside and the natural world have always caught my
            eye and have shaped me deeply.
          </p>
          <p>
            I work on commissions for brands, studios and private clients, and
            I&apos;m happy to take on collaborations, editorial work and bespoke
            projects.
          </p>
        </div>

        <div className="text-ink/60 flex flex-col gap-2 space-y-1 text-sm">
          <span>
            <p>For prints or personal matters:</p>
            <a
              href="mailto:andrespolophoto@gmail.com"
              className="text-ink/80 transition-opacity hover:opacity-60"
            >
              andrespolophoto@gmail.com
            </a>
          </span>

          <span>
            <p>Follow me on</p>
            <p>Instagram · Behance</p>
          </span>
        </div>

        <div>
          <p>Design and code by me</p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
