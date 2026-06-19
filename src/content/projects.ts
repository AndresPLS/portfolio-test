import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import sharp from "sharp";
import { z } from "zod";

import type { ImageSize } from "@/components/project/image-sizes";

/**
 * Capa de contenido. El frontmatter guarda METADATOS, opcionalmente el `layout`
 * (orden + talla del detalle) y `tags` (categorías por imagen). Las fotos viven
 * en `public/projects/<slug>/` y leemos sus dimensiones reales con sharp.
 */

const CONTENT_DIR = path.join(process.cwd(), "content/projects");
const PUBLIC_PROJECTS = path.join(process.cwd(), "public/projects");
const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i;

/** Alto de portada en la home: variado pero determinista por slug (45–70vh). */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
function deterministicCoverVh(slug: string): number {
  // 45, 45.5, … 70 (51 valores), siempre el mismo para cada slug.
  return 45 + (hashString(slug) % 51) * 0.5;
}

/** Tag propio del proyecto: el slug en camelCase (the-mountain-view → theMountainView). */
function toCamelTag(slug: string): string {
  const [first, ...rest] = slug.split("-");
  return (
    first + rest.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")
  );
}

const imageSizeSchema = z.enum(["sm", "md", "lg", "full"]);

// Cada entrada de `layout`: una imagen (con talla) o una pareja en fila.
const layoutItemSchema = z.union([
  z.object({
    row: z.array(z.string()).min(2),
    size: imageSizeSchema.default("md"),
  }),
  z.object({
    src: z.string(),
    size: imageSizeSchema.default("md"),
  }),
]);

