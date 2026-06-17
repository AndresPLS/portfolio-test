import Link from "next/link";

/**
 * Cabecera del sitio: logo (izq.) + About y cambio de idioma (der.).
 * About y En/Es son visuales por ahora; se activan en fases posteriores
 * (página About y i18n están diferidos en el plan).
 */
export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-6 text-sm md:px-10">
      <Link href="/" className="font-display text-base italic">
        Andrés Polo
      </Link>
      <nav className="flex items-center gap-8">
        <span className="cursor-default">About</span>
        <span className="flex items-center gap-2">
          <span className="font-medium italic">En</span>
          <span className="text-ink/40">Es</span>
        </span>
      </nav>
    </header>
  );
}
