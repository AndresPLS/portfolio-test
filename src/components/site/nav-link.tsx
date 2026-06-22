"use client";

import gsap from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Enlace de navegación con feedback en cursiva (no de color): al pasar el ratón
 * se inclina a oblicua con un tween GSAP (skewX + power3.out), y queda inclinado
 * de forma permanente cuando estás en la página a la que apunta (estado activo).
 *
 * Se simula con skewX porque `font-style` no es animable en CSS.
 */
const SKEW = -11;
const DUR = 0.4;

export function NavLink({
  href,
  exact = false,
  toggleTo,
  className = "",
  children,
}: {
  href: string;
  /** Activo solo si la ruta coincide exacta (útil para "/"). */
  exact?: boolean;
  /** Si ya estás en la página activa, el clic lleva aquí (toggle). */
  toggleTo?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  const ref = useRef<HTMLAnchorElement>(null);

  // Destino real: si ya estamos en la página, el clic la "cierra" (toggle).
  const destination = active && toggleTo ? toggleTo : href;

  // El estado activo queda inclinado de forma fija (sin tween).
  useEffect(() => {
    gsap.set(ref.current, { skewX: active ? SKEW : 0 });
  }, [active]);

  const to = (skewX: number) => {
    if (active) return;
    gsap.to(ref.current, { skewX, duration: DUR, ease: "power3.out" });
  };

  return (
    <Link
      ref={ref}
      href={destination}
      onMouseEnter={() => to(SKEW)}
      onMouseLeave={() => to(0)}
      className={`inline-block origin-left ${className}`}
    >
      {children}
    </Link>
  );
}
