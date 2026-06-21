"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";

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
 * Hero de la home: una portada centrada que CAMBIA de imagen, sin transición.
 * Clic/tap → ficha del proyecto activo.
 * - Escritorio (ratón): la posición HORIZONTAL del cursor manda (segmentos verticales).
 * - Móvil/táctil: arrastrar el dedo en VERTICAL cambia de imagen (segmentos
 *   horizontales: se divide el alto, que en móvil da más recorrido). Un tap abre.
 */
export function CoverScrubber({ covers }: { covers: Cover[] }) {
  const [index, setIndex] = useState(0);
  const startYRef = useRef(0);
  const draggedRef = useRef(false);

  const clamp = (n: number) => Math.min(covers.length - 1, Math.max(0, n));

  const pickByX = (clientX: number) =>
    setIndex(clamp(Math.floor((clientX / window.innerWidth) * covers.length)));
  const pickByY = (clientY: number) =>
    setIndex(clamp(Math.floor((clientY / window.innerHeight) * covers.length)));

  // Escritorio: la posición horizontal del cursor mapea al índice.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => pickByX(event.clientX);
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [covers.length]);

  // Táctil: arrastre vertical → índice (el dedo solo emite pointermove al arrastrar).
  const onPointerDown = (event: React.PointerEvent) => {
    startYRef.current = event.clientY;
    draggedRef.current = false;
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") return; // el escritorio ya lo gestiona
    if (Math.abs(event.clientY - startYRef.current) > DRAG_THRESHOLD) {
      draggedRef.current = true;
    }
    pickByY(event.clientY);
  };
  // Si fue un arrastre, no navegamos (solo se cambia la imagen).
  const onClick = (event: React.MouseEvent) => {
    if (draggedRef.current) event.preventDefault();
  };

  // Teclado: las flechas cambian de portada (Enter/Espacio ya activan el enlace
  // de forma nativa). Sin esto, quien navega con teclado queda atrapado en el
  // primer proyecto, porque solo hay un <Link> y su destino es el activo.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((i) => clamp(i + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((i) => clamp(i - 1));
    }
  };

  const active = covers[index];

  return (
    <Link
      href={`/work/${active.slug}`}
      aria-label={`Ver proyecto: ${active.title} (${index + 1} de ${covers.length}). Usa las flechas para cambiar de proyecto.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="flex flex-1 touch-none items-center justify-center px-4 md:px-6"
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
          style={{ ["--cover-mh"]: `${cover.vh}vh` } as CSSProperties}
          className={`h-auto w-full object-contain md:max-h-[var(--cover-mh)] md:w-auto md:max-w-full ${i === index ? "block" : "hidden"}`}
        />
      ))}
    </Link>
  );
}
