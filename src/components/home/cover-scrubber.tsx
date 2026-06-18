"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Cover = {
  slug: string;
  title: string;
  src: string;
  width: number;
  height: number;
  vh: number;
};

const DRAG_THRESHOLD = 8; // px para distinguir arrastre de tap

/**
 * Hero de la home: una portada centrada que CAMBIA según la posición horizontal,
 * sin transición. Clic/tap → ficha del proyecto activo.
 * - Escritorio (ratón): la posición del cursor manda (sin arrastrar).
 * - Móvil/táctil: arrastrar el dedo cambia de imagen; un tap abre el proyecto.
 */
export function CoverScrubber({ covers }: { covers: Cover[] }) {
  const [index, setIndex] = useState(0);
  const startXRef = useRef(0);
  const draggedRef = useRef(false);

  const pickByX = (clientX: number) => {
    const ratio = clientX / window.innerWidth;
    const next = Math.floor(ratio * covers.length);
    setIndex(Math.min(covers.length - 1, Math.max(0, next)));
  };

  // Escritorio: la posición del cursor mapea al índice (sin necesidad de arrastrar).
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => pickByX(event.clientX);
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [covers.length]);

  // Táctil: el dedo solo emite pointermove mientras arrastra → mapeamos la X.
  const onPointerDown = (event: React.PointerEvent) => {
    startXRef.current = event.clientX;
    draggedRef.current = false;
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") return; // el escritorio ya lo gestiona
    if (Math.abs(event.clientX - startXRef.current) > DRAG_THRESHOLD) {
      draggedRef.current = true;
    }
    pickByX(event.clientX);
  };
  // Si fue un arrastre, no navegamos (solo se cambia la imagen).
  const onClick = (event: React.MouseEvent) => {
    if (draggedRef.current) event.preventDefault();
  };

  const active = covers[index];

  return (
    <Link
      href={`/work/${active.slug}`}
      aria-label={`Ver proyecto: ${active.title}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onClick={onClick}
      className="flex flex-1 touch-none items-center justify-center px-6"
    >
      {covers.map((cover, i) => (
        <Image
          key={cover.slug}
          src={cover.src}
          alt={cover.title}
          width={cover.width}
          height={cover.height}
          loading="eager"
          sizes="(max-width: 768px) 85vw, 45vw"
          style={{ height: `${cover.vh}vh`, width: "auto" }}
          className={`max-w-[90vw] ${i === index ? "block" : "hidden"}`}
        />
      ))}
    </Link>
  );
}
