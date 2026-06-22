import { ArrowOutwardIcon } from "@/components/icons";

/**
 * Pie del sitio. Contact / Legal son visuales por ahora (se enlazan más adelante).
 * `creditNote` (opcional, a la izquierda) solo se pasa en vistas concretas (p. ej. About).
 */
export function SiteFooter({ creditNote }: { creditNote?: string }) {
  return (
    <footer className="text-ink/70 flex items-center justify-between gap-4 px-4 py-4 text-sm md:px-6">
      {creditNote ? (
        <a
          href="https://andrespolo.es/"
          target="_blank"
          rel="noopener noreferrer"
          className="group text-ink/70 visited:text-ink/70 hover:text-accent inline-flex items-center gap-1 text-left transition-colors"
        >
          {creditNote}
          <ArrowOutwardIcon className="size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
        </a>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-4">
        <span>Legal</span>
        <span>© 2026</span>
      </div>
    </footer>
  );
}
