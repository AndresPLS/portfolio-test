import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

/**
 * Test del hook que lee `prefers-reduced-motion`.
 *
 * El hook usa `window.matchMedia`, que jsdom no implementa, así que lo
 * simulamos con un mock controlable: guardamos el `change` listener para poder
 * disparar un cambio de preferencia a mano y comprobar que el componente
 * re-renderiza con el nuevo valor (gracias a `useSyncExternalStore`).
 *
 * Nota Angular: como no hay TestBed, "montamos" el hook dentro de un componente
 * de prueba mínimo y leemos su salida del DOM con Testing Library.
 */

type ChangeListener = (e: MediaQueryListEvent) => void;

function installMatchMediaMock(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<ChangeListener>();

  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      media: query,
      get matches() {
        return matches;
      },
      addEventListener: (_: string, cb: ChangeListener) => listeners.add(cb),
      removeEventListener: (_: string, cb: ChangeListener) =>
        listeners.delete(cb),
      // APIs antiguas, no las usamos pero algunas libs las esperan.
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })),
  );

  // Helper para simular que el usuario cambia la preferencia del SO.
  return function emitChange(next: boolean) {
    matches = next;
    listeners.forEach((cb) => cb({ matches: next } as MediaQueryListEvent));
  };
}

function Probe() {
  const reduced = usePrefersReducedMotion();
  return <span>{reduced ? "reduced" : "full"}</span>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePrefersReducedMotion", () => {
  it("refleja el valor inicial de la media query", () => {
    installMatchMediaMock(true);
    render(<Probe />);
    expect(screen.getByText("reduced")).toBeTruthy();
  });

  it("reacciona cuando cambia la preferencia del sistema", () => {
    const emitChange = installMatchMediaMock(false);
    render(<Probe />);
    expect(screen.getByText("full")).toBeTruthy();

    act(() => emitChange(true));
    expect(screen.getByText("reduced")).toBeTruthy();
  });
});
