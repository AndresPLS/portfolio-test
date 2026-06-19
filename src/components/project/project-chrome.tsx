"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { TaggedImage } from "@/content/projects";

const CloseIcon = () => (
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
);

/**
 * "Chrome" de la ficha: cabecera fija (Archive · título · ✕), contador `N/total`,
 * y el overlay Archive (se queda DENTRO del proyecto; la ✕ del overlay solo cierra).
 *
 * El overlay arranca con el tag del propio proyecto (solo sus fotos) y muestra
 * todos los tags alfabéticos; al pulsar otro, re-filtra el mosaico en cliente.
 */
export function ProjectChrome({
  title,
  blockCount,
  nextHref,
  projectTag,
  tags,
  images,
}: {
  title: string;
  blockCount: number;
  nextHref: string;
  projectTag: string;
  tags: string[];
  images: TaggedImage[];
}) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const [activeTag, setActiveTag] = useState(projectTag);

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

  const openArchive = () => {
    setActiveTag(projectTag);
    setOpen(true);
  };

  const filtered = images.filter((img) => img.tags.includes(activeTag));

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
            onClick={openArchive}
            aria-label="Abrir archivo"
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
            <CloseIcon />
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

      {open ? (
        <div
          data-lenis-prevent
          className="bg-bone fixed inset-0 z-40 overflow-y-auto px-4 pt-4 pb-20 md:px-6"
        >
          <div className="relative flex items-center justify-between text-sm">
            <Link href="/about" className="transition-opacity hover:opacity-60">
              About
            </Link>
            <span className="font-display absolute left-1/2 -translate-x-1/2">
              Archive
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar archivo"
              className="transition-opacity hover:opacity-60"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="mt-12 mb-8 flex flex-wrap gap-x-4 gap-y-2 text-[1.6rem]">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`transition-opacity hover:opacity-60 ${
                  tag === activeTag ? "text-ink" : "text-ink/40"
                }`}
              >
                #{tag}
              </button>
            ))}
          </nav>

          <div className="columns-2 gap-8 md:columns-4">
            {filtered.map((img) => (
              <Link
                key={`${img.slug}-${img.src}`}
                href={`/work/${img.slug}`}
                className="mb-8 block break-inside-avoid"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="h-auto w-full"
                />
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
