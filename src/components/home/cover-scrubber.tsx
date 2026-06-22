"use client";

import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

type Cover = {
  slug: string;
  title: string;
  src: string;
  width: number;
  height: number;
  vh: number;
};

const DRAG_THRESHOLD = 8; // px para distinguir arrastre de tap
// Swipe horizontal (móvil) para abrir el detalle: debe ser CLARO. Si es pequeño
// o ambiguo respecto al vertical, no se efectúa.
const SWIPE_MIN_X = 60; // recorrido horizontal mínimo en px
const SWIPE_RATIO = 1.5; // |dx| debe superar a |dy| por este factor

/**
 * Suscripción a un media query con `useSyncExternalStore`: sin desajuste de
 * hidratación (en servidor devuelve `false`) y sin `setState` en un efecto.
 */
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Hero de la home: una portada centrada que CAMBIA de imagen, sin transición.
 * Clic/tap → ficha del proyecto activo.
 * - Escritorio (ratón): la posición HORIZONTAL del cursor manda (segmentos verticales).
 * - Móvil/táctil: arrastrar el dedo en VERTICAL cambia de imagen (segmentos
 *   horizontales: se divide el alto, que en móvil da más recorrido). Un tap abre.
 */
export function CoverScrubber({ covers }: { covers: Cover[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const draggedRef = useRef(false);
  // Dirección del gesto táctil una vez resuelta: "v" (scrub) u "h" (swipe-abrir).
  const axisRef = useRef<null | "v" | "h">(null);
  // Etiqueta "Open" que sigue al cursor: solo en dispositivos con puntero fino
  // (escritorio). En táctil ni se renderiza, para que no aparezca nunca.
  const fine = useMediaQuery("(pointer: fine)");
  const labelRef = useRef<HTMLDivElement>(null);

  const clamp = (n: number) => Math.min(covers.length - 1, Math.max(0, n));

  const pickByX = (clientX: number) =>
    setIndex(clamp(Math.floor((clientX / window.innerWidth) * covers.length)));
  const pickByY = (clientY: number) =>
    setIndex(clamp(Math.floor((clientY / window.innerHeight) * covers.length)));

  // Escritorio: la posición horizontal del cursor mapea al índice, y de paso
  // arrastramos la etiqueta "Open" con un leve trailing (quickTo) muy editorial.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const label = labelRef.current;
    const xTo = label
      ? gsap.quickTo(label, "x", { duration: reduce ? 0 : 0.4, ease: "power3" })
      : null;
    const yTo = label
      ? gsap.quickTo(label, "y", { duration: reduce ? 0 : 0.4, ease: "power3" })
      : null;
    const onMove = (event: PointerEvent) => {
      pickByX(event.clientX);
      xTo?.(event.clientX);
      yTo?.(event.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [covers.length, fine]);

  // Mostrar/ocultar la etiqueta al entrar/salir del hero (solo ratón).
  const showLabel = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse" || !labelRef.current) return;
    gsap.set(labelRef.current, { x: event.clientX, y: event.clientY });
    gsap.to(labelRef.current, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });
  };
  const hideLabel = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse" || !labelRef.current) return;
    gsap.to(labelRef.current, { autoAlpha: 0, duration: 0.2, ease: "power2.out" });
  };

  // Táctil: el eje del gesto se resuelve una vez (vertical = scrub, horizontal =
  // swipe para abrir). Mientras no esté claro, no se hace nada.
  const onPointerDown = (event: React.PointerEvent) => {
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    draggedRef.current = false;
    axisRef.current = null;
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") return; // el escritorio ya lo gestiona
    const dx = event.clientX - startXRef.current;
    const dy = event.clientY - startYRef.current;

    // Resolver el eje en cuanto el gesto supere el umbral mínimo.
    if (axisRef.current === null) {
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        axisRef.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
        draggedRef.current = true; // hubo gesto: el tap-click no debe navegar
      }
    }

    // Solo el gesto vertical cambia de imagen; el horizontal se reserva al swipe.
    if (axisRef.current === "v") pickByY(event.clientY);
  };
  const onPointerUp = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") return;
    const dx = event.clientX - startXRef.current;
    const dy = event.clientY - startYRef.current;
    // Swipe a la izquierda CLARO → abre el detalle del proyecto visible.
    if (
      dx <= -SWIPE_MIN_X &&
      Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO
    ) {
      router.push(`/work/${active.slug}`);
    }
  };
  // Si fue un arrastre/swipe, no navegamos con el tap (solo gesto).
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
      onPointerUp={onPointerUp}
      onPointerEnter={fine ? showLabel : undefined}
      onPointerLeave={fine ? hideLabel : undefined}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="flex flex-1 touch-none items-center justify-center px-4 md:px-6"
    >
      {fine ? (
        <div
          ref={labelRef}
          aria-hidden="true"
          className="pointer-events-none invisible fixed top-0 left-0 z-50 opacity-0"
        >
          <span className="font-sans block -translate-y-1/2 pl-5 text-lg">
            Open
          </span>
        </div>
      ) : null}
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
          className={`h-auto w-full object-contain md:h-[var(--cover-mh)] md:w-auto md:max-w-full ${i === index ? "block" : "hidden"}`}
        />
      ))}
    </Link>
  );
}
