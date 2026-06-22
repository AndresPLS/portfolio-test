import { NavLink } from "./nav-link";

/**
 * Cabecera del sitio: logo (izq.) + About y cambio de idioma (der.).
 * About y En/Es son visuales por ahora; se activan en fases posteriores
 * (página About y i18n están diferidos en el plan).
 */
export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-4 text-sm md:px-6">
      <NavLink href="/" exact className="font-display text-base">
        Andrés Polo
      </NavLink>
      <nav className="flex items-center gap-8">
        <NavLink href="/about" toggleTo="/">
          About
        </NavLink>
        <span className="flex items-center gap-2">
          <button
            type="button"
            aria-current="true"
            className="italic outline-none focus-visible:underline"
          >
            En
          </button>
          <button
            type="button"
            className="text-ink/40 outline-none transition-opacity hover:opacity-70 focus-visible:underline"
          >
            Es
          </button>
        </span>
      </nav>
    </header>
  );
}
