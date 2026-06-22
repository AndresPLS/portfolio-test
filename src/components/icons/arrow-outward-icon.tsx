/** Flecha diagonal hacia fuera (Material Symbols: arrow_outward). */
export function ArrowOutwardIcon({
  className = "size-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="m256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z" />
    </svg>
  );
}
