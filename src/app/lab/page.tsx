import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab",
};

/**
 * /lab — banco de pruebas de microinteracciones y CSS.
 * No se enlaza desde ningún sitio; existe para experimentar.
 * NO BORRAR aunque quede vacía: es el sandbox para futuras pruebas.
 */
export default function LabPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-6 py-24">
      <h1 className="font-display text-2xl">Lab</h1>
      <p className="text-ink/60 text-sm">
        Sandbox de pruebas. Vacío a propósito.
      </p>
    </main>
  );
}
