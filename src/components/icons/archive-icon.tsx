/** Cuadrícula de puntos: abrir el archivo. */
export function ArchiveIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <circle cx="6.5" cy="6.5" r="1.75" />
      <circle cx="13.5" cy="6.5" r="1.75" />
      <circle cx="6.5" cy="13.5" r="1.75" />
      <circle cx="13.5" cy="13.5" r="1.75" />
    </svg>
  );
}
