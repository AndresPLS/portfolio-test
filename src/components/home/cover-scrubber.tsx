"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type Cover = {
  slug: string;
  title: string;
  src: string;
  width: number;
  height: number;
};

/**
 * Hero de la home: una portada de proyecto centrada que CAMBIA según mueves el
 * ratón en horizontal (posición → índice de proyecto), sin transición.
 *
 * - Todas las portadas se montan y precargan (`loading="eager"`) y solo se
 *   muestra la activa → swap instantáneo, sin parpadeo.
 * - Clic → ficha del proyecto activo (/work/<slug>).
 * - Sin ratón (móvil): rota sola (salvo reduced-motion); el tap navega.
 */
export function CoverScrubber({ covers }: { covers: Cover[] }) {
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      const ratio = event.clientX / window.innerWidth;
      const next = Math.floor(ratio * covers.length);
      setIndex(Math.min(covers.length - 1, Math.max(0, next)));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [covers.length]);

  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches || reduced) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % covers.length),
      2200,
    );
    return () => window.clearInterval(id);
  }, [covers.length, reduced]);

  const active = covers[index];

  return (
    <Link
      href={`/work/${active.slug}`}
      aria-label={`Ver proyecto: ${active.title}`}
      className="flex flex-1 items-center justify-center px-6"
    >
      {covers.map((cover, i) => (
        <Image
          key={cover.slug}
          src={cover.src}
          alt={cover.title}
          width={cover.width}
          height={cover.height}
          loading="eager"
          sizes="(max-width: 768px) 80vw, 40vw"
          className={`max-h-[70vh] w-auto ${i === index ? "block" : "hidden"}`}
        />
      ))}
    </Link>
  );
}
