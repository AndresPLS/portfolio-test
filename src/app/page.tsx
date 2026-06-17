export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-between px-6 py-12 md:px-10">
      <header className="flex items-center justify-between text-sm tracking-widest uppercase">
        <span className="font-display font-medium">Estudio</span>
        <nav className="text-ink/50 flex gap-6">
          <span>Architecture</span>
          <span>Product</span>
          <span>About</span>
        </nav>
      </header>

      <section className="max-w-3xl py-24">
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
          Diseño editorial,
          <br />
          imagen y espacio.
        </h1>
        <p className="text-ink/70 mt-8 max-w-md text-lg leading-relaxed">
          Base del proyecto lista: Next.js 16, React 19, Tailwind v4 y
          tipografías cargadas con{" "}
          <code className="font-display">next/font</code>. Sobre esto
          construiremos la home animada en las siguientes fases.
        </p>
      </section>

      <footer className="border-ink/10 text-ink/50 flex items-center justify-between border-t pt-6 text-sm">
        <span>Fase 0 — Scaffolding</span>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
