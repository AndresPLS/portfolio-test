/** Aspa de cerrar. */
export function CloseIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 4l12 12M16 4L4 16" />
    </svg>
  );
}
