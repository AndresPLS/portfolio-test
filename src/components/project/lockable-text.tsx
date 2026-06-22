import { Fragment, type ReactNode } from "react";

/**
 * Renderiza texto del MDX permitiendo "bloquear" fragmentos frente a la
 * traducción automática del navegador. Por defecto todo es traducible; el autor
 * marca lo que NO debe traducirse con:
 *
 *   [lock]texto original[/lock]        → lang por defecto "es"
 *   [lock:fr]texte original[/lock]     → lang explícito
 *
 * Cada fragmento bloqueado se envuelve en `translate="no"` (+ class `notranslate`
 * por compatibilidad) y su `lang` real, importante para accesibilidad y tipografía.
 */
const LOCK_RE = /\[lock(?::([a-zA-Z-]+))?\]([\s\S]*?)\[\/lock\]/g;
const DEFAULT_LOCK_LANG = "es";

export function renderLockable(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  LOCK_RE.lastIndex = 0;
  while ((match = LOCK_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>,
      );
    }
    nodes.push(
      <span
        key={key++}
        lang={match[1] ?? DEFAULT_LOCK_LANG}
        translate="no"
        className="notranslate"
      >
        {match[2]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return nodes;
}
