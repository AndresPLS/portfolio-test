"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { TaggedImage } from "@/content/projects";

gsap.registerPlugin(useGSAP);

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  // `visible` = overlay montado en el DOM; lo mantenemos durante el cierre para
  // poder animar el reverse antes de desmontar.
  const [visible, setVisible] = useState(false);
  const [activeTag, setActiveTag] = useState(projectTag);

  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // Evita que el stagger por cambio de tag dispare en la apertura inicial.
  const skipTagAnim = useRef(true);

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
    skipTagAnim.current = true;
    setActiveTag(projectTag);
    setVisible(true);
  };

  const closeArchive = () => {
    const overlay = overlayRef.current;
    const grid = gridRef.current;
    if (!overlay || prefersReduced()) {
      setVisible(false);
      return;
    }
    gsap
      .timeline({ defaults: { ease: "power2.in" }, onComplete: () => setVisible(false) })
      .to(grid ? Array.from(grid.children) : [], {
        autoAlpha: 0,
        y: 10,
        duration: 0.22,
        stagger: 0.012,
      })
      .to(overlay, { autoAlpha: 0, scale: 0.99, duration: 0.3 }, "-=0.12");
  };

  // Secuencia de apertura: el panel entra (fade + leve scale), luego la barra y
  // los tags, y por último el grid escalonado.
  useGSAP(
    () => {
      if (!visible || prefersReduced()) return;
      const grid = gridRef.current;
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          // Tras abrir, los cambios de tag ya pueden animar el re-stagger.
          onComplete: () => {
            skipTagAnim.current = false;
          },
        })
        .from(overlayRef.current, {
          autoAlpha: 0,
          scale: 0.985,
          duration: 0.45,
          transformOrigin: "50% 50%",
        })
        .from(
          [barRef.current, navRef.current],
          { autoAlpha: 0, y: -10, duration: 0.4, stagger: 0.08 },
          "-=0.25",
        )
        .from(
          grid ? Array.from(grid.children) : [],
          { autoAlpha: 0, y: 26, duration: 0.55, stagger: 0.045 },
          "-=0.15",
        );
    },
    { dependencies: [visible], scope: overlayRef },
  );

  // Re-stagger del grid al cambiar de tag (salta mientras dura la apertura).
  useGSAP(
    () => {
      if (!visible || skipTagAnim.current || prefersReduced()) return;
      const grid = gridRef.current;
      if (!grid) return;
      gsap.from(Array.from(grid.children), {
        autoAlpha: 0,
        y: 16,
        duration: 0.45,
        stagger: 0.03,
        ease: "power3.out",
      });
    },
    { dependencies: [activeTag], scope: overlayRef },
  );

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

      {visible ? (
        <div
          ref={overlayRef}
          data-lenis-prevent
          className="bg-bone fixed inset-0 z-40 overflow-y-auto px-4 pt-4 pb-20 md:px-6"
        >
          <div
            ref={barRef}
            className="relative flex items-center justify-between text-sm"
          >
            <Link href="/about" className="transition-opacity hover:opacity-60">
              About
            </Link>
            <span className="font-display absolute left-1/2 -translate-x-1/2">
              Archive
            </span>
            <button
              type="button"
              onClick={closeArchive}
              aria-label="Cerrar archivo"
              className="transition-opacity hover:opacity-60"
            >
              <CloseIcon />
            </button>
          </div>

          <nav
            ref={navRef}
            className="mx-auto mt-14 mb-16 flex max-w-[82vw] flex-wrap justify-center gap-x-3 text-center text-[1.125rem] md:mt-12 md:gap-x-5 md:text-[1.6rem]"
          >
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

          <div
            ref={gridRef}
            className="columns-3 gap-4 md:mx-auto md:flex md:max-w-[90vw] md:flex-wrap md:justify-center md:gap-12"
          >
            {filtered.map((img) => (
              <Link
                key={`${img.slug}-${img.src}`}
                href={`/work/${img.slug}`}
                onClick={closeArchive}
                className="mb-4 block break-inside-avoid md:mb-0"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  sizes="(max-width: 768px) 33vw, 25vw"
                  className="h-auto w-full md:h-[clamp(280px,32vh,360px)] md:w-auto"
                />
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
