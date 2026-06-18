import { CoverScrubber } from "@/components/home/cover-scrubber";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getAllProjects } from "@/content/projects";

export default async function Home() {
  // Server Component: leemos el contenido en el servidor y pasamos a la isla
  // cliente solo lo necesario (slug, título y portada con sus dimensiones).
  const projects = await getAllProjects();
  const covers = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    src: project.cover.src,
    width: project.cover.width,
    height: project.cover.height,
    vh: project.coverHeightVh,
  }));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1">
        <CoverScrubber covers={covers} />
      </main>
      <SiteFooter />
    </div>
  );
}