const projectFrontmatterSchema = z.object({
  title: z.string(),
  year: z.number().int().optional(),
  subtitleText: z.string().optional(),
  summary: z.string().optional(),
  credit: z.string().optional(),
  featured: z.boolean().default(false),
  /** Alto manual de la portada en la home (vh). Si se omite, se calcula entre 45–70vh. */
  homeCoverHeight: z.number().optional(),
  layout: z.array(layoutItemSchema).optional(),
  /** Categorías por imagen: nombre de archivo → lista de tags. */
  tags: z.record(z.string(), z.array(z.string())).optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  tags: string[];
};

/** Un "bloque" del detalle: una imagen o una pareja, con su talla. */
export type Block =
  | { kind: "single"; image: ProjectImage; size: ImageSize }
  | { kind: "row"; images: ProjectImage[]; size: ImageSize };

export type Project = z.infer<typeof projectFrontmatterSchema> & {
  slug: string;
  body: string;
  cover: ProjectImage; // para la home
  coverHeightVh: number; // alto de la portada en la home (vh)
  blocks: Block[]; // secuencia del detalle (con tallas)
  tag: string; // tag propio del proyecto (camelCase del slug)
};

async function readImage(
  slug: string,
  file: string,
  alt: string,
  tags: string[],
): Promise<ProjectImage> {
  const meta = await sharp(path.join(PUBLIC_PROJECTS, slug, file)).metadata();
  return {
    src: `/projects/${slug}/${file}`,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    alt,
    tags,
  };
}

async function loadProject(fileName: string): Promise<Project> {
  const slug = fileName.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(CONTENT_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  const parsed = projectFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map(
        (issue) => `  · ${issue.path.join(".") || "(raíz)"}: ${issue.message}`,
      )
      .join("\n");
    throw new Error(
      `Frontmatter inválido en content/projects/${fileName}:\n${detail}`,
    );
  }
  const fm = parsed.data;
  const title = fm.title;
  const projectTag = toCamelTag(slug);
  const tagsFor = (file: string): string[] => [
    ...new Set([projectTag, ...(fm.tags?.[file] ?? [])]),
  ];

  const dir = path.join(PUBLIC_PROJECTS, slug);
  const files = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((file) => IMAGE_RE.test(file))
        .sort((a, b) => a.localeCompare(b))
    : [];

  const coverFile = files.find((file) => /^cover/i.test(file)) ?? files[0];
  if (!coverFile) {
    throw new Error(
      `No hay imágenes en public/projects/${slug}/ para el proyecto "${slug}".`,
    );
  }
  const cover = await readImage(slug, coverFile, title, tagsFor(coverFile));

  let blocks: Block[];
  if (fm.layout && fm.layout.length > 0) {
    // Secuencia explícita: orden + talla + parejas definidos por el usuario.
    blocks = await Promise.all(
      fm.layout.map(async (item, i): Promise<Block> => {
        if ("row" in item) {
          const images = await Promise.all(
            item.row.map((file, j) =>
              readImage(
                slug,
                file,
                `${title} — ${i + 1}.${j + 1}`,
                tagsFor(file),
              ),
            ),
          );
          return { kind: "row", images, size: item.size };
        }
        const image = await readImage(
          slug,
          item.src,
          `${title} — ${i + 1}`,
          tagsFor(item.src),
        );
        return { kind: "single", image, size: item.size };
      }),
    );
  } else {
    // Auto: portada + resto, alfabético, todas a "md".
    const galleryFiles = files.filter((file) => file !== coverFile);
    const rest = await Promise.all(
      galleryFiles.map((file, i) =>
        readImage(slug, file, `${title} — ${i + 1}`, tagsFor(file)),
      ),
    );
    blocks = [cover, ...rest].map((image) => ({
      kind: "single",
      image,
      size: "md",
    }));
  }

  const coverHeightVh = fm.homeCoverHeight ?? deterministicCoverVh(slug);
  return {
    ...fm,
    slug,
    tag: projectTag,
    body: content.trim(),
    cover,
    coverHeightVh,
    blocks,
  };
}

async function loadProjects(): Promise<Project[]> {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  const projects = await Promise.all(files.map(loadProject));
  return projects.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

let cached: Promise<Project[]> | null = null;
function all(): Promise<Project[]> {
  if (!cached) cached = loadProjects();
  return cached;
}

export async function getAllProjects(): Promise<Project[]> {
  return all();
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await all()).filter((project) => project.featured);
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  return (await all()).find((project) => project.slug === slug);
}

export async function getAllProjectSlugs(): Promise<string[]> {
  return (await all()).map((project) => project.slug);
}

/** Todas las imágenes únicas de un proyecto (portada + bloques), sin duplicar. */
function projectImages(project: Project): ProjectImage[] {
  const list = [
    project.cover,
    ...project.blocks.flatMap((b) =>
      b.kind === "single" ? [b.image] : b.images,
    ),
  ];
  const seen = new Set<string>();
  return list.filter((img) => {
    if (seen.has(img.src)) return false;
    seen.add(img.src);
    return true;
  });
}

export type TaggedImage = ProjectImage & { slug: string; title: string };

/** Lista de todas las categorías existentes (orden alfabético). */
export async function getAllTags(): Promise<string[]> {
  const set = new Set<string>();
  for (const project of await all()) {
    for (const img of projectImages(project)) {
      img.tags.forEach((tag) => set.add(tag));
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Todas las imágenes (de cualquier proyecto) que comparten una categoría. */
export async function getImagesByTag(tag: string): Promise<TaggedImage[]> {
  const out: TaggedImage[] = [];
  for (const project of await all()) {
    for (const img of projectImages(project)) {
      if (img.tags.includes(tag)) {
        out.push({ ...img, slug: project.slug, title: project.title });
      }
    }
  }
  return out;
}

/** Todas las imágenes del archivo (de todos los proyectos), con su slug. */
export async function getAllImages(): Promise<TaggedImage[]> {
  const out: TaggedImage[] = [];
  for (const project of await all()) {
    for (const img of projectImages(project)) {
      out.push({ ...img, slug: project.slug, title: project.title });
    }
  }
  return out;
}
