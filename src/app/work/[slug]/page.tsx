import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  imageSizeClass,
  introImageClass,
  rowImageClass,
} from "@/components/project/image-sizes";
import { renderLockable } from "@/components/project/lockable-text";
import { ProjectChrome } from "@/components/project/project-chrome";
import { ProjectReveal } from "@/components/project/project-reveal";
import {
  getAllImages,
  getAllProjects,
  getAllProjectSlugs,
  getAllTags,
  getProjectBySlug,
} from "@/content/projects";

export async function generateStaticParams() {
  return (await getAllProjectSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const title = project.seo?.title ?? project.title;
  const description = project.seo?.description ?? project.summary;
  // OG de la ficha: la portada real de la serie (la imagen es lo que mejor
  // representa el proyecto). `metadataBase` la convierte en URL absoluta.
  const ogImage = {
    url: project.cover.src,
    width: project.cover.width,
    height: project.cover.height,
    alt: project.cover.alt,
  };

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      url: `/work/${slug}`,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await getAllProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  if (!project) notFound();
  const next = projects[(index + 1) % projects.length]; // vuelve al primero al final

  const blocks = project.blocks;
  const paragraphs = project.body.split(/\n\n+/).filter(Boolean);
  const meta = [project.subtitleText, project.year].filter(Boolean).join(" · ");

  // Datos del Archive (overlay): todos los tags + todas las imágenes del sitio.
  const tags = await getAllTags();
  const archiveImages = await getAllImages();

  return (
    <article className="h-dvh">
      <ProjectReveal />
      <ProjectChrome
        title={project.title}
        blockCount={blocks.length}
        nextHref={`/work/${next.slug}`}
        projectTag={project.tag}
        tags={tags}
        images={archiveImages}
      />

      {/* Contenedor con scroll-snap. `data-lenis-prevent` hace que el scroll suave
          global (Lenis) ignore esta zona, para que el snap nativo funcione. */}
      <div
        id="shots"
        data-lenis-prevent
        className="h-dvh snap-y snap-mandatory overflow-y-scroll"
      >
        {blocks.map((block, i) => (
          <section
            key={i}
            id={`shot-${i}`}
            data-shot={i}
            className="flex min-h-dvh snap-center flex-col items-center justify-center gap-12 px-4 py-24 md:px-10"
          >
            {block.kind === "single" ? (
              <Image
                src={block.image.src}
                alt={block.image.alt}
                width={block.image.width}
                height={block.image.height}
                priority={i === 0}
                sizes="(max-width: 768px) 90vw, 70vw"
                className={
                  i === 0
                    ? introImageClass
                    : `h-auto w-auto ${imageSizeClass[block.size]}`
                }
              />
            ) : (
              <div className="flex items-center justify-center gap-4 md:gap-6">
                {block.images.map((image) => (
                  <Image
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="44vw"
                    className={`h-auto w-auto ${rowImageClass}`}
                  />
                ))}
              </div>
            )}

            {/* La primera slide lleva la intro del proyecto. */}
            {i === 0 ? (
              <figcaption className="max-w-2xl text-center text-pretty">
                {paragraphs.map((paragraph, j) => (
                  <p
                    key={j}
                    className="text-[1.125rem] leading-[1.2] md:text-[1.2rem]"
                  >
                    {renderLockable(paragraph)}
                  </p>
                ))}
                {meta ? (
                  <p className="text-ink/40 mt-4 text-sm">{meta}</p>
                ) : null}
              </figcaption>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}
