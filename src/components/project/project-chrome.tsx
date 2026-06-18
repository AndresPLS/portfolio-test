"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type Thumb = {
  src: string;
  width: number;
  height: number;
  alt: string;
  blockIndex: number;
};

/**
 * "Chrome" de la ficha (todo lo interactivo): cabecera fija (Thumbnails · título · ✕),
 * contador `N / total` que sigue la slide visible, y el panel de miniaturas.
 * Las fotos las pinta el Server Component; aquí observamos las slides ([data-shot])
 * y navegamos entre ellas con scroll nativo (el contenedor usa scroll-snap).
 */
export function ProjectChrome({
  title,
  blockCount,
  thumbs,
  nextHref,
}: {
  title: string;
  blockCount: number;
  thumbs: Thumb[];
  nextHref: string;
}) {
  const [current, setCurrent] = useState(0);
  const [gridOpen, setGridOpen] = useState(false);
  const reduced = usePrefersReducedMotion();

  // Contador: la slide más visible manda.
  useEffect(() => {
    const slides = Array.from(
      document.querySelectorAll<HTMLElement>("[data-shot]"),
    );
    if (slides.length === 0) return;

    const ratios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = Number((entry.target as HTMLElement).dataset.shot);
          ratios.set(i, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best = 0;
        let bestRatio = -1;
        ratios.forEach((ratio, i) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = i;
          }
        });
        setCurrent(best);
      },
      { threshold: [0.25, 0.5, 0.75, 1] },
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  const goTo = (blockIndex: number) => {
    setGridOpen(false);
    document.getElementById(`shot-${blockIndex}`)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 px-4 py-4 text-sm md:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[200%] [mask-image:linear-gradient(to_bottom,black,black_45%,transparent)] backdrop-blur-md [-webkit-mask-image:linear-gradient(to_bottom,black,black_45%,transparent)]"
        />
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() => setGridOpen(true)}
            aria-label="Ver todas las fotos"
            className="cursor-pointer transition-opacity hover:opacity-60"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="size-5"
            >
              <circle cx="6.5" cy="6.5" r="1.75" />
              <circle cx="13.5" cy="6.5" r="1.75" />
              <circle cx="6.5" cy="13.5" r="1.75" />
              <circle cx="13.5" cy="13.5" r="1.75" />
            </svg>
          </button>
          <h1 className="font-display absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
            {title}
          </h1>
          <Link
            href="/"
            aria-label="Cerrar"
            className="transition-opacity hover:opacity-60"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
              className="size-5"
            >
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-6 z-30 flex items-center justify-center gap-6 text-sm">
        <span className="text-ink/60">
          {current + 1} / {blockCount}
        </span>
        {current === blockCount - 1 ? (
          <Link
            href={nextHref}
            className="text-ink/70 transition-opacity hover:opacity-60"
          >
            Next
          </Link>
        ) : null}
      </div>

      {gridOpen ? (
        <div className="bg-bone fixed inset-0 z-40 overflow-y-auto px-4 pt-24 pb-16 md:px-6">
          <header className="bg-bone/80 fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 text-sm backdrop-blur md:px-6">
            <span className="font-display">{title} · Thumbnails</span>
            <button
              type="button"
              onClick={() => setGridOpen(false)}
              aria-label="Cerrar"
              className="transition-opacity hover:opacity-60"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                className="size-5"
              >
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            </button>
          </header>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {thumbs.map((thumb, i) => (
              <button
                key={`${thumb.src}-${i}`}
                type="button"
                onClick={() => goTo(thumb.blockIndex)}
                aria-label={`Ir a ${thumb.alt}`}
                className="group relative block aspect-[4/5] overflow-hidden"
              >
                <Image
                  src={thumb.src}
                  alt={thumb.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-opacity group-hover:opacity-70"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
