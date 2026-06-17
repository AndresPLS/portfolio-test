import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  imageSizeClass,
  rowImageClass,
} from "@/components/project/image-sizes";
import { ProjectChrome } from "@/components/project/project-chrome";
import { getAllProjectSlugs, getProjectBySlug } from "@/content/projects";

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
  return {
    title: project.seo?.title ?? project.title,
    description: project.seo?.description ?? project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const blocks = project.blocks;
  const paragraphs = project.body.split(/\n\n+/).filter(Boolean);
  const meta = [project.location, project.year].filter(Boolean).join(" · ");

  // Miniaturas para el panel Thumbnails: todas las imágenes, cada una sabe a qué
  // bloque (slide) pertenece para poder saltar allí.
  const thumbs = blocks.flatMap((block, i) =>
    block.kind === "single"
      ? [{ ...block.image, blockIndex: i }]
      : block.images.map((image) => ({ ...image, blockIndex: i })),
  );

  return (
    <article className="h-dvh">
      <ProjectChrome
        title={project.title}
        blockCount={blocks.length}
        thumbs={thumbs}
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
            className="flex min-h-dvh snap-center flex-col items-center justify-center gap-8 px-6 py-24 md:px-10"
          >
            {block.kind === "single" ? (
              <Image
                src={block.image.src}
                alt={block.image.alt}
                width={block.image.width}
                height={block.image.height}
                priority={i === 0}
                sizes="(max-width: 768px) 90vw, 70vw"
                className={`h-auto w-auto ${imageSizeClass[block.size]}`}
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
              <figcaption className="max-w-2xl text-center">
                {paragraphs.map((paragraph, j) => (
                  <p key={j} className="text-lg leading-relaxed">
                    {paragraph}
                  </p>
                ))}
                {project.credit ? (
                  <p className="text-ink/50 mt-6 text-sm">{project.credit}</p>
                ) : null}
                {meta ? (
                  <p className="text-ink/40 mt-2 text-sm">{meta}</p>
                ) : null}
              </figcaption>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}
